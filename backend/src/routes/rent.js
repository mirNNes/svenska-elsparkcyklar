const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const rentController = require("../controllers/rentController");

const router = express.Router();

// POST /rent/start
router.post("/start", requireAuth, rentController.startRent);

// POST /rent/end
router.post("/end", requireAuth, rentController.endRent);

// GET /rent/:id
router.get("/:id", requireAuth, rentController.getRentById);

module.exports = router;
