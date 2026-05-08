import api from './client';

export const selectPlan = (plan) =>
  api.post('/subscription/select', { plan }).then((r) => r.data);
