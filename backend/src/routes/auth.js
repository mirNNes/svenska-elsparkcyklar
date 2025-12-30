const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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

function getAdminRedirectUrl() {
  const base = process.env.ADMIN_REDIRECT_URL || "http://localhost:3003";
  return base.replace(/\/$/, "");
}

function getGithubAdminAllowlist() {
  return (process.env.GITHUB_ADMIN_USERNAMES || "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

function buildLoginRedirect(params = {}) {
  const url = new URL(`${getAdminRedirectUrl()}/login`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

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
 * GET /auth/github
 * Starta GitHub OAuth-flöde för admin
 */
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:5000/api/auth/github/callback";

  if (!clientId) {
    return res
      .status(500)
      .json({ error: "GitHub OAuth är inte konfigurerat" });
  }

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("scope", "read:user");
  authorizeUrl.searchParams.set("allow_signup", "false");

  return res.redirect(authorizeUrl.toString());
});

/**
 * GET /auth/github/callback
 * GitHub callback - skapar JWT och skickar tillbaka till admin-frontend
 */
router.get("/github/callback", async (req, res) => {
  const { code } = req.query || {};
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:5000/api/auth/github/callback";

  if (!code) {
    return res.redirect(
      buildLoginRedirect({ error: "GitHub-login avbruten" })
    );
  }

  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: "GitHub OAuth är inte konfigurerat" });
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.redirect(
        buildLoginRedirect({ error: "Kunde inte logga in med GitHub" })
      );
    }

    const githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "svenska-elsparkcyklar-admin",
        Accept: "application/vnd.github+json",
      },
    });

    const githubUser = await githubResponse.json();
    if (!githubUser || !githubUser.login) {
      return res.redirect(
        buildLoginRedirect({ error: "Kunde inte läsa GitHub-användare" })
      );
    }

    const login = githubUser.login.toLowerCase();
    const allowlist = getGithubAdminAllowlist();

    if (!allowlist.includes(login)) {
      return res.redirect(
        buildLoginRedirect({ error: "Saknar admin-behörighet" })
      );
    }

    const safeEmail =
      githubUser.email || `${githubUser.login}@users.noreply.github.com`;

    let user = await userRepository.getUserByUsername(githubUser.login);
    if (!user) {
      user = await userRepository.getUserByEmail(safeEmail);
    }

    if (!user) {
      user = await userRepository.createUser({
        name: githubUser.name || githubUser.login,
        email: safeEmail,
        username: githubUser.login,
        role: "admin",
        password: crypto.randomUUID(),
      });
    } else if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username || githubUser.login,
    };

    const access_token = signAccessToken(payload);
    const refresh_token = signRefreshToken(payload);

    return res.redirect(
      buildLoginRedirect({
        access_token,
        refresh_token,
        id: String(user._id),
        email: user.email,
        role: user.role,
        username: user.username || githubUser.login,
        name: user.name || githubUser.login,
      })
    );
  } catch (err) {
    return res.redirect(
      buildLoginRedirect({ error: "GitHub-inloggning misslyckades" })
    );
  }
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
