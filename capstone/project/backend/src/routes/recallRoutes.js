const express = require("express");
const router = express.Router();

const {
  createRecall,
  getRecall,
  publishRecall,
  acknowledgeRecall
} = require("../controllers/recallController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, createRecall);

router.get("/:id", verifyToken, getRecall);

router.post("/:id/publish", verifyToken, publishRecall);

router.post("/:id/acknowledgements", verifyToken, acknowledgeRecall);

module.exports = router;