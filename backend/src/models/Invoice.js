// Modell for fakturor kopplade till resor
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
