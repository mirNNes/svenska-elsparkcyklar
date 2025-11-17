// Repository för cyklar och uthyrningar med in-memory-lagring.
const rentRepository = require("./rentRepository");

let nextBikeId = 3;

const bikes = [
  { id: 1, cityId: 1, isAvailable: true },
  { id: 2, cityId: 2, isAvailable: true },
];

async function getAllBikes() {
  return bikes;
}

async function getBikeById(id) {
  return bikes.find((bike) => bike.id === id) || null;
}

async function createBike({ cityId }) {
  const bike = {
    id: nextBikeId++,
    cityId,
    isAvailable: true,
  };
  bikes.push(bike);
  return bike;
}

async function deleteBike(id) {
  const index = bikes.findIndex((b) => b.id === id);
  if (index === -1) {
    return { success: false, reason: "not_found" };
  }

  const currentlyRented = await rentRepository.isBikeRented(id);
  if (currentlyRented) {
    return { success: false, reason: "rented" };
  }

  bikes.splice(index, 1);
  return { success: true };
}

async function startRent(bikeId, userId) {
  const rent = await rentRepository.createRent({ bikeId, userId });
  const bike = bikes.find((b) => b.id === bikeId);
  if (bike) {
    bike.isAvailable = false;
  }
  return rent;
}

async function getRentById(rentId) {
  return rentRepository.getRentById(rentId);
}

async function endRent(rentId) {
  const rent = await rentRepository.endRent(rentId);
  if (!rent) {
    return null;
  }
  const bike = bikes.find((b) => b.id === rent.bikeId);
  if (bike) {
    bike.isAvailable = true;
  }
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
