const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const bikeController = require("../controllers/bikeController");

const router = express.Router();

// Hämta alla cyklar eller en specifik
router.get("/", bikeController.getAllBikes);
router.get("/:id", bikeController.getBikeById);

// Skapa och radera cyklar (skyddat)
router.post("/", requireAuth, bikeController.createBike);
router.delete("/:id", requireAuth, bikeController.deleteBike);

// Starta/avsluta uthyrning (skyddat)
router.post("/rent/:bikeId/:userId", requireAuth, bikeController.startRent);
router.post("/rent-leave/:rentId", requireAuth, bikeController.endRent);

// Telemetri från "cykelprogrammet" (skyddat)
router.patch("/:id/telemetry", requireAuth, requireRole("admin"), bikeController.updateTelemetry);

// Stäng av / slå på cykel (admin)
router.post("/:id/disable", requireAuth, requireRole("admin"), bikeController.disableBike);
router.post("/:id/enable", requireAuth, requireRole("admin"), bikeController.enableBike);

router.patch("/:bikeId/move-to-station/:stationId", requireAuth, requireRole("admin"), bikeController.moveBikeToStation);

module.exports = router;
