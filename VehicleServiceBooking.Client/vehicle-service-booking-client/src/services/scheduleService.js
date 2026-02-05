import api from './api';

export const scheduleService = {
  async getAll(mechanicId) {
    const url = mechanicId ? `/schedules?mechanicId=${mechanicId}` : '/schedules';
    const response = await api.get(url);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  async create(schedule) {
    const response = await api.post('/schedules', schedule);
    return response.data;
  },

  async update(id, schedule) {
    await api.put(`/schedules/${id}`, schedule);
  },

  async delete(id) {
    await api.delete(`/schedules/${id}`);
  },
};

