// Modell för laddstationer (stationer där cyklar kan laddas/parkera).
const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  capacity: { type: Number, default: 0 },
  currentBikes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Station", stationSchema);
