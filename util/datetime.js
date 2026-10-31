/**
 * Date/time normalisation helpers.
 *
 * The app and the admin panel send pickup/drop times in different shapes:
 *
 *   admin panel   "10:00:00"            (time only)
 *   customer app  "2026-12-01 10:00:00.000"  (full timestamp)
 *   Flutter Dart  "2026-12-01T10:00:00.000"
 *
 * The SQL that does interval-overlap comparisons needs the date and the time
 * as separate pieces, so every caller normalises through here first.
 */

const DATE_RE = /^(\d{4}-\d{2}-\d{2})/;
const TIME_RE = /^(\d{2}:\d{2}(?::\d{2})?)/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T\s]+(\d{2}:\d{2}(?::\d{2})?)/;

/**
 * Extract the date portion, or null if the value carries no date.
 *
 * @param {*} value
 * @returns {string|null} 'YYYY-MM-DD'
 */
function toDatePart(value) {
    if (!value) return null;
    const s = String(value).trim();
    const m = s.match(DATE_RE);
    return m ? m[1] : null;
}

/**
 * Extract the time portion as 'HH:MM:SS'.
 *
 * @param {*} value
 * @returns {string|null}
 */
function toTimePart(value) {
    if (!value) return null;
    const s = String(value).trim();

    const dt = s.match(DATETIME_RE);
    if (dt) {
        return dt[1].length === 5 ? `${dt[1]}:00` : dt[1];
    }

    const t = s.match(TIME_RE);
    if (t) {
        return t[1].length === 5 ? `${t[1]}:00` : t[1];
    }

    return null;
}

/**
 * Build the 'YYYY-MM-DD HH:MM:SS' string that MySQL's TIMESTAMP() needs.
 *
 * @param {string|Date} date
 * @param {string} time
 * @returns {string}
 */
function toDateTimeString(date, time) {
    const d = toDatePart(date);
    const t = toTimePart(time);
    if (!d || !t) {
        throw new Error(`Invalid date/time pair: "${date}" / "${time}"`);
    }
    return `${d} ${t}`;
}

module.exports = {
    toDatePart,
    toTimePart,
    toDateTimeString,
};
