
import React, { useState } from 'react';
import { authService, accessKeyService } from '../services/api';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldAlert, User as UserIcon, ShieldCheck, Zap, Shield } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'gerencia'>('user');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação Dinâmica de Chaves
    if (!isLogin && role !== 'user') {
      const isValid = await accessKeyService.validate(accessKey, role);
      if (!isValid) {
        setError(`Esta chave de acesso não é válida para o cargo ${role.toUpperCase()}.`);
        return;
      }
    }

    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await authService.login(username, password);
      } else {
        data = await authService.register({ 
          username, 
          password, 
          full_name: fullName, 
          email, 
          role,
          access_key: role !== 'user' ? accessKey : undefined 
        });
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = (selectedRole: 'user' | 'admin' | 'gerencia') => {
    let mockUser: User;
    
    if (selectedRole === 'gerencia') {
      mockUser = {
        id: 999,
        username: 'Gerente_Master',
        full_name: 'Desenvolvedor AL2 (Acesso Total)',
        role: 'gerencia',
        email: 'dev@al2.tecnologia',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AL2Dev'
      };
    } else if (selectedRole === 'admin') {
      mockUser = {
        id: 888,
        username: 'Admin_Teste',
        full_name: 'Administrador de Sistemas',
        role: 'admin',
        email: 'admin@al2.tecnologia',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
      };
    } else {
      mockUser = {
        id: 777,
        username: 'Usuario_Padrao',
        full_name: 'Operador de Monitoramento',
        role: 'user',
        email: 'user@al2.tecnologia',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=User'
      };
    }
    
    localStorage.setItem('al2_user', JSON.stringify(mockUser));
    onLoginSuccess(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 border-t-4 border-blue-600">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
              <span className="text-blue-600">AL2</span> IoT
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isLogin ? t('login.welcome') : t('login.create')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 py-2">
                   <button 
                     type="button"
                     onClick={() => setRole('user')}
                     className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${role === 'user' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                   >
                     <UserIcon size={18} />
                     <span className="text-[10px] font-bold mt-1 uppercase">Usuário</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setRole('admin')}
                     className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${role === 'admin' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                   >
                     <ShieldCheck size={18} />
                     <span className="text-[10px] font-bold mt-1 uppercase">Admin</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setRole('gerencia')}
                     className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${role === 'gerencia' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                   >
                     <ShieldAlert size={18} />
                     <span className="text-[10px] font-bold mt-1 uppercase">Gerência</span>
                   </button>
                </div>

                {role !== 'user' && (
                  <div className="animate-in zoom-in-95 duration-200">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chave de Acesso Obrigatória
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Cole a chave gerada pelo Master"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      className="w-full px-4 py-2 border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.user_label')}</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.pass_label')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg text-center border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${role === 'gerencia' && !isLogin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 mt-2`}
            >
              {loading ? 'Processando...' : (isLogin ? t('login.btn_enter') : t('login.btn_register'))}
            </button>
          </form>

          <div className="relative mt-8 mb-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-gray-500 dark:text-gray-400 font-bold">Desenvolvimento</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleQuickAccess('gerencia')}
              className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 border-2 border-dashed border-amber-500 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 group"
            >
              <Zap size={18} className="fill-amber-500 group-hover:scale-125 transition-transform" />
              ATIVAR ACESSO MASTER (GERÊNCIA)
            </button>

            <button
              onClick={() => handleQuickAccess('admin')}
              className="w-full py-2.5 px-4 bg-blue-500/5 hover:bg-blue-500/10 border-2 border-dashed border-blue-500/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <Shield size={16} className="group-hover:scale-110 transition-transform" />
              ACESSO RÁPIDO: ADMINISTRADOR
            </button>

            <button
              onClick={() => handleQuickAccess('user')}
              className="w-full py-2.5 px-4 bg-slate-500/5 hover:bg-slate-500/10 border-2 border-dashed border-slate-500/50 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <UserIcon size={16} className="group-hover:scale-110 transition-transform" />
              ACESSO RÁPIDO: USUÁRIO PADRÃO
            </button>
          </div>

          <div className="mt-6 text-center border-t border-gray-100 dark:border-slate-700 pt-6">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setRole('user'); setAccessKey(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 font-medium"
            >
              {isLogin ? t('login.link_register') : t('login.link_login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
