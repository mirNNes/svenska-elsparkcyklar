const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  bikeId: { type: Number, required: true },
  userId: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Ride', rideSchema);
