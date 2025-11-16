// Cykel-routes som hanterar cyklar och enkla uthyrningar i minnet.
const express = require('express');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const bikes = [
  { id: 1, cityId: 1, isAvailable: true },
  { id: 2, cityId: 2, isAvailable: true },
];
const rents = [];
let nextBikeId = 3;
let nextRentId = 1;

// GET /bike - lista alla cyklar
router.get('/', (req, res) => {
  res.json(bikes);
});

// POST /bike - lägg till cykel
router.post('/', requireAuth, (req, res) => {
  const { cityId } = req.body;

  if (!cityId) {
    return res.status(400).json({ error: 'cityId krävs' });
  }

  const bike = {
    id: nextBikeId++,
    cityId,
    isAvailable: true,
  };

  bikes.push(bike);
  return res.status(201).json(bike);
});

// DELETE /bike/:id - ta bort cykel
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const index = bikes.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Bike not found' });
  }

  const activeRent = rents.find((rent) => rent.bikeId === id && !rent.endedAt);
  if (activeRent) {
    return res.status(400).json({ error: 'Bike is currently rented' });
  }

  bikes.splice(index, 1);
  return res.status(204).send();
});

// POST /bike/rent/:bikeId/:userId - starta uthyrning
router.post('/rent/:bikeId/:userId', requireAuth, (req, res) => {
  const bikeId = Number.parseInt(req.params.bikeId, 10);
  const userId = Number.parseInt(req.params.userId, 10);
  const bike = bikes.find((b) => b.id === bikeId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Ogiltigt userId' });
  }

  if (!bike) {
    return res.status(404).json({ error: 'Bike not found' });
  }

  if (!bike.isAvailable) {
    return res.status(400).json({ error: 'Bike already rented' });
  }

  const rent = {
    id: nextRentId++,
    bikeId,
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null,
  };

  rents.push(rent);
  bike.isAvailable = false;

  return res.status(201).json(rent);
});

// POST /bike/rent-leave/:rentId - avsluta resa
router.post('/rent-leave/:rentId', requireAuth, (req, res) => {
  const rentId = Number.parseInt(req.params.rentId, 10);
  const rent = rents.find((r) => r.id === rentId);

  if (!rent) {
    return res.status(404).json({ error: 'Rent not found' });
  }

  if (rent.endedAt) {
    return res.status(400).json({ error: 'Rent already finished' });
  }

  rent.endedAt = new Date().toISOString();
  const bike = bikes.find((b) => b.id === rent.bikeId);
  if (bike) {
    bike.isAvailable = true;
  }

  return res.json(rent);
});

module.exports = router;
