const userRepository = require("../repositories/userRepository");

// GET /user - hämta alla användare
async function getAllUsers(req, res) {
  const users = await userRepository.getAllUsers();
  res.json(users);
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
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = await userRepository.createUser({ name, email });
  res.status(201).json(user);
}

// PUT /user/:id - ersätt en användare
async function updateUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const { name, email } = req.body;

  const user = await userRepository.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!name || !email) return res.status(400).json({ error: "name and email are required" });

  const updatedUser = await userRepository.updateUser(id, { name, email });
  res.json(updatedUser);
}

// PATCH /user/:id - uppdatera delar av en användare
async function patchUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  const { name, email } = req.body;

  const user = await userRepository.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const updatedUser = await userRepository.updateUser(id, { name, email });
  res.json(updatedUser);
}

// DELETE /user/:id - ta bort användare
async function deleteUser(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  const success = await userRepository.deleteUser(id);
  if (!success) return res.status(404).json({ error: "User not found" });

  res.status(204).send();
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
