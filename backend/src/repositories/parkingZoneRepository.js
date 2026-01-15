const ParkingZone = require("../models/ParkingZone");

async function getAllParkingZones() {
  return await ParkingZone.find();
}

async function getParkingZonesByCity(cityId) {
  return await ParkingZone.find({ cityId });
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

// Kontrollera om en position är inom en accepterad parkeringszon
function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

async function findParkingZoneForLocation({ lat, lng }, cityId) {
  const zones = await ParkingZone.find({ cityId });

  return (
    zones.find((zone) => {
      const d = distanceMeters(
        { lat, lng },
        zone.center
      );
      return d <= zone.radius;
    }) || null
  );
}

module.exports = {
  getAllParkingZones,
  getParkingZonesByCity,
  getParkingZoneById,
  createParkingZone,
  updateParkingZone,
  deleteParkingZone,
  findParkingZoneForLocation,
};
