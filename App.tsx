
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Devices } from './pages/Devices';
import { Monitoring } from './pages/Monitoring';
import { Settings } from './pages/Settings';
import { UserManagement } from './pages/UserManagement';
import { authService } from './services/api';
import { User } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authService.me();
        if (data.user) setUser(data.user);
      } catch (error) {
        console.log("Not authenticated");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleUpdateUser = (updatedUser: User) => setUser(updatedUser);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-bold">Iniciando sistema AL2...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout}><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/monitoring" element={user ? <Layout user={user} onLogout={handleLogout}><Monitoring /></Layout> : <Navigate to="/login" />} />
        <Route path="/devices" element={user ? <Layout user={user} onLogout={handleLogout}><Devices /></Layout> : <Navigate to="/login" />} />
        
        {/* Protected route for Gerencia */}
        <Route path="/users" element={user && user.role === 'gerencia' ? <Layout user={user} onLogout={handleLogout}><UserManagement /></Layout> : <Navigate to="/" />} />

        <Route path="/settings" element={user ? <Layout user={user} onLogout={handleLogout}><Settings user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}/></Layout> : <Navigate to="/login" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
