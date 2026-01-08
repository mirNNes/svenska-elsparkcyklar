// Repository för cyklar: hanterar cyklar och hyrstatus medan data ligger i minnet.
const Bike = require("../models/Bike");
const rentRepository = require("./rentRepository");

function getRandomLocation(center) {
  const baseLat = Number.isFinite(center?.lat) ? center.lat : 0;
  const baseLng = Number.isFinite(center?.lng) ? center.lng : 0;
  const deltaLat = (Math.random() - 0.5) * 0.01;
  const deltaLng = (Math.random() - 0.5) * 0.01;
  return { lat: baseLat + deltaLat, lng: baseLng + deltaLng };
}

async function getAllBikes() {
  return await Bike.find();
}

async function getBikeById(id) {
  return await Bike.findOne({ id });
}

async function createBike({ cityId }) {
  const lastBike = await Bike.findOne().sort({ id: -1 });
  const nextId = lastBike ? lastBike.id + 1 : 1;

  const bike = new Bike({
    id: nextId,
    cityId,
    isAvailable: true,
  });

  await bike.save();
  return bike;
}

async function getSimulationBikesByCity(cityId) {
  return await Bike.find({ cityId, isSimulation: true });
}

async function createSimulationBikes({ cityId, count, center }) {
  if (!count || count <= 0) return [];

  const lastBike = await Bike.findOne().sort({ id: -1 });
  let nextId = lastBike ? lastBike.id + 1 : 1;

  const bikes = [];
  for (let i = 0; i < count; i += 1) {
    bikes.push({
      id: nextId++,
      cityId,
      isAvailable: true,
      isSimulation: true,
      battery: 100,
      location: getRandomLocation(center),
    });
  }

  return await Bike.insertMany(bikes);
}

async function bulkUpdateSimulationBikes(bikes) {
  if (!Array.isArray(bikes) || bikes.length === 0) return;

  const ops = bikes.map((bike) => ({
    updateOne: {
      filter: { _id: bike._id },
      update: {
        $set: {
          location: bike.location,
          battery: bike.battery,
          isAvailable: bike.isAvailable,
        },
      },
    },
  }));

  const CHUNK_SIZE = 300;

  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const chunk = ops.slice(i, i + CHUNK_SIZE);
    await Bike.bulkWrite(chunk, { ordered: false });
  }
}

// Uppdatera position/batteri för en cykel (t.ex. telemetri).
async function updateBikeTelemetry(id, updates) {
  return await Bike.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  );
}

// Ta bort alla simuleringscyklar när simuleringen stoppas.
async function deleteSimulationBikes() {
  const result = await Bike.deleteMany({ isSimulation: true });
  return result.deletedCount || 0;
}

async function deleteBike(id) {
  const bike = await Bike.findOne({ id });
  if (!bike) return { success: false, reason: "not_found" };

  const currentlyRented = await rentRepository.isBikeRented(id);
  if (currentlyRented) return { success: false, reason: "rented" };

  await Bike.deleteOne({ id });
  return { success: true };
}

async function startRent(bikeId, userId) {
  const rent = await rentRepository.createRent({ bikeId, userId });
  if (rent && rent.error) {
    return rent;
  }
  // rent.bikeId är nu en Mongo _id (ObjectId)
  await Bike.findOneAndUpdate({ _id: rent.bikeId }, { isAvailable: false });
  return rent;
}

async function getRentById(rentId) {
  return await rentRepository.getRentById(rentId);
}

async function endRent(rentId) {
  const rent = await rentRepository.endRent(rentId);
  if (!rent) return null;

  // rent.bikeId är en Mongo _id
  await Bike.findOneAndUpdate({ _id: rent.bikeId }, { isAvailable: true });
  return rent;
}

// Markera cykeln som upptagen, enkel flagga i db
async function markBikeAsUnavailable(id) {
  await Bike.findOneAndUpdate({ id }, { isAvailable: false });
}

// Markera cykeln som ledig
async function markBikeAsAvailable(id) {
  await Bike.findOneAndUpdate({ id }, { isAvailable: true });
}

// Markera cykeln som ledig via dess Mongo _id (används när ride sparar referensen)
async function markBikeAsAvailableByObjectId(objectId) {
  await Bike.findOneAndUpdate({ _id: objectId }, { isAvailable: true });
}

async function moveBikeToStation(bikeId, location, updates = {}) {
  const bike = await Bike.findOne({ id: bikeId });
  if (!bike) return null;

  bike.location = {
    lat: location.lat,
    lng: location.lng,
  };

  if (updates.isAvailable !== undefined) {
    bike.isAvailable = updates.isAvailable;
  }

  if (updates.isCharging !== undefined) {
    bike.isCharging = updates.isCharging;
  }

  if (updates.currentStationId !== undefined) {
    bike.currentStationId = updates.currentStationId;
  }

  await bike.save();
  return bike;
}

module.exports = {
  getAllBikes,
  getBikeById,
  createBike,
  deleteBike,
  startRent,
  endRent,
  getRentById,
  markBikeAsUnavailable,
  markBikeAsAvailable,
  markBikeAsAvailableByObjectId,
  getSimulationBikesByCity,
  createSimulationBikes,
  bulkUpdateSimulationBikes,
  updateBikeTelemetry,
  deleteSimulationBikes,
  moveBikeToStation,
};
