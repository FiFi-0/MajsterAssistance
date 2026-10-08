const ICON_USER_CIRCLE =
  '<svg class="w-10 h-10 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>';

const TAB_ACTIVE_CLASS = 'pb-2 border-b-2 border-amber-600 dark:border-amber-500 font-medium';
const TAB_INACTIVE_CLASS = 'pb-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 font-medium';

function renderLoginView(container) {
  container.innerHTML = `
    <section class="${CARD_CLASS} max-w-md mx-auto space-y-4">
      <div class="flex justify-center">${ICON_USER_CIRCLE}</div>
      <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button id="tabLogin" type="button" class="${TAB_ACTIVE_CLASS}"></button>
        <button id="tabRegister" type="button" class="${TAB_INACTIVE_CLASS}"></button>
      </div>
      <form id="loginForm" class="space-y-3">
        <input type="email" id="loginEmail" placeholder="Email" class="${INPUT_CLASS}" required />
        <input type="password" id="loginPassword" placeholder="Hasło" class="${INPUT_CLASS}" required />
        <input type="text" id="loginFullName" placeholder="Imię i nazwisko" class="${INPUT_CLASS} hidden" />
        <button type="submit" id="loginSubmitBtn" class="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 flex items-center justify-center gap-2"></button>
      </form>
      <p id="loginError" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
    </section>
  `;

  const tabLogin = container.querySelector('#tabLogin');
  const tabRegister = container.querySelector('#tabRegister');
  const fullNameInput = container.querySelector('#loginFullName');
  const submitBtn = container.querySelector('#loginSubmitBtn');
  const form = container.querySelector('#loginForm');
  const errorEl = container.querySelector('#loginError');

  tabLogin.textContent = 'Logowanie';
  tabRegister.textContent = 'Rejestracja';

  let mode = 'login';

  function setMode(newMode) {
    mode = newMode;
    const isRegister = mode === 'register';
    fullNameInput.classList.toggle('hidden', !isRegister);
    fullNameInput.required = isRegister;
    submitBtn.textContent = isRegister ? 'Zarejestruj się' : 'Zaloguj się';
    tabLogin.className = isRegister ? TAB_INACTIVE_CLASS : TAB_ACTIVE_CLASS;
    tabRegister.className = isRegister ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS;
  }

  tabLogin.addEventListener('click', () => setMode('login'));
  tabRegister.addEventListener('click', () => setMode('register'));
  setMode('login');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.classList.add('hidden');

    const email = container.querySelector('#loginEmail').value.trim();
    const password = container.querySelector('#loginPassword').value;
    const fullName = fullNameInput.value.trim();
    const label = mode === 'register' ? 'Zarejestruj się' : 'Zaloguj się';

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${ICON_SPINNER}<span>Chwileczkę...</span>`;

    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const body = mode === 'register' ? { email, password, fullName } : { email, password };
      const data = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
      setToken(data.token);
      setUser(data.user);
      navigate('/rates');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
}
