import api from './api';

export const mechanicService = {
  async getAll() {
    const response = await api.get('/mechanics');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/mechanics/${id}`);
    return response.data;
  },

  async create(mechanic) {
    const response = await api.post('/mechanics', mechanic);
    return response.data;
  },

  async update(id, mechanic) {
    await api.put(`/mechanics/${id}`, mechanic);
  },

  async delete(id) {
    await api.delete(`/mechanics/${id}`);
  },
};

