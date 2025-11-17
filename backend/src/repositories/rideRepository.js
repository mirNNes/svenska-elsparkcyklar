// Repository för resor med in-memory-lagring.
let nextRideId = 2;

const rides = [
  {
    id: 1,
    bikeId: 1,
    userId: 1,
    startedAt: "2024-01-01T10:00:00.000Z",
    endedAt: "2024-01-01T10:15:00.000Z",
  },
];

async function getRideById(id) {
  return rides.find((r) => r.id === id) || null;
}

async function getRidesByUserId(userId) {
  return rides.filter((ride) => ride.userId === userId);
}

async function startRide(bikeId, userId) {
  const alreadyActive = rides.find((ride) => ride.bikeId === bikeId && !ride.endedAt);
  if (alreadyActive) {
    return { error: "Bike already in ride" };
  }

  const ride = {
    id: nextRideId++,
    bikeId,
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null,
  };

  rides.push(ride);
  return { ride };
}

async function stopRide(rideId) {
  const ride = rides.find((r) => r.id === rideId);
  if (!ride) {
    return { error: "Ride not found", code: "not_found" };
  }

  if (ride.endedAt) {
    return { error: "Ride already finished", code: "already_finished" };
  }

  ride.endedAt = new Date().toISOString();
  return { ride };
}

module.exports = {
  getRideById,
  getRidesByUserId,
  startRide,
  stopRide,
};
