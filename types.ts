
export interface User {
  id: number;
  username: string;
  full_name?: string;
  avatar?: string;
  email?: string;
  role: 'gerencia' | 'admin' | 'user';
  created_at?: string;
}

export interface Sensor {
  id: number;
  identifier: string;
  name: string;
  status: 'active' | 'offline' | 'maintenance';
  last_seen?: string;
  token?: string;
  latitude?: number;
  longitude?: number;
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
