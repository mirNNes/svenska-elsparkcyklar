// Simulation-routes som skapar cyklar i DB och broadcastar uppdateringar via Socket.IO.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const cityRepository = require("../repositories/cityRepository");
const bikeRepository = require("../repositories/bikeRepository");
const rideRepository = require("../repositories/rideRepository");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const router = express.Router();

const UPDATE_INTERVAL_MS = 500;
const DEFAULT_BIKES_PER_CITY = 500;
const STEP_SIZE = 0.00005;
const TURN_RATE = 0.35;
const DEFAULT_USERS_TOTAL = 1500;
const LOG_SIMULATION = process.env.SIM_LOGS !== "0";

function parsePositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const LOG_INTERVAL_MS = parsePositiveNumber(
  process.env.SIM_LOG_INTERVAL_MS,
  5000
);
const LOG_SAMPLE_PER_CITY = parsePositiveNumber(process.env.SIM_LOG_SAMPLE, 5);
const MIN_RIDE_DURATION_MS = 2 * 60 * 1000;
const MAX_RIDE_DURATION_MS = 6 * 60 * 1000;
const LONG_RIDE_RATIO = 0.2;
const LONG_RIDE_MIN_MS = 7 * 60 * 1000;
const LONG_RIDE_MAX_MS = 12 * 60 * 1000;
const LOW_BATTERY_END_THRESHOLD = 5;
const SIM_USER_PREFIX = "simuser";
const SIM_USER_PASSWORD = "simuser123";

const simulation = {
  running: false,
  intervalId: null,
  bikes: [],
  cityCenters: {},
  bikesPerCity: DEFAULT_BIKES_PER_CITY,
  usersTotal: DEFAULT_USERS_TOTAL,
  simUsers: [],
  simUserByBikeId: new Map(),
  activeRides: new Map(),
  desiredActiveRides: 0,
  lastLogAt: 0,
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

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getSimulationSuffix(username) {
  if (typeof username !== "string") return null;
  const match = username.match(new RegExp(`^${SIM_USER_PREFIX}(\\d+)$`));
  return match ? Number(match[1]) : null;
}

async function ensureSimulationUsers(desiredCount) {
  const existing = await User.find({ isSimulation: true }).sort({ id: 1 });
  if (existing.length >= desiredCount) {
    return existing.slice(0, desiredCount);
  }

  const lastUser = await User.findOne().sort({ id: -1 });
  let nextId = lastUser ? lastUser.id + 1 : 1;
  const passwordHash = await bcrypt.hash(SIM_USER_PASSWORD, 10);

  const maxSuffix = existing.reduce((max, user) => {
    const suffix = getSimulationSuffix(user.username);
    return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
  }, 0);
  let suffix = maxSuffix + 1;

  const missing = desiredCount - existing.length;
  const usersToCreate = [];

  for (let i = 0; i < missing; i += 1) {
    const label = `${SIM_USER_PREFIX}${suffix++}`;
    usersToCreate.push({
      id: nextId++,
      name: `Sim User ${label}`,
      email: `${label}@elspark.test`,
      username: label,
      role: "user",
      passwordHash,
      isSimulation: true,
      balance: 100,
      stats: { distance: 0, rides: 0 },
    });
  }

  const created = await User.insertMany(usersToCreate);
  return existing.concat(created);
}

function assignSimUsersToBikes(bikes, simUsers) {
  const mapping = new Map();
  if (!Array.isArray(bikes) || !Array.isArray(simUsers) || !simUsers.length) {
    return mapping;
  }

  // Knyt varje cykel till en specifik sim-användare
  bikes.forEach((bike, index) => {
    const simUser = simUsers[index % simUsers.length];
    if (simUser) {
      mapping.set(bike.id, simUser);
    }
  });

  return mapping;
}

function formatNumber(value, decimals = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toFixed(decimals);
}

function getSimUserLabel(simUser) {
  if (!simUser) return "-";
  const suffix = getSimulationSuffix(simUser.username);
  if (Number.isFinite(suffix)) {
    return `Sim user ${suffix}`;
  }

  return (
    simUser.name ||
    simUser.username ||
    simUser.email ||
    (Number.isInteger(simUser.id) ? `User #${simUser.id}` : "-")
  );
}

function getSampleBikesByCity(bikes, perCity) {
  const groups = new Map();
  const sample = [];

  bikes.forEach((bike) => {
    const cityKey = String(bike.cityId || "okand");
    if (!groups.has(cityKey)) {
      groups.set(cityKey, []);
    }

    const group = groups.get(cityKey);
    if (group.length >= perCity) return;

    group.push(bike);
    sample.push(bike);
  });

  return { sample, groups };
}

function logSimulationSnapshot(bikes, now, force = false) {
  if (!LOG_SIMULATION) return;
  if (!force && now - simulation.lastLogAt < LOG_INTERVAL_MS) return;

  simulation.lastLogAt = now;
  const { sample, groups } = getSampleBikesByCity(bikes, LOG_SAMPLE_PER_CITY);
  const timestamp = new Date(now).toISOString();

  console.log(
    `[SIM] Live snapshot ${timestamp} | Bikes: ${bikes.length} | Cities: ${groups.size}`
  );
  console.log(
    " Bike  CityId                  Batt%  Speed  Status   Ride  User          Lat       Lng"
  );
  console.log(
    "----- ------------------------ ------ ------ -------- ------ ------------- --------- ---------"
  );

  const ordered = [...sample].sort((a, b) => {
    const cityA = String(a.cityId || "");
    const cityB = String(b.cityId || "");
    if (cityA === cityB) {
      return (a.id || 0) - (b.id || 0);
    }
    return cityA.localeCompare(cityB);
  });

  ordered.forEach((bike) => {
    const rideInfo = simulation.activeRides.get(bike.id);
    const simUser = simulation.simUserByBikeId.get(bike.id);
    const row = [
      String(bike.id ?? "-").padStart(5),
      String(bike.cityId || "-").padEnd(24),
      String(formatNumber(bike.battery, 1)).padStart(6),
      String(formatNumber(bike.speed, 1)).padStart(6),
      String(bike.isAvailable ? "Ledig" : "Uthyrd").padEnd(8),
      String(rideInfo?.rideId ?? "-").padStart(6),
      String(getSimUserLabel(simUser)).padEnd(13),
      String(formatNumber(bike.location?.lat, 5)).padStart(9),
      String(formatNumber(bike.location?.lng, 5)).padStart(9),
    ];

    console.log(row.join(" "));
  });

  console.log("");
}

function buildRidePlan(now) {
  const longRide = Math.random() < LONG_RIDE_RATIO;
  const minMs = longRide ? LONG_RIDE_MIN_MS : MIN_RIDE_DURATION_MS;
  const maxMs = longRide ? LONG_RIDE_MAX_MS : MAX_RIDE_DURATION_MS;

  return {
    endAt: now + randomBetween(minMs, maxMs),
    endWhenLow: longRide,
  };
}

async function startSimulationRide(bike, simUser, now) {
  if (!bike || !simUser) return null;

  const ride = await rideRepository.startRide(bike.id, simUser.id);
  if (!ride?.ride) return null;

  await bikeRepository.markBikeAsUnavailable(bike.id);
  bike.isAvailable = false;

  simulation.activeRides.set(bike.id, {
    rideId: ride.ride.id,
    userId: simUser.id,
    ...buildRidePlan(now),
  });

  return ride.ride;
}

async function startInitialSimulationRides() {
  const now = Date.now();

  for (const bike of simulation.bikes) {
    const simUser = simulation.simUserByBikeId.get(bike.id);
    if (!simUser) continue;

    try {
      await startSimulationRide(bike, simUser, now);
    } catch (error) {
      console.error("Failed to start simulated ride:", error);
    }
  }
}

function stopSimulation() {
  if (simulation.intervalId) {
    clearInterval(simulation.intervalId);
    simulation.intervalId = null;
  }

  simulation.running = false;
  simulation.bikes = [];
  simulation.cityCenters = {};
  simulation.simUserByBikeId = new Map();
  simulation.lastLogAt = 0;
}

async function endActiveSimulationRides() {
  if (!simulation.activeRides.size) return;

  const bikesById = new Map(simulation.bikes.map((bike) => [bike.id, bike]));

  for (const [bikeId, rideInfo] of simulation.activeRides.entries()) {
    const bike = bikesById.get(bikeId);
    if (!bike?.location) continue;

    try {
      await rideRepository.endRide(rideInfo.rideId, {
        lat: bike.location.lat,
        lng: bike.location.lng,
      });
      await bikeRepository.markBikeAsAvailable(bikeId);
    } catch (error) {
      console.error("Failed to end simulated ride:", error);
    }
  }

  simulation.activeRides.clear();
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
  const { count, userCount } = req.body || {};
  const parsedCount = Number.parseInt(count, 10);
  const parsedUserCount = Number.parseInt(userCount, 10);
  const bikesPerCity =
    Number.isFinite(parsedCount) && parsedCount > 0
      ? parsedCount
      : DEFAULT_BIKES_PER_CITY;
  const requestedUsers =
    Number.isFinite(parsedUserCount) && parsedUserCount > 0
      ? parsedUserCount
      : DEFAULT_USERS_TOTAL;

  if (simulation.running) {
    // Tillåt omstart genom att stoppa innan vi startar om.
    await endActiveSimulationRides();
    stopSimulation();
  }

  const prep = await prepareSimulation(bikesPerCity);
  if (prep.error) {
    return res.status(400).json({ error: prep.error });
  }

  const totalUsers = Math.max(requestedUsers, prep.bikes.length);
  const simUsers = await ensureSimulationUsers(totalUsers);

  simulation.running = true;
  simulation.bikes = prep.bikes;
  simulation.cityCenters = prep.cityCenters;
  simulation.bikesPerCity = bikesPerCity;
  simulation.usersTotal = totalUsers;
  simulation.simUsers = simUsers;
  simulation.simUserByBikeId = assignSimUsersToBikes(
    simulation.bikes,
    simUsers
  );
  simulation.activeRides = new Map();
  simulation.desiredActiveRides = Math.min(
    simulation.bikes.length,
    simulation.simUsers.length
  );
  simulation.lastLogAt = 0;

  // Starta en resa per cykel så att uthyrningen syns direkt i admin-UI
  await startInitialSimulationRides();
  logSimulationSnapshot(simulation.bikes, Date.now(), true);

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

      const bikesById = new Map(updatedBikes.map((bike) => [bike.id, bike]));
      const now = Date.now();
      const endedBikeIds = [];

      if (simulation.activeRides.size > 0) {
        for (const [bikeId, rideInfo] of simulation.activeRides.entries()) {
          const bike = bikesById.get(bikeId);
          if (!bike) {
            simulation.activeRides.delete(bikeId);
            continue;
          }

          const isLowBattery =
            Number.isFinite(bike.battery) &&
            bike.battery <= LOW_BATTERY_END_THRESHOLD;
          const shouldEnd =
            rideInfo.endAt <= now || (rideInfo.endWhenLow && isLowBattery);

          if (!shouldEnd) {
            bike.isAvailable = false;
            continue;
          }

          const endLat = bike.location?.lat;
          const endLng = bike.location?.lng;
          if (!Number.isFinite(endLat) || !Number.isFinite(endLng)) {
            bike.isAvailable = false;
            continue;
          }

          try {
            await rideRepository.endRide(rideInfo.rideId, {
              lat: endLat,
              lng: endLng,
            });
            await bikeRepository.markBikeAsAvailable(bikeId);
            bike.isAvailable = true;

            // Synka batteri/position från DB så vi inte skriver över med gamla värden.
            const refreshedBike = await bikeRepository.getBikeById(bikeId);
            if (refreshedBike) {
              bike.battery = refreshedBike.battery;
              bike.location = refreshedBike.location;
            }
          } catch (error) {
            console.error("Failed to end simulated ride:", error);
          } finally {
            simulation.activeRides.delete(bikeId);
            endedBikeIds.push(bikeId);
          }
        }
      }

      if (endedBikeIds.length > 0) {
        for (const bikeId of endedBikeIds) {
          const bike = bikesById.get(bikeId);
          const simUser = simulation.simUserByBikeId.get(bikeId);
          if (!bike || !simUser) continue;

          try {
            await startSimulationRide(bike, simUser, now);
          } catch (error) {
            console.error("Failed to restart simulated ride:", error);
          }
        }
      }

      if (simulation.simUsers.length > 0) {
        const bikesMissingRide = updatedBikes.filter(
          (bike) => !simulation.activeRides.has(bike.id)
        );

        for (const bike of bikesMissingRide) {
          const simUser =
            simulation.simUserByBikeId.get(bike.id) ??
            pickRandomItem(simulation.simUsers);
          if (!simUser) continue;

          try {
            await startSimulationRide(bike, simUser, now);
          } catch (error) {
            console.error("Failed to backfill simulated ride:", error);
          }
        }
      }

      await bikeRepository.bulkUpdateSimulationBikes(updatedBikes);

      if (io) {
        // Skicka batch uppdatering per tick så admin-klienten kan uppdatera allt på en gång.
        io.emit("bike-batch-update", { bikes: updatedBikes });
      }

      logSimulationSnapshot(updatedBikes, now);

      simulation.bikes = updatedBikes;
    } catch (error) {
      console.error("Simulation tick failed:", error);
    }
  }, UPDATE_INTERVAL_MS);

  return res.json({
    message: "Simulation startad",
    bikesPerCity,
    totalBikes: simulation.bikes.length,
    totalUsers: simulation.simUsers.length,
    activeRideTarget: simulation.desiredActiveRides,
    intervalMs: UPDATE_INTERVAL_MS,
  });
});

// POST /simulation/stop - stoppa simuleringen
router.post("/stop", requireAuth, requireRole("admin"), async (req, res) => {
  const wasRunning = simulation.running;
  await endActiveSimulationRides();
  stopSimulation();
  simulation.simUsers = [];
  simulation.simUserByBikeId = new Map();
  simulation.activeRides = new Map();
  simulation.desiredActiveRides = 0;
  const removed = await bikeRepository.deleteSimulationBikes();
  return res.json({
    message: wasRunning ? "Simulation stoppad" : "Ingen simulation kördes",
    removedBikes: removed,
  });
});

module.exports = router;
