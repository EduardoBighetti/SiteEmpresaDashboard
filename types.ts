
export interface User {
  id: number;
  username: string;
  avatar?: string; // Base64 or URL
  email?: string;
  role?: 'admin' | 'user';
}

export interface Sensor {
  id: number;
  identifier: string;
  name: string;
  status: 'active' | 'offline' | 'maintenance';
  last_seen?: string;
  token?: string; // Only visible upon creation
}

export interface Reading {
  id: number;
  sensor_id: number;
  temperature: number;
  humidity: number;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface ApiError {
  message: string;
}
