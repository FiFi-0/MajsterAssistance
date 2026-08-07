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
      header.className = 'flex justify-between items-center';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-medium';
      titleSpan.textContent = estimate.title;

      const totalSpan = document.createElement('span');
      totalSpan.textContent = `${estimate.total_cost.toFixed(2)} zł`;

      header.appendChild(titleSpan);
      header.appendChild(totalSpan);
      row.appendChild(header);

      const details = document.createElement('div');
      details.className = 'mt-2 hidden text-sm text-gray-600 space-y-1';
      row.appendChild(details);

      row.addEventListener('click', async () => {
        if (details.classList.contains('hidden') && details.dataset.loaded !== 'true') {
          const full = await apiFetch(`/estimates/${estimate.id}`);
          full.items.forEach((item) => {
            const cost = item.labor_cost || item.material_cost;
            const line = document.createElement('div');
            line.textContent = `${item.description} — ${cost.toFixed(2)} zł`;
            details.appendChild(line);
          });
          details.dataset.loaded = 'true';
        }
        details.classList.toggle('hidden');
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
      const body = {
        apiKey: container.querySelector('#estApiKey').value.trim(),
        jobDescription: container.querySelector('#estDescription').value.trim(),
        category: categorySelect.value,
        title: container.querySelector('#estTitle').value.trim() || undefined,
        clientName: container.querySelector('#estClient').value.trim() || undefined,
      };
      await apiFetch('/estimates/generate', { method: 'POST', body: JSON.stringify(body) });
      form.reset();
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
