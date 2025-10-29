import axios from "axios";

const API_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = {
  login: (email) => api.post("/auth/login", { email }),
  register: (userData) => api.post("/auth/register", userData),
};

export const usuariosAPI = {
  getAll: () => api.get("/usuarios"),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post("/usuarios", data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

export const canchasAPI = {
  getAll: () => api.get("/canchas"),
  getById: (id) => api.get(`/canchas/${id}`),
  create: (data) => api.post("/canchas", data),
  update: (id, data) => api.put(`/canchas/${id}`, data),
  delete: (id) => api.delete(`/canchas/${id}`),
  getByTipo: (tipo) => api.get(`/canchas/tipo/${tipo}`),
};

export const reservasAPI = {
  getAll: () => api.get("/reservas"),
  getById: (id) => api.get(`/reservas/${id}`),
  create: (data) => api.post("/reservas", data),
  delete: (id) => api.delete(`/reservas/${id}`),
  confirmar: (id) => api.patch(`/reservas/${id}/confirmar`),
  cancelar: (id) => api.patch(`/reservas/${id}/cancelar`),
  getByUsuario: (usuarioId) => api.get(`/reservas/usuario/${usuarioId}`),
  getByCancha: (canchaId) => api.get(`/reservas/cancha/${canchaId}`),
};

export default api;
