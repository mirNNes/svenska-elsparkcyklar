// Repository för uthyrningar (rents): håller koll på aktiva/avslutade hyror i databasen.
const Rent = require("../models/Rent");
const Bike = require("../models/Bike");
const User = require("../models/User");
const ParkingZone = require("../models/ParkingZone");

const BASE_START_PRICE = 10;      // kr
const PRICE_PER_MINUTE = 2;       // kr/min
const OUTSIDE_ZONE_FEE = 20;      // kr
const FREE_PARKING_DISCOUNT = 10; // kr

async function createRent({ bikeId, userId, startParkingStatus }) {
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
    startedAt: new Date(),
    endedAt: null,
    startParkingStatus: startParkingStatus || "OUTSIDE_ZONE",
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

  const bike = await Bike.findById(rent.bikeId);

  let endParkingStatus = "OUTSIDE_ZONE";

  if (bike?.currentStationId) {
    endParkingStatus = "STATION";
  } else if (bike?.location) {
    const zones = await ParkingZone.find({ cityId: bike.cityId });
    const insideZone = zones.find(zone =>
      isInsideZone(bike.location, zone)
    );
    if (insideZone) endParkingStatus = "OK";
  }

  const startedAt = new Date(rent.startedAt);
  const endedAt = new Date();
  const durationMs = endedAt - startedAt;

  const durationMinutes = Math.max(
    1,
    Math.ceil(durationMs / 60000)
  );

  const basePrice = BASE_START_PRICE;
  const timePrice = durationMinutes * PRICE_PER_MINUTE;

  let extraFee = 0;
  let discount = 0;

  // Rabatt om man startar fel men parkerar rätt
  if (
    rent.startParkingStatus === "OUTSIDE_ZONE" &&
    endParkingStatus === "OK"
  ) {
    discount = FREE_PARKING_DISCOUNT;
  }

  // Avgift om man parkerar fel
  if (endParkingStatus === "OUTSIDE_ZONE") {
    extraFee = OUTSIDE_ZONE_FEE;
  }

  const totalPrice = Math.max(
    basePrice + timePrice + extraFee - discount,
    0
  );

  rent.endedAt = endedAt;
  rent.endParkingStatus = endParkingStatus;

  rent.basePrice = basePrice;
  rent.extraFee = timePrice + extraFee;
  rent.discount = discount;
  rent.totalPrice = totalPrice;

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

function isInsideZone(location, zone) {
  const dx = location.lat - zone.center.lat;
  const dy = location.lng - zone.center.lng;
  const distance = Math.sqrt(dx * dx + dy * dy) * 111_000;
  return distance <= zone.radius;
}

module.exports = {
  createRent,
  getRentById,
  endRent,
  isBikeRented,
  isInsideZone,
};
