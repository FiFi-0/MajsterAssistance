const db = require('../config/database');

function createUser({ email, passwordHash, fullName }) {
  const result = db
    .prepare('INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)')
    .run(email, passwordHash, fullName);
  return findUserById(result.lastInsertRowid);
}

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

module.exports = { createUser, findUserByEmail, findUserById };
