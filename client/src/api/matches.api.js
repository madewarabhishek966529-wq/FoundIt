import { api } from './axios';

export const getItemMatches = async (itemId) => {
  const response = await api.get(`/items/${itemId}/matches`);
  return response.data;
};

export const getMyMatches = async () => {
  const response = await api.get('/matches/mine');
  return response.data;
};

export const dismissMatch = async (matchId) => {
  const response = await api.patch(`/matches/${matchId}/dismiss`);
  return response.data;
};

export const searchByImage = async (formData, params = {}) => {
  const response = await api.post('/items/search-by-image', formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
