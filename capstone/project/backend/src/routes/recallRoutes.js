const express = require("express");

const {
  createRecall,
  getRecall,
  publishRecall,
  acknowledgeRecall
} = require("../controllers/recallController");

const router = express.Router();

router.post("/", createRecall);

router.get("/:id", getRecall);

router.post("/:id/publish", publishRecall);

router.post("/:id/acknowledgements", acknowledgeRecall);

module.exports = router;

const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, createRecall);

router.get("/:id", verifyToken, getRecall);

router.post("/:id/publish", verifyToken, publishRecall);

router.post("/:id/acknowledgements", verifyToken, acknowledgeRecall);
