import { api } from './axios';

export const submitClaim = async (claimData) => {
  const response = await api.post('/claims', claimData);
  return response.data;
};

export const getMyClaims = async () => {
  const response = await api.get('/claims/mine');
  return response.data;
};

export const getIncomingClaims = async () => {
  const response = await api.get('/claims/incoming');
  return response.data;
};

export const approveClaim = async (claimId) => {
  const response = await api.patch(`/claims/${claimId}/approve`);
  return response.data;
};

export const rejectClaim = async (claimId, reason) => {
  const response = await api.patch(`/claims/${claimId}/reject`, { reason });
  return response.data;
};

export const cancelClaim = async (claimId) => {
  const response = await api.patch(`/claims/${claimId}/cancel`);
  return response.data;
};
