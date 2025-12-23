const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const stationController = require("../controllers/stationController");

const router = express.Router();

// Hämta alla stationer eller en specifik
router.get("/", stationController.getAllStations);
router.get("/:id", stationController.getStationById);

// Skapa/uppdatera/ta bort stationer (admin)
router.post("/", requireAuth, requireRole("admin"), stationController.createStation);
router.patch("/:id", requireAuth, requireRole("admin"), stationController.updateStation);
router.delete("/:id", requireAuth, requireRole("admin"), stationController.deleteStation);

module.exports = router;
