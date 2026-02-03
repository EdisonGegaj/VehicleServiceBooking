import api from './api';

export const bookingService = {
  async getAll() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async create(booking) {
    const response = await api.post('/bookings', booking);
    return response.data;
  },

  async update(id, booking) {
    await api.put(`/bookings/${id}`, booking);
  },

  async cancel(id) {
    await api.post(`/bookings/${id}/cancel`);
  },
};

