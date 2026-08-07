registerRoute('/login', renderLoginView);
registerRoute('/rates', renderRatesView, { requiresAuth: true });
registerRoute('/estimates', renderEstimatesView, { requiresAuth: true });
