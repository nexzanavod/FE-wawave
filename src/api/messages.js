import api from './client';

export const getLogs = (params) =>
  api.get('/message/logs', { params }).then((r) => r.data);

export const getJobs = () =>
  api.get('/message/jobs').then((r) => r.data);

export const getJob = (id) =>
  api.get(`/message/jobs/${id}`).then((r) => r.data);

export const cancelJob = (id) =>
  api.post(`/message/jobs/${id}/cancel`).then((r) => r.data);

export const sendBulk = (body) =>
  api.post('/message/send-bulk', body).then((r) => r.data);

export const sendOne = (number, message) =>
  api.post('/message/send-text', { number, message }).then((r) => r.data);

export const verifyNumber = (number) =>
  api.post('/message/verify-number', { number }).then((r) => r.data);

export const verifyNumbers = (numbers) =>
  api.post('/message/verify-numbers', { numbers }).then((r) => r.data);

export const uploadRecipients = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/recipients', form).then((r) => r.data);
};
