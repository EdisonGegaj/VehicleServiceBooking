import api from './api';

export const serviceTypeService = {
  async getAll(activeOnly = false) {
    const response = await api.get(`/servicetypes?activeOnly=${activeOnly}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/servicetypes/${id}`);
    return response.data;
  },

  async create(serviceType) {
    const response = await api.post('/servicetypes', serviceType);
    return response.data;
  },

  async update(id, serviceType) {
    await api.put(`/servicetypes/${id}`, serviceType);
  },

  async delete(id) {
    await api.delete(`/servicetypes/${id}`);
  },
};

