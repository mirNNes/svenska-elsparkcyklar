// Repository för tillåtna zoner: CRUD mot MongoDB.
const AllowedZone = require("../models/AllowedZone");

async function getAllAllowedZones() {
  return await AllowedZone.find();
}

async function getAllowedZoneById(id) {
  return await AllowedZone.findOne({ id });
}

async function createAllowedZone({ name, cityId, center, radius }) {
  const lastZone = await AllowedZone.findOne().sort({ id: -1 });
  const nextId = lastZone ? lastZone.id + 1 : 1;

  const zone = new AllowedZone({
    id: nextId,
    name,
    cityId,
    center,
    radius,
  });

  await zone.save();
  return zone;
}

async function updateAllowedZone(id, updates) {
  const zone = await AllowedZone.findOne({ id });
  if (!zone) return null;

  if (updates.name !== undefined) zone.name = updates.name;
  if (updates.cityId !== undefined) zone.cityId = updates.cityId;
  if (updates.center !== undefined) zone.center = updates.center;
  if (updates.radius !== undefined) zone.radius = updates.radius;

  await zone.save();
  return zone;
}

async function deleteAllowedZone(id) {
  const result = await AllowedZone.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  getAllAllowedZones,
  getAllowedZoneById,
  createAllowedZone,
  updateAllowedZone,
  deleteAllowedZone,
};
