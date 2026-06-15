import React from 'react';
import { 
  LayoutGrid, Link2, RefreshCw, Globe, Database, HardDrive, 
  ShoppingBag, CreditCard, Ticket, Users, MessageSquare, 
  Star, Megaphone, HelpCircle, Settings, User, ChevronLeft, ChevronRight, Zap,
  ShieldAlert, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../../stores/useSystemStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataStore } from '../../stores/useDataStore';
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

  const { unreadChatCount } = useDataStore();

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
  const customerSections: { titleKey?: any; title?: string; items: any[] }[] = [
    {
      items: [
        { tab: 'dashboard' as ActiveTab, labelKey: 'summaryTitle' as const, label: 'RINGKASAN', icon: <LayoutGrid className="h-5 w-5" /> }
      ]
    },
    {
      titleKey: 'infrastructureTitle' as const,
      title: 'INFRASTRUKTUR',
      items: [
        { tab: 'subdomains' as ActiveTab, labelKey: 'subdomains' as const, label: 'SUBDOMAIN', icon: <Globe className="h-5 w-5" /> },
        { tab: 'databases' as ActiveTab, labelKey: 'databases' as const, label: 'DATABASE', icon: <Database className="h-5 w-5" /> }
      ]
    },
    {
      titleKey: 'billingTitleUppercase' as const,
      title: 'TAGIHAN',
      items: [
        { tab: 'plans' as ActiveTab, labelKey: 'plans' as const, label: 'PAKET', icon: <ShoppingBag className="h-5 w-5" /> },
        { tab: 'billing' as ActiveTab, labelKey: 'billing' as const, label: 'PEMBAYARAN', icon: <CreditCard className="h-5 w-5" /> }
      ]
    },
    {
      titleKey: 'crmTitle' as const,
      title: 'CRM',
      items: [
        { tab: 'chat' as ActiveTab, labelKey: 'chat' as const, label: 'LIVE CHAT', icon: <MessageSquare className="h-5 w-5" /> },
        { tab: 'testimonials' as ActiveTab, labelKey: 'testimonialsTitleLabel' as const, label: 'TESTIMONI', icon: <Star className="h-5 w-5" /> },
        { tab: 'reports' as ActiveTab, labelKey: 'supportTicketTitle' as const, label: 'TIKET DUKUNGAN', icon: <HelpCircle className="h-5 w-5" /> },
        { tab: 'profile' as ActiveTab, labelKey: 'profileSettingsTitle' as const, label: 'PENGATURAN AKUN', icon: <User className="h-5 w-5" /> }
      ]
    }
  ];

  // Admin navigation sections (Aligned with side bar screenshot)
  const adminSections: { titleKey?: any; title?: string; items: any[] }[] = [
    {
      items: [
        { tab: 'admin-dashboard' as ActiveTab, labelKey: 'summaryTitle' as const, label: 'RINGKASAN', icon: <LayoutGrid className="h-5 w-5" />, hasDot: true }
      ]
    },
    {
      titleKey: 'infrastructureTitle' as const,
      title: 'INFRASTRUKTUR',
      items: [
        { tab: 'admin-dashboard' as ActiveTab, label: 'ARENHOST ID', icon: <Link2 className="h-5 w-5" />, isExternal: true, url: 'https://arenhost.id/client/clientarea.php' },
        { tab: 'admin-deployment' as ActiveTab, labelKey: 'deployment' as const, label: 'DEPLOYMENT', icon: <RefreshCw className="h-5 w-5" /> },
        { tab: 'admin-subdomain' as ActiveTab, labelKey: 'subdomains' as const, label: 'SUBDOMAIN', icon: <Globe className="h-5 w-5" /> },
        { tab: 'admin-database' as ActiveTab, labelKey: 'databases' as const, label: 'DATABASE', icon: <Database className="h-5 w-5" /> },
        { tab: 'admin-disk' as ActiveTab, labelKey: 'diskCapacity' as const, label: 'PENGGUNAAN DISK', icon: <HardDrive className="h-5 w-5" /> }
      ]
    },
    {
      titleKey: 'billingTitleUppercase' as const,
      title: 'TAGIHAN',
      items: [
        { tab: 'admin-plans' as ActiveTab, labelKey: 'plans' as const, label: 'PAKET', icon: <ShoppingBag className="h-5 w-5" /> },
        { tab: 'admin-payments' as ActiveTab, labelKey: 'billing' as const, label: 'PEMBAYARAN', icon: <CreditCard className="h-5 w-5" /> },
        { tab: 'admin-vouchers' as ActiveTab, labelKey: 'voucherTitle' as const, label: 'VOUCHER', icon: <Ticket className="h-5 w-5" /> }
      ]
    },
    {
      titleKey: 'crmTitle' as const,
      title: 'CRM',
      items: [
        { tab: 'admin-users' as ActiveTab, labelKey: 'clientTitle' as const, label: 'KLIEN', icon: <Users className="h-5 w-5" /> },
        { tab: 'admin-chat' as ActiveTab, labelKey: 'chat' as const, label: 'LIVE CHAT', icon: <MessageSquare className="h-5 w-5" /> },
        { tab: 'admin-testimonials' as ActiveTab, labelKey: 'testimonialsTitleLabel' as const, label: 'TESTIMONI', icon: <Star className="h-5 w-5" /> },
        { tab: 'admin-notifications' as ActiveTab, labelKey: 'notifications' as const, label: 'NOTIFIKASI', icon: <Megaphone className="h-5 w-5" /> },
        { tab: 'admin-reports' as ActiveTab, labelKey: 'supportTicketTitle' as const, label: 'TIKET DUKUNGAN', icon: <HelpCircle className="h-5 w-5" /> },
        { tab: 'admin-settings' as ActiveTab, labelKey: 'settingsTitle' as const, label: 'PENGATURAN', icon: <Settings className="h-5 w-5" /> },
        { tab: 'profile' as ActiveTab, labelKey: 'profileSettingsTitle' as const, label: 'PENGATURAN AKUN', icon: <User className="h-5 w-5" /> }
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
            <div className="h-8 w-8 rounded-md bg-brand-primary flex items-center justify-center text-white font-black text-lg shrink-0">
              <Zap className="h-4.5 w-4.5 text-white fill-white shrink-0" />
            </div>
            <span className={`font-bold text-lg tracking-tighter text-text-main transition-all duration-300 ${
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
            <div key={secIdx} className={`space-y-1 ${isSidebarCollapsed ? 'mb-3' : ''}`}>
              {(section.titleKey || section.title) && !isSidebarCollapsed && (
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-text-muted/65 tracking-wider uppercase">
                  {section.titleKey ? t(section.titleKey).toUpperCase() : section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = checkIsActive(item.tab, item.label);
                const itemLabel = item.labelKey ? t(item.labelKey).toUpperCase() : item.label;
                
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
                    className={`w-full flex items-center rounded-md text-sm font-medium cursor-pointer border-none transition-colors duration-150 relative ${
                      isSidebarCollapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : 'justify-between px-3 py-2.5'
                    } ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-subtle hover:bg-border-main/20 hover:text-text-main'
                    }`}
                  >
                    <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3.5'}`}>
                      <span className="shrink-0">{item.icon}</span>
                      <span className={`truncate text-xs font-semibold transition-all duration-300 ${
                        isSidebarCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden invisible' : 'w-auto opacity-100 visible'
                      }`}>
                        {itemLabel}
                      </span>
                    </div>
                    {isSidebarCollapsed && (item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0 && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                    )}
                    {!isSidebarCollapsed && (isActive || (!!(item as any).hasDot) || ((item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0)) ? (
                      <span className={`h-2 w-2 rounded-full ${((item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0) ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-brand-primary shadow-[0_0_12px_var(--brand-primary)]'} shrink-0 ml-1.5 ${isActive || ((item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0) ? 'animate-pulse' : ''}`} />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Role Indicator */}
        <div className="p-4 border-t border-border-main">
          <div className={`flex items-center rounded-md bg-border-main/10 text-xs font-medium text-text-subtle transition-all duration-300 ${
            isSidebarCollapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : 'px-3 py-2.5 gap-2.5'
          }`}>
            <ShieldAlert className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            <span className={`truncate transition-all duration-300 ${
              isSidebarCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden invisible' : 'w-auto opacity-100 visible'
            }`}>
              {currentRole === 'Admin' ? t('role') + ': Admin' : t('role') + ': Client'}
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
            <div className="h-8 w-8 rounded-md bg-brand-primary flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-lg tracking-tighter text-text-main">
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
              {(section.titleKey || section.title) && (
                <div className="px-3.5 py-1 text-[10px] font-extrabold text-text-muted/65 tracking-wider uppercase">
                  {section.titleKey ? t(section.titleKey).toUpperCase() : section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = checkIsActive(item.tab, item.label);
                const itemLabel = item.labelKey ? t(item.labelKey).toUpperCase() : item.label;
                
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium cursor-pointer border-none ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-subtle hover:bg-border-main/20 hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{itemLabel}</span>
                    </div>
                     {(isActive || (!!(item as any).hasDot) || ((item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0)) ? (
                      <span className={`h-2 w-2 rounded-full ${((item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0) ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-brand-primary shadow-[0_0_12px_var(--brand-primary)]'} shrink-0 ml-1.5 ${isActive || ((item.tab === 'chat' || item.tab === 'admin-chat') && unreadChatCount > 0) ? 'animate-pulse' : ''}`} />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border-main">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-border-main/10 text-xs font-medium text-text-subtle">
            <ShieldAlert className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            <span className="truncate">
              {currentRole === 'Admin' ? t('role') + ': Admin' : t('role') + ': Client'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

