const ICON_SPARKLES =
  '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>';

const ICON_SPINNER =
  '<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>';

const ICON_CHECK_CIRCLE =
  '<svg class="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';

const ICON_CUBE =
  '<svg class="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>';

const ICON_CLOCK =
  '<svg class="w-4 h-4 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';

const INPUT_CLASS =
  'w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';

const CARD_CLASS = 'bg-white dark:bg-gray-800 dark:ring-1 dark:ring-gray-800 dark:shadow-none rounded-lg shadow p-6';

async function renderChatView(container) {
  container.innerHTML = `
    <section class="${CARD_CLASS} space-y-4">
      <div>
        <h2 class="text-xl font-semibold">Asystent Techniczny</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Opisz prace remontowe, a asystent wygeneruje checklistę zadań, oszacuje czas realizacji i zaproponuje listę potrzebnych materiałów.
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" for="apiKey">Twój klucz API Gemini</label>
        <input type="password" id="apiKey" class="${INPUT_CLASS}" placeholder="AIza..." />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" for="jobDescription">Opisz prace do wykonania</label>
        <textarea id="jobDescription" rows="4" class="${INPUT_CLASS}" placeholder="np. Wymiana baterii łazienkowej i uszczelnienie fug"></textarea>
      </div>
      <button id="generateBtn" class="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2">
        ${ICON_SPARKLES}
        <span>Generuj checklistę</span>
      </button>
      <p id="chatError" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
    </section>

    <section id="resultSection" class="mt-6 ${CARD_CLASS} hidden">
      <h3 class="text-lg font-semibold mb-1" id="resultTitle"></h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4" id="totalHours"></p>
      <div>
        <h4 class="font-medium mb-2">Checklista prac</h4>
        <ul id="checklistItems" class="space-y-2"></ul>
      </div>
      <div class="mt-5">
        <h4 class="font-medium mb-2">Materiały</h4>
        <ul id="materialsItems" class="space-y-2"></ul>
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

  function renderIconList(listEl, items, icon, formatter) {
    listEl.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-2';

      const iconWrap = document.createElement('span');
      iconWrap.innerHTML = icon;

      const text = document.createElement('span');
      text.textContent = formatter(item);

      li.appendChild(iconWrap);
      li.appendChild(text);
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
    generateBtn.innerHTML = `${ICON_SPINNER}<span>Generowanie...</span>`;

    try {
      const data = await apiFetch('/chat/checklist', {
        method: 'POST',
        body: JSON.stringify({ apiKey, jobDescription }),
      });

      saveApiKey(apiKey);

      const totalHours = data.checklist.reduce((sum, item) => sum + item.estimatedHours, 0);
      resultTitle.textContent = data.jobTitle;
      totalHoursEl.innerHTML = `${ICON_CLOCK} Łączny szacowany czas: ${totalHours} h`;
      renderIconList(
        checklistItems,
        data.checklist,
        ICON_CHECK_CIRCLE,
        (item) => `${item.task} (${item.estimatedHours} h)`
      );
      renderIconList(
        materialsItems,
        data.materials,
        ICON_CUBE,
        (item) => `${item.name} — ${item.quantity} ${item.unit}`
      );
      resultSection.classList.remove('hidden');
    } catch (error) {
      chatError.textContent = error.message;
      chatError.classList.remove('hidden');
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `${ICON_SPARKLES}<span>Generuj checklistę</span>`;
    }
  });
}
