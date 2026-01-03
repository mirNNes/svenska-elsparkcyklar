const rideRepository = require("../repositories/rideRepository");
const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");

// POST /ride/start - starta en resa
async function startRide(req, res) {
  const { bikeId, userId: bodyUserId } = req.body || {};
  const isAdmin = req.user?.role === "admin";
  let userId = isAdmin ? bodyUserId : null;

  if (!Number.isInteger(bikeId) || bikeId <= 0) {
    return res.status(400).json({ error: "Ogiltigt bikeId" });
  }
  const bike = await bikeRepository.getBikeById(bikeId);
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
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  if (bike.isOperational === false) return res.status(400).json({ error: "Bike is disabled" });
  if (bike.isInService === true) return res.status(400).json({ error: "Bike is in service" });
  if (!bike.isAvailable)
    return res.status(400).json({ error: "Bike already rented" });

  const ride = await rideRepository.startRide(bikeId, userId);
  if (ride && ride.error) {
    // rideRepository svarar med error om bike/user saknas eller redan är i resa
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

  // Vi kräver slutposition så att parkering/batteri blir korrekt uppdaterat.
  const endedRide = await rideRepository.endRide(rideId, {
    lat: endLat,
    lng: endLng,
  });
  // Sätt cykeln som ledig igen, Ride sparar bikeId som Mongo _id
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
  res.json({ ride: ride || null });
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
