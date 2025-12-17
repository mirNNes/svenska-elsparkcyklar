const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const router = express.Router();
const refreshBlacklist = new Set();

/**
 * POST /auth/login
 * Admin-only login using email + password
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

  // Only allow admin logins
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Endast administratörer får logga in" });
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

module.exports = router;
