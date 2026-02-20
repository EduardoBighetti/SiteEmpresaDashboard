
import { User, Sensor, Reading, AccessKey } from '../types';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(errorData.detail || 'Falha na requisição');
    }
    return response.json();
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('OFFLINE');
    }
    throw error;
  }
};

// --- MOCK STORAGE HELPERS ---
const getLocalSensors = (): Sensor[] => {
  const stored = localStorage.getItem('al2_local_sensors');
  if (stored) return JSON.parse(stored);
  
  // Sensores padrão para teste da Planta Baixa
  const defaultSensors: Sensor[] = [
    { id: 1, identifier: 'ESP32-AR-01', name: 'Ar-condicionado 01', status: 'active', floor_x: 25, floor_y: 35, latitude: -23.5505, longitude: -46.6333 },
    { id: 2, identifier: 'ESP32-AR-02', name: 'Ar-condicionado 02', status: 'active', floor_x: 45, floor_y: 35, latitude: -23.5510, longitude: -46.6340 },
    { id: 3, identifier: 'ESP32-GEL-01', name: 'Geladeira Bebidas', status: 'active', floor_x: 75, floor_y: 65, latitude: -23.5515, longitude: -46.6345 },
    { id: 4, identifier: 'ESP32-EST-01', name: 'Estoque Central', status: 'offline', floor_x: 15, floor_y: 80, latitude: -23.5520, longitude: -46.6350 },
  ];
  localStorage.setItem('al2_local_sensors', JSON.stringify(defaultSensors));
  return defaultSensors;
};

const getLocalKeys = (): AccessKey[] => {
  const stored = localStorage.getItem('al2_access_keys');
  const defaultKey: AccessKey = { id: 0, key: 'Al2@@', role: 'gerencia', is_used: false, created_at: new Date().toISOString() };
  return stored ? JSON.parse(stored) : [defaultKey];
};

const saveLocalKey = (key: AccessKey) => {
  const keys = getLocalKeys();
  keys.push(key);
  localStorage.setItem('al2_access_keys', JSON.stringify(keys));
};

export const authService = {
  me: async (): Promise<{ user: User | null }> => {
    try {
      const userData = localStorage.getItem('al2_user');
      if (userData) return { user: JSON.parse(userData) };
      return { user: null };
    } catch (e) {
      return { user: null }; 
    }
  },
  login: async (username: string, password: string): Promise<{ user: User }> => {
    const data = await fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('al2_user', JSON.stringify(data.user));
    return data;
  },
  logout: async (): Promise<void> => {
    localStorage.removeItem('al2_user');
  },
  register: async (payload: any): Promise<{ user: User }> => {
    try {
        const data = await fetchWithAuth('/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        localStorage.setItem('al2_user', JSON.stringify(data.user));
        return data;
    } catch (e: any) {
        if (e.message === 'OFFLINE') {
            const newUser: User = {
                id: Math.floor(Math.random() * 1000),
                username: payload.username,
                full_name: payload.full_name,
                email: payload.email,
                role: payload.role,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('al2_user', JSON.stringify(newUser));
            if (payload.access_key) {
                const keys = getLocalKeys();
                const keyIdx = keys.findIndex(k => k.key === payload.access_key);
                if (keyIdx !== -1) {
                    keys[keyIdx].is_used = true;
                    localStorage.setItem('al2_access_keys', JSON.stringify(keys));
                }
            }
            return { user: newUser };
        }
        throw e;
    }
  },
  getUsers: async (): Promise<User[]> => {
    try {
      return await fetchWithAuth('/users');
    } catch (e) {
      const loggedUser = JSON.parse(localStorage.getItem('al2_user') || 'null');
      return loggedUser ? [loggedUser] : [];
    }
  },
  sendFeedback: async (email: string, message: string): Promise<boolean> => {
    console.log(`Feedback: ${message} de ${email}`);
    return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
  }
};

export const accessKeyService = {
  getAll: async (): Promise<AccessKey[]> => {
    try {
      return await fetchWithAuth('/keys');
    } catch (e) {
      return getLocalKeys();
    }
  },
  generate: async (role: 'admin' | 'gerencia'): Promise<AccessKey> => {
    const newKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      return await fetchWithAuth('/keys', {
        method: 'POST',
        body: JSON.stringify({ key: newKey, role }),
      });
    } catch (e) {
      const keyObj: AccessKey = {
        id: Math.floor(Math.random() * 10000),
        key: newKey,
        role,
        is_used: false,
        created_at: new Date().toISOString()
      };
      saveLocalKey(keyObj);
      return keyObj;
    }
  },
  validate: async (key: string, role: string): Promise<boolean> => {
    try {
      const data = await fetchWithAuth(`/keys/validate?key=${key}&role=${role}`);
      return data.valid;
    } catch (e) {
      const keys = getLocalKeys();
      return keys.some(k => k.key === key && k.role === role && !k.is_used);
    }
  }
};

export const sensorService = {
  getAll: async (): Promise<Sensor[]> => {
    try {
      const apiSensors = await fetchWithAuth('/sensors');
      return [...apiSensors, ...getLocalSensors()];
    } catch (err: any) {
      return getLocalSensors();
    }
  },
  create: async (identifier: string, name: string, latitude?: number, longitude?: number): Promise<Sensor> => {
    try {
      return await fetchWithAuth('/sensors', {
        method: 'POST',
        body: JSON.stringify({ identifier, name, latitude, longitude }),
      });
    } catch (err: any) {
      if (err.message === 'OFFLINE') {
        const newLocalSensor: Sensor = {
          id: Math.floor(Math.random() * 10000),
          identifier,
          name,
          latitude,
          longitude,
          status: 'offline',
          last_seen: new Date().toISOString()
        };
        const sensors = getLocalSensors();
        sensors.push(newLocalSensor);
        localStorage.setItem('al2_local_sensors', JSON.stringify(sensors));
        return newLocalSensor;
      }
      throw err;
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      await fetchWithAuth(`/sensors/${id}`, { method: 'DELETE' });
    } catch (err) {
      const sensors = getLocalSensors().filter(s => s.id !== id);
      localStorage.setItem('al2_local_sensors', JSON.stringify(sensors));
    }
  }
};

export const readingService = {
  getLatest: async (sensorId?: number): Promise<Reading[]> => {
    try {
      const query = sensorId ? `?sensorId=${sensorId}` : '';
      return await fetchWithAuth(`/readings${query}`);
    } catch (e) {
      // Retorna alguns dados mockados se o backend estiver offline
      return [
        { id: 1, sensor_id: sensorId || 1, temperature: 22.5, humidity: 45, created_at: new Date().toISOString() },
        { id: 2, sensor_id: sensorId || 1, temperature: 23.0, humidity: 44, created_at: new Date(Date.now() - 60000).toISOString() }
      ];
    }
  }
};
