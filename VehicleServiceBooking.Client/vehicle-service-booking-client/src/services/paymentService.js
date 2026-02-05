import api from './api';

export const paymentService = {
  async getAll() {
    const response = await api.get('/payments');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async create(payment) {
    const response = await api.post('/payments', payment);
    return response.data;
  },

  async update(id, payment) {
    await api.put(`/payments/${id}`, payment);
  },

  async delete(id) {
    await api.delete(`/payments/${id}`);
  },
};
