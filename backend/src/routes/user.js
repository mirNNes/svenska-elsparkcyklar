// Användar-routes som använder en lista i minnet som datakälla.
const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const users = [
  { id: 1, name: "Mirnes", email: "mirnes@example.com" },
  { id: 2, name: "Rebecka", email: "rebecka@example.com" },
];
let nextUserId = 3;

// GET /user - lista alla användare
router.get("/", (req, res) => {
  res.json(users);
});

// GET /user/:id - hämta en specifik användare
router.get("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});

// POST /user - skapa en ny användare
router.post("/", requireAuth, (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = {
    id: nextUserId++,
    name,
    email,
  };

  users.push(user);
  return res.status(201).json(user);
});

// PUT /user/:id - ersätt en användare
router.put("/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  user.name = name;
  user.email = email;

  return res.json(user);
});

// PATCH /user/:id - uppdatera delar av en användare
router.patch("/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);

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

  return res.json(user);
});

// DELETE /user/:id - ta bort en användare
router.delete("/:id", requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
