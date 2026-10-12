const NEW_CATEGORY_VALUE = '__new__';

const ICON_BANKNOTES =
  '<svg class="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>';

async function renderRatesView(container) {
  container.innerHTML = `
    <section class="${CARD_CLASS} space-y-4">
      <div class="flex items-center gap-2">
        ${ICON_BANKNOTES}
        <h2 class="text-xl font-semibold">Twoje stawki</h2>
      </div>
      <form id="rateForm" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input type="hidden" id="rateId" />
        <div>
          <select id="rateCategorySelect" class="${INPUT_CLASS}" required></select>
          <input type="text" id="rateCategoryNew" placeholder="Nazwa nowej kategorii" class="${INPUT_CLASS} mt-2 hidden" />
        </div>
        <input type="number" id="rateHourly" placeholder="Stawka godzinowa (PLN)" class="${INPUT_CLASS}" step="0.01" required />
        <input type="number" id="rateMarkup" placeholder="Narzut na materiały (%)" class="${INPUT_CLASS}" step="0.01" value="0" />
        <button type="submit" id="rateSubmitBtn" class="bg-amber-600 text-white rounded px-3 py-2 hover:bg-amber-700 flex items-center justify-center gap-2">
          ${ICON_PLUS_CIRCLE}
          <span>Dodaj stawkę</span>
        </button>
      </form>
      <p id="rateError" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
      <table class="w-full text-left border-t border-gray-200 dark:border-gray-700">
        <thead>
          <tr class="text-sm text-gray-500 dark:text-gray-400">
            <th class="py-2">Kategoria</th>
            <th>Stawka/h</th>
            <th>Narzut</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="ratesTableBody"></tbody>
      </table>
      <p id="ratesEmpty" class="text-sm text-gray-500 dark:text-gray-400 hidden">Nie masz jeszcze żadnych stawek — dodaj pierwszą powyżej.</p>
    </section>
  `;

  const form = container.querySelector('#rateForm');
  const errorEl = container.querySelector('#rateError');
  const tbody = container.querySelector('#ratesTableBody');
  const emptyEl = container.querySelector('#ratesEmpty');
  const submitBtn = container.querySelector('#rateSubmitBtn');
  const idInput = container.querySelector('#rateId');
  const categorySelect = container.querySelector('#rateCategorySelect');
  const categoryNewInput = container.querySelector('#rateCategoryNew');
  const hourlyInput = container.querySelector('#rateHourly');
  const markupInput = container.querySelector('#rateMarkup');

  function updateCategoryNewVisibility() {
    const isNew = categorySelect.value === NEW_CATEGORY_VALUE;
    categoryNewInput.classList.toggle('hidden', !isNew);
    categoryNewInput.required = isNew;
  }

  function populateCategorySelect(categories) {
    categorySelect.innerHTML = '';
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    const newOption = document.createElement('option');
    newOption.value = NEW_CATEGORY_VALUE;
    newOption.textContent = '+ Nowa kategoria';
    categorySelect.appendChild(newOption);
    updateCategoryNewVisibility();
  }

  categorySelect.addEventListener('change', updateCategoryNewVisibility);

  function resetForm() {
    form.reset();
    idInput.value = '';
    submitBtn.innerHTML = `${ICON_PLUS_CIRCLE}<span>Dodaj stawkę</span>`;
    updateCategoryNewVisibility();
  }

  async function loadRates() {
    const rates = await apiFetch('/rates');
    tbody.innerHTML = '';
    emptyEl.classList.toggle('hidden', rates.length > 0);

    const categories = [...new Set(rates.map((rate) => rate.category))];
    populateCategorySelect(categories);

    rates.forEach((rate) => {
      const tr = document.createElement('tr');
      tr.className = 'border-t border-gray-200 dark:border-gray-700';

      const categoryTd = document.createElement('td');
      categoryTd.className = 'py-2';
      categoryTd.textContent = rate.category;

      const hourlyTd = document.createElement('td');
      hourlyTd.textContent = `${rate.hourly_rate} zł`;

      const markupTd = document.createElement('td');
      markupTd.textContent = `${rate.material_markup_percent}%`;

      const actionsTd = document.createElement('td');
      actionsTd.className = 'text-right space-x-1';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.setAttribute('aria-label', 'Edytuj stawkę');
      editBtn.className = ICON_BUTTON_CLASS;
      editBtn.innerHTML = ICON_PENCIL;
      editBtn.addEventListener('click', () => {
        idInput.value = rate.id;
        categorySelect.value = rate.category;
        updateCategoryNewVisibility();
        hourlyInput.value = rate.hourly_rate;
        markupInput.value = rate.material_markup_percent;
        submitBtn.innerHTML = `${ICON_PENCIL}<span>Zapisz zmiany</span>`;
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.setAttribute('aria-label', 'Usuń stawkę');
      deleteBtn.className = `${ICON_BUTTON_CLASS} text-red-600 dark:text-red-400`;
      deleteBtn.innerHTML = ICON_TRASH;
      deleteBtn.addEventListener('click', async () => {
        await apiFetch(`/rates/${rate.id}`, { method: 'DELETE' });
        showToast('Stawka usunięta');
        await loadRates();
      });

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(categoryTd);
      tr.appendChild(hourlyTd);
      tr.appendChild(markupTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.classList.add('hidden');

    const id = idInput.value;
    const category =
      categorySelect.value === NEW_CATEGORY_VALUE ? categoryNewInput.value.trim() : categorySelect.value;

    if (!category) {
      errorEl.textContent = 'Podaj nazwę kategorii';
      errorEl.classList.remove('hidden');
      return;
    }

    const body = {
      category,
      hourlyRate: Number(hourlyInput.value),
      materialMarkupPercent: Number(markupInput.value),
    };

    try {
      if (id) {
        await apiFetch(`/rates/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Stawka zaktualizowana');
      } else {
        await apiFetch('/rates', { method: 'POST', body: JSON.stringify(body) });
        showToast('Stawka dodana');
      }
      resetForm();
      await loadRates();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    }
  });

  await loadRates();
}
