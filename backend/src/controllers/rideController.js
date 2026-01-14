const rideRepository = require("../repositories/rideRepository");
const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");
const stationRepository = require("../repositories/stationRepository");
const parkingZoneRepository = require("../repositories/parkingZoneRepository");

function getUserLabel(user) {
  if (!user) return null;

  const username = user.username || "";
  const simMatch = username.match(/^simuser(\d+)$/);
  if (simMatch) {
    return `Sim user ${simMatch[1]}`;
  }

  return (
    user.name ||
    user.username ||
    user.email ||
    (Number.isInteger(user.id) ? `User #${user.id}` : null)
  );
}

// POST /ride/start - starta en resa
async function startRide(req, res) {
  const { bikeId, userId: bodyUserId } = req.body || {};
  const isAdmin = req.user?.role === "admin";
  let userId = isAdmin ? bodyUserId : null;

  if (!Number.isInteger(bikeId) || bikeId <= 0) {
    return res.status(400).json({ error: "Ogiltigt bikeId" });
  }

  const bike = await bikeRepository.getBikeById(bikeId);
  if (!bike) return res.status(404).json({ error: "Bike not found" });

  let user;
  if (isAdmin) {
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Ogiltigt userId" });
    }
    user = await userRepository.getUserById(userId);
  } else {
    const userObjectId = req.user?.id;
    if (!userObjectId) return res.status(401).json({ error: "Unauthorized" });
    user = await userRepository.getUserByObjectId(userObjectId);
    if (user) userId = user.id;
  }

  if (!user) return res.status(404).json({ error: "User not found" });
  if (bike.isOperational === false)
    return res.status(400).json({ error: "Bike is disabled" });
  if (bike.isInService === true)
    return res.status(400).json({ error: "Bike is in service" });
  if (!bike.isAvailable)
    return res.status(400).json({ error: "Bike already rented" });

  // Om cykeln står på en laddstation – ta bort den därifrån
  if (bike.currentStationId) {
    const stationId = bike.currentStationId;

    await bikeRepository.updateBikeTelemetry(bikeId, {
      currentStationId: null,
      isCharging: false,
      isAvailable: true,
    });

    // Minska antal cyklar på stationen
    await stationRepository.removeBikeFromStation(stationId);
  }

  // Lägre startavgift om cykeln stod på fri parkering
  const startFeeModifier =
    bike.parkingStatus === "OUTSIDE_ZONE" ? 0.8 : 1.0;

  const ride = await rideRepository.startRide(bikeId, userId, {
    startFeeModifier,
  });

  if (ride && ride.error) {
    const status = ride.error === "Bike already in ride" ? 400 : 404;
    return res.status(status).json({ error: ride.error });
  }

  await bikeRepository.markBikeAsUnavailable(bikeId);

  res.status(201).json(ride);
}

// POST /ride/end - avsluta en resa
async function endRide(req, res) {
  const { rideId, endLocation } = req.body || {};

  if (!Number.isInteger(rideId) || rideId <= 0) {
    return res.status(400).json({ error: "Ogiltigt rideId" });
  }
  if (!endLocation) {
    return res.status(400).json({ error: "endLocation krävs" });
  }

  const endLat = Number(endLocation?.lat);
  const endLng = Number(endLocation?.lng);
  if (!Number.isFinite(endLat) || !Number.isFinite(endLng)) {
    return res.status(400).json({ error: "Ogiltig endLocation" });
  }

  const ride = await rideRepository.getRideById(rideId);
  if (!ride) return res.status(404).json({ error: "Ride not found" });
  if (ride.endedAt)
    return res.status(400).json({ error: "Ride already finished" });

  // Avsluta resa med slutposition
  const endedRide = await rideRepository.endRide(rideId, {
    lat: endLat,
    lng: endLng,
  });

  // Kontrollera parkeringszon
  let parkingZone = null;
  try {
    parkingZone = await parkingZoneRepository.findParkingZoneForLocation(
      { lat: endLat, lng: endLng },
      ride.cityId
    );
  } catch (err) {
    console.error("Parking zone check failed", err);
  }

  if (endedRide?.ride) {
    let status = parkingZone ? "OK" : "OUTSIDE_ZONE";
    let zoneId = parkingZone ? parkingZone.id : null;

    endedRide.ride.parkingStatus = status;
    endedRide.ride.parkingZoneId = zoneId;

    await bikeRepository.updateBikeByObjectId(
      endedRide.ride.bikeId,
      {
        parkingStatus: status,
        parkingZoneId: zoneId,
      }
    );
  }

  // Markera cykel som ledig igen
  await bikeRepository.markBikeAsAvailableByObjectId(
    endedRide.ride ? endedRide.ride.bikeId : ride.bikeId
  );

  res.json(endedRide);
}

// GET /ride/:id - hämta resa
async function getRideById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const ride = await rideRepository.getRideById(id);

  if (!ride) return res.status(404).json({ error: "Ride not found" });
  res.json(ride);
}

// GET /ride/me - hämta resor för inloggad användare
async function getMyRides(req, res) {
  const userObjectId = req.user?.id;
  if (!userObjectId) return res.status(401).json({ error: "Unauthorized" });

  const user = await userRepository.getUserByObjectId(userObjectId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const rides = await rideRepository.getRidesByUserObjectId(user._id);
  res.json(rides);
}

// GET /ride/active - hämta aktiv resa för inloggad användare
async function getMyActiveRide(req, res) {
  const userObjectId = req.user?.id;
  if (!userObjectId) return res.status(401).json({ error: "Unauthorized" });

  const user = await userRepository.getUserByObjectId(userObjectId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const ride = await rideRepository.getActiveRideByUserObjectId(user._id);
  res.json({ ride: ride || null });
}

// GET /ride/active/bike/:bikeId - hämta aktiv resa för cykel (admin)
async function getActiveRideByBike(req, res) {
  const bikeId = Number.parseInt(req.params.bikeId, 10);
  if (!Number.isInteger(bikeId)) {
    return res.status(400).json({ error: "Ogiltigt bikeId" });
  }

  const bike = await bikeRepository.getBikeById(bikeId);
  if (!bike) return res.status(404).json({ error: "Bike not found" });

  const ride = await rideRepository.getActiveRideByBikeObjectId(bike._id);
  if (!ride) return res.json({ ride: null });

  const user = await userRepository.getUserByObjectId(ride.userId);
  const userLabel = getUserLabel(user);
  const ridePayload = ride.toObject();
  if (userLabel) {
    ridePayload.userLabel = userLabel;
  }

  res.json({ ride: ridePayload });
}

// GET /ride/user/:userId - resor för specifik användare (admin)
async function getRidesByUser(req, res) {
  const userId = Number.parseInt(req.params.userId, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Ogiltigt userId" });
  }

  try {
    const rides = await rideRepository.getRidesByUserId(userId);
    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rides" });
  }
}

// GET /ride - hämta alla resor (admin)
async function getAllRides(req, res) {
  try {
    const rides = await rideRepository.getAllRides();
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rides" });
  }
}

module.exports = {
  startRide,
  endRide,
  getRideById,
  getMyRides,
  getMyActiveRide,
  getActiveRideByBike,
  getAllRides,
  getRidesByUser,
};
