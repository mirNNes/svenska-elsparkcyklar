// Repository för accepterade parkeringszoner: CRUD mot MongoDB.
const ParkingZone = require("../models/ParkingZone");

async function getAllParkingZones() {
  return await ParkingZone.find();
}

async function getParkingZoneById(id) {
  return await ParkingZone.findOne({ id });
}

async function createParkingZone({ name, cityId, center, radius }) {
  const lastZone = await ParkingZone.findOne().sort({ id: -1 });
  const nextId = lastZone ? lastZone.id + 1 : 1;

  const zone = new ParkingZone({
    id: nextId,
    name,
    cityId,
    center,
    radius,
  });

  await zone.save();
  return zone;
}

async function updateParkingZone(id, updates) {
  const zone = await ParkingZone.findOne({ id });
  if (!zone) return null;

  if (updates.name !== undefined) zone.name = updates.name;
  if (updates.cityId !== undefined) zone.cityId = updates.cityId;
  if (updates.center !== undefined) zone.center = updates.center;
  if (updates.radius !== undefined) zone.radius = updates.radius;

  await zone.save();
  return zone;
}

async function deleteParkingZone(id) {
  const result = await ParkingZone.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  getAllParkingZones,
  getParkingZoneById,
  createParkingZone,
  updateParkingZone,
  deleteParkingZone,
};
