const NEW_CATEGORY_VALUE = '__new__';

async function renderRatesView(container) {
  container.innerHTML = `
    <section class="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 class="text-xl font-semibold">Twoje stawki</h2>
      <form id="rateForm" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input type="hidden" id="rateId" />
        <div>
          <select id="rateCategorySelect" class="w-full border rounded px-3 py-2" required></select>
          <input type="text" id="rateCategoryNew" placeholder="Nazwa nowej kategorii" class="w-full border rounded px-3 py-2 mt-2 hidden" />
        </div>
        <input type="number" id="rateHourly" placeholder="Stawka godzinowa (PLN)" class="border rounded px-3 py-2" step="0.01" required />
        <input type="number" id="rateMarkup" placeholder="Narzut na materiały (%)" class="border rounded px-3 py-2" step="0.01" value="0" />
        <button type="submit" id="rateSubmitBtn" class="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">Dodaj stawkę</button>
      </form>
      <p id="rateError" class="text-red-600 text-sm hidden"></p>
      <table class="w-full text-left border-t">
        <thead>
          <tr class="text-sm text-gray-500">
            <th class="py-2">Kategoria</th>
            <th>Stawka/h</th>
            <th>Narzut</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="ratesTableBody"></tbody>
      </table>
    </section>
  `;

  const form = container.querySelector('#rateForm');
  const errorEl = container.querySelector('#rateError');
  const tbody = container.querySelector('#ratesTableBody');
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
    submitBtn.textContent = 'Dodaj stawkę';
    updateCategoryNewVisibility();
  }

  async function loadRates() {
    const rates = await apiFetch('/rates');
    tbody.innerHTML = '';

    const categories = [...new Set(rates.map((rate) => rate.category))];
    populateCategorySelect(categories);

    rates.forEach((rate) => {
      const tr = document.createElement('tr');
      tr.className = 'border-t';

      const categoryTd = document.createElement('td');
      categoryTd.className = 'py-2';
      categoryTd.textContent = rate.category;

      const hourlyTd = document.createElement('td');
      hourlyTd.textContent = `${rate.hourly_rate} zł`;

      const markupTd = document.createElement('td');
      markupTd.textContent = `${rate.material_markup_percent}%`;

      const actionsTd = document.createElement('td');
      actionsTd.className = 'text-right space-x-2';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = 'Edytuj';
      editBtn.className = 'text-blue-600 hover:underline text-sm';
      editBtn.addEventListener('click', () => {
        idInput.value = rate.id;
        categorySelect.value = rate.category;
        updateCategoryNewVisibility();
        hourlyInput.value = rate.hourly_rate;
        markupInput.value = rate.material_markup_percent;
        submitBtn.textContent = 'Zapisz zmiany';
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Usuń';
      deleteBtn.className = 'text-red-600 hover:underline text-sm';
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
