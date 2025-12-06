
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Moon, Sun, Upload, Mail, LogOut, User as UserIcon, Send, Globe, Ruler } from 'lucide-react';
import { authService } from '../services/api';
import { useLanguage, UnitPreferences } from '../contexts/LanguageContext';

interface SettingsProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout, isDarkMode, toggleTheme }) => {
  const { language, setLanguage, t, units, setUnits, updateUnit } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const [username, setUsername] = useState(user?.username || '');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !feedback) return;

    setSending(true);
    try {
      await authService.sendFeedback(email, feedback);
      setSentSuccess(true);
      setEmail('');
      setFeedback('');
      setTimeout(() => setSentSuccess(false), 5000);
    } catch (error) {
      alert("Erro");
    } finally {
      setSending(false);
    }
  };

  const roleLabel = user?.username === 'EduardoBighetti' 
    ? t('header.admin') 
    : t('header.user');

  // Custom CSS class for Radio Buttons to ensure White Dot on Blue Background
  const radioClass = `
    appearance-none w-4 h-4 border border-gray-300 dark:border-gray-600 rounded-full 
    checked:bg-blue-600 checked:border-blue-600 
    relative 
    after:content-[''] after:w-2 after:h-2 after:bg-white after:rounded-full 
    after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 
    after:hidden checked:after:block 
    mr-2 cursor-pointer
  `;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('set.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('set.subtitle')}</p>
      </div>

      {/* Language Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Globe size={20} className="text-indigo-500" />
          {t('set.lang_title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('set.lang_desc')}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setLanguage('pt')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-28 ${
              language === 'pt' 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-transparent bg-gray-50 dark:bg-slate-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-3xl">🇧🇷</span>
            <span className={`text-sm font-medium ${language === 'pt' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}>Português</span>
          </button>

          <button 
            onClick={() => setLanguage('en')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-28 ${
              language === 'en' 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-transparent bg-gray-50 dark:bg-slate-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-3xl">🇺🇸</span>
            <span className={`text-sm font-medium ${language === 'en' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}>English</span>
          </button>

          <button 
            onClick={() => setLanguage('es')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-28 ${
              language === 'es' 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-transparent bg-gray-50 dark:bg-slate-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-3xl">🇪🇸</span>
            <span className={`text-sm font-medium ${language === 'es' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}>Español</span>
          </button>
        </div>
      </div>

      {/* Unit Preference Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Ruler size={20} className="text-teal-500" />
                {t('set.units_title')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('set.units_desc')}</p>
            </div>
            {/* Quick Toggle for System */}
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button 
                    onClick={() => setUnits({ ...units, system: 'metric' })}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${units.system === 'metric' ? 'bg-white dark:bg-slate-600 shadow-sm text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}
                >
                    {language === 'en' ? 'Metric' : 'Métrico'}
                </button>
                <button 
                    onClick={() => setUnits({ ...units, system: 'imperial' })}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${units.system === 'imperial' ? 'bg-white dark:bg-slate-600 shadow-sm text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}
                >
                    {language === 'en' ? 'Imperial' : 'Imperial'}
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">{t('unit.quantity')}</th>
                <th className="px-4 py-3">{t('unit.metric')}</th>
                <th className="px-4 py-3 rounded-tr-lg">{t('unit.imperial')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {/* Length */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t('unit.length')}</td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="length" checked={units.length === 'm'} onChange={() => updateUnit('length', 'm')} className={radioClass}/>
                            m, km, cm
                        </label>
                    </td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="length" checked={units.length === 'imp'} onChange={() => updateUnit('length', 'imp')} className={radioClass}/>
                            inch, ft, yd, mi
                        </label>
                    </td>
                </tr>
                {/* Mass */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t('unit.mass')}</td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="mass" checked={units.mass === 'kg'} onChange={() => updateUnit('mass', 'kg')} className={radioClass}/>
                            kg, g, t
                        </label>
                    </td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="mass" checked={units.mass === 'lb'} onChange={() => updateUnit('mass', 'lb')} className={radioClass}/>
                            lb, oz
                        </label>
                    </td>
                </tr>
                 {/* Volume */}
                 <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t('unit.volume')}</td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="volume" checked={units.volume === 'L'} onChange={() => updateUnit('volume', 'L')} className={radioClass}/>
                            L, mL, m³
                        </label>
                    </td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="volume" checked={units.volume === 'gal'} onChange={() => updateUnit('volume', 'gal')} className={radioClass}/>
                            gal, qt, fl oz
                        </label>
                    </td>
                </tr>
                 {/* Temperature */}
                 <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t('unit.temp')}</td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="temp" checked={units.temperature === 'C'} onChange={() => updateUnit('temperature', 'C')} className={radioClass}/>
                            °C (Celsius)
                        </label>
                    </td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="temp" checked={units.temperature === 'F'} onChange={() => updateUnit('temperature', 'F')} className={radioClass}/>
                            °F (Fahrenheit)
                        </label>
                    </td>
                </tr>
                {/* Speed */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t('unit.speed')}</td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="speed" checked={units.speed === 'kmh'} onChange={() => updateUnit('speed', 'kmh')} className={radioClass}/>
                            km/h
                        </label>
                    </td>
                    <td className="px-4 py-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="speed" checked={units.speed === 'mph'} onChange={() => updateUnit('speed', 'mph')} className={radioClass}/>
                            mph
                        </label>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          {isDarkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
          {t('set.appearance')}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">{t('set.dark_mode')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('set.dark_desc')}</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-400'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <UserIcon size={20} className="text-blue-500" />
          {t('set.login_info')}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-slate-700 bg-gray-100 relative group">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <UserIcon size={48} />
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={24} />
                <span className="text-xs font-medium mt-1">Alterar</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.user_label')}</label>
              <input 
                type="text" 
                value={username}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nível de Acesso</label>
              <div className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400">
                {roleLabel}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID do Sistema</label>
              <input 
                type="text" 
                value={`USER-${user?.id.toString().padStart(4, '0')}`}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Mail size={20} className="text-green-500" />
          {t('set.feedback')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          {t('set.feedback_desc')}
        </p>

        {sentSuccess ? (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-2">
            <Send size={18} />
            <span>Enviado!</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input 
                type="email" 
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem</label>
              <textarea 
                required
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="text-right">
               <span className="text-xs text-gray-400 mr-2">dudubighetti2005@gmail.com</span>
               <button 
                type="submit" 
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {t('set.btn_send')} <Send size={16} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout Section */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('set.logout_title')}</h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/70">{t('set.logout_desc')}</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
        >
          <LogOut size={18} />
          {t('set.btn_logout')}
        </button>
      </div>
    </div>
  );
};
