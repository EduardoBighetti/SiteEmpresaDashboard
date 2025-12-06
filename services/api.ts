
import { User, Sensor, Reading } from '../types';

// In a real scenario, this would point to your actual backend URL
// For this React demo, we will simulate responses if the backend isn't running
const API_URL = 'http://localhost:3000/api';

const headers = {
  'Content-Type': 'application/json',
};

// Helper to handle fetch with credentials
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      credentials: 'include', // Important for session cookies
    });
    
    if (!response.ok) {
      throw new Error('API Request Failed');
    }
    return response.json();
  } catch (error) {
    // Re-throw to be caught by specific services
    throw error;
  }
};

export const authService = {
  me: async (): Promise<{ user: User | null }> => {
    try {
      return await fetchWithAuth('/me');
    } catch (e) {
      console.warn("Backend not reachable. Returning null to force login.");
      // Return null user to force the Login screen on startup if backend is down
      return { user: null }; 
    }
  },
  login: async (username: string, password: string): Promise<{ user: User }> => {
    try {
      return await fetchWithAuth('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    } catch (e) {
      // Mock login for demo
      // Logic: Only "EduardoBighetti" is Admin. Everyone else is User.
      const isAdmin = username === 'EduardoBighetti';
      
      return { 
        user: { 
          id: isAdmin ? 999 : Math.floor(Math.random() * 1000), 
          username: username,
          role: isAdmin ? 'admin' : 'user'
        } 
      };
    }
  },
  logout: async (): Promise<void> => {
    try {
      return await fetchWithAuth('/logout', { method: 'POST' });
    } catch (e) {
      return;
    }
  },
  register: async (username: string, password: string): Promise<{ user: User }> => {
    try {
      return await fetchWithAuth('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    } catch (e) {
       const isAdmin = username === 'EduardoBighetti';
       return { 
         user: { 
           id: Math.floor(Math.random() * 1000), 
           username: username,
           role: isAdmin ? 'admin' : 'user'
         } 
       };
    }
  },
  sendFeedback: async (email: string, message: string): Promise<boolean> => {
    // In a real app, this would POST to a backend which uses SMTP/SendGrid
    // to email dudubighetti2005@gmail.com
    console.log(`Sending email to dudubighetti2005@gmail.com from ${email}: ${message}`);
    return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
  }
};

export const sensorService = {
  getAll: async (): Promise<Sensor[]> => {
    try {
      return await fetchWithAuth('/sensors');
    } catch (e) {
      // Mock data for UI preview
      return [
        { id: 1, identifier: 'ESP32-001', name: 'Sala de Servidores', status: 'active', last_seen: new Date().toISOString() },
        { id: 2, identifier: 'ESP8266-A', name: 'Estufa Hidropônica', status: 'active', last_seen: new Date(Date.now() - 300000).toISOString() },
        { id: 3, identifier: 'ESP32-LAB-02', name: 'Laboratório Químico', status: 'offline', last_seen: new Date(Date.now() - 86400000).toISOString() },
      ];
    }
  },
  create: async (identifier: string, name: string): Promise<Sensor> => {
    try {
      return await fetchWithAuth('/sensors', {
        method: 'POST',
        body: JSON.stringify({ identifier, name }),
      });
    } catch (e) {
       return { id: Math.random(), identifier, name, status: 'offline', last_seen: new Date().toISOString() };
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      return await fetchWithAuth(`/sensors/${id}`, { method: 'DELETE' });
    } catch (e) {
      return;
    }
  }
};

export const readingService = {
  getLatest: async (sensorId?: number): Promise<Reading[]> => {
    const query = sensorId ? `?sensorId=${sensorId}` : '';
    try {
      const data = await fetchWithAuth(`/readings${query}`);
      // If we are in "Dashboard" mode (no sensorId), we might need to average data on frontend
      // But if backend sends raw rows, we might just return them.
      return data;
    } catch (e) {
      // Mock Data Generator
      const now = Date.now();
      
      // If sensorId is provided, return specific data for that sensor
      // If NO sensorId is provided (Dashboard), return a "Global Average" mock
      
      let baseTemp = 24;
      let baseHum = 50;
      
      if (sensorId === 1) { baseTemp = 20; baseHum = 45; } // Cooler
      if (sensorId === 2) { baseTemp = 28; baseHum = 80; } // Warmer/Humid
      if (sensorId === 3) { baseTemp = 22; baseHum = 30; } 
      
      // If it's the dashboard (no ID), use a stable average
      if (!sensorId) {
        baseTemp = 25; // Average of all
        baseHum = 55;
      }

      return Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        sensor_id: sensorId || 0,
        // Add some randomness but keep it smooth
        temperature: baseTemp + (Math.sin(i) * 2) + (Math.random() * 0.5),
        humidity: baseHum + (Math.cos(i) * 5) + (Math.random() * 1),
        created_at: new Date(now - i * 1800000).toISOString(), // 30 min intervals
      })).reverse();
    }
  }
};
