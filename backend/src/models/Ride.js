const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  // Mongoreferenser till Bike och User
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: "Bike", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  // Data som lär behövas för kvitto/pris och statistik
  distance: { type: Number, default: null }, // meter
  energyUsed: { type: Number, default: null }, // Wh
  price: { type: Number, default: null }, // SEK
});

module.exports = mongoose.model("Ride", rideSchema);
