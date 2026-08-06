const estimateModel = require('../models/estimateModel');
const rateModel = require('../models/rateModel');
const llmService = require('./llmService');

function assertOwnedEstimate(userId, estimateId) {
  const estimate = estimateModel.findEstimateById(estimateId);
  if (!estimate || estimate.user_id !== userId) {
    const error = new Error('Kosztorys nie został znaleziony');
    error.status = 404;
    throw error;
  }
  return estimate;
}

function listEstimates(userId) {
  return estimateModel.findEstimatesByUser(userId);
}

function getEstimate(userId, estimateId) {
  const estimate = assertOwnedEstimate(userId, estimateId);
  const items = estimateModel.findItemsByEstimate(estimateId);
  return { ...estimate, items };
}

async function generateEstimate(userId, { apiKey, jobDescription, category, title, clientName }) {
  const rate = rateModel.findRatesByUser(userId).find((r) => r.category === category);
  if (!rate) {
    const error = new Error('Brak zdefiniowanej stawki dla tej kategorii');
    error.status = 404;
    throw error;
  }

  const { jobTitle, checklist, materials } = await llmService.generateChecklist(apiKey, jobDescription);

  const estimate = estimateModel.createEstimate({
    userId,
    title: title || jobTitle,
    clientName,
  });

  let total = 0;

  checklist.forEach((task) => {
    const laborCost = task.estimatedHours * rate.hourly_rate;
    total += laborCost;
    estimateModel.addEstimateItem({
      estimateId: estimate.id,
      description: task.task,
      laborHours: task.estimatedHours,
      laborCost,
      materialCost: 0,
      totalCost: laborCost,
    });
  });

  materials.forEach((material) => {
    const materialCost =
      material.quantity * material.estimatedUnitPrice * (1 + rate.material_markup_percent / 100);
    total += materialCost;
    estimateModel.addEstimateItem({
      estimateId: estimate.id,
      description: `${material.name} (${material.quantity} ${material.unit})`,
      laborHours: 0,
      laborCost: 0,
      materialCost,
      totalCost: materialCost,
    });
  });

  const updatedEstimate = estimateModel.updateEstimateTotal(estimate.id, total);
  const items = estimateModel.findItemsByEstimate(estimate.id);

  return { ...updatedEstimate, items };
}

module.exports = { listEstimates, getEstimate, generateEstimate };
