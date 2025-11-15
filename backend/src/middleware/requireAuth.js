// Middleware som kräver ett fejk-token i Authorization-headern.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization-header saknas' });
  }

  const token = authHeader.slice(7).trim();

  if (!token.startsWith('access-')) {
    return res.status(401).json({ error: 'Ogiltigt tokenformat' });
  }

  const [, username = 'okänd'] = token.split('-');
  req.user = { username };

  return next();
}

module.exports = requireAuth;
