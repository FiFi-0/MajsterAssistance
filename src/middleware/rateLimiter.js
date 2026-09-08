const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele prób logowania, spróbuj ponownie za chwilę' },
});

const llmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele zapytań do asystenta AI, spróbuj ponownie za chwilę' },
});

module.exports = { authLimiter, llmLimiter };
