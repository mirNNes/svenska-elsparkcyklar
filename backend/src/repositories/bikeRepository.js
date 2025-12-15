// Repository för cyklar: hanterar cyklar och hyrstatus medan data ligger i minnet.
const Bike = require("../models/Bike");
const rentRepository = require("./rentRepository");

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
};
