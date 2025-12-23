// Grundrouter där varje API-del kopplas in.
const express = require('express');
const cityRouter = require('./city');
const userRouter = require('./user');
const bikeRouter = require('./bike');
const rideRouter = require('./ride');
const authRouter = require('./auth');
const simulationRouter = require('./simulation');
const adminRouter = require('./admin');
const stationRouter = require('./station');
const parkingZoneRouter = require('./parkingZone');
const allowedZoneRouter = require('./allowedZone');
const invoiceRouter = require('./invoice');

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
router.use('/admin', adminRouter);
router.use('/station', stationRouter);
router.use('/parking-zone', parkingZoneRouter);
router.use('/allowed-zone', allowedZoneRouter);
router.use('/invoice', invoiceRouter);

module.exports = router;
