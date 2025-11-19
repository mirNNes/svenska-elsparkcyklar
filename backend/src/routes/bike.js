// Cykel-routes som hanterar cyklar och enkla uthyrningar i minnet.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");

const router = express.Router();

// GET /bike - lista alla cyklar
router.get("/", async (req, res) => {
  const bikes = await bikeRepository.getAllBikes();
  res.json(bikes);
});

// POST /bike - lägg till cykel
router.post("/", requireAuth, async (req, res) => {
  const { cityId } = req.body;

  if (!cityId) {
    return res.status(400).json({ error: "cityId krävs" });
  }

  const bike = await bikeRepository.createBike({ cityId });
  return res.status(201).json(bike);
});

// DELETE /bike/:id - ta bort cykel
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const result = await bikeRepository.deleteBike(id);

  if (!result.success && result.reason === "not_found") {
    return res.status(404).json({ error: "Bike not found" });
  }

  if (!result.success && result.reason === "rented") {
    return res.status(400).json({ error: "Bike is currently rented" });
  }

  return res.status(204).send();
});

// POST /bike/rent/:bikeId/:userId - starta uthyrning
router.post("/rent/:bikeId/:userId", requireAuth, async (req, res) => {
  const bikeId = Number.parseInt(req.params.bikeId, 10);
  const userId = Number.parseInt(req.params.userId, 10);
  const bike = await bikeRepository.getBikeById(bikeId);
  const user = await userRepository.getUserById(userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Ogiltigt userId" });
  }

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  if (!bike.isAvailable) {
    return res.status(400).json({ error: "Bike already rented" });
  }

  const rent = await bikeRepository.startRent(bikeId, userId);

  return res.status(201).json(rent);
});

// POST /bike/rent-leave/:rentId - avsluta resa
router.post("/rent-leave/:rentId", requireAuth, async (req, res) => {
  const rentId = Number.parseInt(req.params.rentId, 10);
  const rent = await bikeRepository.getRentById(rentId);

  if (!rent) {
    return res.status(404).json({ error: "Rent not found" });
  }

  if (rent.endedAt) {
    return res.status(400).json({ error: "Rent already finished" });
  }

  const ended = await bikeRepository.endRent(rentId);

  return res.json(ended);
});

module.exports = router;
