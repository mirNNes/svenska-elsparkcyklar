const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  scootersAvailable: { type: Number, default: 0 },
});

module.exports = mongoose.model('City', citySchema);
