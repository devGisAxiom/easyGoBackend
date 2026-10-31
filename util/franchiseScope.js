/**
 * Franchise (tenant) scoping.
 *
 * EasyGo now supports multiple franchises inside one deployment. A franchise
 * is a row in the `franchises` table; every booking, bike and location
 * carries a `*_franchise_id` pointing at it.
 *
 * Access rules
 *   super-admin     (u_role = 'admin')            -> sees every franchise
 *   franchise-admin (u_role = 'franchise_admin')   -> sees only their own
 *   customer        (u_role = 'user')              -> sees only their own rows
 *
 * IMPORTANT: this module is the ONLY place that decides row visibility. Every
 * list/report endpoint must call `getScope()` and AND the result onto its
 * query. That keeps the rule auditable in one file instead of scattered
 * across every controller — which is exactly how tenant leaks happen.
 */

const SUPER_ADMIN_ROLE = 'admin';
const FRANCHISE_ADMIN_ROLE = 'franchise_admin';

function isSuperAdmin(user) {
    return !!user && user.role === SUPER_ADMIN_ROLE;
}

function isFranchiseAdmin(user) {
    return !!user && user.role === FRANCHISE_ADMIN_ROLE && !!user.franchise_id;
}

/**
 * Build the tenant restriction for a query.
 *
 * @param {object} user  The authenticated user (req.user)
 * @param {string} column Fully-qualified column holding the franchise id,
 *                       e.g. 'b.b_franchise_id', 'u.u_franchise_id',
 *                       'bk.b_franchise_id', 'lc.l_franchise_id'
 * @returns {{clause: string, params: any[]}} `clause` is a bare condition
 *          (no leading AND) so it can be dropped straight into a list of
 *          conditions that are joined with AND.
 */
function getScope(user, column) {
    if (isFranchiseAdmin(user)) {
        return {
            clause: `${column} = ?`,
            params: [Number(user.franchise_id)],
        };
    }
    return { clause: '', params: [] };
}

/**
 * Merge the tenant restriction into an existing set of conditions.
 *
 * @param {object} user
 * @param {string} column
 * @param {string[]} existingParts Conditions already collected (without WHERE)
 * @param {any[]} existingParams
 * @returns {{clause: string, params: any[]}} `clause` is a full WHERE clause
 *          (empty string when there is nothing to filter on).
 */
function buildWhere(user, column, existingParts = [], existingParams = []) {
    const parts = [...existingParts];
    const params = [...existingParams];

    const scope = getScope(user, column);
    if (scope.clause) {
        parts.push(scope.clause);
        params.push(...scope.params);
    }

    return {
        clause: parts.length ? `WHERE ${parts.join(' AND ')}` : '',
        params,
    };
}

/**
 * Append the tenant restriction to a WHERE clause that may already exist.
 * Used by the report controllers, which build their condition as a raw SQL
 * fragment.
 *
 * @returns {{sql: string, params: any[]}} `sql` is a fragment starting with
 *          " AND " (or empty).
 */
function appendScope(existingClause, user, column) {
    const scope = getScope(user, column);
    if (!scope.clause) return { sql: '', params: [] };

    const needsAnd = existingClause && existingClause.trim().length > 0;
    return {
        sql: `${needsAnd ? ' AND ' : 'WHERE '}${scope.clause}`,
        params: scope.params,
    };
}

/**
 * Super-admin can look at any single franchise; a franchise-admin is always
 * locked to their own. Used by report endpoints that accept a
 * `franchise_id` filter from the client.
 *
 * @returns {number|null} The franchise id to filter by, or null for "all".
 */
function resolveRequestedFranchise(user, requestedFranchiseId) {
    if (isFranchiseAdmin(user)) {
        return Number(user.franchise_id);
    }
    if (requestedFranchiseId) {
        return Number(requestedFranchiseId);
    }
    return null;
}

/**
 * Check that the authenticated user is allowed to act on a row that belongs
 * to a given franchise.
 *
 * List endpoints are already filtered by `getScope()`, but mutations that
 * take a row id directly (delete bike, edit centre, update booking status…)
 * would otherwise let a franchise-admin touch another franchise's data just
 * by guessing an id. Every such endpoint must call this.
 *
 * Rows with no franchise set are treated as head-office data and remain
 * accessible.
 *
 * @param {object} user
 * @param {number|null} rowFranchiseId
 * @returns {{allowed: boolean, message?: string}}
 */
function assertFranchiseAccess(user, rowFranchiseId) {
    if (isSuperAdmin(user)) return { allowed: true };

    if (isFranchiseAdmin(user)) {
        if (!rowFranchiseId) return { allowed: true };
        if (Number(rowFranchiseId) === Number(user.franchise_id)) {
            return { allowed: true };
        }
        return {
            allowed: false,
            message: 'This record belongs to a different franchise',
        };
    }

    return { allowed: false, message: 'Access denied' };
}

module.exports = {
    SUPER_ADMIN_ROLE,
    FRANCHISE_ADMIN_ROLE,
    isSuperAdmin,
    isFranchiseAdmin,
    getScope,
    buildWhere,
    appendScope,
    resolveRequestedFranchise,
    assertFranchiseAccess,
};
