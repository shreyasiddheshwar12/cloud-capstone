require("dotenv").config();

const express = require("express");
const { getConnection } = require("./db");

const authRoutes = require("./routes/authRoutes");
const recallRoutes = require("./routes/recallRoutes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/recalls", recallRoutes);

app.get("/test", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query("SELECT * FROM Roles");

    res.json(result.recordset);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/", async (req, res) => {
  res.send("Recall API Running Successfully");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
