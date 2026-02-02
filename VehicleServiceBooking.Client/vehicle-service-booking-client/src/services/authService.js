import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async registerClient(data) {
    const response = await api.post('/auth/register-client', data);
    return response.data;
  },

  async registerMechanic(data) {
    const response = await api.post('/auth/register-mechanic', data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

