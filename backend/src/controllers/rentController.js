const rentRepository = require("../repositories/rentRepository");
const bikeRepository = require("../repositories/bikeRepository");
const userRepository = require("../repositories/userRepository");

// POST /rent/start - starta uthyrning
async function startRent(req, res) {
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
  if (!bike.isAvailable) return res.status(400).json({ error: "Bike already rented" });

  const rent = await bikeRepository.startRent(bikeId, userId);
  res.status(201).json(rent);
}

// POST /rent/end - avsluta uthyrning
async function endRent(req, res) {
  const { rentId } = req.body;
  if (!Number.isInteger(rentId) || rentId <= 0) {
    return res.status(400).json({ error: "Ogiltigt rentId" });
  }
  const rent = await bikeRepository.getRentById(rentId);

  if (!rent) return res.status(404).json({ error: "Rent not found" });
  if (rent.endedAt) return res.status(400).json({ error: "Rent already finished" });

  const endedRent = await bikeRepository.endRent(rentId);
  res.json(endedRent);
}

// GET /rent/:id - hämta uthyrning
async function getRentById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const rent = await rentRepository.getRentById(id);

  if (!rent) return res.status(404).json({ error: "Rent not found" });
  res.json(rent);
}

module.exports = {
  startRent,
  endRent,
  getRentById,
};
