// Repository för uthyrningar (rents): håller koll på aktiva/avslutade hyror i minnet.
const Rent = require("../models/Rent");

async function createRent({ bikeId, userId }) {
  const lastRent = await Rent.findOne().sort({ id: -1 });
  const nextId = lastRent ? lastRent.id + 1 : 1;

  const rent = new Rent({
    id: nextId,
    bikeId,
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null,
  });

  await rent.save();
  return rent;
}

async function getRentById(rentId) {
  return await Rent.findOne({ id: rentId });
}

async function endRent(rentId) {
  const rent = await Rent.findOne({ id: rentId });
  if (!rent || rent.endedAt) return null;

  rent.endedAt = new Date().toISOString();
  await rent.save();
  return rent;
}

async function isBikeRented(bikeId) {
  const activeRent = await Rent.findOne({ bikeId, endedAt: null });
  return !!activeRent;
}

module.exports = {
  createRent,
  getRentById,
  endRent,
  isBikeRented,
};
