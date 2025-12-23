const stationRepository = require("../repositories/stationRepository");

// GET /station - lista alla laddstationer
async function getAllStations(req, res) {
  const stations = await stationRepository.getAllStations();
  res.json(stations);
}

// GET /station/:id - hämta en station
async function getStationById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt stationId" });
  const station = await stationRepository.getStationById(id);
  if (!station) return res.status(404).json({ error: "Station not found" });
  res.json(station);
}

// POST /station - skapa station
async function createStation(req, res) {
  const { name, cityId, location, capacity, currentBikes } = req.body;
  if (!name) return res.status(400).json({ error: "name krävs" });
  if (!cityId) return res.status(400).json({ error: "cityId krävs" });
  if (!location || location.lat === undefined || location.lng === undefined) {
    return res.status(400).json({ error: "location måste innehålla lat och lng" });
  }
  if (capacity !== undefined && !Number.isFinite(Number(capacity))) {
    return res.status(400).json({ error: "capacity måste vara ett tal" });
  }
  if (currentBikes !== undefined && !Number.isFinite(Number(currentBikes))) {
    return res.status(400).json({ error: "currentBikes måste vara ett tal" });
  }

  const station = await stationRepository.createStation({
    name,
    cityId,
    location: { lat: Number(location.lat), lng: Number(location.lng) },
    capacity: capacity !== undefined ? Number(capacity) : undefined,
    currentBikes: currentBikes !== undefined ? Number(currentBikes) : undefined,
  });

  res.status(201).json(station);
}

// PATCH /station/:id - uppdatera station
async function updateStation(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt stationId" });

  const { name, cityId, location, capacity, currentBikes } = req.body || {};
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (cityId !== undefined) updates.cityId = cityId;
  if (location !== undefined) {
    if (location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({ error: "location måste innehålla lat och lng" });
    }
    updates.location = { lat: Number(location.lat), lng: Number(location.lng) };
  }
  if (capacity !== undefined) {
    if (!Number.isFinite(Number(capacity))) {
      return res.status(400).json({ error: "capacity måste vara ett tal" });
    }
    updates.capacity = Number(capacity);
  }
  if (currentBikes !== undefined) {
    if (!Number.isFinite(Number(currentBikes))) {
      return res.status(400).json({ error: "currentBikes måste vara ett tal" });
    }
    updates.currentBikes = Number(currentBikes);
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "Inga fält att uppdatera" });
  }

  const station = await stationRepository.updateStation(id, updates);
  if (!station) return res.status(404).json({ error: "Station not found" });
  res.json(station);
}

// DELETE /station/:id - ta bort station
async function deleteStation(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt stationId" });
  const success = await stationRepository.deleteStation(id);
  if (!success) return res.status(404).json({ error: "Station not found" });
  res.status(204).send();
}

module.exports = {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
};
