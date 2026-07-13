export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Device {
  _id: string;
  id?: string;
  owner: string;
  name?: string;
  deviceName?: string;
  model: string;
  manufacturer: string;
  osVersion?: string;
  androidVersion?: string;
  batteryLevel: number;
  isCharging: boolean;
  ramUsed: number;
  ramTotal: number;
  storageUsed: number;
  storageTotal: number;
  soundMode: string;
  lastSync?: string;
  lastSeen?: string;
  isOnline: boolean;
  fcmToken?: string;
  isRinging?: boolean;
  latitude?: number;
  longitude?: number;
  locationTimestamp?: string;
  location?: DeviceLocation;
  role?: 'owner' | 'manager' | 'finder' | 'viewer';
}

export interface SharedDeviceData {
  _id: string;
  id?: string;
  name?: string;
  deviceName?: string;
  model: string;
  manufacturer: string;
  osVersion?: string;
  androidVersion?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  ramUsed?: number;
  ramTotal?: number;
  storageUsed?: number;
  storageTotal?: number;
  soundMode?: string;
  lastSync?: string;
  lastSeen?: string;
  isOnline?: boolean;
  isRinging?: boolean;
  latitude?: number;
  longitude?: number;
  locationTimestamp?: string;
  location?: DeviceLocation;
}

export interface SharedDevice {
  _id: string;
  device: SharedDeviceData;
  permittedFields: string[];
  role: 'owner' | 'manager' | 'finder' | 'viewer';
  isRinging?: boolean;
}

export interface InviteUser {
  _id: string;
  email: string;
  displayName?: string;
}

export interface InviteDevice {
  _id: string;
  name: string;
  model: string;
}

export interface Invite {
  _id: string;
  device: InviteDevice;
  sender: InviteUser;
  receiver: InviteUser;
  role: 'manager' | 'finder' | 'viewer';
  permittedFields: string[];
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface TrustLink {
  _id: string;
  device: string;
  user: InviteUser;
  role: 'manager' | 'finder' | 'viewer';
  permittedFields: string[];
}

export interface LocationLog {
  _id: string;
  device: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  batteryLevel: number;
  isCharging: boolean;
  timestamp: string;
}

export interface HistoryLog {
  _id: string;
  device: string;
  actor: InviteUser | null;
  action: string;
  details: string;
  timestamp: string;
}
