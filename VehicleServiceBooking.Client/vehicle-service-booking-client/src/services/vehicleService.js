import api from './api';

export const vehicleService = {
  async getAll() {
    const response = await api.get('/vehicles');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async create(vehicle) {
    const response = await api.post('/vehicles', vehicle);
    return response.data;
  },

  async update(id, vehicle) {
    await api.put(`/vehicles/${id}`, vehicle);
  },

  async delete(id) {
    await api.delete(`/vehicles/${id}`);
  },
};

