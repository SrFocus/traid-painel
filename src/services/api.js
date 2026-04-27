import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) => 
  api.post('/auth/login', { username, password });

// Stats
export const getStats = () => api.get('/stats');

// Players (vRP - usa id numérico)
export const getPlayers = (page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'desc') => 
  api.get('/players', { params: { page, limit, search, sortBy, sortOrder } });

export const getOnlinePlayers = () => api.get('/players/online');

export const getPlayer = (id) => 
  api.get(`/players/${id}`);

export const updatePlayer = (id, data) => 
  api.put(`/players/${id}`, data);

export const modifyPlayerMoney = (id, action, amount) => 
  api.post(`/players/${id}/money`, { action, amount });

export const modifyPlayerCasino = (id, action, amount) =>
  api.post(`/players/${id}/casino`, { action, amount });

// Inventory
export const addInventoryItem = (id, item, amount) => 
  api.post(`/players/${id}/inventory`, { item, amount });

export const removeInventoryItem = (id, slot, amount = null) => 
  api.delete(`/players/${id}/inventory/${slot}`, { params: amount ? { amount } : {} });

export const addPlayerWeaponSkin = (playerId, component) =>
  api.post(`/players/${playerId}/weapon-skins`, { component });

export const removePlayerWeaponSkin = (playerId, component) =>
  api.delete(`/players/${playerId}/weapon-skins/${encodeURIComponent(component)}`);

// Vehicles
export const getVehicles = (page = 1, limit = 20, search = '', userId = '') => 
  api.get('/vehicles', { params: { page, limit, search, userId } });

export const deleteVehicle = (id) => 
  api.delete(`/vehicles/${id}`);

// Houses (global)
export const getHouses = (page = 1, limit = 20, search = '') =>
  api.get('/houses', { params: { page, limit, search } });

export const deleteHouse = (id) =>
  api.delete(`/houses/${id}`);

export const addPlayerVehicle = (playerId, vehicle, plate = '', dias = null) =>
  api.post(`/players/${playerId}/vehicles`, { vehicle, plate, dias });

export const removePlayerVehicle = (playerId, vehicleId) =>
  api.delete(`/players/${playerId}/vehicles/${vehicleId}`);

export const addPlayerGroup = (playerId, group, dias = null) =>
  api.post(`/players/${playerId}/groups`, { group, dias });

export const removePlayerGroup = (playerId, group) =>
  api.delete(`/players/${playerId}/groups/${group}`);

export const addVehicleTrunkItem = (playerId, vehicleId, item, amount) =>
  api.post(`/players/${playerId}/vehicles/${vehicleId}/trunk`, { item, amount });

export const removeVehicleTrunkItem = (playerId, vehicleId, slot, amount = null) =>
  api.delete(`/players/${playerId}/vehicles/${vehicleId}/trunk/${slot}`, { params: amount ? { amount } : {} });

export const addPlayerHouse = (playerId, home) =>
  api.post(`/players/${playerId}/houses`, { home });

export const removePlayerHouse = (playerId, homeId) =>
  api.delete(`/players/${playerId}/houses/${homeId}`);

export const addHouseStashItem = (playerId, homeId, item, amount) =>
  api.post(`/players/${playerId}/houses/${homeId}/stash`, { item, amount });

export const removeHouseStashItem = (playerId, homeId, slot, amount = null) =>
  api.delete(`/players/${playerId}/houses/${homeId}/stash/${slot}`, { params: amount ? { amount } : {} });

export const getHouseStash = (houseId) =>
  api.get(`/houses/${houseId}/stash`);

// Chests (vrp_chests)
export const getChests = (page = 1, limit = 30, search = '') =>
  api.get('/chests', { params: { page, limit, search } });

export const getChestStash = (chestId) =>
  api.get(`/chests/${chestId}/stash`);

export const addChestStashItem = (chestId, item, amount) =>
  api.post(`/chests/${chestId}/stash`, { item, amount });

export const removeChestStashItem = (chestId, slot, amount = null) =>
  api.delete(`/chests/${chestId}/stash/${slot}`, { params: amount ? { amount } : {} });

// Bans (vRP - usa user_id)
export const getBans = () => api.get('/bans');

export const addBan = (user_id, motivo, desbanimento, hwid = 0) => 
  api.post('/bans', { user_id, motivo, desbanimento, hwid });

export const removeBan = (user_id) => 
  api.delete(`/bans/${user_id}`);

// Whitelist
export const getWhitelist = () => api.get('/whitelist');

// Logs
export const getLogs = (limit = 100) => 
  api.get('/logs', { params: { limit } });

// Panel Users (apenas dono)
export const getPanelUsers = () => api.get('/panel-users');

export const createPanelUser = (username, password, role) => 
  api.post('/panel-users', { username, password, role });

export const updatePanelUser = (id, data) => 
  api.put(`/panel-users/${id}`, data);

export const deletePanelUser = (id) => 
  api.delete(`/panel-users/${id}`);

// Panel Logs (apenas dono)
export const getPanelLogs = (page = 1, limit = 50, search = '', action = '') => 
  api.get('/panel-logs', { params: { page, limit, search, action } });

export default api;
