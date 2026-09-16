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

    res.json(result.recordset[0]);

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