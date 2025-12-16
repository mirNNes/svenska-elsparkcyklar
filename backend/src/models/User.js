const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  // Unikt användarnamn för inloggning/visning
  username: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // Lösenordhash för admin login
  passwordHash: { type: String, required: true },

  // Roller för att skilja på om det är anvädnare eller admin
  role: { type: String, enum: ["user", "admin"], default: "user" },
  // Anändarens statistik
  stats: {
    distance: { type: Number, default: 0 }, // meter
    rides: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("User", userSchema);
