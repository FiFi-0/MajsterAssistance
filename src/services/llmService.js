const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

const SYSTEM_PROMPT = `Jesteś asystentem technicznym specjalizującym się w polskich pracach remontowo-budowlanych.
Na podstawie opisu prac od użytkownika wygeneruj szczegółową checklistę zadań, oszacuj czas w godzinach dla każdego zadania oraz listę potrzebnych materiałów.
Trzymaj się realistycznych, rynkowych szacunków czasu pracy i odpowiadaj wyłącznie w języku polskim.`;

const checklistSchema = {
  type: SchemaType.OBJECT,
  properties: {
    jobTitle: { type: SchemaType.STRING },
    checklist: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          task: { type: SchemaType.STRING },
          estimatedHours: { type: SchemaType.NUMBER },
        },
        required: ['task', 'estimatedHours'],
      },
    },
    materials: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          unit: { type: SchemaType.STRING },
        },
        required: ['name', 'quantity', 'unit'],
      },
    },
  },
  required: ['jobTitle', 'checklist', 'materials'],
};

async function generateChecklist(apiKey, jobDescription) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: checklistSchema,
    },
  });

  try {
    const result = await model.generateContent(jobDescription);
    return JSON.parse(result.response.text());
  } catch (error) {
    const safeError = new Error(error.message || 'Błąd komunikacji z modelem AI');
    safeError.status = 502;
    throw safeError;
  }
}

module.exports = { generateChecklist };
