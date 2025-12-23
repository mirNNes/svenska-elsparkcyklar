const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const allowedZoneController = require("../controllers/allowedZoneController");

const router = express.Router();

// Hämta alla zoner eller en specifik
router.get("/", allowedZoneController.getAllAllowedZones);
router.get("/:id", allowedZoneController.getAllowedZoneById);

// Skapa/uppdatera/ta bort zoner (admin)
router.post("/", requireAuth, requireRole("admin"), allowedZoneController.createAllowedZone);
router.patch("/:id", requireAuth, requireRole("admin"), allowedZoneController.updateAllowedZone);
router.delete("/:id", requireAuth, requireRole("admin"), allowedZoneController.deleteAllowedZone);

module.exports = router;
