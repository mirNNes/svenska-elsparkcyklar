// Ride-routes som loggar enkla resor i minnet.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { rides, bikes, users } = require("../dataStore");

const router = express.Router();

let nextRideId = rides.length + 1;

// GET /ride/user/:userId - hämta resor för en användare
router.get("/user/:userId", (req, res) => {
  const userId = Number.parseInt(req.params.userId, 10);
  const userRides = rides.filter((ride) => ride.userId === userId);

  if (userRides.length === 0) {
    return res.status(404).json({ error: "No rides found for user" });
  }

  return res.json(userRides);
});

// GET /ride/:id - hämta en specifik resa
router.get("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const ride = rides.find((r) => r.id === id);

  if (!ride) {
    return res.status(404).json({ error: "Ride not found" });
  }

  return res.json(ride);
});

// POST /ride/start - starta en resa
router.post("/start", requireAuth, (req, res) => {
  const { bikeId, userId } = req.body;

  if (!bikeId || !userId) {
    return res.status(400).json({ error: "bikeId och userId krävs" });
  }

  const bikeExists = bikes.some((b) => b.id === bikeId);
  if (!bikeExists) {
    return res.status(404).json({ error: "Bike not found" });
  }

  const userExists = users.some((u) => u.id === userId);
  if (!userExists) {
    return res.status(404).json({ error: "User not found" });
  }

  const alreadyActive = rides.find((ride) => ride.bikeId === bikeId && !ride.endedAt);
  if (alreadyActive) {
    return res.status(400).json({ error: "Bike already in ride" });
  }

  const ride = {
    id: nextRideId++,
    bikeId,
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null,
  };

  rides.push(ride);
  return res.status(201).json(ride);
});

// POST /ride/stop - stoppa en resa
router.post("/stop", requireAuth, (req, res) => {
  const { rideId } = req.body;

  if (!rideId) {
    return res.status(400).json({ error: "rideId krävs" });
  }

  const ride = rides.find((r) => r.id === rideId);

  if (!ride) {
    return res.status(404).json({ error: "Ride not found" });
  }

  if (ride.endedAt) {
    return res.status(400).json({ error: "Ride already finished" });
  }

  ride.endedAt = new Date().toISOString();
  return res.json(ride);
});

module.exports = router;
