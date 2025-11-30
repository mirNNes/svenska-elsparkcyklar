// Repository för resor: lagrar och uppdaterar rides i minnet.
// repositories/rideRepository.js
const Ride = require("../models/Ride");

async function getRideById(id) {
  return await Ride.findOne({ id });
}

async function getRidesByUserId(userId) {
  return await Ride.find({ userId });
}

async function startRide(bikeId, userId) {
  // Kolla om cykeln redan har en aktiv resa
  const activeRide = await Ride.findOne({ bikeId, endedAt: null });
  if (activeRide) {
    return { error: "Bike already in ride" };
  }

  // Räkna ut nästa id
  const lastRide = await Ride.findOne().sort({ id: -1 });
  const nextId = lastRide ? lastRide.id + 1 : 1;

  const ride = new Ride({
    id: nextId,
    bikeId,
    userId,
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
