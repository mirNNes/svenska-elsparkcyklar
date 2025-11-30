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
  await Bike.findOneAndUpdate({ id: bikeId }, { isAvailable: false });
  return rent;
}

async function getRentById(rentId) {
  return await rentRepository.getRentById(rentId);
}

async function endRent(rentId) {
  const rent = await rentRepository.endRent(rentId);
  if (!rent) return null;

  await Bike.findOneAndUpdate({ id: rent.bikeId }, { isAvailable: true });
  return rent;
}

module.exports = {
  getAllBikes,
  getBikeById,
  createBike,
  deleteBike,
  startRent,
  endRent,
  getRentById,
};
