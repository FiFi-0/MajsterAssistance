const ESTIMATE_STATUS_LABELS = {
  draft: 'Szkic',
  sent: 'Wysłany',
  accepted: 'Zaakceptowany',
  rejected: 'Odrzucony',
};

const ESTIMATE_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function createItemField(type, value, placeholder, extraClass, step) {
  const input = document.createElement('input');
  input.type = type;
  if (type === 'number') {
    input.step = step || '1';
  }
  if (value !== undefined) {
    input.value = value;
  }
  if (placeholder) {
    input.placeholder = placeholder;
  }
  input.className = `border rounded px-2 py-1 text-sm w-full ${extraClass || ''}`;
  return input;
}

function createReadOnlyCostField() {
  const input = document.createElement('input');
  input.type = 'text';
  input.disabled = true;
  input.className = 'border rounded px-2 py-1 text-sm w-full bg-gray-100 text-gray-500';
  return input;
}

async function renderItemsEditor(details, estimateId, totalSpan) {
  details.innerHTML = '';

  const full = await apiFetch(`/estimates/${estimateId}`);

  const totalHours = full.items.reduce((sum, item) => sum + item.labor_hours, 0);
  const hoursLine = document.createElement('div');
  hoursLine.className = 'font-medium mb-2';
  hoursLine.textContent = `Łączny czas robocizny: ${totalHours} h`;
  details.appendChild(hoursLine);

  const headerRow = document.createElement('div');
  headerRow.className = 'grid grid-cols-5 gap-2 text-xs text-gray-400 mb-1';
  ['Godz.', 'Stawka (zł/h)', 'Robocizna (zł)', 'Materiał (zł)', ''].forEach((text) => {
    const cell = document.createElement('span');
    cell.textContent = text;
    headerRow.appendChild(cell);
  });
  details.appendChild(headerRow);

  full.items.forEach((item) => {
    const itemBlock = document.createElement('div');
    itemBlock.className = 'border rounded p-2 mb-2';

    const descInput = createItemField('text', item.description, '', 'w-full mb-2');

    const itemRow = document.createElement('div');
    itemRow.className = 'grid grid-cols-5 gap-2 items-center';

    const hoursInput = createItemField('number', item.labor_hours, '', '', '0.5');
    const initialRate = item.labor_hours > 0 ? Math.round((item.labor_cost / item.labor_hours) * 100) / 100 : 0;
    const rateInput = createItemField('number', initialRate, '', '', '1');
    const laborCostDisplay = createReadOnlyCostField();
    const materialCostInput = createItemField('number', item.material_cost, '', '', '1');

    function refreshLaborCostDisplay() {
      const computed = (Number(hoursInput.value) || 0) * (Number(rateInput.value) || 0);
      laborCostDisplay.value = `${computed.toFixed(2)} zł`;
    }
    refreshLaborCostDisplay();
    hoursInput.addEventListener('input', refreshLaborCostDisplay);
    rateInput.addEventListener('input', refreshLaborCostDisplay);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Zapisz';
    saveBtn.className = 'text-blue-600 hover:underline text-sm';
    saveBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const laborHours = Number(hoursInput.value) || 0;
      const laborCost = laborHours * (Number(rateInput.value) || 0);
      const result = await apiFetch(`/estimates/${estimateId}/items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          description: descInput.value.trim(),
          laborHours,
          laborCost,
          materialCost: Number(materialCostInput.value) || 0,
        }),
      });
      totalSpan.textContent = `${result.estimate.total_cost.toFixed(2)} zł`;
      showToast('Pozycja zaktualizowana');
      await renderItemsEditor(details, estimateId, totalSpan);
    });

    const deleteItemBtn = document.createElement('button');
    deleteItemBtn.type = 'button';
    deleteItemBtn.textContent = 'Usuń';
    deleteItemBtn.className = 'text-red-600 hover:underline text-sm';
    deleteItemBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const result = await apiFetch(`/estimates/${estimateId}/items/${item.id}`, { method: 'DELETE' });
      totalSpan.textContent = `${result.estimate.total_cost.toFixed(2)} zł`;
      showToast('Pozycja usunięta');
      await renderItemsEditor(details, estimateId, totalSpan);
    });

    actions.appendChild(saveBtn);
    actions.appendChild(deleteItemBtn);

    itemRow.appendChild(hoursInput);
    itemRow.appendChild(rateInput);
    itemRow.appendChild(laborCostDisplay);
    itemRow.appendChild(materialCostInput);
    itemRow.appendChild(actions);

    itemBlock.appendChild(descInput);
    itemBlock.appendChild(itemRow);
    details.appendChild(itemBlock);
  });

  const addBlock = document.createElement('div');
  addBlock.className = 'mt-3 pt-3 border-t';

  const addRow = document.createElement('div');
  addRow.className = 'grid grid-cols-5 gap-2 items-center';

  const newDesc = createItemField('text', undefined, 'Nowa pozycja', 'w-full mb-2');
  const newHours = createItemField('number', 0, '', '', '0.5');
  const newRate = createItemField('number', 0, '', '', '1');
  const newLaborCostDisplay = createReadOnlyCostField();
  newLaborCostDisplay.value = '0.00 zł';
  const newMaterialCost = createItemField('number', 0, '', '', '1');

  function refreshNewLaborCostDisplay() {
    const computed = (Number(newHours.value) || 0) * (Number(newRate.value) || 0);
    newLaborCostDisplay.value = `${computed.toFixed(2)} zł`;
  }
  newHours.addEventListener('input', refreshNewLaborCostDisplay);
  newRate.addEventListener('input', refreshNewLaborCostDisplay);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '+ Dodaj';
  addBtn.className = 'text-green-600 hover:underline text-sm';
  addBtn.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (!newDesc.value.trim()) {
      return;
    }
    const laborHours = Number(newHours.value) || 0;
    const laborCost = laborHours * (Number(newRate.value) || 0);
    const result = await apiFetch(`/estimates/${estimateId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        description: newDesc.value.trim(),
        laborHours,
        laborCost,
        materialCost: Number(newMaterialCost.value) || 0,
      }),
    });
    totalSpan.textContent = `${result.estimate.total_cost.toFixed(2)} zł`;
    showToast('Pozycja dodana');
    await renderItemsEditor(details, estimateId, totalSpan);
  });

  addRow.appendChild(newHours);
  addRow.appendChild(newRate);
  addRow.appendChild(newLaborCostDisplay);
  addRow.appendChild(newMaterialCost);
  addRow.appendChild(addBtn);

  addBlock.appendChild(newDesc);
  addBlock.appendChild(addRow);
  details.appendChild(addBlock);
}

async function renderEstimatesView(container) {
  container.innerHTML = `
    <section class="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 class="text-xl font-semibold">Nowy kosztorys</h2>
      <form id="estimateForm" class="space-y-3">
        <input type="password" id="estApiKey" placeholder="Twój klucz API Gemini" class="w-full border rounded px-3 py-2" required />
        <select id="estCategory" class="w-full border rounded px-3 py-2" required></select>
        <input type="text" id="estTitle" placeholder="Tytuł kosztorysu (opcjonalnie)" class="w-full border rounded px-3 py-2" />
        <input type="text" id="estClient" placeholder="Klient (opcjonalnie)" class="w-full border rounded px-3 py-2" />
        <textarea id="estDescription" rows="3" placeholder="Opisz prace do wykonania" class="w-full border rounded px-3 py-2" required></textarea>
        <button type="submit" id="estSubmitBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Generuj kosztorys</button>
      </form>
      <p id="estError" class="text-red-600 text-sm hidden"></p>
    </section>

    <section class="mt-6 bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-3">Zapisane kosztorysy</h2>
      <div id="estimatesList" class="space-y-2"></div>
    </section>
  `;

  const categorySelect = container.querySelector('#estCategory');
  const submitBtn = container.querySelector('#estSubmitBtn');
  container.querySelector('#estApiKey').value = getSavedApiKey();
  const rates = await apiFetch('/rates');

  if (rates.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Najpierw dodaj stawkę w zakładce "Stawki"';
    categorySelect.appendChild(option);
    submitBtn.disabled = true;
  } else {
    rates.forEach((rate) => {
      const option = document.createElement('option');
      option.value = rate.category;
      option.textContent = rate.category;
      categorySelect.appendChild(option);
    });
  }

  const form = container.querySelector('#estimateForm');
  const errorEl = container.querySelector('#estError');
  const listEl = container.querySelector('#estimatesList');

  async function loadEstimates() {
    const estimates = await apiFetch('/estimates');
    listEl.innerHTML = '';

    if (estimates.length === 0) {
      listEl.textContent = 'Brak zapisanych kosztorysów.';
      return;
    }

    estimates.forEach((estimate) => {
      const row = document.createElement('div');
      row.className = 'border rounded p-3 cursor-pointer hover:bg-gray-50';

      const header = document.createElement('div');
      header.className = 'flex justify-between items-center gap-3';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-medium';
      titleSpan.textContent = estimate.title;

      const rightSide = document.createElement('div');
      rightSide.className = 'flex items-center gap-3';

      const totalSpan = document.createElement('span');
      totalSpan.textContent = `${estimate.total_cost.toFixed(2)} zł`;

      const statusSelect = document.createElement('select');
      statusSelect.className = `text-xs rounded px-2 py-1 border-0 ${
        ESTIMATE_STATUS_COLORS[estimate.status] || ESTIMATE_STATUS_COLORS.draft
      }`;
      Object.entries(ESTIMATE_STATUS_LABELS).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        option.selected = value === estimate.status;
        statusSelect.appendChild(option);
      });
      statusSelect.addEventListener('click', (event) => event.stopPropagation());
      statusSelect.addEventListener('change', async () => {
        await apiFetch(`/estimates/${estimate.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: statusSelect.value }),
        });
        statusSelect.className = `text-xs rounded px-2 py-1 border-0 ${
          ESTIMATE_STATUS_COLORS[statusSelect.value] || ESTIMATE_STATUS_COLORS.draft
        }`;
        showToast('Status zaktualizowany');
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Usuń';
      deleteBtn.className = 'text-red-600 hover:underline text-sm';
      deleteBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await apiFetch(`/estimates/${estimate.id}`, { method: 'DELETE' });
        showToast('Kosztorys usunięty');
        await loadEstimates();
      });

      rightSide.appendChild(statusSelect);
      rightSide.appendChild(totalSpan);
      rightSide.appendChild(deleteBtn);
      header.appendChild(titleSpan);
      header.appendChild(rightSide);
      row.appendChild(header);

      const details = document.createElement('div');
      details.className = 'mt-2 hidden text-sm text-gray-600';
      details.addEventListener('click', (event) => event.stopPropagation());
      row.appendChild(details);

      row.addEventListener('click', async () => {
        const wasHidden = details.classList.contains('hidden');
        details.classList.toggle('hidden');
        if (wasHidden) {
          await renderItemsEditor(details, estimate.id, totalSpan);
        }
      });

      listEl.appendChild(row);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generowanie...';

    try {
      const apiKey = container.querySelector('#estApiKey').value.trim();
      const body = {
        apiKey,
        jobDescription: container.querySelector('#estDescription').value.trim(),
        category: categorySelect.value,
        title: container.querySelector('#estTitle').value.trim() || undefined,
        clientName: container.querySelector('#estClient').value.trim() || undefined,
      };
      await apiFetch('/estimates/generate', { method: 'POST', body: JSON.stringify(body) });
      saveApiKey(apiKey);
      showToast('Kosztorys wygenerowany');
      form.reset();
      container.querySelector('#estApiKey').value = apiKey;
      await loadEstimates();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Generuj kosztorys';
    }
  });

  await loadEstimates();
}
