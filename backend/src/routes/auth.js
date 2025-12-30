const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const userRepository = require("../repositories/userRepository");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const router = express.Router();
const refreshBlacklist = new Set();

/**
 * POST /auth/login
 * Login för både användare och admin (email + password)
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email och password krävs" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  // JWT payload
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const access_token = signAccessToken(payload);
  const refresh_token = signRefreshToken(payload);

  return res.json({
    access_token,
    refresh_token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * POST /auth/refresh
 */
router.post("/refresh", (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "refresh_token krävs" });
  }

  if (refreshBlacklist.has(refresh_token)) {
    return res.status(401).json({ error: "Refresh-token spärrad" });
  }

  try {
    const payload = verifyRefreshToken(refresh_token);

    const newAccess = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);

    refreshBlacklist.add(refresh_token);

    return res.json({
      access_token: newAccess,
    refresh_token: newRefresh,
    });
  } catch (err) {
    return res.status(401).json({ error: "Ogiltigt refresh token" });
  }
});

/**
 * POST /auth/logout
 */
router.post("/logout", requireAuth, (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "refresh_token krävs" });
  }

  refreshBlacklist.add(refresh_token);
  return res.json({ message: "Utloggad" });
});

/**
 * POST /auth/signup - skapa nytt användarkonto (roll: user)
 */
router.post("/signup", async (req, res) => {
  const { name, email, password, username } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email och password krävs" });
  }

  const existingEmail = await userRepository.getUserByEmail(email);
  if (existingEmail) {
    return res.status(409).json({ error: "E-postadressen är redan registrerad" });
  }

  if (username) {
    const existingUsername = await userRepository.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: "Användarnamnet är upptaget" });
    }
  }

  const user = await userRepository.createUser({
    name,
    email,
    username,
    role: "user",
    password,
  });

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const access_token = signAccessToken(payload);
  const refresh_token = signRefreshToken(payload);

  return res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    access_token,
    refresh_token,
  });
});

module.exports = router;
