// Simulation-routes som skapar cyklar i DB och broadcastar uppdateringar via Socket.IO.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const cityRepository = require("../repositories/cityRepository");
const bikeRepository = require("../repositories/bikeRepository");

const router = express.Router();

const UPDATE_INTERVAL_MS = 2000;
const DEFAULT_BIKES_PER_CITY = 500;

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
  };
}

function getCenterForCity(cityCenters, cityId) {
  const key = cityId?.toString();
  return cityCenters[key] || { lat: 0, lng: 0 };
}

function getNextLocation(location, center) {
  const baseLat = Number.isFinite(location?.lat) ? location.lat : center.lat || 0;
  const baseLng = Number.isFinite(location?.lng) ? location.lng : center.lng || 0;
  const deltaLat = (Math.random() - 0.5) * 0.002;
  const deltaLng = (Math.random() - 0.5) * 0.002;
  return { lat: baseLat + deltaLat, lng: baseLng + deltaLng };
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

    const created = missing > 0
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
  const bikesPerCity = Number.isFinite(parsedCount) && parsedCount > 0
    ? parsedCount
    : DEFAULT_BIKES_PER_CITY;

  if (simulation.running) {
    return res.status(409).json({ error: "Simulation körs redan" });
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
        const nextLocation = getNextLocation(bike.location, center);
        const nextBattery = Math.max(
          0,
          (Number.isFinite(bike.battery) ? bike.battery : 100) - Math.random() * 1.5
        );
        const updatedAt = new Date().toISOString();

        return {
          ...bike,
          location: nextLocation,
          battery: nextBattery,
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
router.post("/stop", requireAuth, requireRole("admin"), (req, res) => {
  if (!simulation.running) {
    return res.status(400).json({ error: "Ingen simulation körs" });
  }

  stopSimulation();
  return res.json({ message: "Simulation stoppad" });
});

module.exports = router;
