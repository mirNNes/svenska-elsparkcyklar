// Middleware som verifierar JWT i Authorization-headern.
const { verifyAccessToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization-header saknas" });
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role, ...payload };
    req.token = token;
    return next();
  } catch (error) {
    const message = error.name === "TokenExpiredError" ? "Token har gått ut" : "Ogiltigt token";
    return res.status(401).json({ error: message });
  }
}

// Enkel rollkontroll, används ovanpå requireAuth.
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Otillräckliga rättigheter" });
    }
    return next();
  };
}

module.exports = requireAuth;
module.exports.requireRole = requireRole;
