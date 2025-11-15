// Ride-routes som loggar enkla resor i minnet.
const express = require('express');

const router = express.Router();

const rides = [
  {
    id: 1,
    bikeId: 1,
    userId: 1,
    startedAt: '2024-01-01T10:00:00.000Z',
    endedAt: '2024-01-01T10:15:00.000Z',
  },
];
let nextRideId = 2;

// GET /ride/user/:userId - hämta resor för en användare
router.get('/user/:userId', (req, res) => {
  const userId = Number.parseInt(req.params.userId, 10);
  const userRides = rides.filter((ride) => ride.userId === userId);

  if (userRides.length === 0) {
    return res.status(404).json({ error: 'No rides found for user' });
  }

  return res.json(userRides);
});

// GET /ride/:id - hämta en specifik resa
router.get('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const ride = rides.find((r) => r.id === id);

  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  return res.json(ride);
});

// POST /ride/start - starta en resa
router.post('/start', (req, res) => {
  const { bikeId, userId } = req.body;

  if (!bikeId || !userId) {
    return res.status(400).json({ error: 'bikeId och userId krävs' });
  }

  const alreadyActive = rides.find((ride) => ride.bikeId === bikeId && !ride.endedAt);
  if (alreadyActive) {
    return res.status(400).json({ error: 'Bike already in ride' });
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
router.post('/stop', (req, res) => {
  const { rideId } = req.body;

  if (!rideId) {
    return res.status(400).json({ error: 'rideId krävs' });
  }

  const ride = rides.find((r) => r.id === rideId);

  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  if (ride.endedAt) {
    return res.status(400).json({ error: 'Ride already finished' });
  }

  ride.endedAt = new Date().toISOString();
  return res.json(ride);
});

module.exports = router;
