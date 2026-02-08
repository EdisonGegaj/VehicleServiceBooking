import api from "./api";

export const authService = {
  login: async (credentials) => {
    const res = await api.post("/Auth/login", credentials);
    return res.data; 
  },

  registerClient: async (data) => {
    const res = await api.post("/Auth/register-client", data);
    return res.data; 
  },

  registerMechanic: async (data) => {
    const res = await api.post("/Auth/register-mechanic", data);
    return res.data;
  },
};
