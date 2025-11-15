// Base API router where feature-specific routers are mounted.
const express = require('express');
const cityRouter = require('./city');

const router = express.Router();

// Placeholder root response so /api can be poked right away.
router.get('/', (req, res) => {
  res.json({ message: 'API ready for more routes' });
});

router.use('/city', cityRouter);

module.exports = router;
