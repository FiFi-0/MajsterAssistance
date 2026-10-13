registerRoute('/chat', renderChatView);
registerRoute('/login', renderLoginView, { guestOnly: true });
registerRoute('/rates', renderRatesView, { requiresAuth: true });
registerRoute('/estimates', renderEstimatesView, { requiresAuth: true });
