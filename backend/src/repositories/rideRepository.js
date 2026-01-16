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
const ENERGY_USED_PER_METER = 0.006;

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
  return await Ride.find({ userId: user._id }).sort({ startedAt: -1 });
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
  return await Ride.find()
    .sort({ startedAt: -1 })
    .populate({
      path: "bikeId",
      populate: {
        path: "cityId",
        model: "City",
      },
    })
    .populate("userId");
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

  let startParkingStatus = "OUTSIDE_ZONE";
  if (bike.currentStationId) {
    startParkingStatus = "STATION";
  } else if (bike.parkingStatus) {
    startParkingStatus = bike.parkingStatus;
  }

  const ride = new Ride({
    id: nextId,
    bikeId: bike._id,
    userId: user._id,
    startedAt: new Date().toISOString(),
    endedAt: null,
    // Jag sparar startpositionen direkt från cykeln så vi kan räkna distans senare.
    startLocation: {
      lat: bike.location?.lat ?? null,
      lng: bike.location?.lng ?? null,
    },
    startParkingStatus,
  });

  await ride.save();
  return { ride };
}

// Enkel avslutning av resa med dummy-beräkning
async function endRide(rideId, endLocation) {
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
  const fallbackDistance = durationMinutes * 200;
  const distanceFromLocations = endLocation
    ? distanceMeters(ride.startLocation, endLocation)
    : null;
  const resolvedDistance = Number.isFinite(distanceFromLocations)
    ? distanceFromLocations
    : fallbackDistance;
  ride.distance = Math.round(resolvedDistance); // meter
  ride.energyUsed = Math.round(ride.distance * ENERGY_USED_PER_METER);

  // Pris: 10 kr start + 2 kr per minut + ev. fri-parkering
  const bike = await Bike.findById(ride.bikeId);
  let shouldSaveBike = false;
  if (endLocation) {
    ride.endLocation = { lat: endLocation.lat, lng: endLocation.lng };
    if (bike) {
      // Vi uppdaterar cykelns position innan parkeringslogiken körs.
      bike.location = { lat: endLocation.lat, lng: endLocation.lng };
      shouldSaveBike = true;
    }
  }
  const parking = await getParkingInfo(bike);
  ride.parkingType = parking.type;
  ride.parkingFee = parking.fee;

  if (parking.type === "station") {
    ride.endParkingStatus = "STATION";
  } else if (parking.type === "parking") {
    ride.endParkingStatus = "OK";
  } else {
    ride.endParkingStatus = "OUTSIDE_ZONE";
  }

  const basePrice = BASE_PRICE;
  const timePrice = PRICE_PER_MINUTE * durationMinutes;

  let extraFee = timePrice + parking.fee;
  let discount = 0;

  if (
    ride.startParkingStatus === "OUTSIDE_ZONE" &&
    ride.endParkingStatus === "OK"
  ) {
    discount = FREE_PARKING_FEE;
  }

  const totalPrice = basePrice + extraFee - discount;

  ride.basePrice = roundMoney(basePrice);
  ride.extraFee = roundMoney(extraFee);
  ride.discount = roundMoney(discount);
  ride.totalPrice = roundMoney(totalPrice);
  ride.price = ride.totalPrice;

  if (bike && Number.isFinite(bike.battery)) {
    const drained = Math.max(0, Math.round(ride.energyUsed));
    bike.battery = Math.max(0, Math.min(100, bike.battery - drained));
    if (parking.type === "station") {
      bike.battery = 100;
    }
    shouldSaveBike = true;
  }

  if (bike && shouldSaveBike) {
    await bike.save();
  }

  await ride.save();

  // Dra från saldo om möjligt, annars skapa faktura
  const user = await User.findById(ride.userId);
  if (user && Number.isFinite(user.balance) && user.balance >= ride.totalPrice) {
    user.balance = roundMoney(user.balance - ride.totalPrice);
    await user.save();
  } else {
    await invoiceRepository.createInvoice({
      userId: ride.userId,
      rideId: ride._id,
      amount: ride.totalPrice,
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
