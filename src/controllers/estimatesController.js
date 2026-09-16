const estimateService = require('../services/estimateService');

function list(req, res, next) {
  try {
    res.json(estimateService.listEstimates(req.userId));
  } catch (error) {
    next(error);
  }
}

function getOne(req, res, next) {
  try {
    res.json(estimateService.getEstimate(req.userId, Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}

async function generate(req, res, next) {
  try {
    const { apiKey, jobDescription, category, title, clientName } = req.body;
    if (!apiKey || !jobDescription || !category) {
      const error = new Error('Klucz API, opis prac i kategoria są wymagane');
      error.status = 400;
      throw error;
    }

    const estimate = await estimateService.generateEstimate(req.userId, {
      apiKey,
      jobDescription,
      category,
      title,
      clientName,
    });
    res.status(201).json(estimate);
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    estimateService.deleteEstimate(req.userId, Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      const error = new Error('Status jest wymagany');
      error.status = 400;
      throw error;
    }

    const estimate = estimateService.updateStatus(req.userId, Number(req.params.id), status);
    res.json(estimate);
  } catch (error) {
    next(error);
  }
}

function parseItemBody(req) {
  const { description, laborHours, laborCost, materialCost } = req.body;
  if (!description) {
    const error = new Error('Opis pozycji jest wymagany');
    error.status = 400;
    throw error;
  }
  return {
    description,
    laborHours: Number(laborHours) || 0,
    laborCost: Number(laborCost) || 0,
    materialCost: Number(materialCost) || 0,
  };
}

function addItem(req, res, next) {
  try {
    const result = estimateService.addItem(req.userId, Number(req.params.id), parseItemBody(req));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

function updateItem(req, res, next) {
  try {
    const result = estimateService.updateItem(
      req.userId,
      Number(req.params.id),
      Number(req.params.itemId),
      parseItemBody(req)
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function removeItem(req, res, next) {
  try {
    const result = estimateService.deleteItem(req.userId, Number(req.params.id), Number(req.params.itemId));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getOne, generate, remove, updateStatus, addItem, updateItem, removeItem };
