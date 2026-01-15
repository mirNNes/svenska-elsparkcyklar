// Repository för laddstationer: ansvarar för CRUD mot MongoDB.
const Station = require("../models/Station");

async function getAllStations() {
  return await Station.find();
}

async function getStationsByCity(cityId) {
  return await Station.find({ cityId });
}

async function getStationById(id) {
  return await Station.findOne({ id });
}

async function createStation({ name, cityId, location, capacity, currentBikes }) {
  const lastStation = await Station.findOne().sort({ id: -1 });
  const nextId = lastStation ? lastStation.id + 1 : 1;

  const station = new Station({
    id: nextId,
    name,
    cityId,
    location,
    capacity: Number.isFinite(capacity) ? capacity : 0,
    currentBikes: Number.isFinite(currentBikes) ? currentBikes : 0,
  });

  await station.save();
  return station;
}

async function updateStation(id, updates) {
  const station = await Station.findOne({ id });
  if (!station) return null;

  if (updates.name !== undefined) station.name = updates.name;
  if (updates.cityId !== undefined) station.cityId = updates.cityId;
  if (updates.location !== undefined) station.location = updates.location;
  if (updates.capacity !== undefined) station.capacity = updates.capacity;
  if (updates.currentBikes !== undefined)
    station.currentBikes = updates.currentBikes;

  await station.save();
  return station;
}

// Minska antal cyklar på stationen
async function removeBikeFromStation(stationId) {
  const station = await Station.findOne({ id: stationId });
  if (!station) return null;

  if (station.currentBikes > 0) {
    station.currentBikes -= 1;
    await station.save();
  }

  return station;
}

async function deleteStation(id) {
  const result = await Station.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  getAllStations,
  getStationsByCity,
  getStationById,
  createStation,
  updateStation,
  removeBikeFromStation,
  deleteStation,
};
