const db = require('../config/database');

function createEstimate({ userId, title, clientName }) {
  const result = db
    .prepare('INSERT INTO estimates (user_id, title, client_name) VALUES (?, ?, ?)')
    .run(userId, title, clientName ?? null);
  return findEstimateById(result.lastInsertRowid);
}

function findEstimateById(id) {
  return db.prepare('SELECT * FROM estimates WHERE id = ?').get(id);
}

function findEstimatesByUser(userId) {
  return db.prepare('SELECT * FROM estimates WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

function updateEstimateTotal(id, totalCost) {
  db.prepare("UPDATE estimates SET total_cost = ?, updated_at = datetime('now') WHERE id = ?").run(
    totalCost,
    id
  );
  return findEstimateById(id);
}

function deleteEstimate(id) {
  db.prepare('DELETE FROM estimates WHERE id = ?').run(id);
}

function addEstimateItem({ estimateId, description, laborHours, laborCost, materialCost, totalCost }) {
  const result = db
    .prepare(
      `INSERT INTO estimate_items (estimate_id, description, labor_hours, labor_cost, material_cost, total_cost)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(estimateId, description, laborHours, laborCost, materialCost, totalCost);
  return db.prepare('SELECT * FROM estimate_items WHERE id = ?').get(result.lastInsertRowid);
}

function findItemsByEstimate(estimateId) {
  return db.prepare('SELECT * FROM estimate_items WHERE estimate_id = ?').all(estimateId);
}

module.exports = {
  createEstimate,
  findEstimateById,
  findEstimatesByUser,
  updateEstimateTotal,
  deleteEstimate,
  addEstimateItem,
  findItemsByEstimate,
};
