// Stad-routes som använder en tillfällig lista i minnet.
const express = require('express');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const cities = [
  { id: 1, name: 'Stockholm', scootersAvailable: 120 },
  { id: 2, name: 'Göteborg', scootersAvailable: 80 },
];
let nextCityId = 3;

// GET /city - lista alla städer
router.get('/', (req, res) => {
  res.json(cities);
});

// GET /city/:id - hämta en specifik stad
router.get('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const city = cities.find((c) => c.id === id);

  if (!city) {
    return res.status(404).json({ error: 'City not found' });
  }

  return res.json(city);
});

// Hjälpfunktion som applicerar uppdateringar från req.body på en stad.
function applyCityUpdates(city, body, { requireField } = { requireField: false }) {
  const { name, scootersAvailable } = body;

  if (requireField && (name === undefined || scootersAvailable === undefined)) {
    return { error: 'name and scootersAvailable are required' };
  }

  if (name !== undefined) {
    city.name = name;
  }

  if (scootersAvailable !== undefined) {
    city.scootersAvailable = scootersAvailable;
  }

  if (name === undefined && scootersAvailable === undefined) {
    return { error: 'At least one field must be provided' };
  }

  return { city };
}

// POST /city - skapa en ny stad
router.post('/', requireAuth, (req, res) => {
  const { name, scootersAvailable } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const city = {
    id: nextCityId++,
    name,
    scootersAvailable: Number.isFinite(scootersAvailable) ? scootersAvailable : 0,
  };

  cities.push(city);
  return res.status(201).json(city);
});

// PUT /city/:id - ersätt en stad
router.put('/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const city = cities.find((c) => c.id === id);

  if (!city) {
    return res.status(404).json({ error: 'City not found' });
  }

  const result = applyCityUpdates(city, req.body, { requireField: true });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result.city);
});

// PATCH /city/:id - uppdatera delar av en stad
router.patch('/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const city = cities.find((c) => c.id === id);

  if (!city) {
    return res.status(404).json({ error: 'City not found' });
  }

  const result = applyCityUpdates(city, req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result.city);
});

// DELETE /city/:id - ta bort en stad
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const index = cities.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'City not found' });
  }

  cities.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
