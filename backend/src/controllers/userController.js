const userRepository = require("../repositories/userRepository");

// GET /user - hämta alla användare
async function getAllUsers(req, res) {
  const users = await userRepository.getAllUsers();
  res.json(users);
}

// GET /user/me - hämta profil för inloggad användare
async function getMe(req, res) {
  // JWT-baserad identitet är den enda källa vi litar på för "nuvarande användare".
  const userObjectId = req.user?.id;
  if (!userObjectId) return res.status(401).json({ error: "Unauthorized" });

  const user = await userRepository.getUserByObjectId(userObjectId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Skicka tillbaka en säker, användbar vy utan lösenordshash.
  const safeUser = {
    _id: user._id,
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    balance: user.balance,
    stats: user.stats,
  };

  res.json(safeUser);
}

// GET /user/:id - hämta en användare
async function getUserById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const user = await userRepository.getUserById(id);

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

// POST /user - skapa användare
async function createUser(req, res) {
  const { name, email, username, role, stats } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name och email krävs" });
  }
  if (username && typeof username !== "string") return res.status(400).json({ error: "username måste vara en sträng" });
  if (role && !["user", "admin"].includes(role)) return res.status(400).json({ error: "role måste vara user eller admin" });
  if (stats && (stats.distance !== undefined && !Number.isFinite(stats.distance) || stats.rides !== undefined && !Number.isFinite(stats.rides))) {
    return res.status(400).json({ error: "stats.distance/stats.rides måste vara tal" });
  }

  const user = await userRepository.createUser({ name, email, username, role, stats });
  res.status(201).json(user);
}

// PUT /user/:id - ersätt en användare
async function updateUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const { name, email, username, role, stats } = req.body;

  const user = await userRepository.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!name || !email) return res.status(400).json({ error: "name och email krävs" });
  if (username && typeof username !== "string") return res.status(400).json({ error: "username måste vara en sträng" });
  if (role && !["user", "admin"].includes(role)) return res.status(400).json({ error: "role måste vara user eller admin" });
  if (stats && (stats.distance !== undefined && !Number.isFinite(stats.distance) || stats.rides !== undefined && !Number.isFinite(stats.rides))) {
    return res.status(400).json({ error: "stats.distance/stats.rides måste vara tal" });
  }

  const updatedUser = await userRepository.updateUser(id, { name, email, username, role, stats });
  res.json(updatedUser);
}

// PATCH /user/:id - uppdatera delar av en användare
async function patchUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const { name, email, username, role, stats } = req.body;

  const user = await userRepository.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const updatedUser = await userRepository.updateUser(id, { name, email, username, role, stats });
  res.json(updatedUser);
}

// DELETE /user/:id - ta bort användare
async function deleteUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  const success = await userRepository.deleteUser(id);
  if (!success) return res.status(404).json({ error: "User not found" });

  res.status(204).send();
}

// POST /user/:id/topup - fyll på saldo
async function topUpBalance(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const { amount } = req.body || {};

  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt userId" });
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "amount måste vara ett positivt tal" });
  }

  const updatedUser = await userRepository.addBalance(id, parsedAmount);
  if (!updatedUser) return res.status(404).json({ error: "User not found" });

  res.json(updatedUser);
}

module.exports = {
  getAllUsers,
  getMe,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  topUpBalance,
};
