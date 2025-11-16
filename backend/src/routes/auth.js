// Auth-routes som fejk-loggar in användare och ger enkla token-strängar.
const express = require("express");
const { rememberAccessToken } = require("../middleware/tokenStore");

const router = express.Router();
const refreshStore = new Map();

function createToken(prefix, username) {
  return `${prefix}-${username}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

// POST /auth/login - fejkad login som ger access och refresh token
router.post("/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username krävs" });
  }

  const accessToken = createToken("access", username);
  const refreshToken = createToken("refresh", username);

  refreshStore.set(refreshToken, { username });
  rememberAccessToken(accessToken, username);

  return res.json({
    user: { username },
    accessToken,
    refreshToken,
  });
});

// POST /auth/refresh - skapa nytt tokenpar från ett refresh token
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken krävs" });
  }

  const session = refreshStore.get(refreshToken);

  if (!session) {
    return res.status(401).json({ error: "Ogiltigt refresh token" });
  }

  refreshStore.delete(refreshToken);

  const accessToken = createToken("access", session.username);
  const newRefreshToken = createToken("refresh", session.username);

  refreshStore.set(newRefreshToken, { username: session.username });
  rememberAccessToken(accessToken, session.username);

  return res.json({
    user: { username: session.username },
    accessToken,
    refreshToken: newRefreshToken,
  });
});

module.exports = router;
