// Repository för resor: lagrar och uppdaterar rides i minnet
// repositories/rideRepository.js
const Ride = require("../models/Ride");
const Bike = require("../models/Bike");
const User = require("../models/User");
const stationRepository = require("./stationRepository");
const parkingZoneRepository = require("./parkingZoneRepository");
const invoiceRepository = require("./invoiceRepository");

const BASE_PRICE = 10;
const PRICE_PER_MINUTE = 2;
const FREE_PARKING_FEE = 10;
const STATION_RADIUS_METERS = 50;

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

// Enkel avståndsberäkning i meter (räcker för små ytor i en stad).
function distanceMeters(a, b) {
  const lat1 = Number(a?.lat);
  const lng1 = Number(a?.lng);
  const lat2 = Number(b?.lat);
  const lng2 = Number(b?.lng);
  if (!Number.isFinite(lat1) || !Number.isFinite(lng1) || !Number.isFinite(lat2) || !Number.isFinite(lng2)) {
    return null;
  }

  const dLat = (lat2 - lat1) * 111000;
  const dLng = (lng2 - lng1) * 111000 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function isInsideRadius(point, center, radiusMeters) {
  const dist = distanceMeters(point, center);
  if (!Number.isFinite(radiusMeters) || dist === null) return false;
  return dist <= radiusMeters;
}

async function getParkingInfo(bike) {
  if (!bike || !bike.location) {
    return { type: "free", fee: FREE_PARKING_FEE };
  }

  const cityId = bike.cityId;
  const stations = cityId
    ? await stationRepository.getStationsByCity(cityId)
    : await stationRepository.getAllStations();

  const parkingZones = cityId
    ? await parkingZoneRepository.getParkingZonesByCity(cityId)
    : await parkingZoneRepository.getAllParkingZones();

  const stationHit = stations.find((station) =>
    isInsideRadius(bike.location, station.location, STATION_RADIUS_METERS)
  );
  if (stationHit) {
    return { type: "station", fee: 0 };
  }

  const parkingHit = parkingZones.find((zone) =>
    isInsideRadius(bike.location, zone.center, zone.radius)
  );
  if (parkingHit) {
    return { type: "parking", fee: 0 };
  }

  return { type: "free", fee: FREE_PARKING_FEE };
}

async function getRideById(id) {
  return await Ride.findOne({ id });
}

async function getRidesByUserId(userId) {
  // Slå upp user och använd dess _id som referens
  const user = await User.findOne({ id: userId });
  if (!user) return [];
  return await Ride.find({ userId: user._id });
}

async function getRidesByUserObjectId(userObjectId) {
  return await Ride.find({ userId: userObjectId });
}

async function getActiveRideByUserObjectId(userObjectId) {
  return await Ride.findOne({ userId: userObjectId, endedAt: null });
}

async function getActiveRideByBikeObjectId(bikeObjectId) {
  return await Ride.findOne({ bikeId: bikeObjectId, endedAt: null });
}

async function getAllRides() {
  return await Ride.find().sort({ startedAt: -1 });
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

  // Pris: 10 kr start + 2 kr per minut + ev. fri-parkering
  const bike = await Bike.findById(ride.bikeId);
  const parking = await getParkingInfo(bike);
  ride.parkingType = parking.type;
  ride.parkingFee = parking.fee;
  ride.price = roundMoney(BASE_PRICE + PRICE_PER_MINUTE * durationMinutes + parking.fee);

  await ride.save();

  // Dra från saldo om möjligt, annars skapa faktura
  const user = await User.findById(ride.userId);
  if (user && Number.isFinite(user.balance) && user.balance >= ride.price) {
    user.balance = roundMoney(user.balance - ride.price);
    await user.save();
  } else {
    await invoiceRepository.createInvoice({
      userId: ride.userId,
      rideId: ride._id,
      amount: ride.price,
    });
  }

  return { ride };
}

module.exports = {
  getRideById,
  getRidesByUserId,
  getRidesByUserObjectId,
  getActiveRideByUserObjectId,
  getActiveRideByBikeObjectId,
  startRide,
  endRide,
  getAllRides,
};
