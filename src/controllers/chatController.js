const llmService = require('../services/llmService');

async function generateChecklist(req, res, next) {
  try {
    const { apiKey, jobDescription } = req.body;
    if (!apiKey || !jobDescription) {
      const error = new Error('Klucz API oraz opis prac są wymagane');
      error.status = 400;
      throw error;
    }

    const checklist = await llmService.generateChecklist(apiKey, jobDescription);
    res.json(checklist);
  } catch (error) {
    next(error);
  }
}

module.exports = { generateChecklist };
