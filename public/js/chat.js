const generateBtn = document.getElementById('generateBtn');
const apiKeyInput = document.getElementById('apiKey');
const jobDescriptionInput = document.getElementById('jobDescription');
const chatError = document.getElementById('chatError');
const resultSection = document.getElementById('resultSection');
const resultTitle = document.getElementById('resultTitle');
const checklistItems = document.getElementById('checklistItems');
const materialsItems = document.getElementById('materialsItems');

function renderList(container, items, formatter) {
  container.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = formatter(item);
    container.appendChild(li);
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
    const response = await fetch('/api/chat/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, jobDescription }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Wystąpił błąd');
    }

    resultTitle.textContent = data.jobTitle;
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
