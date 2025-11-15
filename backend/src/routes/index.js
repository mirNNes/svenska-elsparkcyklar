// Base API router where future feature routes will be mounted.
const express = require('express');

const router = express.Router();

// Placeholder root response so /api can be poked right away.
router.get('/', (req, res) => {
  res.json({ message: 'API ready for more routes' });
});

module.exports = router;
