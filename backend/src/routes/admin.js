const express = require("express");
const City = require("../models/City");
const Bike = require("../models/Bike");
const seedData = require("../seedData");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");

const router = express.Router();

// Enkel reset-endpoint för admin: rensar City/Bike och kör seed igen.
router.post("/reset-seed", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    await City.deleteMany({});
    await Bike.deleteMany({});
    await seedData();
    res.json({ message: "Seed-data återställd" });
  } catch (err) {
    console.error("Reset seed misslyckades:", err);
    res.status(500).json({ error: "Kunde inte återställa seed-data" });
  }
});

module.exports = router;
