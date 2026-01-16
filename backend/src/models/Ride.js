const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },

  // Mongo-referenser
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bike",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },

  // Data för kvitto / pris / statistik
  distance: { type: Number, default: null },   // meter
  energyUsed: { type: Number, default: null }, // Wh
  price: { type: Number, default: null },      // SEK

  // Positioner för historik
  startLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  endLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },

  // Parkeringsinfo vid avslut
  parkingStatus: {
    type: String,
    enum: ["OK", "OUTSIDE_ZONE", "STATION"],
    default: null,
  },
  parkingZoneId: {
    type: Number,
    default: null,
  },

  // Avgiftsmodifierare beroende på startplats
  startFeeModifier: {
    type: Number,
    default: 1.0,
  },
  
  startParkingStatus: {
    type: String,
    enum: ["OK", "OUTSIDE_ZONE", "STATION"],
    default: null,
  },

  endParkingStatus: {
    type: String,
    enum: ["OK", "OUTSIDE_ZONE", "STATION"],
    default: null,
  },

  basePrice: {
    type: Number,
    default: 0,
  },

  extraFee: {
    type: Number,
    default: 0,
  },

  discount: {
    type: Number,
    default: 0,
  },

  totalPrice: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Ride", rideSchema);
