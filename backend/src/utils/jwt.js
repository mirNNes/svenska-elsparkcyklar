const jwt = require('jsonwebtoken');

function getRequiredEnv(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Env ${name} saknas`);
  }
  return value;
}

const accessSecret = () => getRequiredEnv('JWT_ACCESS_SECRET');
const refreshSecret = () => getRequiredEnv('JWT_REFRESH_SECRET');
const accessExpiresIn = () => getRequiredEnv('JWT_ACCESS_EXPIRES_IN', '15m');
const refreshExpiresIn = () => getRequiredEnv('JWT_REFRESH_EXPIRES_IN', '7d');

function signAccessToken(payload) {
  return jwt.sign(payload, accessSecret(), { expiresIn: accessExpiresIn() });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret(), { expiresIn: refreshExpiresIn() });
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret());
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret());
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
