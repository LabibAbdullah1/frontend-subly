// src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, Globe, Database, CreditCard, 
  MessageSquare, AlertTriangle, ShieldAlert, 
  Settings, Users, ChevronLeft, ChevronRight, X,
  ShoppingBag, Percent
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    currentRole, 
    activeTab, 
    setActiveTab,
    device
  } = useSystemStore();

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  // Customer navigation links
  const customerNavItems = [
    { tab: 'dashboard' as ActiveTab, label: t('dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { tab: 'subdomains' as ActiveTab, label: t('subdomains'), icon: <Globe className="h-5 w-5" /> },
    { tab: 'databases' as ActiveTab, label: t('databases'), icon: <Database className="h-5 w-5" /> },
    { tab: 'plans' as ActiveTab, label: t('plans'), icon: <ShoppingBag className="h-5 w-5" /> },
    { tab: 'billing' as ActiveTab, label: t('billing'), icon: <CreditCard className="h-5 w-5" /> },
    { tab: 'chat' as ActiveTab, label: t('chat'), icon: <MessageSquare className="h-5 w-5" /> },
    { tab: 'reports' as ActiveTab, label: t('reports'), icon: <AlertTriangle className="h-5 w-5" /> },
    { tab: 'profile' as ActiveTab, label: t('profile'), icon: <Settings className="h-5 w-5" /> },
  ];

  // Admin navigation links
  const adminNavItems = [
    { tab: 'admin-dashboard' as ActiveTab, label: t('adminStats'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { tab: 'admin-plans' as ActiveTab, label: t('planManager'), icon: <ShoppingBag className="h-5 w-5" /> },
    { tab: 'admin-vouchers' as ActiveTab, label: t('voucherManager'), icon: <Percent className="h-5 w-5" /> },
    { tab: 'admin-users' as ActiveTab, label: t('userManager'), icon: <Users className="h-5 w-5" /> },
    { tab: 'admin-payments' as ActiveTab, label: t('paymentConfirmation'), icon: <CreditCard className="h-5 w-5" /> },
    { tab: 'admin-chat' as ActiveTab, label: t('adminChatTitle'), icon: <MessageSquare className="h-5 w-5" /> },
    { tab: 'admin-settings' as ActiveTab, label: t('systemSettings'), icon: <Settings className="h-5 w-5" /> },
  ];

  const navItems = currentRole === 'Admin' ? adminNavItems : customerNavItems;

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-64';

  // Desktop view
  if (device === 'desktop') {
    return (
      <aside 
        className={`h-screen sticky top-0 flex flex-col bg-bg-surface border-r border-border-main transition-all duration-300 z-30 select-none ${sidebarWidth}`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-main">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            {!isSidebarCollapsed && (
              <span className="font-black text-lg tracking-tight bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                SUBLY
              </span>
            )}
          </div>
        </div>

        {/* Collapsible toggle tab */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-20 bg-bg-surface border border-border-main hover:bg-border-main/50 text-text-muted hover:text-text-main p-1 rounded-full shadow-md z-40 cursor-pointer"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Navigation Items list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            
            return (
              <button
                key={item.tab}
                onClick={() => handleTabClick(item.tab)}
                className={`w-full flex items-center justify-between px-4.5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'text-text-muted hover:bg-border-main/20 hover:text-text-main'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {isActive && (
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-primary shadow-[0_0_12px_var(--brand-primary)] animate-pulse shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Role Indicator */}
        <div className="p-4 border-t border-border-main">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-border-main/10 text-xs font-bold text-text-muted ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <ShieldAlert className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            {!isSidebarCollapsed && (
              <span className="truncate">
                Role: {currentRole}
              </span>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Mobile Drawer view
  return (
    <>
      {/* Drawer Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Drawer Panel */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-bg-surface border-r border-border-main z-50 flex flex-col transition-transform duration-300 transform select-none ${
          isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-main">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span className="font-black text-lg tracking-tight bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              SUBLY
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-border-main/40 text-text-muted hover:text-text-main cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab || 
              (item.tab === 'dashboard' && (activeTab === 'subdomains' || activeTab === 'databases'));
            
            return (
              <button
                key={item.tab}
                onClick={() => handleTabClick(item.tab)}
                className={`w-full flex items-center justify-between px-4.5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'text-text-muted hover:bg-border-main/20 hover:text-text-main'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-primary shadow-[0_0_12px_var(--brand-primary)] animate-pulse shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-main">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-border-main/10 text-xs font-bold text-text-muted">
            <ShieldAlert className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            <span className="truncate">
              Role: {currentRole}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
