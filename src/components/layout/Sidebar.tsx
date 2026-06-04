import React from 'react';
import { 
  LayoutGrid, Link2, RefreshCw, Globe, Database, HardDrive, 
  ShoppingBag, CreditCard, Ticket, Users, MessageSquare, 
  Star, Megaphone, HelpCircle, Settings, User, ChevronLeft, ChevronRight, Zap,
  ShieldAlert, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../../stores/useSystemStore';
import type { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    currentRole, 
    activeTab, 
    setActiveTab,
    device
  } = useSystemStore();

  const handleTabClick = (tab: ActiveTab, isExternal?: boolean, url?: string) => {
    if (isExternal && url) {
      window.open(url, '_blank');
      return;
    }
    setActiveTab(tab);
  };

  const checkIsActive = (tab: ActiveTab, label?: string) => {
    if (label === 'ARENHOST ID') return false;
    return activeTab === tab;
  };

  // Customer navigation sections
  const customerSections = [
    {
      items: [
        { tab: 'dashboard' as ActiveTab, label: 'RINGKASAN', icon: <LayoutGrid className="h-5 w-5" /> }
      ]
    },
    {
      title: 'INFRASTRUKTUR',
      items: [
        { tab: 'subdomains' as ActiveTab, label: 'SUBDOMAIN', icon: <Globe className="h-5 w-5" /> },
        { tab: 'databases' as ActiveTab, label: 'DATABASE', icon: <Database className="h-5 w-5" /> }
      ]
    },
    {
      title: 'TAGIHAN',
      items: [
        { tab: 'plans' as ActiveTab, label: 'PAKET', icon: <ShoppingBag className="h-5 w-5" /> },
        { tab: 'billing' as ActiveTab, label: 'PEMBAYARAN', icon: <CreditCard className="h-5 w-5" /> }
      ]
    },
    {
      title: 'CRM',
      items: [
        { tab: 'chat' as ActiveTab, label: 'LIVE CHAT', icon: <MessageSquare className="h-5 w-5" /> },
        { tab: 'testimonials' as ActiveTab, label: 'TESTIMONI', icon: <Star className="h-5 w-5" /> },
        { tab: 'reports' as ActiveTab, label: 'TIKET DUKUNGAN', icon: <HelpCircle className="h-5 w-5" /> },
        { tab: 'profile' as ActiveTab, label: 'PENGATURAN AKUN', icon: <User className="h-5 w-5" /> }
      ]
    }
  ];

  // Admin navigation sections (Aligned with side bar screenshot)
  const adminSections = [
    {
      items: [
        { tab: 'admin-dashboard' as ActiveTab, label: 'RINGKASAN', icon: <LayoutGrid className="h-5 w-5" />, hasDot: true }
      ]
    },
    {
      title: 'INFRASTRUKTUR',
      items: [
        { tab: 'admin-dashboard' as ActiveTab, label: 'ARENHOST ID', icon: <Link2 className="h-5 w-5" />, isExternal: true, url: 'https://arenhost.id/client/clientarea.php' },
        { tab: 'admin-deployment' as ActiveTab, label: 'DEPLOYMENT', icon: <RefreshCw className="h-5 w-5" /> },
        { tab: 'admin-subdomain' as ActiveTab, label: 'SUBDOMAIN', icon: <Globe className="h-5 w-5" /> },
        { tab: 'admin-database' as ActiveTab, label: 'DATABASE', icon: <Database className="h-5 w-5" /> },
        { tab: 'admin-disk' as ActiveTab, label: 'PENGGUNAAN DISK', icon: <HardDrive className="h-5 w-5" /> }
      ]
    },
    {
      title: 'TAGIHAN',
      items: [
        { tab: 'admin-plans' as ActiveTab, label: 'PAKET', icon: <ShoppingBag className="h-5 w-5" /> },
        { tab: 'admin-payments' as ActiveTab, label: 'PEMBAYARAN', icon: <CreditCard className="h-5 w-5" /> },
        { tab: 'admin-vouchers' as ActiveTab, label: 'VOUCHER', icon: <Ticket className="h-5 w-5" /> }
      ]
    },
    {
      title: 'CRM',
      items: [
        { tab: 'admin-users' as ActiveTab, label: 'KLIEN', icon: <Users className="h-5 w-5" /> },
        { tab: 'admin-chat' as ActiveTab, label: 'LIVE CHAT', icon: <MessageSquare className="h-5 w-5" /> },
        { tab: 'admin-testimonials' as ActiveTab, label: 'TESTIMONI', icon: <Star className="h-5 w-5" /> },
        { tab: 'admin-notifications' as ActiveTab, label: 'NOTIFIKASI', icon: <Megaphone className="h-5 w-5" /> },
        { tab: 'admin-reports' as ActiveTab, label: 'TIKET DUKUNGAN', icon: <HelpCircle className="h-5 w-5" /> },
        { tab: 'admin-settings' as ActiveTab, label: 'PENGATURAN', icon: <Settings className="h-5 w-5" /> },
        { tab: 'profile' as ActiveTab, label: 'PENGATURAN AKUN', icon: <User className="h-5 w-5" /> }
      ]
    }
  ];

  const sections = currentRole === 'Admin' ? adminSections : customerSections;
  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-64';

  // Desktop view
  if (device === 'desktop') {
    return (
      <aside 
        className={`h-screen sticky top-0 flex flex-col bg-bg-surface border-r border-border-main transition-all duration-300 z-30 select-none ${sidebarWidth}`}
      >
        {/* Brand Logo Header */}
        <div className={`h-16 flex items-center border-b border-border-main transition-all duration-300 ${
          isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'
        }`}>
          <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'gap-0' : 'gap-2.5'}`}>
            <div className="h-8 w-8 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-lg shrink-0">
              <Zap className="h-4.5 w-4.5 text-white fill-white shrink-0" />
            </div>
            <span className={`font-black text-lg tracking-tight bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent transition-all duration-300 ${
              isSidebarCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden invisible' : 'w-auto opacity-100 visible'
            }`}>
              SUBLY
            </span>
          </div>
        </div>

        {/* Collapsible toggle tab */}
        <motion.button 
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute -right-3 top-20 bg-bg-surface border border-border-main hover:border-brand-primary/50 text-text-muted hover:text-brand-primary h-6.5 w-6.5 rounded-full shadow-md z-40 cursor-pointer flex items-center justify-center transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </motion.button>

        {/* Navigation Items list */}
        <nav className={`flex-1 py-4 space-y-4 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'px-2' : 'px-4'
        }`}>
          {sections.map((section, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {section.title && !isSidebarCollapsed && (
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-text-muted/65 tracking-wider uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = checkIsActive(item.tab, item.label);
                
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => {
                      if ((item as any).isExternal && (item as any).url) {
                        window.open((item as any).url, '_blank');
                      } else {
                        handleTabClick(item.tab);
                      }
                    }}
                    whileHover={{ scale: 1.02, x: isSidebarCollapsed ? 0 : 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`w-full flex items-center rounded-xl text-sm font-semibold cursor-pointer border-none transition-colors duration-150 ${
                      isSidebarCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'justify-between px-4.5 py-3'
                    } ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-muted hover:bg-border-main/20 hover:text-text-main'
                    }`}
                  >
                    <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3.5'}`}>
                      <span className="shrink-0">{item.icon}</span>
                      <span className={`truncate text-xs font-semibold transition-all duration-300 ${
                        isSidebarCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden invisible' : 'w-auto opacity-100 visible'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {!isSidebarCollapsed && (isActive || (!!(item as any).hasDot)) ? (
                      <span className={`h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_12px_var(--brand-primary)] shrink-0 ml-1.5 ${isActive ? 'animate-pulse' : ''}`} />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Role Indicator */}
        <div className="p-4 border-t border-border-main">
          <div className={`flex items-center rounded-xl bg-border-main/10 text-xs font-bold text-text-muted transition-all duration-300 ${
            isSidebarCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'px-3 py-2.5 gap-3'
          }`}>
            <ShieldAlert className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            <span className={`truncate transition-all duration-300 ${
              isSidebarCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden invisible' : 'w-auto opacity-100 visible'
            }`}>
              {currentRole === 'Admin' ? 'Administrator' : 'Client Account'}
            </span>
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

        <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {sections.map((section, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {section.title && (
                <div className="px-3.5 py-1 text-[10px] font-extrabold text-text-muted/65 tracking-wider uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = checkIsActive(item.tab, item.label);
                
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => {
                      if ((item as any).isExternal && (item as any).url) {
                        window.open((item as any).url, '_blank');
                      } else {
                        handleTabClick(item.tab);
                      }
                    }}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`w-full flex items-center justify-between px-4.5 py-3 rounded-xl text-xs font-semibold cursor-pointer border-none ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-muted hover:bg-border-main/20 hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {(isActive || (!!(item as any).hasDot)) ? (
                      <span className={`h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_12px_var(--brand-primary)] shrink-0 ml-1.5 ${isActive ? 'animate-pulse' : ''}`} />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border-main">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-border-main/10 text-xs font-bold text-text-muted">
            <ShieldAlert className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            <span className="truncate">
              {currentRole === 'Admin' ? 'Administrator' : 'Client Account'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

