// Litet in-memory-register för access-tokens.
const accessTokens = new Map();

function rememberAccessToken(token, username) {
  accessTokens.set(token, { username });
}

function getAccessSession(token) {
  return accessTokens.get(token);
}

function revokeAccessToken(token) {
  accessTokens.delete(token);
}

module.exports = {
  rememberAccessToken,
  getAccessSession,
  revokeAccessToken,
};
