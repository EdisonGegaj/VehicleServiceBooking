import api from './api';

export const workOrderService = {
  async getAll() {
    const response = await api.get('/workorders');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/workorders/${id}`);
    return response.data;
  },

  async create(workOrder) {
    const response = await api.post('/workorders', workOrder);
    return response.data;
  },

  async update(id, workOrder) {
    await api.put(`/workorders/${id}`, workOrder);
  },

  async delete(id) {
    await api.delete(`/workorders/${id}`);
  },
};

