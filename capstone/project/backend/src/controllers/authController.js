const jwt = require("jsonwebtoken");
const { getConnection } = require("../db");

async function login(req, res) {
  try {
    const { email } = req.body;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("email", email)
      .query(`
        SELECT
            u.UserId,
            u.FullName,
            u.Email,
            r.RoleName
        FROM Users u
        INNER JOIN Roles r
            ON u.RoleId = r.RoleId
        WHERE u.Email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const user = result.recordset[0];

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
      user
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
}

module.exports = {
  login
};
