import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle common error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — could trigger re-auth here
      console.warn('[API] Authentication failed');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const syncUser = (data) => api.post('/auth/sync', data);

// User API
export const getMe = () => api.get('/users/me');

// Device API
export const getDevices = () => api.get('/devices');
export const getDevice = (id) => api.get(`/devices/${id}`);
export const registerDevice = (data) => api.post('/devices', data);
export const removeDevice = (id) => api.delete(`/devices/${id}`);
export const updateFcmToken = (id, fcmToken) =>
  api.patch(`/devices/${id}/fcm-token`, { fcmToken });

export default api;
