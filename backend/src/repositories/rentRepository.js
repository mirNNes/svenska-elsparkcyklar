// Repository för uthyrningar (rents) med in-memory-lagring.
let nextRentId = 1;

const rents = [];

async function createRent({ bikeId, userId }) {
  const rent = {
    id: nextRentId++,
    bikeId,
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null,
  };
  rents.push(rent);
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
  return rent;
}

async function isBikeRented(bikeId) {
  return rents.some((rent) => rent.bikeId === bikeId && !rent.endedAt);
}

module.exports = {
  createRent,
  getRentById,
  endRent,
  isBikeRented,
};
