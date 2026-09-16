const sql = require("mssql");
const { config } = require("../db");

const createRecall = async (req, res) => {
  try {
    const {
      recallId,
      medicineCode,
      batchNumber,
      severity,
      reason
    } = req.body;

    const pool = await sql.connect(config);

    await pool.request()
      .input("recallId", sql.NVarChar, recallId)
      .input("medicineCode", sql.NVarChar, medicineCode)
      .input("batchNumber", sql.NVarChar, batchNumber)
      .input("severity", sql.NVarChar, severity)
      .input("reason", sql.NVarChar, reason)
      .query(`
        INSERT INTO ProductRecall
        (
          RecallId,
          MedicineCode,
          BatchNumber,
          Severity,
          Reason,
          Status
        )
        VALUES
        (
          @recallId,
          @medicineCode,
          @batchNumber,
          @severity,
          @reason,
          'Draft'
        )
      `);

    res.status(201).json({
      message: "Recall created successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

const getRecall = async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("recallId", sql.NVarChar, req.params.id)
      .query(`
        SELECT *
        FROM ProductRecall
        WHERE RecallId = @recallId
      `);

    res.status(200).json(result.recordset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

const publishRecall = async (req, res) => {
  try {
    const pool = await sql.connect(config);

    await pool.request()
      .input("recallId", sql.NVarChar, req.params.id)
      .query(`
        UPDATE ProductRecall
        SET Status = 'Published'
        WHERE RecallId = @recallId
      `);

    res.status(200).json({
      message: "Recall published successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

const acknowledgeRecall = async (req, res) => {
  try {
    const { partnerId } = req.body;

    const pool = await sql.connect(config);

    await pool.request()
      .input("recallId", sql.NVarChar, req.params.id)
      .input("partnerId", sql.NVarChar, partnerId)
      .query(`
        INSERT INTO RecallAcknowledgement
        (
          RecallId,
          PartnerId,
          AcknowledgedAt,
          NotificationStatus
        )
        VALUES
        (
          @recallId,
          @partnerId,
          GETDATE(),
          'Acknowledged'
        )
      `);

    res.status(200).json({
      message: "Recall acknowledged successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  createRecall,
  getRecall,
  publishRecall,
  acknowledgeRecall
};
