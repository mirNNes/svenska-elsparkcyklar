// Repository för uthyrningar (rents): håller koll på aktiva/avslutade hyror i databasen.
const Rent = require("../models/Rent");
const Bike = require("../models/Bike");
const User = require("../models/User");

async function createRent({ bikeId, userId }) {
  // Hämta bike/user via deras numeriska id och använd deras _id som referens.
  const bike = await Bike.findOne({ id: bikeId });
  const user = await User.findOne({ id: userId });
  if (!bike || !user) {
    return { error: "Bike or user not found" };
  }

  const lastRent = await Rent.findOne().sort({ id: -1 });
  const nextId = lastRent ? lastRent.id + 1 : 1;

  const rent = new Rent({
    id: nextId,
    bikeId: bike._id,
    userId: user._id,
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
  // Kolla via numeriskt id -> slå upp _id först.
  const bike = await Bike.findOne({ id: bikeId });
  if (!bike) return false;
  const activeRent = await Rent.findOne({ bikeId: bike._id, endedAt: null });
  return !!activeRent;
}

module.exports = {
  createRent,
  getRentById,
  endRent,
  isBikeRented,
};
