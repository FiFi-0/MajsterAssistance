const routes = {};
const DEFAULT_ROUTE = '/chat';

function registerRoute(path, renderFn, { requiresAuth = false } = {}) {
  routes[path] = { renderFn, requiresAuth };
}

function navigate(path) {
  window.location.hash = path;
}

function createNavLink(label, path) {
  const a = document.createElement('a');
  a.textContent = label;
  a.href = `#${path}`;
  const isActive = (window.location.hash.slice(1) || DEFAULT_ROUTE) === path;
  a.className = isActive
    ? 'text-amber-700 dark:text-amber-400 font-semibold underline'
    : 'text-amber-600 dark:text-amber-500 hover:underline';
  return a;
}

function createNavButton(label, onClick) {
  const button = document.createElement('button');
  button.textContent = label;
  button.className = 'text-red-600 dark:text-red-400 hover:underline';
  button.addEventListener('click', onClick);
  return button;
}

function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';

  nav.appendChild(createNavLink('Asystent', '/chat'));

  if (isAuthenticated()) {
    const user = getUser();
    if (user) {
      const userLabel = document.createElement('span');
      userLabel.textContent = `Zalogowano jako: ${user.full_name}`;
      userLabel.className = 'text-sm text-gray-500 dark:text-gray-400 mr-2';
      nav.appendChild(userLabel);
    }

    nav.appendChild(createNavLink('Stawki', '/rates'));
    nav.appendChild(createNavLink('Kosztorysy', '/estimates'));
    nav.appendChild(
      createNavButton('Wyloguj', () => {
        clearToken();
        clearUser();
        navigate('/login');
      })
    );
  } else {
    nav.appendChild(createNavLink('Zaloguj / Zarejestruj', '/login'));
  }
}

async function renderRoute() {
  const path = window.location.hash.slice(1) || DEFAULT_ROUTE;
  const route = routes[path] || routes[DEFAULT_ROUTE];

  if (route.requiresAuth && !isAuthenticated()) {
    navigate('/login');
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = '';
  await route.renderFn(app);
  renderNav();
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);
