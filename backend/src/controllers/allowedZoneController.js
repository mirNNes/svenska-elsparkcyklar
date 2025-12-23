const allowedZoneRepository = require("../repositories/allowedZoneRepository");

// GET /allowed-zone - lista alla tillåtna zoner
async function getAllAllowedZones(req, res) {
  const zones = await allowedZoneRepository.getAllAllowedZones();
  res.json(zones);
}

// GET /allowed-zone/:id - hämta zon
async function getAllowedZoneById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt zoneId" });
  const zone = await allowedZoneRepository.getAllowedZoneById(id);
  if (!zone) return res.status(404).json({ error: "Allowed zone not found" });
  res.json(zone);
}

// POST /allowed-zone - skapa zon
async function createAllowedZone(req, res) {
  const { name, cityId, center, radius } = req.body;
  if (!name) return res.status(400).json({ error: "name krävs" });
  if (!cityId) return res.status(400).json({ error: "cityId krävs" });
  if (!center || center.lat === undefined || center.lng === undefined) {
    return res.status(400).json({ error: "center måste innehålla lat och lng" });
  }
  if (!Number.isFinite(Number(radius))) {
    return res.status(400).json({ error: "radius måste vara ett tal" });
  }

  const zone = await allowedZoneRepository.createAllowedZone({
    name,
    cityId,
    center: { lat: Number(center.lat), lng: Number(center.lng) },
    radius: Number(radius),
  });

  res.status(201).json(zone);
}

// PATCH /allowed-zone/:id - uppdatera zon
async function updateAllowedZone(req, res) {
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

  const zone = await allowedZoneRepository.updateAllowedZone(id, updates);
  if (!zone) return res.status(404).json({ error: "Allowed zone not found" });
  res.json(zone);
}

// DELETE /allowed-zone/:id - ta bort zon
async function deleteAllowedZone(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt zoneId" });
  const success = await allowedZoneRepository.deleteAllowedZone(id);
  if (!success) return res.status(404).json({ error: "Allowed zone not found" });
  res.status(204).send();
}

module.exports = {
  getAllAllowedZones,
  getAllowedZoneById,
  createAllowedZone,
  updateAllowedZone,
  deleteAllowedZone,
};
