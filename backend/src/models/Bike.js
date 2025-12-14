const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  battery: { type: Number, default: 100 },
  isAvailable: { type: Boolean, default: true },
  // Mongo-referenskoppling till vilken stad cykeln hör till
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", default: null },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Bike", bikeSchema);
