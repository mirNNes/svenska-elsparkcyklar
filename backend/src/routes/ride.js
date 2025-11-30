const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const rideController = require("../controllers/rideController");

const router = express.Router();

// POST /ride/start
router.post("/start", requireAuth, rideController.startRide);

// POST /ride/end
router.post("/end", requireAuth, rideController.endRide);

// GET /ride/:id
router.get("/:id", requireAuth, rideController.getRideById);

module.exports = router;
