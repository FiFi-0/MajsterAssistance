const ESTIMATE_STATUS_LABELS = {
  draft: 'Szkic',
  sent: 'Wysłany',
  accepted: 'Zaakceptowany',
  rejected: 'Odrzucony',
};

const ESTIMATE_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const ICON_CLIPBOARD =
  '<svg class="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>';

const ICON_ARCHIVE_BOX =
  '<svg class="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>';

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
  input.className = `border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${extraClass || ''}`;
  return input;
}

function createReadOnlyCostField() {
  const input = document.createElement('input');
  input.type = 'text';
  input.disabled = true;
  input.className =
    'border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
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
  headerRow.className = 'grid grid-cols-5 gap-2 text-xs text-gray-400 dark:text-gray-500 mb-1';
  ['Godz.', 'Stawka (zł/h)', 'Robocizna (zł)', 'Materiał (zł)', ''].forEach((text) => {
    const cell = document.createElement('span');
    cell.textContent = text;
    headerRow.appendChild(cell);
  });
  details.appendChild(headerRow);

  full.items.forEach((item) => {
    const itemBlock = document.createElement('div');
    itemBlock.className = 'border border-gray-200 dark:border-gray-700 rounded p-2 mb-2';

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
    actions.className = 'flex gap-1';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.setAttribute('aria-label', 'Zapisz pozycję');
    saveBtn.className = ICON_BUTTON_CLASS;
    saveBtn.innerHTML = ICON_CHECK;
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
    deleteItemBtn.setAttribute('aria-label', 'Usuń pozycję');
    deleteItemBtn.className = `${ICON_BUTTON_CLASS} text-red-600 dark:text-red-400`;
    deleteItemBtn.innerHTML = ICON_TRASH;
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
  addBlock.className = 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700';

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
  addBtn.setAttribute('aria-label', 'Dodaj pozycję');
  addBtn.className = `${ICON_BUTTON_CLASS} text-green-600 dark:text-green-500`;
  addBtn.innerHTML = ICON_PLUS_CIRCLE;
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
    <section class="${CARD_CLASS} space-y-4">
      <div class="flex items-center gap-2">
        ${ICON_CLIPBOARD}
        <h2 class="text-xl font-semibold">Nowy kosztorys</h2>
      </div>
      <form id="estimateForm" class="space-y-3">
        <input type="password" id="estApiKey" placeholder="Twój klucz API Gemini" class="${INPUT_CLASS}" required />
        <select id="estCategory" class="${INPUT_CLASS}" required></select>
        <input type="text" id="estTitle" placeholder="Tytuł kosztorysu (opcjonalnie)" class="${INPUT_CLASS}" />
        <input type="text" id="estClient" placeholder="Klient (opcjonalnie)" class="${INPUT_CLASS}" />
        <textarea id="estDescription" rows="3" placeholder="Opisz prace do wykonania" class="${INPUT_CLASS}" required></textarea>
        <button type="submit" id="estSubmitBtn" class="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 w-full">
          ${ICON_CLIPBOARD}
          <span>Generuj kosztorys</span>
        </button>
      </form>
      <p id="estError" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
    </section>

    <section class="mt-6 ${CARD_CLASS}">
      <div class="flex items-center gap-2 mb-3">
        ${ICON_ARCHIVE_BOX}
        <h2 class="text-xl font-semibold">Zapisane kosztorysy</h2>
      </div>
      <div id="estimatesList" class="space-y-2"></div>
      <p id="estimatesEmpty" class="text-sm text-gray-500 dark:text-gray-400 hidden">Brak zapisanych kosztorysów — wygeneruj pierwszy powyżej.</p>
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
  const emptyEl = container.querySelector('#estimatesEmpty');

  async function loadEstimates() {
    const estimates = await apiFetch('/estimates');
    listEl.innerHTML = '';
    emptyEl.classList.toggle('hidden', estimates.length > 0);

    estimates.forEach((estimate) => {
      const row = document.createElement('div');
      row.className =
        'border border-gray-200 dark:border-gray-700 rounded p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50';

      const header = document.createElement('div');
      header.className = 'flex justify-between items-center gap-3';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'flex items-center gap-2';

      const chevron = document.createElement('span');
      chevron.innerHTML = ICON_CHEVRON_DOWN;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-medium';
      titleSpan.textContent = estimate.title;

      titleWrap.appendChild(chevron);
      titleWrap.appendChild(titleSpan);

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
      deleteBtn.setAttribute('aria-label', 'Usuń kosztorys');
      deleteBtn.className = `${ICON_BUTTON_CLASS} text-red-600 dark:text-red-400`;
      deleteBtn.innerHTML = ICON_TRASH;
      deleteBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await apiFetch(`/estimates/${estimate.id}`, { method: 'DELETE' });
        showToast('Kosztorys usunięty');
        await loadEstimates();
      });

      rightSide.appendChild(statusSelect);
      rightSide.appendChild(totalSpan);
      rightSide.appendChild(deleteBtn);
      header.appendChild(titleWrap);
      header.appendChild(rightSide);
      row.appendChild(header);

      const details = document.createElement('div');
      details.className = 'mt-2 hidden text-sm text-gray-600 dark:text-gray-300';
      details.addEventListener('click', (event) => event.stopPropagation());
      row.appendChild(details);

      row.addEventListener('click', async () => {
        const wasHidden = details.classList.contains('hidden');
        details.classList.toggle('hidden');
        chevron.firstElementChild.classList.toggle('rotate-180', wasHidden);
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
    submitBtn.innerHTML = `${ICON_SPINNER}<span>Generowanie...</span>`;

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
      submitBtn.innerHTML = `${ICON_CLIPBOARD}<span>Generuj kosztorys</span>`;
    }
  });

  await loadEstimates();
}
