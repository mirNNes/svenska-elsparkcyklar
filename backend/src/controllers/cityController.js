const cityRepository = require("../repositories/cityRepository");

// Hjälpfunktion som applicerar uppdateringar på en stad
function applyCityUpdates(city, body, { requireField } = { requireField: false }) {
  const { name, scootersAvailable } = body;

  if (requireField && (name === undefined || scootersAvailable === undefined)) {
    return { error: "name and scootersAvailable are required" };
  }

  if (name !== undefined) city.name = name;
  if (scootersAvailable !== undefined) city.scootersAvailable = scootersAvailable;

  if (name === undefined && scootersAvailable === undefined) {
    return { error: "At least one field must be provided" };
  }

  return { city };
}

// GET /city - lista alla städer
async function getAllCities(req, res) {
  const cities = await cityRepository.getAllCities();
  res.json(cities);
}

// GET /city/:id - hämta en stad
async function getCityById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const city = await cityRepository.getCityById(id);
  if (!city) return res.status(404).json({ error: "City not found" });
  res.json(city);
}

// POST /city - skapa ny stad
async function createCity(req, res) {
  const { name, scootersAvailable } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const city = await cityRepository.createCity({ name, scootersAvailable });
  res.status(201).json(city);
}

// PUT /city/:id - ersätt stad
async function replaceCity(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const city = await cityRepository.getCityById(id);
  if (!city) return res.status(404).json({ error: "City not found" });

  const result = applyCityUpdates(city, req.body, { requireField: true });
  if (result.error) return res.status(400).json({ error: result.error });

  const updatedCity = await cityRepository.updateCity(id, result.city);
  res.json(updatedCity);
}

// PATCH /city/:id - uppdatera delar av stad
async function updateCity(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const city = await cityRepository.getCityById(id);
  if (!city) return res.status(404).json({ error: "City not found" });

  const result = applyCityUpdates(city, req.body);
  if (result.error) return res.status(400).json({ error: result.error });

  const updatedCity = await cityRepository.updateCity(id, result.city);
  res.json(updatedCity);
}

// DELETE /city/:id - ta bort stad
async function deleteCity(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const success = await cityRepository.deleteCity(id);
  if (!success) return res.status(404).json({ error: "City not found" });

  res.status(204).send();
}

module.exports = {
  getAllCities,
  getCityById,
  createCity,
  replaceCity,
  updateCity,
  deleteCity,
};
