// Grundrouter där varje API-del kopplas in.
const express = require('express');
const cityRouter = require('./city');
const userRouter = require('./user');
const bikeRouter = require('./bike');
const rideRouter = require('./ride');
const authRouter = require('./auth');
const simulationRouter = require('./simulation');

const router = express.Router();

// Placeholder root response so /api can be poked right away.
router.get('/', (req, res) => {
  res.json({ message: 'API ready for more routes' });
});

router.use('/city', cityRouter);
router.use('/user', userRouter);
router.use('/bike', bikeRouter);
router.use('/ride', rideRouter);
router.use('/auth', authRouter);
router.use('/simulation', simulationRouter);

module.exports = router;
