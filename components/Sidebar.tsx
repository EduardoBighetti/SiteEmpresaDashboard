import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Router as RouterIcon, LogOut, Settings, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  onLogout: () => void;
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isMobileOpen, isDesktopOpen, onCloseMobile }) => {
  const { t } = useLanguage();
  
  // Base classes: 
  // - Fixed on mobile, static on desktop.
  // - overflow-hidden is CRITICAL here: it prevents the inner content (width 64) from showing
  //   while the parent container is animating from width 0 to 64.
  // - whitespace-nowrap keeps text on one line during the shrink.
  const baseClass = "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out lg:static lg:inset-auto whitespace-nowrap overflow-hidden";
  
  // Mobile: Controls translate-x.
  const mobileTransform = isMobileOpen ? "translate-x-0" : "-translate-x-full";
  
  // Desktop: Controls width.
  // lg:translate-x-0 ensures it's visible (transform-wise) when in desktop mode, regardless of mobile state.
  const desktopWidth = isDesktopOpen ? "lg:w-64" : "lg:w-0";
  
  // Combine classes
  const sidebarClasses = `${baseClass} w-64 ${mobileTransform} lg:translate-x-0 ${desktopWidth}`;

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mx-2 my-1 ${
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full w-64"> 
        {/* Inner container with fixed width w-64 ensures content doesn't squash during width transition of the parent aside */}
        
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
            
            <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('menu.config')}
            </div>

            <NavLink to="/settings" className={linkClass} onClick={onCloseMobile}>
              <Settings size={20} className="shrink-0" />
              <span>{t('menu.account')}</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t border-slate-800 min-w-full">
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