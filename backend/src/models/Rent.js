const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  // Riktiga referenser till Bike och User
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Rent', rentSchema);
