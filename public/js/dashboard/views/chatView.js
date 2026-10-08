async function renderChatView(container) {
  container.innerHTML = `
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <h2 class="text-xl font-semibold">Asystent Techniczny</h2>
      <div>
        <label class="block text-sm font-medium mb-1" for="apiKey">Twój klucz API Gemini</label>
        <input type="password" id="apiKey" class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-2" placeholder="AIza..." />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" for="jobDescription">Opisz prace do wykonania</label>
        <textarea id="jobDescription" rows="4" class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-2" placeholder="np. Wymiana baterii łazienkowej i uszczelnienie fug"></textarea>
      </div>
      <button id="generateBtn" class="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50">
        Generuj checklistę
      </button>
      <p id="chatError" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
    </section>

    <section id="resultSection" class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 hidden">
      <h3 class="text-lg font-semibold mb-1" id="resultTitle"></h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3" id="totalHours"></p>
      <div>
        <h4 class="font-medium mb-1">Checklista prac</h4>
        <ul id="checklistItems" class="list-disc list-inside space-y-1"></ul>
      </div>
      <div class="mt-4">
        <h4 class="font-medium mb-1">Materiały</h4>
        <ul id="materialsItems" class="list-disc list-inside space-y-1"></ul>
      </div>
    </section>
  `;

  const generateBtn = container.querySelector('#generateBtn');
  const apiKeyInput = container.querySelector('#apiKey');
  const jobDescriptionInput = container.querySelector('#jobDescription');
  const chatError = container.querySelector('#chatError');
  const resultSection = container.querySelector('#resultSection');
  const resultTitle = container.querySelector('#resultTitle');
  const totalHoursEl = container.querySelector('#totalHours');
  const checklistItems = container.querySelector('#checklistItems');
  const materialsItems = container.querySelector('#materialsItems');

  apiKeyInput.value = getSavedApiKey();

  function renderList(listEl, items, formatter) {
    listEl.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = formatter(item);
      listEl.appendChild(li);
    });
  }

  generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const jobDescription = jobDescriptionInput.value.trim();

    chatError.classList.add('hidden');
    resultSection.classList.add('hidden');

    if (!apiKey || !jobDescription) {
      chatError.textContent = 'Podaj klucz API oraz opis prac.';
      chatError.classList.remove('hidden');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generowanie...';

    try {
      const data = await apiFetch('/chat/checklist', {
        method: 'POST',
        body: JSON.stringify({ apiKey, jobDescription }),
      });

      saveApiKey(apiKey);

      const totalHours = data.checklist.reduce((sum, item) => sum + item.estimatedHours, 0);
      resultTitle.textContent = data.jobTitle;
      totalHoursEl.textContent = `Łączny szacowany czas: ${totalHours} h`;
      renderList(checklistItems, data.checklist, (item) => `${item.task} (${item.estimatedHours} h)`);
      renderList(materialsItems, data.materials, (item) => `${item.name} — ${item.quantity} ${item.unit}`);
      resultSection.classList.remove('hidden');
    } catch (error) {
      chatError.textContent = error.message;
      chatError.classList.remove('hidden');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generuj checklistę';
    }
  });
}
