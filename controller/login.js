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

    let checkjwttoken = await model.CheckJwtToken(checkUser[0].u_id);

    if (checkjwttoken.length == 0) {
      await model.AddUserJWTToken(token, checkUser[0].u_id);
    } else {
      await model.UpdateUserJWTToken(token, checkUser[0].u_id);
    }

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
    let { user_id } = req.user
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });

    let updatetoken = await model.UpdateUserJWTToken('null', user_id)

    if (updatetoken.affectedRows == 0) {
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