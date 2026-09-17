const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db");

async function login(req, res) {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("email", email)
      .query(`
        SELECT
          u.UserId,
          u.FullName,
          u.Email,
          u.PasswordHash,
          r.RoleName
        FROM Users u
        JOIN Roles r
          ON u.RoleId = r.RoleId
        WHERE u.Email=@email
      `);

    if (result.recordset.length === 0) {

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(
      password,
      user.PasswordHash
    );

    if (!isMatch) {

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user.UserId,
        email: user.Email,
        role: user.RoleName
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      token,
      user: {
        userId: user.UserId,
        fullName: user.FullName,
        email: user.Email,
        role: user.RoleName
      }
    });

  } catch(err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
}

module.exports = {
  login
};