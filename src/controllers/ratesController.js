const rateService = require('../services/rateService');

function list(req, res, next) {
  try {
    res.json(rateService.listRates(req.userId));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const { category, hourlyRate, materialMarkupPercent } = req.body;
    if (!category || hourlyRate === undefined) {
      const error = new Error('Kategoria i stawka godzinowa są wymagane');
      error.status = 400;
      throw error;
    }

    const rate = rateService.createRate(req.userId, { category, hourlyRate, materialMarkupPercent });
    res.status(201).json(rate);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const { category, hourlyRate, materialMarkupPercent } = req.body;
    if (!category || hourlyRate === undefined) {
      const error = new Error('Kategoria i stawka godzinowa są wymagane');
      error.status = 400;
      throw error;
    }

    const rate = rateService.updateRate(req.userId, Number(req.params.id), {
      category,
      hourlyRate,
      materialMarkupPercent,
    });
    res.json(rate);
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    rateService.deleteRate(req.userId, Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, remove };
