
import React, { useState } from 'react';
import { authService } from '../services/api';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await authService.login(username, password);
      } else {
        data = await authService.register(username, password);
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">AL2 IoT</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isLogin ? t('login.welcome') : t('login.create')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.user_label')}</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.pass_label')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? '...' : (isLogin ? t('login.btn_enter') : t('login.btn_register'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 font-medium"
            >
              {isLogin ? t('login.link_register') : t('login.link_login')}
            </button>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 px-8 py-4 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-slate-700">
          &copy; 2025 AL2 Tecnologia.
        </div>
      </div>
    </div>
  );
};
