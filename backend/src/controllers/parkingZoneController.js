const parkingZoneRepository = require("../repositories/parkingZoneRepository");

// GET /parking-zone - lista alla parkeringszoner
async function getAllParkingZones(req, res) {
  const zones = await parkingZoneRepository.getAllParkingZones();
  res.json(zones);
}

// GET /parking-zone/:id - hämta zon
async function getParkingZoneById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt zoneId" });
  const zone = await parkingZoneRepository.getParkingZoneById(id);
  if (!zone) return res.status(404).json({ error: "Parking zone not found" });
  res.json(zone);
}

// POST /parking-zone - skapa zon
async function createParkingZone(req, res) {
  const { name, cityId, center, radius } = req.body;
  if (!name) return res.status(400).json({ error: "name krävs" });
  if (!cityId) return res.status(400).json({ error: "cityId krävs" });
  if (!center || center.lat === undefined || center.lng === undefined) {
    return res.status(400).json({ error: "center måste innehålla lat och lng" });
  }
  if (!Number.isFinite(Number(radius))) {
    return res.status(400).json({ error: "radius måste vara ett tal" });
  }

  const zone = await parkingZoneRepository.createParkingZone({
    name,
    cityId,
    center: { lat: Number(center.lat), lng: Number(center.lng) },
    radius: Number(radius),
  });

  res.status(201).json(zone);
}

// PATCH /parking-zone/:id - uppdatera zon
async function updateParkingZone(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt zoneId" });

  const { name, cityId, center, radius } = req.body || {};
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (cityId !== undefined) updates.cityId = cityId;
  if (center !== undefined) {
    if (center.lat === undefined || center.lng === undefined) {
      return res.status(400).json({ error: "center måste innehålla lat och lng" });
    }
    updates.center = { lat: Number(center.lat), lng: Number(center.lng) };
  }
  if (radius !== undefined) {
    if (!Number.isFinite(Number(radius))) {
      return res.status(400).json({ error: "radius måste vara ett tal" });
    }
    updates.radius = Number(radius);
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "Inga fält att uppdatera" });
  }

  const zone = await parkingZoneRepository.updateParkingZone(id, updates);
  if (!zone) return res.status(404).json({ error: "Parking zone not found" });
  res.json(zone);
}

// DELETE /parking-zone/:id - ta bort zon
async function deleteParkingZone(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt zoneId" });
  const success = await parkingZoneRepository.deleteParkingZone(id);
  if (!success) return res.status(404).json({ error: "Parking zone not found" });
  res.status(204).send();
}

module.exports = {
  getAllParkingZones,
  getParkingZoneById,
  createParkingZone,
  updateParkingZone,
  deleteParkingZone,
};
