import api from './client';

// Dodo Payments checkout: returns { checkoutUrl } to redirect the user to.
export const startCheckout = (plan) =>
  api.post('/subscription/checkout', { plan }).then((r) => r.data);

// Direct activation without payment — only works in dev when Dodo isn't configured.
export const selectPlan = (plan) =>
  api.post('/subscription/select', { plan }).then((r) => r.data);
