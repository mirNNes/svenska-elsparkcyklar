// Repository för cyklar och uthyrningar med in-memory-lagring.
let nextBikeId = 3;
let nextRentId = 1;

const bikes = [
  { id: 1, cityId: 1, isAvailable: true },
  { id: 2, cityId: 2, isAvailable: true },
];

const rents = [];

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

async function isBikeRented(id) {
  return rents.some((rent) => rent.bikeId === id && !rent.endedAt);
}

async function deleteBike(id) {
  const index = bikes.findIndex((b) => b.id === id);
  if (index === -1) {
    return { success: false, reason: "not_found" };
  }

  const currentlyRented = await isBikeRented(id);
  if (currentlyRented) {
    return { success: false, reason: "rented" };
  }

  bikes.splice(index, 1);
  return { success: true };
}

async function startRent(bikeId, userId) {
  const rent = {
    id: nextRentId++,
    bikeId,
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null,
  };
  rents.push(rent);
  const bike = bikes.find((b) => b.id === bikeId);
  if (bike) {
    bike.isAvailable = false;
  }
  return rent;
}

async function getRentById(rentId) {
  return rents.find((r) => r.id === rentId) || null;
}

async function endRent(rentId) {
  const rent = rents.find((r) => r.id === rentId);
  if (!rent || rent.endedAt) {
    return null;
  }
  rent.endedAt = new Date().toISOString();
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
  isBikeRented,
  startRent,
  endRent,
  getRentById,
};
