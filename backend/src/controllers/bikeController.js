const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");

async function getAllBikes(req, res) {
  const bikes = await bikeRepository.getAllBikes();
  res.json(bikes);
}

async function getBikeById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt bikeId" });
  const bike = await bikeRepository.getBikeById(id);
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  res.json(bike);
}

async function createBike(req, res) {
  const { cityId } = req.body;
  if (!cityId) return res.status(400).json({ error: "cityId krävs" });
  if (typeof cityId !== "string" && !Number.isInteger(cityId)) {
    return res.status(400).json({ error: "cityId måste vara ett id eller ObjectId-sträng" });
  }
  const bike = await bikeRepository.createBike({ cityId });
  res.status(201).json(bike);
}

async function deleteBike(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const result = await bikeRepository.deleteBike(id);
  if (!result.success && result.reason === "not_found") return res.status(404).json({ error: "Bike not found" });
  if (!result.success && result.reason === "rented") return res.status(400).json({ error: "Bike is currently rented" });
  return res.status(204).send();
}

async function startRent(req, res) {
  const bikeId = Number.parseInt(req.params.bikeId, 10);
  const userId = Number.parseInt(req.params.userId, 10);

  if (!Number.isInteger(bikeId) || bikeId <= 0) return res.status(400).json({ error: "Ogiltigt bikeId" });
  const bike = await bikeRepository.getBikeById(bikeId);
  const user = await userRepository.getUserById(userId);
  if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ error: "Ogiltigt userId" });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  if (!bike.isAvailable) return res.status(400).json({ error: "Bike already rented" });

  const rent = await bikeRepository.startRent(bikeId, userId);
  if (rent && rent.error) return res.status(404).json({ error: rent.error });

  return res.status(201).json(rent);
}

async function endRent(req, res) {
  const rentId = Number.parseInt(req.params.rentId, 10);
  const rent = await bikeRepository.getRentById(rentId);
  if (!rent) return res.status(404).json({ error: "Rent not found" });
  if (rent.endedAt) return res.status(400).json({ error: "Rent already finished" });

  const ended = await bikeRepository.endRent(rentId);
  res.json(ended);
}

module.exports = {
  getAllBikes,
  getBikeById,
  createBike,
  deleteBike,
  startRent,
  endRent,
};
