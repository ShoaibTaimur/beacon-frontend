import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { auth } from './firebase';
import { Device, SharedDevice, Invite, TrustLink, LocationLog, HistoryLog } from '../types';

const getBaseURL = (): string => {
  if (window.location.hostname === 'beacon.taimur.dev') {
    return 'https://beacon-backend-two.vercel.app/api';
  }
  const envUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
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
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token: string | null = null;
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
      console.warn('[API] Authentication failed');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const syncUser = (data: { email: string | null; displayName: string | null }): Promise<AxiosResponse<{ success: boolean; user: any }>> => 
  api.post('/auth/sync', data);

// User API
export const getMe = (): Promise<AxiosResponse<{ success: boolean; user: any }>> => 
  api.get('/users/me');

// Device API
export const getDevices = (): Promise<AxiosResponse<{ success: boolean; devices: Device[] }>> => 
  api.get('/devices');

export const getDevice = (id: string): Promise<AxiosResponse<{ success: boolean; device: Device }>> => 
  api.get(`/devices/${id}`);

export const registerDevice = (data: { name: string; model: string; manufacturer: string; osVersion: string }): Promise<AxiosResponse<Device>> => 
  api.post('/devices', data);

export const removeDevice = (id: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.delete(`/devices/${id}`);

export const updateFcmToken = (id: string, fcmToken: string): Promise<AxiosResponse<{ success: boolean }>> =>
  api.patch(`/devices/${id}/fcm-token`, { fcmToken });

export const getDeviceLocationHistory = (id: string, date: string): Promise<AxiosResponse<{ success: boolean; history: LocationLog[] }>> =>
  api.get(`/devices/${id}/location-history`, { params: { date } });

// Trust API — Invites
export const sendTrustInvite = (data: { email: string; deviceId: string; role: string; permittedFields: string[] }): Promise<AxiosResponse<Invite>> => 
  api.post('/trust/invite', data);

export const getIncomingInvites = (): Promise<AxiosResponse<{ success: boolean; invites: Invite[] }>> => 
  api.get('/trust/invites/incoming');

export const getOutgoingInvites = (): Promise<AxiosResponse<{ success: boolean; invites: Invite[] }>> => 
  api.get('/trust/invites/outgoing');

export const acceptInvite = (id: string): Promise<AxiosResponse<Invite>> => 
  api.post(`/trust/invites/${id}/accept`);

export const declineInvite = (id: string): Promise<AxiosResponse<Invite>> => 
  api.post(`/trust/invites/${id}/decline`);

export const revokeInvite = (id: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.delete(`/trust/invites/${id}`);

// Trust API — Shared Devices
export const getSharedDevices = (): Promise<AxiosResponse<{ success: boolean; devices: SharedDevice[] }>> => 
  api.get('/trust/shared-devices');

export const getSharedDevice = (id: string): Promise<AxiosResponse<{ success: boolean; device: SharedDevice }>> => 
  api.get(`/trust/shared-devices/${id}`);

// Trust API — Trust Management
export const getTrustedUsers = (deviceId: string): Promise<AxiosResponse<TrustLink[]>> => 
  api.get(`/trust/device/${deviceId}/trusted-users`);

export const updateTrustLink = (linkId: string, data: { role: string; permittedFields: string[] }): Promise<AxiosResponse<TrustLink>> => 
  api.patch(`/trust/${linkId}`, data);

export const revokeTrustLink = (linkId: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.delete(`/trust/${linkId}`);

// Trust API — Device History
export const getDeviceHistory = (deviceId: string, page = 1): Promise<AxiosResponse<{ logs: HistoryLog[]; totalPages: number; currentPage: number }>> => 
  api.get(`/trust/devices/${deviceId}/history?page=${page}`);

export const ringDevice = (id: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.post(`/devices/${id}/ring`);

export const stopRingDevice = (id: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.post(`/devices/${id}/stop-ring`);

export const locateDevice = (id: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.post(`/devices/${id}/locate`);

export const refreshDevice = (id: string): Promise<AxiosResponse<{ success: boolean }>> => 
  api.post(`/devices/${id}/refresh`);

// Config settings APIs (stored in MongoDB)
export const getConfig = (key: string): Promise<AxiosResponse<{ success: boolean; value: any }>> =>
  api.get(`/config/${key}`);

export const getAdminConfig = (key: string): Promise<AxiosResponse<{ success: boolean; value: any }>> =>
  api.get(`/config/${key}/admin`);

export const updateConfig = (key: string, value: any): Promise<AxiosResponse<{ success: boolean; setting: any }>> =>
  api.post(`/config/${key}`, { value });

export default api;
