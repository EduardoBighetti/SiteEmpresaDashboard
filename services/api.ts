
import { User, Sensor, Reading } from '../types';

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
    // Se falhar por conexão (servidor offline), lançamos um erro específico para o service tratar
    if (error.message.includes('Failed to fetch')) {
      throw new Error('OFFLINE');
    }
    throw error;
  }
};

// Auxiliar para gerenciar sensores locais quando o banco está offline
const getLocalSensors = (): Sensor[] => {
  const stored = localStorage.getItem('al2_local_sensors');
  return stored ? JSON.parse(stored) : [];
};

const saveLocalSensor = (sensor: Sensor) => {
  const sensors = getLocalSensors();
  sensors.push(sensor);
  localStorage.setItem('al2_local_sensors', JSON.stringify(sensors));
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
    const data = await fetchWithAuth('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('al2_user', JSON.stringify(data.user));
    return data;
  },
  getUsers: async (): Promise<User[]> => {
    try {
      return await fetchWithAuth('/users');
    } catch (e) {
      return []; // Fallback para dev
    }
  },
  sendFeedback: async (email: string, message: string): Promise<boolean> => {
    console.log(`Feedback para suporte: ${message} de ${email}`);
    return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
  }
};

export const sensorService = {
  getAll: async (): Promise<Sensor[]> => {
    try {
      const apiSensors = await fetchWithAuth('/sensors');
      return [...apiSensors, ...getLocalSensors()];
    } catch (err: any) {
      // Se estiver offline, retorna apenas os locais para não quebrar a UI
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
      // Se falhar (servidor offline), salvamos localmente para permitir desenvolvimento da UI
      if (err.message === 'OFFLINE') {
        const newLocalSensor: Sensor = {
          id: Math.floor(Math.random() * 10000), // ID temporário
          identifier,
          name,
          latitude,
          longitude,
          status: 'offline',
          last_seen: new Date().toISOString()
        };
        saveLocalSensor(newLocalSensor);
        return newLocalSensor;
      }
      throw err;
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      await fetchWithAuth(`/sensors/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Remove do local se não encontrar no banco ou banco offline
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
      // Retorna dados fake para o dashboard não ficar vazio em dev
      return [];
    }
  }
};
