const model = require('../model/login');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../util/logger');
const { GenerateToken } = require('../util/jwt');

module.exports.login = async (req, res) => {
  try {
    const { emailorphone_number, password, role } = req.body;
    if (!emailorphone_number || !password || !role) {
      logger.warn("Login failed: all fields are required");
      return res.status(400).json({
        result: false,
        message: 'all fields are required',

      });
    }

    const checkUser = await model.CheckUser(emailorphone_number, role);

    if (checkUser.length == 0) {
      return res.status(404).json({
        result: false,
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, checkUser[0].u_password);
    if (!isPasswordValid) {

      logger.warn("Login failed: Invalid credentials for user %s", emailorphone_number);

      return res.status(401).json({
        result: false,
        message: 'Invalid credentials',
      });
    }

    const payload = {
      u_id: checkUser[0].u_id,
      email: checkUser[0].u_email,
      role: checkUser[0].u_role

    };

    const token = GenerateToken(payload);

    // Multi-session: every login gets its own row. Don't overwrite previous
    // tabs/devices — that's what caused "admin backend closes automatically"
    // when a second tab logged in.
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2h, matches JWT exp
    await model.AddUserJWTToken(token, checkUser[0].u_id, expiresAt);

    // Respond with user data and token
    return res.status(200).json({
      result: true,
      message: 'Login successful',
      user: {
        id: checkUser[0].u_id,
        name: checkUser[0].u_name,
        email: checkUser[0].u_email,
        phone: checkUser[0].u_phone,
        role: checkUser[0].u_role,
        token
      }
    });


  } catch (error) {
    logger.error("Error in login: ", error);
    return res.status(500).json({
      result: false,
      message: error.message,
    })
  }
}

module.exports.LogOut = async (req, res) => {
  try {
    // JWT payload uses u_id, not user_id — destructuring under the wrong name
    // was silently producing undefined here, which made the DELETE fail.
    const user_id = req.user?.u_id;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });
    if (!user_id) return res.status(400).json({ message: 'Invalid token payload' });

    // Multi-session: delete only THIS token, not the whole user's session.
    const deltoken = await model.DeleteUserJWTToken(token, user_id);

    if (deltoken.affectedRows == 0) {
      return res.send({
        result: false,
        message: "Failed to Logout"
      })
    } else {
      return res.send({
        result: true,
        message: "Logout sucessfull"
      })
    }


  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}