import api from './api';

export const serviceCenterService = {
  async getAll() {
    const response = await api.get('/servicecenters');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/servicecenters/${id}`);
    return response.data;
  },

  async create(center) {
    const response = await api.post('/servicecenters', center);
    return response.data;
  },

  async update(id, center) {
    await api.put(`/servicecenters/${id}`, center);
  },

  async delete(id) {
    await api.delete(`/servicecenters/${id}`);
  },
};

