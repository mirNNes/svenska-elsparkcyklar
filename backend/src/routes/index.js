// Grundrouter där varje API-del kopplas in.
const express = require('express');
const cityRouter = require('./city');
const userRouter = require('./user');

const router = express.Router();

// Placeholder root response so /api can be poked right away.
router.get('/', (req, res) => {
  res.json({ message: 'API ready for more routes' });
});

router.use('/city', cityRouter);
router.use('/user', userRouter);

module.exports = router;
