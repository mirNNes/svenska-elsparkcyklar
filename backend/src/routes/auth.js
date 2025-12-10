const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const router = express.Router();
const refreshBlacklist = new Set();

// POST /auth/login - förenklad login som ger riktiga JWT
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "username och password krävs" });
  }

  // Dummy-lookup: admin får role "admin", övriga "user"
  const role = username === "admin" ? "admin" : "user";
  const user = { id: username, username, role };

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return res.json({ user, accessToken, refreshToken });
});

// POST /auth/refresh - verifiera refresh token och ge nytt par
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken krävs" });
  }

  if (refreshBlacklist.has(refreshToken)) {
    return res.status(401).json({ error: "Ogiltigt eller spärrat refresh token" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = { id: payload.id, username: payload.username, role: payload.role };

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    // Spärra gamla refresh token
    refreshBlacklist.add(refreshToken);

    return res.json({
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    const message = error.name === "TokenExpiredError" ? "Refresh token har gått ut" : "Ogiltigt refresh token";
    return res.status(401).json({ error: message });
  }
});

// POST /auth/logout - spärra refresh-token
router.post("/logout", requireAuth, (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken krävs för logout" });
  }

  refreshBlacklist.add(refreshToken);

  return res.json({ message: "Utloggad" });
});

module.exports = router;
