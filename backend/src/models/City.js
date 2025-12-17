const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  scootersAvailable: { type: Number, default: 0 },
  // Stadens mittpunkt (lat/lng) används för karta
  center: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  // Radie för staden
  radius: { type: Number, default: null }, // meter
});

module.exports = mongoose.model("City", citySchema);
