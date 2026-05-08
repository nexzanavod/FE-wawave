import api from './client';

export const getSettings = () =>
  api.get('/settings/anti-spam').then((r) => r.data);

export const saveSettings = (body) =>
  api.put('/settings/anti-spam', body).then((r) => r.data);
