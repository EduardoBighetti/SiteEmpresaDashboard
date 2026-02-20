
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Router as RouterIcon, LogOut, Settings, Activity, Users, ShieldCheck, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../types';

interface SidebarProps {
  onLogout: () => void;
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isMobileOpen, isDesktopOpen, onCloseMobile, user }) => {
  const { t } = useLanguage();
  
  const baseClass = "fixed inset-y-0 left-0 z-50 bg-[#111827] text-white transition-all duration-300 ease-in-out lg:static lg:inset-auto whitespace-nowrap overflow-hidden border-r border-slate-800";
  const mobileTransform = isMobileOpen ? "translate-x-0" : "-translate-x-full";
  const desktopWidth = isDesktopOpen ? "lg:w-64" : "lg:w-0";
  const sidebarClasses = `${baseClass} w-64 ${mobileTransform} lg:translate-x-0 ${desktopWidth}`;

  // Estilo do link exatamente como no print (com a barra branca lateral)
  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `relative flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all ${
      isActive 
        ? "bg-blue-600 text-white" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
    }`;

  const activeIndicator = (isActive: boolean) => 
    isActive ? <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" /> : null;

  const isGerencia = user?.role === 'gerencia';

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onCloseMobile} />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full w-64"> 
          {/* Logo Section - Igual ao print */}
          <div className="h-20 flex items-center px-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <span className="text-blue-500">AL2</span>
              <span className="text-white">IoT System</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-8 mb-4 mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest opacity-50">
              {t('menu.main')}
            </div>
            
            <NavLink to="/" className={linkClass} onClick={onCloseMobile}>
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={20} />
                  <span>{t('menu.dashboard')}</span>
                  {activeIndicator(isActive)}
                </>
              )}
            </NavLink>

            <NavLink to="/monitoring" className={linkClass} onClick={onCloseMobile}>
              {({ isActive }) => (
                <>
                  <Activity size={20} />
                  <span>{t('menu.monitoring')}</span>
                  {activeIndicator(isActive)}
                </>
              )}
            </NavLink>
            
            <NavLink to="/devices" className={linkClass} onClick={onCloseMobile}>
              {({ isActive }) => (
                <>
                  <RouterIcon size={20} />
                  <span>{t('menu.devices')}</span>
                  {activeIndicator(isActive)}
                </>
              )}
            </NavLink>

            {/* Menu de Usuários - Apenas para Gerência */}
            {isGerencia && (
              <NavLink to="/users" className={linkClass} onClick={onCloseMobile}>
                {({ isActive }) => (
                  <>
                    <Users size={20} />
                    <span>Gestão de Usuários</span>
                    {activeIndicator(isActive)}
                  </>
                )}
              </NavLink>
            )}
            
            <div className="px-8 mt-10 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest opacity-50">
              {t('menu.config')}
            </div>

            <NavLink to="/settings" className={linkClass} onClick={onCloseMobile}>
              {({ isActive }) => (
                <>
                  <Settings size={20} />
                  <span>{t('menu.account')}</span>
                  {activeIndicator(isActive)}
                </>
              )}
            </NavLink>
          </nav>

          {/* Footer Info - Igual ao print */}
          <div className="p-6">
             <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400">
                   <UserIcon size={18} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Nível de Acesso</span>
                   <span className="text-xs text-white font-black uppercase tracking-widest">{user?.role || 'User'}</span>
                </div>
             </div>

            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-2 py-2 text-sm font-bold text-[#f87171] hover:text-red-400 transition-all w-full group"
            >
              <LogOut size={20} />
              <span>{t('menu.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
