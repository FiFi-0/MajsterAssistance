function renderLoginView(container) {
  container.innerHTML = `
    <section class="bg-white rounded-lg shadow p-6 max-w-md mx-auto space-y-4">
      <div class="flex gap-4 border-b">
        <button id="tabLogin" type="button" class="pb-2 border-b-2 border-blue-600 font-medium"></button>
        <button id="tabRegister" type="button" class="pb-2 border-b-2 border-transparent text-gray-500"></button>
      </div>
      <form id="loginForm" class="space-y-3">
        <input type="email" id="loginEmail" placeholder="Email" class="w-full border rounded px-3 py-2" required />
        <input type="password" id="loginPassword" placeholder="Hasło" class="w-full border rounded px-3 py-2" required />
        <input type="text" id="loginFullName" placeholder="Imię i nazwisko" class="w-full border rounded px-3 py-2 hidden" />
        <button type="submit" id="loginSubmitBtn" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"></button>
      </form>
      <p id="loginError" class="text-red-600 text-sm hidden"></p>
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
    tabLogin.className = isRegister
      ? 'pb-2 border-b-2 border-transparent text-gray-500'
      : 'pb-2 border-b-2 border-blue-600 font-medium';
    tabRegister.className = isRegister
      ? 'pb-2 border-b-2 border-blue-600 font-medium'
      : 'pb-2 border-b-2 border-transparent text-gray-500';
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

    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const body = mode === 'register' ? { email, password, fullName } : { email, password };
      const data = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
      setToken(data.token);
      navigate('/rates');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    }
  });
}
