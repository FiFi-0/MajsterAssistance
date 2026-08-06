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

module.exports = { list, getOne, generate };
