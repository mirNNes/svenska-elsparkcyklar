// Simulation-routes som skapar cyklar i DB och broadcastar uppdateringar via Socket.IO.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const cityRepository = require("../repositories/cityRepository");
const bikeRepository = require("../repositories/bikeRepository");

const router = express.Router();

const UPDATE_INTERVAL_MS = 500;
const DEFAULT_BIKES_PER_CITY = 500;
const STEP_SIZE = 0.00005;
const TURN_RATE = 0.35;

const simulation = {
  running: false,
  intervalId: null,
  bikes: [],
  cityCenters: {},
  bikesPerCity: DEFAULT_BIKES_PER_CITY,
};

function normalizeBike(bike) {
  return {
    _id: bike._id,
    id: bike.id,
    cityId: bike.cityId,
    location: bike.location,
    battery: bike.battery,
    isAvailable: bike.isAvailable,
    velocity: getInitialVelocity(),
  };
}

function getCenterForCity(cityCenters, cityId) {
  const key = cityId?.toString();
  return cityCenters[key] || { lat: 0, lng: 0 };
}

function getInitialVelocity() {
  const angle = Math.random() * Math.PI * 2;
  const speed = STEP_SIZE * (0.6 + Math.random() * 0.8);
  return {
    lat: Math.cos(angle) * speed,
    lng: Math.sin(angle) * speed,
  };
}

function getNextMovement(bike, center) {
  const baseLat = Number.isFinite(bike.location?.lat)
    ? bike.location.lat
    : center.lat || 0;
  const baseLng = Number.isFinite(bike.location?.lng)
    ? bike.location.lng
    : center.lng || 0;

  const currentVelocity = bike.velocity || getInitialVelocity();
  const speed =
    Math.sqrt(currentVelocity.lat ** 2 + currentVelocity.lng ** 2) || STEP_SIZE;

  // Små svängar så att cykeln håller riktning en stund innan den byter.
  const turn = (Math.random() - 0.5) * TURN_RATE;
  const angle = Math.atan2(currentVelocity.lng, currentVelocity.lat) + turn;

  const nextVelocity = {
    lat: Math.cos(angle) * speed,
    lng: Math.sin(angle) * speed,
  };

  return {
    nextLocation: {
      lat: baseLat + nextVelocity.lat,
      lng: baseLng + nextVelocity.lng,
    },
    nextVelocity,
  };
}

function stopSimulation() {
  if (simulation.intervalId) {
    clearInterval(simulation.intervalId);
    simulation.intervalId = null;
  }

  simulation.running = false;
  simulation.bikes = [];
  simulation.cityCenters = {};
}

async function prepareSimulation(bikesPerCity) {
  const cities = await cityRepository.getAllCities();

  if (!cities.length) {
    return { error: "Inga städer att simulera" };
  }

  const cityCenters = {};
  const bikes = [];

  for (const city of cities) {
    cityCenters[city._id.toString()] = city.center || { lat: 0, lng: 0 };

    const existing = await bikeRepository.getSimulationBikesByCity(city._id);
    const missing = Math.max(0, bikesPerCity - existing.length);

    const created =
      missing > 0
        ? await bikeRepository.createSimulationBikes({
            cityId: city._id,
            count: missing,
            center: city.center,
          })
        : [];

    existing.forEach((bike) => bikes.push(normalizeBike(bike)));
    created.forEach((bike) => bikes.push(normalizeBike(bike)));
  }

  return {
    bikes,
    cityCenters,
    citiesCount: cities.length,
  };
}

// POST /simulation/start - starta simuleringsrunda
router.post("/start", requireAuth, requireRole("admin"), async (req, res) => {
  const { count } = req.body || {};
  const parsedCount = Number.parseInt(count, 10);
  const bikesPerCity =
    Number.isFinite(parsedCount) && parsedCount > 0
      ? parsedCount
      : DEFAULT_BIKES_PER_CITY;

  if (simulation.running) {
    // Tillåt omstart genom att stoppa innan vi startar om.
    stopSimulation();
  }

  const prep = await prepareSimulation(bikesPerCity);
  if (prep.error) {
    return res.status(400).json({ error: prep.error });
  }

  simulation.running = true;
  simulation.bikes = prep.bikes;
  simulation.cityCenters = prep.cityCenters;
  simulation.bikesPerCity = bikesPerCity;

  const io = req.app.get("io");

  simulation.intervalId = setInterval(async () => {
    if (!simulation.running) return;

    try {
      const updatedBikes = simulation.bikes.map((bike) => {
        const center = getCenterForCity(simulation.cityCenters, bike.cityId);
        const baseLocation =
          Number.isFinite(bike.location?.lat) &&
          Number.isFinite(bike.location?.lng)
            ? bike.location
            : center;
        const currentBattery = Number.isFinite(bike.battery)
          ? bike.battery
          : 100;
        const nextBattery = Math.max(0, currentBattery - Math.random() * 1.5);
        let nextLocation = baseLocation;
        let nextVelocity = bike.velocity || { lat: 0, lng: 0 };
        let speed = 0;
        const isAvailable = nextBattery > 0 ? bike.isAvailable : false;

        if (nextBattery > 0) {
          const movement = getNextMovement(bike, center);
          nextLocation = movement.nextLocation;
          nextVelocity = movement.nextVelocity;
          speed = Math.round(
            Math.sqrt(nextVelocity.lat ** 2 + nextVelocity.lng ** 2) * 111000
          );
        } else {
          // Om batteriet är slut så står cykeln still
          nextVelocity = { lat: 0, lng: 0 };
        }

        const updatedAt = new Date().toISOString();

        return {
          ...bike,
          location: nextLocation,
          velocity: nextVelocity,
          battery: nextBattery,
          isAvailable,
          speed,
          lastTelemetryAt: updatedAt,
          updatedAt,
        };
      });

      await bikeRepository.bulkUpdateSimulationBikes(updatedBikes);

      if (io) {
        updatedBikes.forEach((bike) => {
          io.emit("bike-update", {
            id: bike.id,
            cityId: bike.cityId,
            location: bike.location,
            battery: bike.battery,
            isAvailable: bike.isAvailable,
            speed: bike.speed,
            isOperational: bike.isOperational,
            isInService: bike.isInService,
            lastTelemetryAt: bike.lastTelemetryAt,
            updatedAt: bike.updatedAt,
          });
        });
      }

      simulation.bikes = updatedBikes;
    } catch (error) {
      console.error("Simulation tick failed:", error);
    }
  }, UPDATE_INTERVAL_MS);

  return res.json({
    message: "Simulation startad",
    bikesPerCity,
    totalBikes: simulation.bikes.length,
    intervalMs: UPDATE_INTERVAL_MS,
  });
});

// POST /simulation/stop - stoppa simuleringen
router.post("/stop", requireAuth, requireRole("admin"), async (req, res) => {
  const wasRunning = simulation.running;
  stopSimulation();
  const removed = await bikeRepository.deleteSimulationBikes();
  return res.json({
    message: wasRunning ? "Simulation stoppad" : "Ingen simulation kördes",
    removedBikes: removed,
  });
});

module.exports = router;
