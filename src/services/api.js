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

// Trust API — Invites
export const sendTrustInvite = (data) => api.post('/trust/invite', data);
export const getIncomingInvites = () => api.get('/trust/invites/incoming');
export const getOutgoingInvites = () => api.get('/trust/invites/outgoing');
export const acceptInvite = (id) => api.post(`/trust/invites/${id}/accept`);
export const declineInvite = (id) => api.post(`/trust/invites/${id}/decline`);
export const revokeInvite = (id) => api.delete(`/trust/invites/${id}`);

// Trust API — Shared Devices
export const getSharedDevices = () => api.get('/trust/shared-devices');
export const getSharedDevice = (id) => api.get(`/trust/shared-devices/${id}`);

// Trust API — Trust Management
export const getTrustedUsers = (deviceId) => api.get(`/trust/device/${deviceId}/trusted-users`);
export const updateTrustLink = (linkId, data) => api.patch(`/trust/${linkId}`, data);
export const revokeTrustLink = (linkId) => api.delete(`/trust/${linkId}`);

// Trust API — Device History
export const getDeviceHistory = (deviceId, page = 1) => api.get(`/trust/devices/${deviceId}/history?page=${page}`);

export default api;
