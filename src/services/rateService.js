const rateModel = require('../models/rateModel');

function assertOwnedRate(userId, rateId) {
  const rate = rateModel.findRateById(rateId);
  if (!rate || rate.user_id !== userId) {
    const error = new Error('Stawka nie została znaleziona');
    error.status = 404;
    throw error;
  }
  return rate;
}

function listRates(userId) {
  return rateModel.findRatesByUser(userId);
}

function createRate(userId, { category, hourlyRate, materialMarkupPercent }) {
  return rateModel.createRate({ userId, category, hourlyRate, materialMarkupPercent });
}

function updateRate(userId, rateId, { category, hourlyRate, materialMarkupPercent }) {
  assertOwnedRate(userId, rateId);
  return rateModel.updateRate(rateId, { category, hourlyRate, materialMarkupPercent });
}

function deleteRate(userId, rateId) {
  assertOwnedRate(userId, rateId);
  rateModel.deleteRate(rateId);
}

module.exports = { listRates, createRate, updateRate, deleteRate };
