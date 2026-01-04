const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const rideController = require("../controllers/rideController");
const rideRepository = require("../repositories/rideRepository");

const router = express.Router();

// POST /ride/start
router.post("/start", requireAuth, rideController.startRide);

// POST /ride/end
router.post("/end", requireAuth, rideController.endRide);

// GET /ride/me - resor för inloggad användare
router.get("/me", requireAuth, rideController.getMyRides);

// GET /ride/active - aktiv resa för inloggad användare
router.get("/active", requireAuth, rideController.getMyActiveRide);

// GET /ride/active/bike/:bikeId - aktiv resa för cykel (admin)
router.get(
  "/active/bike/:bikeId",
  requireAuth,
  requireRole("admin"),
  rideController.getActiveRideByBike
);

// GET /
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  rideController.getAllRides
);

// GET /ride/user/:userId - resor för specifik användare (admin)
router.get(
  "/user/:userId",
  requireAuth,
  requireRole("admin"),
  rideController.getRidesByUser
);

// GET /ride/:id
router.get("/:id", rideController.getRideById);

module.exports = router;
