// Simulation-routes som startar och stoppar en enkel timer i minnet.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const simulation = {
  running: false,
  intervalId: null,
  targetCount: 0,
  ticks: 0,
};

function stopSimulation() {
  if (simulation.intervalId) {
    clearInterval(simulation.intervalId);
    simulation.intervalId = null;
  }

  simulation.running = false;
  simulation.ticks = 0;
  simulation.targetCount = 0;
}

// POST /simulation/start - starta simuleringsrunda
router.post("/start", requireAuth, (req, res) => {
  const { count = 1000 } = req.body || {};
  const parsedCount = Number.parseInt(count, 10);

  if (!Number.isFinite(parsedCount) || parsedCount <= 0) {
    return res.status(400).json({ error: 'count måste vara ett positivt tal' });
  }

  if (simulation.running) {
    return res.status(409).json({ error: 'Simulation körs redan' });
  }

  simulation.running = true;
  simulation.targetCount = parsedCount;
  simulation.ticks = 0;
  simulation.intervalId = setInterval(() => {
    simulation.ticks += 1;
    if (simulation.ticks >= simulation.targetCount) {
      stopSimulation();
    }
  }, 500);

  return res.json({
    message: 'Simulation startad',
    targetCount: simulation.targetCount,
    intervalMs: 500,
  });
});

// POST /simulation/stop - stoppa simuleringen
router.post("/stop", requireAuth, (req, res) => {
  if (!simulation.running) {
    return res.status(400).json({ error: 'Ingen simulation körs' });
  }

  stopSimulation();
  return res.json({ message: 'Simulation stoppad' });
});

module.exports = router;
