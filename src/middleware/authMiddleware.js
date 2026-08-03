const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    const error = new Error('Brak autoryzacji');
    error.status = 401;
    return next(error);
  }

  try {
    req.userId = verifyToken(token).userId;
    next();
  } catch {
    const error = new Error('Nieprawidłowy lub wygasły token');
    error.status = 401;
    next(error);
  }
}

module.exports = requireAuth;
