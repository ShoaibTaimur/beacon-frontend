import axios from 'axios';
import { auth } from './firebase';

const getBaseURL = () => {
  if (window.location.hostname === 'beacon.taimur.dev') {
    return 'https://beacon-backend-two.vercel.app/api';
  }
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (window.location.hostname === '10.0.2.2') {
    return envUrl.replace('localhost', '10.0.2.2');
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token to every request (supporting WebView ?token query param bypass)
api.interceptors.request.use(async (config) => {
  let token = null;
  const user = auth.currentUser;
  
  if (user) {
    token = await user.getIdToken();
  } else {
    // Try to extract from URL query parameters (useful in Android WebView)
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
    if (token) {
      sessionStorage.setItem('temp_auth_token', token);
    } else {
      token = sessionStorage.getItem('temp_auth_token');
    }
  }

  if (token) {
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
export const getDeviceLocationHistory = (id, date) =>
  api.get(`/devices/${id}/location-history`, { params: { date } });

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

export const ringDevice = (id) => api.post(`/devices/${id}/ring`);
export const stopRingDevice = (id) => api.post(`/devices/${id}/stop-ring`);
export const locateDevice = (id) => api.post(`/devices/${id}/locate`);
export const refreshDevice = (id) => api.post(`/devices/${id}/refresh`);

export default api;
