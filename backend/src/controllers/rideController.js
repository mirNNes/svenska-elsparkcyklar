const rideRepository = require("../repositories/rideRepository");
const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");

// POST /ride/start - starta en resa
async function startRide(req, res) {
  const { bikeId, userId } = req.body;

  if (!Number.isInteger(bikeId) || bikeId <= 0) {
    return res.status(400).json({ error: "Ogiltigt bikeId" });
  }
  const bike = await bikeRepository.getBikeById(bikeId);
  const user = await userRepository.getUserById(userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Ogiltigt userId" });
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
  const { rideId } = req.body;

  if (!Number.isInteger(rideId) || rideId <= 0) {
    return res.status(400).json({ error: "Ogiltigt rideId" });
  }
  const ride = await rideRepository.getRideById(rideId);
  if (!ride) return res.status(404).json({ error: "Ride not found" });
  if (ride.endedAt)
    return res.status(400).json({ error: "Ride already finished" });

  const endedRide = await rideRepository.endRide(rideId);
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

module.exports = {
  startRide,
  endRide,
  getRideById,
};
