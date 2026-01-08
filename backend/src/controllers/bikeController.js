const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");
const stationRepository = require("../repositories/stationRepository");

async function getAllBikes(req, res) {
  const bikes = await bikeRepository.getAllBikes();
  res.json(bikes);
}

async function getBikeById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Ogiltigt bikeId" });
  const bike = await bikeRepository.getBikeById(id);
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  res.json(bike);
}

async function createBike(req, res) {
  const { cityId } = req.body;
  if (!cityId) return res.status(400).json({ error: "cityId krävs" });
  if (typeof cityId !== "string" && !Number.isInteger(cityId)) {
    return res
      .status(400)
      .json({ error: "cityId måste vara ett id eller ObjectId-sträng" });
  }
  const bike = await bikeRepository.createBike({ cityId });
  res.status(201).json(bike);
}

async function deleteBike(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const result = await bikeRepository.deleteBike(id);
  if (!result.success && result.reason === "not_found")
    return res.status(404).json({ error: "Bike not found" });
  if (!result.success && result.reason === "rented")
    return res.status(400).json({ error: "Bike is currently rented" });
  return res.status(204).send();
}

async function startRent(req, res) {
  const bikeId = Number.parseInt(req.params.bikeId, 10);
  const isAdmin = req.user?.role === "admin";
  let userId = isAdmin ? Number.parseInt(req.params.userId, 10) : null;

  if (!Number.isInteger(bikeId) || bikeId <= 0)
    return res.status(400).json({ error: "Ogiltigt bikeId" });

  const bike = await bikeRepository.getBikeById(bikeId);

  if (bike && bike.currentStationId) {
    const station = await stationRepository.getStationById(bike.currentStationId);

    if (station && station.currentBikes > 0) {
      station.currentBikes -= 1;
      await station.save();
    }

    // Rensa station-koppling på cykeln
    await bikeRepository.updateBikeTelemetry(bikeId, {
      currentStationId: null,
      isCharging: false,
    });
  }

  let user;

  if (isAdmin) {
    if (!Number.isInteger(userId) || userId <= 0)
      return res.status(400).json({ error: "Ogiltigt userId" });
    user = await userRepository.getUserById(userId);
  } else {
    const userObjectId = req.user?.id;
    if (!userObjectId) return res.status(401).json({ error: "Unauthorized" });
    user = await userRepository.getUserByObjectId(userObjectId);
    if (user) userId = user.id;
  }

  if (!user) return res.status(404).json({ error: "User not found" });
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  if (bike.isOperational === false)
    return res.status(400).json({ error: "Bike is disabled" });
  if (bike.isInService === true)
    return res.status(400).json({ error: "Bike is in service" });
  if (!bike.isAvailable)
    return res.status(400).json({ error: "Bike already rented" });

  const rent = await bikeRepository.startRent(bikeId, userId);
  if (rent && rent.error) return res.status(404).json({ error: rent.error });

  return res.status(201).json(rent);
}

async function endRent(req, res) {
  const rentId = Number.parseInt(req.params.rentId, 10);
  const rent = await bikeRepository.getRentById(rentId);
  if (!rent) return res.status(404).json({ error: "Rent not found" });
  if (rent.endedAt)
    return res.status(400).json({ error: "Rent already finished" });

  const ended = await bikeRepository.endRent(rentId);
  res.json(ended);
}

async function updateTelemetry(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Ogiltigt bikeId" });

  const { location, battery, isAvailable, speed, isOperational, isInService } =
    req.body || {};
  const updates = {};

  if (location !== undefined) {
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Ogiltig location" });
    }
    updates.location = { lat, lng };
  }

  if (battery !== undefined) {
    const batteryValue = Number(battery);
    if (
      !Number.isFinite(batteryValue) ||
      batteryValue < 0 ||
      batteryValue > 100
    ) {
      return res.status(400).json({ error: "Ogiltigt batteri" });
    }
    updates.battery = batteryValue;
  }

  if (isAvailable !== undefined) {
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ error: "isAvailable måste vara boolean" });
    }
    updates.isAvailable = isAvailable;
  }

  if (speed !== undefined) {
    const speedValue = Number(speed);
    if (!Number.isFinite(speedValue) || speedValue < 0) {
      return res.status(400).json({ error: "Ogiltig speed" });
    }
    updates.speed = speedValue;
  }

  if (isOperational !== undefined) {
    if (typeof isOperational !== "boolean") {
      return res
        .status(400)
        .json({ error: "isOperational måste vara boolean" });
    }
    updates.isOperational = isOperational;
  }

  if (isInService !== undefined) {
    if (typeof isInService !== "boolean") {
      return res.status(400).json({ error: "isInService måste vara boolean" });
    }
    updates.isInService = isInService;
  }

  if (updates.battery !== undefined && updates.battery <= 0) {
    // Om batteriet är slut så stannar cykeln och är otillgänglig
    updates.speed = 0;
    updates.isAvailable = false;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "Inga fält att uppdatera" });
  }

  updates.lastTelemetryAt = new Date();

  const updatedBike = await bikeRepository.updateBikeTelemetry(id, updates);
  if (!updatedBike) return res.status(404).json({ error: "Bike not found" });

  const io = req.app.get("io");
  if (io) {
    io.emit("bike-update", {
      id: updatedBike.id,
      cityId: updatedBike.cityId,
      location: updatedBike.location,
      battery: updatedBike.battery,
      isAvailable: updatedBike.isAvailable,
      speed: updatedBike.speed,
      isOperational: updatedBike.isOperational,
      isInService: updatedBike.isInService,
      lastTelemetryAt: updatedBike.lastTelemetryAt,
      updatedAt: new Date().toISOString(),
    });
  }

  return res.json(updatedBike);
}

async function disableBike(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Ogiltigt bikeId" });

  const updatedBike = await bikeRepository.updateBikeTelemetry(id, {
    isOperational: false,
  });
  if (!updatedBike) return res.status(404).json({ error: "Bike not found" });

  return res.json(updatedBike);
}

async function enableBike(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Ogiltigt bikeId" });

  const updatedBike = await bikeRepository.updateBikeTelemetry(id, {
    isOperational: true,
    isInService: false,
  });
  if (!updatedBike) return res.status(404).json({ error: "Bike not found" });

  return res.json(updatedBike);
}

async function moveBikeToStation(req, res) {
  const bikeId = Number.parseInt(req.params.bikeId, 10);
  const stationId = Number.parseInt(req.params.stationId, 10);

  if (!Number.isInteger(bikeId) || !Number.isInteger(stationId)) {
    return res.status(400).json({ error: "Ogiltigt id" });
  }

  const station = await stationRepository.getStationById(stationId);
  if (!station) {
    return res.status(404).json({ error: "Station not found" });
  }

  if (station.capacity > 0 && station.currentBikes >= station.capacity) {
    return res.status(400).json({ error: "Stationen är full" });
  }

  const bike = await bikeRepository.moveBikeToStation(
    bikeId,
    {
      lat: station.location.lat,
      lng: station.location.lng,
    },
    {
      isAvailable: false,
      isCharging: true,
      currentStationId: station.id,
    }
  );

  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  station.currentBikes += 1;
  await station.save();

  return res.json({
    message: "Bike moved to charging station",
    bike,
    station,
  });
}

module.exports = {
  getAllBikes,
  getBikeById,
  createBike,
  deleteBike,
  startRent,
  endRent,
  updateTelemetry,
  disableBike,
  enableBike,
  moveBikeToStation,
};
