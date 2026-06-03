// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { 
  Menu, Sun, Moon, Bell, ChevronDown, 
  User, LogOut, Languages, ShieldAlert
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataStore } from '../../stores/useDataStore';
import { useTranslation } from '../../hooks/useTranslation';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { 
    theme, 
    toggleTheme, 
    language, 
    toggleLanguage, 
    toggleSidebar, 
    currentRole, 
    setCurrentRole,
    activeTab,
    setActiveTab,
    currentSubdomainId,
    device
  } = useSystemStore();

  const { user, logout } = useAuthStore();
  const { subdomains } = useDataStore();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Generate breadcrumbs from active tab
  const getBreadcrumbs = () => {
    const crumbs = [];
    
    if (currentRole === 'Admin') {
      crumbs.push({ label: 'Admin Panel', active: activeTab === 'admin-dashboard', onClick: () => setActiveTab('admin-dashboard') });
      if (activeTab === 'admin-plans') crumbs.push({ label: t('planManager'), active: true });
      if (activeTab === 'admin-vouchers') crumbs.push({ label: t('voucherManager'), active: true });
      if (activeTab === 'admin-users') crumbs.push({ label: t('userManager'), active: true });
      if (activeTab === 'admin-payments') crumbs.push({ label: t('paymentConfirmation'), active: true });
      if (activeTab === 'admin-chat') crumbs.push({ label: t('adminChatTitle'), active: true });
      if (activeTab === 'admin-settings') crumbs.push({ label: t('systemSettings'), active: true });
    } else {
      crumbs.push({ label: 'Client portal', active: activeTab === 'dashboard', onClick: () => setActiveTab('dashboard') });
      if (activeTab === 'plans') crumbs.push({ label: t('plans'), active: true });
      if (activeTab === 'billing') crumbs.push({ label: t('billing'), active: true });
      if (activeTab === 'chat') crumbs.push({ label: t('chat'), active: true });
      if (activeTab === 'reports') crumbs.push({ label: t('reports'), active: true });
      if (activeTab === 'profile') crumbs.push({ label: t('profile'), active: true });
      
      if (activeTab === 'subdomains') {
        if (currentSubdomainId) {
          const sub = subdomains.find(s => s.id === currentSubdomainId);
          crumbs.push({ label: t('subdomains'), active: false, onClick: () => setActiveTab('subdomains', null) });
          crumbs.push({ label: sub ? `${sub.name}.subly.host` : 'Detail', active: true });
        } else {
          crumbs.push({ label: t('subdomains'), active: true });
        }
      }
      if (activeTab === 'databases') {
        crumbs.push({ label: t('databases'), active: true });
      }
    }
    
    return crumbs;
  };

  return (
    <header className="h-16 sticky top-0 bg-bg-surface/85 backdrop-blur-md border-b border-border-main flex items-center justify-between px-6 z-40 select-none">
      {/* Left side: Hamburger (Mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {device === 'mobile' && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-border-main/50 text-text-muted hover:text-text-main cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
          {getBreadcrumbs().map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-border-main">/</span>}
              <span 
                onClick={crumb.onClick}
                className={crumb.active ? 'text-brand-primary' : 'hover:text-text-main cursor-pointer'}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right side: Language, Theme, Role Selector, Notifications, Profile */}
      <div className="flex items-center gap-2">
        
        {/* Language switch */}
        <button 
          onClick={toggleLanguage}
          className="p-2.5 rounded-xl hover:bg-border-main/40 text-text-muted hover:text-text-main cursor-pointer flex items-center gap-1.5"
          title={t('language')}
        >
          <Languages className="h-4.5 w-4.5" />
          <span className="text-xs font-bold uppercase">{language}</span>
        </button>

        {/* Theme switch */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-border-main/40 text-text-muted hover:text-text-main cursor-pointer"
          title={t('theme')}
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Desktop view role switcher */}
        {device === 'desktop' && (
          <div className="relative">
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary border border-brand-primary/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{currentRole} Mode</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {roleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleDropdownOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-40 rounded-2xl bg-bg-surface border border-border-main shadow-2xl p-2 z-20 animate-in fade-in slide-in-from-top-3 duration-150">
                  <div className="text-[9px] font-black text-text-muted uppercase px-3 py-1.5 select-none tracking-widest border-b border-border-main mb-1">
                    {t('role')}
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentRole('Customer');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      currentRole === 'Customer' 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-muted hover:bg-border-main/30 hover:text-text-main'
                    }`}
                  >
                    Client (Customer)
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentRole('Admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      currentRole === 'Admin' 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-muted hover:bg-border-main/30 hover:text-text-main'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications */}
        <button 
          onClick={() => activeTab !== 'admin-chat' && activeTab !== 'chat' && setActiveTab(currentRole === 'Admin' ? 'admin-dashboard' : 'dashboard')}
          className="relative p-2.5 rounded-xl hover:bg-border-main/40 text-text-muted hover:text-text-main cursor-pointer"
          title={t('notifications')}
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User profile details dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-border-main/40 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
              {user ? user.name.charAt(0).toUpperCase() : 'L'}
            </div>
            {device === 'desktop' && (
              <>
                <span className="text-xs font-bold text-text-main pl-1">{user ? user.name : 'Labib'}</span>
                <ChevronDown className="h-3 w-3 text-text-muted" />
              </>
            )}
          </button>

          {profileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-60 rounded-3xl bg-bg-surface border border-border-main shadow-2xl p-3.5 z-20 animate-in fade-in slide-in-from-top-3 duration-150 text-left">
                {/* Profile Header */}
                <div className="px-2 pb-3 mb-2 border-b border-border-main select-none">
                  <p className="text-xs font-black text-text-main">{user ? user.name : 'Labib'}</p>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">{user ? user.email : 'client@subly.net'}</p>
                </div>

                {/* Mobile View Role Switcher inside profile */}
                {device === 'mobile' && (
                  <div className="border-b border-border-main pb-2 mb-2">
                    <div className="text-[9px] font-black text-text-muted uppercase px-2 py-1 select-none tracking-widest">
                      Switch Role
                    </div>
                    <div className="flex gap-1.5 mt-1.5 px-2">
                      <button 
                        onClick={() => {
                          setCurrentRole('Customer');
                          setProfileDropdownOpen(false);
                        }}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold border ${
                          currentRole === 'Customer'
                            ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                            : 'border-border-main text-text-muted'
                        }`}
                      >
                        Client
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentRole('Admin');
                          setProfileDropdownOpen(false);
                        }}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold border ${
                          currentRole === 'Admin'
                            ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                            : 'border-border-main text-text-muted'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                )}

                {/* Profile Links */}
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:bg-border-main/30 hover:text-text-main cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>{t('profile')}</span>
                </button>

                {/* Logout simulation */}
                <button 
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 mt-1 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
export default Header;
