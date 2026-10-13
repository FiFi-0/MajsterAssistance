const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, '..', 'database', 'test-suite.db');

function resetDb() {
  ['', '-wal', '-shm'].forEach((suffix) => {
    const file = TEST_DB_PATH + suffix;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

resetDb();
process.env.DB_PATH = TEST_DB_PATH;
process.env.JWT_SECRET = 'test-suite-secret';

const db = require('../src/config/database');
const userModel = require('../src/models/userModel');
const rateModel = require('../src/models/rateModel');
const estimateModel = require('../src/models/estimateModel');
const estimateService = require('../src/services/estimateService');
const llmService = require('../src/services/llmService');

test.after(() => {
  db.close();
  resetDb();
});

test('hybrydowa estymacja liczy koszty ze stawek majstra, nie z AI', async (t) => {
  const user = userModel.createUser({ email: 'hybrid@example.com', passwordHash: 'x', fullName: 'Test' });
  rateModel.createRate({ userId: user.id, category: 'hydraulika', hourlyRate: 100, materialMarkupPercent: 20 });

  t.mock.method(llmService, 'generateChecklist', async () => ({
    jobTitle: 'Testowy remont',
    checklist: [{ task: 'Demontaz', estimatedHours: 2 }],
    materials: [{ name: 'Silikon', quantity: 3, unit: 'szt.', estimatedUnitPrice: 10 }],
  }));

  const result = await estimateService.generateEstimate(user.id, {
    apiKey: 'fake-key',
    jobDescription: 'opis',
    category: 'hydraulika',
  });

  const laborItem = result.items.find((item) => item.description === 'Demontaz');
  const materialItem = result.items.find((item) => item.description.startsWith('Silikon'));

  assert.equal(laborItem.labor_cost, 200);
  assert.equal(materialItem.material_cost, 36);
  assert.equal(result.total_cost, 236);
});

test('generowanie bez zdefiniowanej stawki konczy sie bledem 404', async (t) => {
  const user = userModel.createUser({ email: 'norate@example.com', passwordHash: 'x', fullName: 'Test' });

  t.mock.method(llmService, 'generateChecklist', async () => ({
    jobTitle: 'Test',
    checklist: [],
    materials: [],
  }));

  await assert.rejects(
    () =>
      estimateService.generateEstimate(user.id, {
        apiKey: 'fake-key',
        jobDescription: 'opis',
        category: 'nieistniejaca-kategoria',
      }),
    (error) => error.status === 404
  );
});

test('edycja pozycji przelicza sume calego kosztorysu', () => {
  const user = userModel.createUser({ email: 'edit@example.com', passwordHash: 'x', fullName: 'Edit' });
  const estimate = estimateModel.createEstimate({ userId: user.id, title: 'Test', clientName: null });
  const item = estimateModel.addEstimateItem({
    estimateId: estimate.id,
    description: 'Zadanie',
    laborHours: 1,
    laborCost: 100,
    materialCost: 0,
    totalCost: 100,
  });
  estimateModel.updateEstimateTotal(estimate.id, 100);

  const result = estimateService.updateItem(user.id, estimate.id, item.id, {
    description: 'Zadanie poprawione',
    laborHours: 2,
    laborCost: 250,
    materialCost: 10,
  });

  assert.equal(result.items[0].total_cost, 260);
  assert.equal(result.estimate.total_cost, 260);
});

test('obcy uzytkownik nie moze usunac cudzego kosztorysu', () => {
  const owner = userModel.createUser({ email: 'owner@example.com', passwordHash: 'x', fullName: 'Owner' });
  const intruder = userModel.createUser({ email: 'intruder@example.com', passwordHash: 'x', fullName: 'Intruder' });
  const estimate = estimateModel.createEstimate({ userId: owner.id, title: 'Prywatny', clientName: null });

  assert.throws(
    () => estimateService.deleteEstimate(intruder.id, estimate.id),
    (error) => error.status === 404
  );
});

test('zaokraglanie eliminuje bledy zmiennoprzecinkowe przy generowaniu', async (t) => {
  const user = userModel.createUser({ email: 'round@example.com', passwordHash: 'x', fullName: 'Round' });
  rateModel.createRate({ userId: user.id, category: 'budowlanka', hourlyRate: 50, materialMarkupPercent: 10 });

  t.mock.method(llmService, 'generateChecklist', async () => ({
    jobTitle: 'Test zaokraglen',
    checklist: [],
    materials: [{ name: 'Plyta', quantity: 2, unit: 'szt.', estimatedUnitPrice: 95 }],
  }));

  const result = await estimateService.generateEstimate(user.id, {
    apiKey: 'fake-key',
    jobDescription: 'opis',
    category: 'budowlanka',
  });

  assert.equal(result.items[0].material_cost, 209);
});
