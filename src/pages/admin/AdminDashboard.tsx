// src/pages/admin/AdminDashboard.tsx
// ─── Orchestrator: renders the correct view based on activeTab ───────────────
import React, { useEffect, useMemo } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useTranslation } from '../../hooks/useTranslation';

// ─── View Components ──────────────────────────────────────────────────────────
import { AdminSummaryView }       from './views/AdminSummaryView';
import { AdminPaymentsView }      from './views/AdminPaymentsView';
import { AdminDeploymentView }    from './views/AdminDeploymentView';
import { AdminSubdomainView }     from './views/AdminSubdomainView';
import { AdminDatabaseView }      from './views/AdminDatabaseView';
import { AdminDiskView }          from './views/AdminDiskView';
import { AdminNotificationsView } from './views/AdminNotificationsView';
import { AdminReportsView }       from './views/AdminReportsView';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const formatUptime = (seconds: number | undefined) => {
  if (seconds === undefined) return '0m';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '0m';
};

export const AdminDashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeTab } = useSystemStore();
  const {
    payments,
    fetchAdminStats,
    subdomains,
    fetchSubdomains,
    adminUsers,
    fetchAdminUsers,
    fetchAdminDiskUsage,
    fetchNotifications,
    fetchIssues,
  } = useDataStore();

  // Fetch data on mount / tab change
  useEffect(() => {
    fetchAdminStats();
    fetchSubdomains();
    fetchAdminUsers();
    fetchAdminDiskUsage();
    fetchNotifications();
    fetchIssues();
  }, [fetchAdminStats, fetchSubdomains, fetchAdminUsers, fetchAdminDiskUsage, fetchNotifications, fetchIssues, activeTab]);

  // ─── Shared computed data (passed down to views that need them) ───────────
  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  const monthlyRevenue = useMemo(() =>
    payments
      .filter((p) => {
        if (p.status !== 'success') return false;
        const d = new Date(p.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.amount + p.unique_code), 0),
    [payments, currentMonth, currentYear]
  );

  const allDeployments = useMemo(() =>
    subdomains
      .flatMap((sub) =>
        (sub.deployments || []).map((dep) => ({
          ...dep,
          subdomainName: sub.full_domain || `${sub.name}.subly.host`,
          ownerName: sub.user?.name || 'Client',
          gitUrl: sub.git_url,
        }))
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [subdomains]
  );

  const activeQueueDeployments = useMemo(() =>
    allDeployments.filter((d) => d.status === 'queued' || d.status === 'processing'),
    [allDeployments]
  );

  const locale = language === 'id' ? 'id-ID' : 'en-US';

  const getLast6MonthsRevenue = () => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mo = d.getMonth();
      const yr = d.getFullYear();
      const revenue = payments
        .filter((p) => {
          if (p.status !== 'success') return false;
          const pd = new Date(p.created_at);
          return pd.getMonth() === mo && pd.getFullYear() === yr;
        })
        .reduce((sum, p) => sum + (p.amount + p.unique_code), 0);
      return { label: d.toLocaleDateString(locale, { month: 'short' }), revenue };
    });
  };

  const getSystemLogs = () => {
    const logs: { type: string; message: string; time: Date }[] = [];
    payments.forEach((p) => {
      const owner = adminUsers.find((u) => u.id === p.user_id);
      const name  = owner ? owner.name : `Client #${p.user_id}`;
      if (p.status === 'success') {
        logs.push({ 
          type: 'success', 
          message: t('logPaymentSuccess')
            .replace('{name}', name)
            .replace('{amount}', (p.amount + p.unique_code).toLocaleString(locale)), 
          time: new Date(p.created_at) 
        });
      } else if (p.status === 'pending') {
        logs.push({ 
          type: 'pending', 
          message: t('logPaymentPending').replace('{name}', name), 
          time: new Date(p.created_at) 
        });
      }
    });
    subdomains.forEach((s) =>
      logs.push({ 
        type: 'info', 
        message: t('logSubdomainActive')
          .replace('{subdomain}', `${s.name}.subly.host`)
          .replace('{name}', s.user?.name || 'Client'), 
        time: new Date(s.created_at) 
      })
    );
    adminUsers.forEach((u) =>
      logs.push({ 
        type: 'user', 
        message: t('logNewClient')
          .replace('{name}', u.name)
          .replace('{email}', u.email), 
        time: new Date(u.createdAt || new Date()) 
      })
    );
    return logs.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  };

  // ─── Render correct view ──────────────────────────────────────────────────
  if (activeTab === 'admin-dashboard') {
    return (
      <AdminSummaryView
        formatUptime={formatUptime}
        getLast6MonthsRevenue={getLast6MonthsRevenue}
        getSystemLogs={getSystemLogs}
        allDeployments={allDeployments}
        activeQueueDeployments={activeQueueDeployments}
        monthlyRevenue={monthlyRevenue}
      />
    );
  }

  if (activeTab === 'admin-payments')      return <AdminPaymentsView />;
  if (activeTab === 'admin-deployment')    return <AdminDeploymentView allDeployments={allDeployments} activeQueueDeployments={activeQueueDeployments} />;
  if (activeTab === 'admin-subdomain')     return <AdminSubdomainView />;
  if (activeTab === 'admin-database')      return <AdminDatabaseView />;
  if (activeTab === 'admin-disk')          return <AdminDiskView />;
  if (activeTab === 'admin-notifications') return <AdminNotificationsView />;
  if (activeTab === 'admin-reports')       return <AdminReportsView />;

  return null;
};

export default AdminDashboard;
