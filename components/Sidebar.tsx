
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Router as RouterIcon, LogOut, Settings, Activity, Users } from 'lucide-react';
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
  
  const baseClass = "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out lg:static lg:inset-auto whitespace-nowrap overflow-hidden";
  const mobileTransform = isMobileOpen ? "translate-x-0" : "-translate-x-full";
  const desktopWidth = isDesktopOpen ? "lg:w-64" : "lg:w-0";
  const sidebarClasses = `${baseClass} w-64 ${mobileTransform} lg:translate-x-0 ${desktopWidth}`;

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mx-2 my-1 ${
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  const isGerencia = user?.role === 'gerencia';
  const isAdminOrGerencia = user?.role === 'gerencia' || user?.role === 'admin';

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobile} />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full w-64"> 
          <div className="h-20 flex items-center justify-center px-4 border-b border-slate-800 min-w-full bg-slate-900">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <span className="text-blue-500">AL2</span>
              <span className="text-white">IoT System</span>
            </div>
          </div>

          <nav className="flex-1 py-6 overflow-y-auto min-w-full custom-scrollbar">
            <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('menu.main')}
            </div>
            
            <NavLink to="/" className={linkClass} onClick={onCloseMobile}>
              <LayoutDashboard size={20} className="shrink-0" />
              <span>{t('menu.dashboard')}</span>
            </NavLink>

            <NavLink to="/monitoring" className={linkClass} onClick={onCloseMobile}>
              <Activity size={20} className="shrink-0" />
              <span>{t('menu.monitoring')}</span>
            </NavLink>
            
            <NavLink to="/devices" className={linkClass} onClick={onCloseMobile}>
              <RouterIcon size={20} className="shrink-0" />
              <span>{t('menu.devices')}</span>
            </NavLink>

            {isGerencia && (
              <NavLink to="/users" className={linkClass} onClick={onCloseMobile}>
                <Users size={20} className="shrink-0" />
                <span>Gestão de Usuários</span>
              </NavLink>
            )}
            
            <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('menu.config')}
            </div>

            <NavLink to="/settings" className={linkClass} onClick={onCloseMobile}>
              <Settings size={20} className="shrink-0" />
              <span>{t('menu.account')}</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t border-slate-800 min-w-full text-center">
             <div className="mb-2 px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Nível: {user?.role}
             </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors"
            >
              <LogOut size={20} className="shrink-0" />
              <span>{t('menu.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
