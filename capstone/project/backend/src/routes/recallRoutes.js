const express = require("express");
const router = express.Router();

const authorize = require("../middleware/authorize");

const {verifyToken} = require("../middleware/authMiddleware")

const {
  createRecall,
  getRecall,
  publishRecall,
  acknowledgeRecall
} = require("../controllers/recallController");

console.log("createRecall:", typeof createRecall);
console.log("getRecall:", typeof getRecall);
console.log("publishRecall:", typeof publishRecall);
console.log("acknowledgeRecall:", typeof acknowledgeRecall);
console.log("verifyToken:", typeof verifyToken);

// router.post("/", verifyToken, createRecall);
router.post(
  "/",
  verifyToken,
  authorize("RecallPublisher"),
  createRecall
);

// router.get("/:id", verifyToken, getRecall);
router.get(
  "/:id",
  verifyToken,
  authorize(
    "RecallPublisher",
    "RecallViewer",
    "RecallCustomer"
  ),
  getRecall
);

// router.post("/:id/publish", verifyToken, publishRecall);
router.post(
  "/:id/publish",
  verifyToken,
  authorize("RecallPublisher"),
  publishRecall
);

// router.post("/:id/acknowledgements", verifyToken, acknowledgeRecall);
router.post(
  "/:id/acknowledgements",
  verifyToken,
  authorize("RecallAcknowledger"),
  acknowledgeRecall
);

module.exports = router;
