// Repository för resor: lagrar och uppdaterar rides i minnet
// repositories/rideRepository.js
const Ride = require("../models/Ride");
const Bike = require("../models/Bike");
const User = require("../models/User");

async function getRideById(id) {
  return await Ride.findOne({ id });
}

async function getRidesByUserId(userId) {
  // Slå upp user och använd dess _id som referens
  const user = await User.findOne({ id: userId });
  if (!user) return [];
  return await Ride.find({ userId: user._id });
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

// Enkel avslutning av resa med dummy-beräkning
async function endRide(rideId) {
  const ride = await Ride.findOne({ id: rideId });
  if (!ride) {
    return { error: "Ride not found", code: "not_found" };
  }
  if (ride.endedAt) {
    return { error: "Ride already finished", code: "already_finished" };
  }

  const endTime = new Date();
  ride.endedAt = endTime.toISOString();

  // Dummy-beräkning: anta 200 m per minut (ca 12 km/h)
  const durationMinutes = Math.max(
    0,
    (endTime - new Date(ride.startedAt)) / 60000
  );
  ride.distance = Math.round(durationMinutes * 200); // meter

  // Energi: enkelt antagande 0.6 Wh per 100 meter
  ride.energyUsed = Math.round(ride.distance * 0.6);

  // Pris: 10 kr start + 2 kr per minut
  const base = 10;
  const perMinute = 2;
  ride.price = Math.round((base + perMinute * durationMinutes) * 100) / 100;

  await ride.save();
  return { ride };
}

module.exports = {
  getRideById,
  getRidesByUserId,
  startRide,
  endRide,
};
