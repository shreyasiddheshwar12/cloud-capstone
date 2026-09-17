const { sql, getConnection } = require("../db");

/*
  Creates an entry in AuditLog.

  Important:
  AuditLog.RecallId must already exist in ProductRecall.
  AuditLog.UserId must already exist in your Users/User table
  if UserId has a foreign-key constraint.
*/
async function logAudit(
  pool,
  recallId,
  userId,
  actionName,
  actionDetails
) {
  console.log("===== AUDIT CALLED =====");
  console.log({
    recallId,
    userId,
    actionName,
    actionDetails
  });

  const result = await pool
    .request()
    .input("auditRecallId", sql.NVarChar(50), recallId)
    .input("auditUserId", sql.Int, Number(userId))
    .input("auditActionName", sql.NVarChar(100), actionName)
    .input(
      "auditActionDetails",
      sql.NVarChar(500),
      actionDetails
    )
    .query(`
      INSERT INTO AuditLog
      (
        RecallId,
        UserId,
        ActionName,
        ActionDetails,
        ActionTime
      )
      VALUES
      (
        @auditRecallId,
        @auditUserId,
        @auditActionName,
        @auditActionDetails,
        GETDATE()
      )
    `);

  console.log("AUDIT INSERT SUCCESS");

  return result;
}

/*
  POST /recalls
*/
const createRecall = async (req, res) => {
  try {
    const {
      recallId,
      medicineCode,
      medicineName,
      batchNumber,
      severity,
      reason
    } = req.body;

    const createdBy = req.user.userId;

    if (
      !recallId ||
      !medicineCode ||
      !medicineName ||
      !batchNumber ||
      !severity ||
      !reason
    ) {
      return res.status(400).json({
        error:
          "recallId, medicineCode, medicineName, batchNumber, severity, reason, and createdBy are required"
      });
    }

    const numericCreatedBy = Number(createdBy);

    if (!Number.isInteger(numericCreatedBy)) {
      return res.status(400).json({
        error: "createdBy must be a valid numeric user ID"
      });
    }

    const pool = await getConnection();

    /*
      Use a transaction so that both ProductRecall and AuditLog
      succeed together.

      If audit insertion fails, recall insertion is rolled back.
    */
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      await new sql.Request(transaction)
        .input("recallId", sql.NVarChar(50), recallId)
        .input(
          "medicineCode",
          sql.NVarChar(50),
          medicineCode
        )
        .input(
          "medicineName",
          sql.NVarChar(100),
          medicineName
        )
        .input(
          "batchNumber",
          sql.NVarChar(50),
          batchNumber
        )
        .input("severity", sql.NVarChar(20), severity)
        .input("reason", sql.NVarChar(500), reason)
        .input("createdBy", sql.Int, numericCreatedBy)
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

      await new sql.Request(transaction)
        .input(
          "auditRecallId",
          sql.NVarChar(50),
          recallId
        )
        .input(
          "auditUserId",
          sql.Int,
          numericCreatedBy
        )
        .input(
          "auditActionName",
          sql.NVarChar(100),
          "RecallCreated"
        )
        .input(
          "auditActionDetails",
          sql.NVarChar(500),
          `Recall ${recallId} created successfully`
        )
        .query(`
          INSERT INTO AuditLog
          (
            RecallId,
            UserId,
            ActionName,
            ActionDetails,
            ActionTime
          )
          VALUES
          (
            @auditRecallId,
            @auditUserId,
            @auditActionName,
            @auditActionDetails,
            GETDATE()
          )
        `);

      await transaction.commit();

      console.log(
        `Recall ${recallId} and RecallCreated audit saved`
      );

      return res.status(201).json({
        message: "Recall created successfully",
        recallId,
        auditRecorded: true
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("CREATE RECALL ERROR:");
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

/*
  GET /recalls/:id

  GET does not write an audit row here because it is only reading data.
  Add a RecallViewed event later only if your requirement needs read auditing.
*/
const getRecall = async (req, res) => {
  try {
    const recallId = req.params.id;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("recallId", sql.NVarChar(50), recallId)
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
    console.error("GET RECALL ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};

/*
  POST /recalls/:id/publish
*/
const publishRecall = async (req, res) => {
  try {
    const recallId = req.params.id;
    const pool = await getConnection();

    /*
      Read recall before update so that:
      1. We verify that it exists.
      2. We get CreatedBy as a safe fallback.
      3. We prevent repeated publishing.
    */
    const existingRecall = await pool
      .request()
      .input("recallId", sql.NVarChar(50), recallId)
      .query(`
        SELECT
          RecallId,
          CreatedBy,
          Status
        FROM ProductRecall
        WHERE RecallId = @recallId
      `);

    if (existingRecall.recordset.length === 0) {
      return res.status(404).json({
        error: "Recall not found"
      });
    }

    if (existingRecall.recordset[0].Status === "Published") {
      return res.status(409).json({
        error: "Recall is already published"
      });
    }

    /*
      Prefer the authenticated user from JWT.
      Fall back to CreatedBy only if req.user is unavailable.
    */
    const authenticatedUserId = req.user?.userId;

    const auditUserId = authenticatedUserId
      ? Number(authenticatedUserId)
      : Number(existingRecall.recordset[0].CreatedBy);

    if (!Number.isInteger(auditUserId)) {
      return res.status(400).json({
        error: "A valid user ID is required to publish the recall"
      });
    }

    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const updateResult = await new sql.Request(transaction)
        .input("recallId", sql.NVarChar(50), recallId)
        .query(`
          UPDATE ProductRecall
          SET
            Status = 'Published',
            PublishedAt = GETDATE()
          WHERE RecallId = @recallId
            AND Status <> 'Published'
        `);

      if (updateResult.rowsAffected[0] === 0) {
        await transaction.rollback();

        return res.status(409).json({
          error: "Recall could not be published"
        });
      }

      /*
        If you already have Event Grid publishing code,
        place it here before the audit INSERT.

        Only write RecallPublished after Event Grid accepts
        the event successfully.
      */

      await new sql.Request(transaction)
        .input(
          "auditRecallId",
          sql.NVarChar(50),
          recallId
        )
        .input("auditUserId", sql.Int, auditUserId)
        .input(
          "auditActionName",
          sql.NVarChar(100),
          "RecallPublished"
        )
        .input(
          "auditActionDetails",
          sql.NVarChar(500),
          `Recall ${recallId} published successfully`
        )
        .query(`
          INSERT INTO AuditLog
          (
            RecallId,
            UserId,
            ActionName,
            ActionDetails,
            ActionTime
          )
          VALUES
          (
            @auditRecallId,
            @auditUserId,
            @auditActionName,
            @auditActionDetails,
            GETDATE()
          )
        `);

      await transaction.commit();

      console.log(
        `Recall ${recallId} and RecallPublished audit saved`
      );

      return res.status(200).json({
        message: "Recall published successfully",
        recallId,
        auditRecorded: true
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("PUBLISH RECALL ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};

/*
  POST /recalls/:id/acknowledgements
*/
const acknowledgeRecall = async (req, res) => {
  try {
    const recallId = req.params.id;
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({
        error: "partnerId is required"
      });
    }

    const pool = await getConnection();

    const recallResult = await pool
      .request()
      .input("recallId", sql.NVarChar(50), recallId)
      .query(`
        SELECT
          RecallId,
          CreatedBy,
          Status
        FROM ProductRecall
        WHERE RecallId = @recallId
      `);

    if (recallResult.recordset.length === 0) {
      return res.status(404).json({
        error: "Recall not found"
      });
    }

    if (recallResult.recordset[0].Status !== "Published") {
      return res.status(400).json({
        error: "Only a published recall can be acknowledged"
      });
    }

    const existingAcknowledgement = await pool
      .request()
      .input("recallId", sql.NVarChar(50), recallId)
      .input(
        "partnerId",
        sql.NVarChar(50),
        partnerId
      )
      .query(`
        SELECT
          RecallId,
          PartnerId
        FROM RecallAcknowledgement
        WHERE RecallId = @recallId
          AND PartnerId = @partnerId
      `);

    if (existingAcknowledgement.recordset.length > 0) {
      return res.status(409).json({
        error:
          "This partner has already acknowledged this recall"
      });
    }

    /*
      Use the actual authenticated user ID from JWT.

      Do not use UserId 0 because AuditLog.UserId may have
      a foreign-key relationship with your user table.
    */
    const authenticatedUserId = req.user?.userId;

    const auditUserId = authenticatedUserId
      ? Number(authenticatedUserId)
      : Number(recallResult.recordset[0].CreatedBy);

    if (!Number.isInteger(auditUserId)) {
      return res.status(400).json({
        error:
          "A valid user ID is required to acknowledge the recall"
      });
    }

    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      await new sql.Request(transaction)
        .input(
          "recallId",
          sql.NVarChar(50),
          recallId
        )
        .input(
          "partnerId",
          sql.NVarChar(50),
          partnerId
        )
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

      await new sql.Request(transaction)
        .input(
          "auditRecallId",
          sql.NVarChar(50),
          recallId
        )
        .input("auditUserId", sql.Int, auditUserId)
        .input(
          "auditActionName",
          sql.NVarChar(100),
          "RecallAcknowledged"
        )
        .input(
          "auditActionDetails",
          sql.NVarChar(500),
          `Partner ${partnerId} acknowledged recall ${recallId}`
        )
        .query(`
          INSERT INTO AuditLog
          (
            RecallId,
            UserId,
            ActionName,
            ActionDetails,
            ActionTime
          )
          VALUES
          (
            @auditRecallId,
            @auditUserId,
            @auditActionName,
            @auditActionDetails,
            GETDATE()
          )
        `);

      await transaction.commit();

      console.log(
        `Acknowledgement and audit saved for recall ${recallId}`
      );

      return res.status(201).json({
        message: "Recall acknowledged successfully",
        recallId,
        partnerId,
        auditRecorded: true
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("ACKNOWLEDGE RECALL ERROR:");
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({
        error:
          "This partner has already acknowledged this recall"
      });
    }

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