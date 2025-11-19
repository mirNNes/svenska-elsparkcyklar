// Ride-routes som loggar enkla resor i minnet.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const rideRepository = require("../repositories/rideRepository");
const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");

const router = express.Router();

// GET /ride/user/:userId - hämta resor för en användare
router.get("/user/:userId", async (req, res) => {
  const userId = Number.parseInt(req.params.userId, 10);
  const userRides = await rideRepository.getRidesByUserId(userId);

  if (userRides.length === 0) {
    return res.status(404).json({ error: "No rides found for user" });
  }

  return res.json(userRides);
});

// GET /ride/:id - hämta en specifik resa
router.get("/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const ride = await rideRepository.getRideById(id);

  if (!ride) {
    return res.status(404).json({ error: "Ride not found" });
  }

  return res.json(ride);
});

// POST /ride/start - starta en resa
router.post("/start", requireAuth, async (req, res) => {
  const { bikeId, userId } = req.body;

  if (!bikeId || !userId) {
    return res.status(400).json({ error: "bikeId och userId krävs" });
  }

  const bike = await bikeRepository.getBikeById(bikeId);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  const user = await userRepository.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const startResult = await rideRepository.startRide(bikeId, userId);
  if (startResult.error) {
    return res.status(400).json({ error: startResult.error });
  }

  return res.status(201).json(startResult.ride);
});

// POST /ride/stop - stoppa en resa
router.post("/stop", requireAuth, async (req, res) => {
  const { rideId } = req.body;

  if (!rideId) {
    return res.status(400).json({ error: "rideId krävs" });
  }

  const stopResult = await rideRepository.stopRide(rideId);

  if (stopResult.error && stopResult.code === "not_found") {
    return res.status(404).json({ error: "Ride not found" });
  }

  if (stopResult.error && stopResult.code === "already_finished") {
    return res.status(400).json({ error: "Ride already finished" });
  }

  return res.json(stopResult.ride);
});

module.exports = router;
