import api from './client';

export const getWaStatus = () =>
  api.get('/wa/status').then((r) => r.data);

export const connectWa = () =>
  api.get('/wa/connect').then((r) => r.data);

export const logoutWa = () =>
  api.post('/wa/logout').then((r) => r.data);
