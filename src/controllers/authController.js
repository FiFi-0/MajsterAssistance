const authService = require('../services/authService');

function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      const error = new Error('Email, hasło i imię i nazwisko są wymagane');
      error.status = 400;
      throw error;
    }

    const result = authService.register({ email, password, fullName });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error('Email i hasło są wymagane');
      error.status = 400;
      throw error;
    }

    const result = authService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function me(req, res, next) {
  try {
    const user = authService.getCurrentUser(req.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
