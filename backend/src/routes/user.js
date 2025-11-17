// Användar-routes som använder en lista i minnet som datakälla.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const userRepository = require("../repositories/userRepository");

const router = express.Router();

// GET /user - lista alla användare
router.get("/", async (req, res) => {
  const users = await userRepository.getAllUsers();
  res.json(users);
});

// GET /user/:id - hämta en specifik användare
router.get("/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const user = await userRepository.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});

// POST /user - skapa en ny användare
router.post("/", requireAuth, async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = await userRepository.createUser({ name, email });
  return res.status(201).json(user);
});

// PUT /user/:id - ersätt en användare
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const user = await userRepository.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  user.name = name;
  user.email = email;

  const updatedUser = await userRepository.updateUser(id, user);
  return res.json(updatedUser);
});

// PATCH /user/:id - uppdatera delar av en användare
router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const user = await userRepository.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res
      .status(400)
      .json({ error: "At least one field must be provided" });
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (email !== undefined) {
    user.email = email;
  }

  const updatedUser = await userRepository.updateUser(id, user);
  return res.json(updatedUser);
});

// DELETE /user/:id - ta bort en användare
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const success = await userRepository.deleteUser(id);

  if (!success) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(204).send();
});

module.exports = router;
