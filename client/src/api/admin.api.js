import { api } from './axios';

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getDeskItems = async () => {
  const response = await api.get('/admin/desk-items');
  return response.data;
};

export const getClaimsQueue = async (status = 'pending') => {
  const response = await api.get('/admin/claims', { params: { status } });
  return response.data;
};

export const completeHandover = async (data) => {
  const response = await api.post('/admin/handover', data);
  return response.data;
};

export const getHandoverLogs = async (page = 1) => {
  const response = await api.get('/admin/handover-log', { params: { page } });
  return response.data;
};
