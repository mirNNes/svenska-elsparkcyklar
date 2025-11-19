// Stad-routes som använder en tillfällig lista i minnet.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const cityRepository = require("../repositories/cityRepository");

const router = express.Router();

// GET /city - lista alla städer
router.get("/", async (req, res) => {
  const cities = await cityRepository.getAllCities();
  res.json(cities);
});

// GET /city/:id - hämta en specifik stad
router.get("/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const city = await cityRepository.getCityById(id);

  if (!city) {
    return res.status(404).json({ error: "City not found" });
  }

  return res.json(city);
});

// Hjälpfunktion som applicerar uppdateringar från req.body på en stad.
function applyCityUpdates(city, body, { requireField } = { requireField: false }) {
  const { name, scootersAvailable } = body;

  if (requireField && (name === undefined || scootersAvailable === undefined)) {
    return { error: "name and scootersAvailable are required" };
  }

  if (name !== undefined) {
    city.name = name;
  }

  if (scootersAvailable !== undefined) {
    city.scootersAvailable = scootersAvailable;
  }

  if (name === undefined && scootersAvailable === undefined) {
    return { error: "At least one field must be provided" };
  }

  return { city };
}

// POST /city - skapa en ny stad
router.post("/", requireAuth, async (req, res) => {
  const { name, scootersAvailable } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const city = await cityRepository.createCity({ name, scootersAvailable });
  return res.status(201).json(city);
});

// PUT /city/:id - ersätt en stad
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const city = await cityRepository.getCityById(id);

  if (!city) {
    return res.status(404).json({ error: "City not found" });
  }

  const result = applyCityUpdates(city, req.body, { requireField: true });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const updatedCity = await cityRepository.updateCity(id, result.city);
  return res.json(updatedCity);
});

// PATCH /city/:id - uppdatera delar av en stad
router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const city = await cityRepository.getCityById(id);

  if (!city) {
    return res.status(404).json({ error: "City not found" });
  }

  const result = applyCityUpdates(city, req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const updatedCity = await cityRepository.updateCity(id, result.city);
  return res.json(updatedCity);
});

// DELETE /city/:id - ta bort en stad
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const success = await cityRepository.deleteCity(id);

  if (!success) {
    return res.status(404).json({ error: "City not found" });
  }

  return res.status(204).send();
});

module.exports = router;
