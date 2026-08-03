const userModel = require('../models/userModel');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function register({ email, password, fullName }) {
  const existing = userModel.findUserByEmail(email);
  if (existing) {
    const error = new Error('Użytkownik z tym adresem e-mail już istnieje');
    error.status = 409;
    throw error;
  }

  const passwordHash = hashPassword(password);
  const user = userModel.createUser({ email, passwordHash, fullName });
  const token = signToken({ userId: user.id });

  return { user: sanitizeUser(user), token };
}

function login({ email, password }) {
  const user = userModel.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    const error = new Error('Nieprawidłowy e-mail lub hasło');
    error.status = 401;
    throw error;
  }

  const token = signToken({ userId: user.id });
  return { user: sanitizeUser(user), token };
}

function getCurrentUser(userId) {
  const user = userModel.findUserById(userId);
  if (!user) {
    const error = new Error('Użytkownik nie istnieje');
    error.status = 404;
    throw error;
  }
  return sanitizeUser(user);
}

module.exports = { register, login, getCurrentUser };
