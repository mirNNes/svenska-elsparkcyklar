const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  battery: { type: Number, default: 100 },
  isAvailable: { type: Boolean, default: true },
  // Markerar cyklar som skapats för simulering
  isSimulation: { type: Boolean, default: false },
  // Mongo-referenskoppling till vilken stad cykeln hör till
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", default: null },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  // "Cykelprogrammet"
  speed: { type: Number, default: 0 },
  isOperational: { type: Boolean, default: true },
  isInService: { type: Boolean, default: false },
  lastTelemetryAt: { type: Date, default: null },
  currentStationId: { type: Number, default: null },
  isCharging: { type: Boolean, default: false },
});

module.exports = mongoose.model("Bike", bikeSchema);
