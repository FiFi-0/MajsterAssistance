const db = require('../config/database');

function createRate({ userId, category, hourlyRate, materialMarkupPercent }) {
  const result = db
    .prepare(
      'INSERT INTO rates (user_id, category, hourly_rate, material_markup_percent) VALUES (?, ?, ?, ?)'
    )
    .run(userId, category, hourlyRate, materialMarkupPercent ?? 0);
  return findRateById(result.lastInsertRowid);
}

function findRateById(id) {
  return db.prepare('SELECT * FROM rates WHERE id = ?').get(id);
}

function findRatesByUser(userId) {
  return db.prepare('SELECT * FROM rates WHERE user_id = ? ORDER BY category').all(userId);
}

function updateRate(id, { category, hourlyRate, materialMarkupPercent }) {
  db.prepare(
    'UPDATE rates SET category = ?, hourly_rate = ?, material_markup_percent = ? WHERE id = ?'
  ).run(category, hourlyRate, materialMarkupPercent, id);
  return findRateById(id);
}

function deleteRate(id) {
  db.prepare('DELETE FROM rates WHERE id = ?').run(id);
}

module.exports = { createRate, findRateById, findRatesByUser, updateRate, deleteRate };
