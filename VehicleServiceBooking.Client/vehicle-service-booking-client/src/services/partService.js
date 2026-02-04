import api from './api';

export const partService = {
  async getAll() {
    const response = await api.get('/parts');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/parts/${id}`);
    return response.data;
  },

  async create(part) {
    const response = await api.post('/parts', part);
    return response.data;
  },

  async update(id, part) {
    await api.put(`/parts/${id}`, part);
  },

  async delete(id) {
    await api.delete(`/parts/${id}`);
  },
};

