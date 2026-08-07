const routes = {};

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
  a.className = 'text-blue-600 hover:underline';
  return a;
}

function createNavButton(label, onClick) {
  const button = document.createElement('button');
  button.textContent = label;
  button.className = 'text-red-600 hover:underline';
  button.addEventListener('click', onClick);
  return button;
}

function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';

  if (isAuthenticated()) {
    nav.appendChild(createNavLink('Stawki', '/rates'));
    nav.appendChild(createNavLink('Kosztorysy', '/estimates'));
    nav.appendChild(
      createNavButton('Wyloguj', () => {
        clearToken();
        navigate('/login');
      })
    );
  } else {
    nav.appendChild(createNavLink('Zaloguj / Zarejestruj', '/login'));
  }
}

async function renderRoute() {
  const path = window.location.hash.slice(1) || '/rates';
  const route = routes[path] || routes['/rates'];

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
