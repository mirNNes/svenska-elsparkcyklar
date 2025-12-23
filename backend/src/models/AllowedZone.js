// Modell för tillåtna zoner att köra i.
const mongoose = require("mongoose");

const allowedZoneSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  radius: { type: Number, required: true },
});

module.exports = mongoose.model("AllowedZone", allowedZoneSchema);
