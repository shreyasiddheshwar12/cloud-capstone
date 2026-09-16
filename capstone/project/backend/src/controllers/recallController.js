const { sql, getConnection } = require("../db");

const createRecall = async (req, res) => {
  try {
    const {
      recallId,
      medicineCode,
      medicineName,
      batchNumber,
      severity,
      reason,
      createdBy
    } = req.body;

    if (
      !recallId ||
      !medicineCode ||
      !medicineName ||
      !batchNumber ||
      !severity ||
      !reason ||
      !createdBy
    ) {
      return res.status(400).json({
        error:
          "recallId, medicineCode, medicineName, batchNumber, severity, reason, and createdBy are required"
      });
    }

    const pool = await getConnection();

    await pool
      .request()
      .input("recallId", sql.NVarChar(50), recallId)
      .input("medicineCode", sql.NVarChar(50), medicineCode)
      .input("medicineName", sql.NVarChar(100), medicineName)
      .input("batchNumber", sql.NVarChar(50), batchNumber)
      .input("severity", sql.NVarChar(20), severity)
      .input("reason", sql.NVarChar(500), reason)
      .input("createdBy", sql.Int, createdBy)
      .query(`
        INSERT INTO ProductRecall
        (
          RecallId,
          MedicineCode,
          MedicineName,
          BatchNumber,
          Severity,
          Reason,
          Status,
          CreatedBy,
          CreatedAt,
          PublishedAt
        )
        VALUES
        (
          @recallId,
          @medicineCode,
          @medicineName,
          @batchNumber,
          @severity,
          @reason,
          'Draft',
          @createdBy,
          GETDATE(),
          NULL
        )
      `);

    return res.status(201).json({
      message: "Recall created successfully",
      recallId: recallId
    });
  } catch (error) {
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({
        error: "Recall ID already exists"
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

const getRecall = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("recallId", sql.NVarChar(50), req.params.id)
      .query(`
        SELECT
          RecallId,
          MedicineCode,
          MedicineName,
          BatchNumber,
          Severity,
          Reason,
          Status,
          CreatedBy,
          CreatedAt,
          PublishedAt
        FROM ProductRecall
        WHERE RecallId = @recallId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Recall not found"
      });
    }

    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};

const publishRecall = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("recallId", sql.NVarChar(50), req.params.id)
      .query(`
        UPDATE ProductRecall
        SET
          Status = 'Published',
          PublishedAt = GETDATE()
        WHERE RecallId = @recallId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: "Recall not found"
      });
    }

    return res.status(200).json({
      message: "Recall published successfully",
      recallId: req.params.id
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};

const acknowledgeRecall = async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({
        error: "partnerId is required"
      });
    }

    const pool = await getConnection();

    const recallResult = await pool
      .request()
      .input("recallId", sql.NVarChar(50), req.params.id)
      .query(`
        SELECT RecallId
        FROM ProductRecall
        WHERE RecallId = @recallId
      `);

    if (recallResult.recordset.length === 0) {
      return res.status(404).json({
        error: "Recall not found"
      });
    }

    await pool
      .request()
      .input("recallId", sql.NVarChar(50), req.params.id)
      .input("partnerId", sql.NVarChar(50), partnerId)
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

    return res.status(201).json({
      message: "Recall acknowledged successfully",
      recallId: req.params.id,
      partnerId: partnerId
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
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
