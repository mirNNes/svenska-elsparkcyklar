// Repository för resor: lagrar och uppdaterar rides i minnet.
// repositories/rideRepository.js
const Ride = require("../models/Ride");
const Bike = require("../models/Bike");
const User = require("../models/User");

async function getRideById(id) {
  return await Ride.findOne({ id });
}

async function getRidesByUserId(userId) {
  return await Ride.find({ userId });
}

async function startRide(bikeId, userId) {
  // Hämta bike och user via deras numeriska id och använd deras _id som referens
  const bike = await Bike.findOne({ id: bikeId });
  const user = await User.findOne({ id: userId });

  if (!bike || !user) {
    return { error: "Bike or user not found" };
  }

  // Kolla om cykeln redan har en aktiv resa
  const activeRide = await Ride.findOne({ bikeId: bike._id, endedAt: null });
  if (activeRide) {
    return { error: "Bike already in ride" };
  }

  // Räkna ut nästa id
  const lastRide = await Ride.findOne().sort({ id: -1 });
  const nextId = lastRide ? lastRide.id + 1 : 1;

  const ride = new Ride({
    id: nextId,
    bikeId: bike._id,
    userId: user._id,
    startedAt: new Date().toISOString(),
    endedAt: null,
  });

  await ride.save();
  return { ride };
}

async function stopRide(rideId) {
  const ride = await Ride.findOne({ id: rideId });
  if (!ride) {
    return { error: "Ride not found", code: "not_found" };
  }
  if (ride.endedAt) {
    return { error: "Ride already finished", code: "already_finished" };
  }

  ride.endedAt = new Date().toISOString();
  await ride.save();
  return { ride };
}

module.exports = {
  getRideById,
  getRidesByUserId,
  startRide,
  stopRide,
};
