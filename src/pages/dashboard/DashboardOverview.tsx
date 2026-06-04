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
    { label: 'Klaim Subdomain', desc: 'Daftarkan virtual host baru', tab: 'plans', icon: <Globe className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-500 border border-blue-500/15' },
    { label: 'MySQL Database', desc: 'Kelola alokasi kontainer DB', tab: 'databases', icon: <Database className="h-5 w-5" />, color: 'bg-green-500/10 text-green-500 border border-green-500/15' },
    { label: 'Tagihan & Invoices', desc: 'Riwayat & transaksi QRIS', tab: 'billing', icon: <CreditCard className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-500 border border-amber-500/15' },
    { label: 'Live Chat Admin', desc: 'Konsol support chat bantuan', tab: 'chat', icon: <MessageSquare className="h-5 w-5" />, color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/15' },
  ];

  // Helper for relative time formatting
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Tadi baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay === 1) return 'Kemarin';
    return `${diffDay} hari yang lalu`;
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
          desc: `Subdomain ${sub.name}.subly.host berhasil diklaim.`
        });
      }
      
      if (sub.deployments) {
        sub.deployments.forEach(dep => {
          const depDateStr = dep.deployed_at || dep.created_at;
          if (depDateStr) {
            events.push({
              date: new Date(depDateStr),
              type: 'deployment',
              desc: `Deployment v${dep.version} untuk ${sub.name} selesai (${dep.status.toUpperCase()}).`
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
          desc: `Database ${db.db_name} berhasil dibuat.`
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
            desc: `Pembayaran ${p.plan?.name || 'Paket'} berhasil dikonfirmasi.`
          });
        } else if (p.status === 'pending') {
          events.push({
            date: new Date(p.created_at),
            type: 'invoice',
            desc: `Tagihan baru sebesar Rp ${(p.amount + p.unique_code).toLocaleString('id-ID')} dibuat.`
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
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-brand-primary animate-pulse" />
            {t('welcome')}, {userName}!
          </h1>
          <p className="text-[10px] text-text-muted font-semibold tracking-wider uppercase mt-0.5">
            Ringkasan status virtual host, alokasi database, dan monitoring resources Anda.
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
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Invoice Belum Terbayar</h4>
              <p className="text-[11px] text-text-muted mt-1 leading-normal">
                Anda memiliki tagihan pending sebesar <span className="font-semibold text-amber-500 font-mono">Rp {(pendingPayment.amount + pendingPayment.unique_code).toLocaleString('id-ID')}</span> untuk inisiasi subdomain baru.
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
            Bayar Sekarang
          </Button>
        </div>
      )}

      {/* Subdomain Resource Utilization Section */}
      <div className="space-y-3.5 text-left">
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">
          Penggunaan Sumber Daya per Subdomain
        </h3>
        
        {subdomains.length === 0 ? (
          <CardPanel className="p-6 text-center select-none">
            <Globe className="h-8 w-8 text-text-muted/40 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              Belum ada subdomain aktif. Silakan beli paket hosting untuk mulai mendeploy website Anda.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => setActiveTab('plans')}
            >
              Beli Paket Hosting
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
                        {sub.status === 'active' ? 'Aktif' : 'Nonaktif'}
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
                          {db ? db.db_name : '1 Database Aktif'}
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
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">Pintasan Menu Utama</h3>
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
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1 select-none">Log Aktivitas Terbaru</h3>
          <CardPanel className="p-5 h-full">
            <div className="space-y-4 select-none">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <p className="text-xs font-semibold">Belum ada aktivitas terbaru.</p>
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
