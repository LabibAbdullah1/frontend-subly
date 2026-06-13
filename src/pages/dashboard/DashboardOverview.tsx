// src/pages/dashboard/DashboardOverview.tsx
import React from 'react';
import { 
  Globe, Database, CreditCard, MessageSquare, ArrowRight, AlertTriangle, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import type { ActiveTab } from '../../types';

export const DashboardOverview: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useSystemStore();
  const { subdomains, databases, payments } = useDataStore();
  const { user } = useAuthStore();

  const userName = user?.name || 'Labib';

  // Filter pending payments
  const pendingPayment = payments.find(p => p.status === 'pending');

  const quickActions = [
    { label: t('quickActionClaimSubdomain'), desc: t('quickActionClaimSubdomainDesc'), tab: 'plans', icon: <Globe className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-500 border border-blue-500/15' },
    { label: t('quickActionDatabase'), desc: t('quickActionDatabaseDesc'), tab: 'databases', icon: <Database className="h-5 w-5" />, color: 'bg-green-500/10 text-green-500 border border-green-500/15' },
    { label: t('quickActionBilling'), desc: t('quickActionBillingDesc'), tab: 'billing', icon: <CreditCard className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-500 border border-amber-500/15' },
    { label: t('quickActionChat'), desc: t('quickActionChatDesc'), tab: 'chat', icon: <MessageSquare className="h-5 w-5" />, color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/15' },
  ];

  // Helper for relative time formatting
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t('justNow');
    if (diffMin < 60) return t('minutesAgo').replace('{count}', String(diffMin));
    if (diffHour < 24) return t('hoursAgo').replace('{count}', String(diffHour));
    if (diffDay === 1) return t('yesterday');
    return t('daysAgo').replace('{count}', String(diffDay));
  };

  // Compile real events from subdomains, databases, payments, and deployments
  const compileRealEvents = () => {
    const events: { date: Date; type: string; desc: string }[] = [];

    // 1. Subdomains & Deployments
    subdomains.forEach(sub => {
      if (sub.created_at) {
        events.push({
          date: new Date(sub.created_at),
          type: 'subdomain',
          desc: t('eventSubdomainClaimed').replace('{name}', sub.name)
        });
      }
      
      if (sub.deployments) {
        sub.deployments.forEach(dep => {
          const depDateStr = dep.deployed_at || dep.created_at;
          if (depDateStr) {
            events.push({
              date: new Date(depDateStr),
              type: 'deployment',
              desc: t('eventDeploymentFinished').replace('{version}', String(dep.version)).replace('{name}', sub.name).replace('{status}', dep.status.toUpperCase())
            });
          }
        });
      }
    });

    // 2. Databases
    databases.forEach(db => {
      if (db.created_at) {
        events.push({
          date: new Date(db.created_at),
          type: 'database',
          desc: t('eventDatabaseCreated').replace('{name}', db.db_name)
        });
      }
    });

    // 3. Payments
    payments.forEach(p => {
      if (p.created_at) {
        if (p.status === 'success') {
          events.push({
            date: new Date(p.created_at),
            type: 'payment',
            desc: t('eventPaymentConfirmed').replace('{name}', p.plan?.name || t('plans'))
          });
        } else if (p.status === 'pending') {
          events.push({
            date: new Date(p.created_at),
            type: 'invoice',
            desc: t('eventInvoiceCreated').replace('{amount}', (p.amount + p.unique_code).toLocaleString('id-ID'))
          });
        }
      }
    });

    // Sort by date descending, limit to top 4
    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 4);
  };

  const recentEvents = compileRealEvents();

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Client Notifications List banner */}
      <ClientNotificationsBanner />

      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-brand-primary animate-pulse" />
            {t('welcome')}, {userName}!
          </h1>
          <p className="text-[10px] text-text-muted font-semibold tracking-wider uppercase mt-0.5">
            {t('dashboardOverviewSub')}
          </p>
        </div>
      </div>

      {/* Unpaid Payment Alert Card */}
      {pendingPayment && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 select-none animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">{t('unpaidInvoiceAlert')}</h4>
              <p className="text-[11px] text-text-muted mt-1 leading-normal">
                {t('unpaidInvoiceDesc').replace('{amount}', (pendingPayment.amount + pendingPayment.unique_code).toLocaleString('id-ID'))}
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="!bg-amber-500 hover:!bg-amber-600 shadow-amber-500/20 !text-white shrink-0 rounded-xl"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
            onClick={() => setActiveTab('billing')}
          >
            {t('payNow')}
          </Button>
        </div>
      )}

      {/* Subdomain Resource Utilization Section */}
      <div className="space-y-3.5 text-left">
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">
          {t('subdomainResourcesTitle')}
        </h3>
        
        {subdomains.length === 0 ? (
          <CardPanel className="p-6 text-center select-none">
            <Globe className="h-8 w-8 text-text-muted/40 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              {t('noActiveSubdomainOverview')}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => setActiveTab('plans')}
            >
              {t('buyHostingBtn')}
            </Button>
          </CardPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subdomains.map((sub) => {
              const db = databases.find((d) => d.subdomain_id === sub.id);
              const linkedPayment = payments.find(
                (p) => p.subdomain_id === sub.id && p.status === 'success'
              );
              const planStorageMb = linkedPayment?.plan?.max_storage_mb ?? 1024;
              const usedStorageMb = sub.storage_override_mb ?? 0;
              const storagePercent = Math.min(100, Math.round((usedStorageMb / planStorageMb) * 100));

              return (
                <motion.div
                  key={sub.id}
                  whileHover={{ y: -3, scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col h-full"
                >
                  <CardPanel 
                    title={`${sub.name}.subly.host`}
                    headerActions={
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                        sub.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border-green-500/15'
                          : 'bg-text-muted/10 text-text-muted border-text-muted/15'
                      }`}>
                        {sub.status === 'active' ? t('activeLabel') : t('inactiveLabel')}
                      </span>
                    }
                  >
                    <div className="space-y-4">
                      {/* Storage utilization progress bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                          <span>NVMe Disk Storage</span>
                          <span className="font-mono">
                            {usedStorageMb} MB / {planStorageMb} MB ({storagePercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-border-main/40 h-2 rounded-full overflow-hidden border border-border-main/20">
                          <div
                            className="h-full rounded-full bg-brand-primary"
                            style={{ width: `${storagePercent || 1}%` }}
                          />
                        </div>
                      </div>

                      {/* Database info combined */}
                      <div className="pt-3.5 border-t border-border-main/50 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-text-muted flex items-center gap-1.5">
                          <Database className="h-4 w-4 shrink-0 text-text-muted" />
                          Database MySQL:
                        </span>
                        <span className="font-mono text-text-main font-bold">
                          {db ? db.db_name : t('oneActiveDb')}
                        </span>
                      </div>
                    </div>
                  </CardPanel>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid Quick Navigation Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Quick Actions (Span 2) */}
        <div className="lg:col-span-2 space-y-3.5">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">{t('quickActionsTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.tab}
                onClick={() => setActiveTab(action.tab as ActiveTab)}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full text-left p-5 rounded-xl bg-bg-surface border border-border-main/50 hover:border-amber-500/40 transition-colors duration-150 cursor-pointer flex gap-4 items-center group shadow-xs hover:shadow-md border-none"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-text-main group-hover:text-brand-primary transition-colors uppercase tracking-wider">{action.label}</h4>
                  <p className="text-[10px] text-text-muted mt-1 truncate">{action.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right: Recent Events Timeline (Span 1) */}
        <div className="lg:col-span-1 space-y-3.5">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">{t('recentActivityLogs')}</h3>
          <CardPanel className="p-5 h-full">
            <div className="space-y-4 select-none">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <p className="text-xs font-semibold">{t('noRecentActivity')}</p>
                </div>
              ) : (
                recentEvents.map((evt, idx) => (
                  <div key={idx} className="flex gap-3 text-left animate-in fade-in duration-200">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-brand-primary mt-1.5" />
                      {idx < recentEvents.length - 1 && (
                        <div className="w-0.5 bg-border-main/40 flex-1 my-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-semibold text-text-muted uppercase">{getRelativeTime(evt.date)}</span>
                      <p className="text-xs font-semibold text-text-main leading-normal mt-0.5">{evt.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardPanel>
        </div>

      </div>

    </div>
  );
};
export default DashboardOverview;

const ClientNotificationsBanner: React.FC = () => {
  const { t } = useTranslation();
  const { notifications, markNotificationAsRead } = useDataStore();
  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (unreadNotifications.length === 0) return null;

  return (
    <div className="space-y-3.5 mb-6 text-left animate-in fade-in duration-300">
      <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">
        {t('recentNotificationsTitle')}
      </h3>
      <div className="space-y-2.5">
        {unreadNotifications.map((n) => (
          <div 
            key={n.id} 
            className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-left flex justify-between items-start gap-4"
          >
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-brand-secondary tracking-wide uppercase">{n.title}</h4>
              <p className="text-xs text-text-main leading-relaxed font-semibold">{n.message}</p>
              <span className="text-[9px] text-text-muted block mt-1 font-mono">{new Date(n.createdAt).toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={() => markNotificationAsRead(n.id)}
              className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary hover:underline cursor-pointer uppercase shrink-0"
            >
              {t('markAsRead')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

