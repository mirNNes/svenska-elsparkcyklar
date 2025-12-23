const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const parkingZoneController = require("../controllers/parkingZoneController");

const router = express.Router();

// Hämta alla zoner eller en specifik
router.get("/", parkingZoneController.getAllParkingZones);
router.get("/:id", parkingZoneController.getParkingZoneById);

// Skapa/uppdatera/ta bort zoner (admin)
router.post("/", requireAuth, requireRole("admin"), parkingZoneController.createParkingZone);
router.patch("/:id", requireAuth, requireRole("admin"), parkingZoneController.updateParkingZone);
router.delete("/:id", requireAuth, requireRole("admin"), parkingZoneController.deleteParkingZone);

module.exports = router;
