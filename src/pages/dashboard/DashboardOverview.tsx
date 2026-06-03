// src/pages/dashboard/DashboardOverview.tsx
import React from 'react';
import { 
  Globe, Database, CreditCard, MessageSquare, ArrowRight, AlertTriangle, Sparkles
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { StatusProgressBar } from '../../components/dashboard/StatusProgressBar';

export const DashboardOverview: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useSystemStore();
  const { subdomains, databases, payments } = useDataStore();

  // Calculate usage stats
  const totalStorageUsed = subdomains.reduce((acc, sub) => acc + (sub.storage_override_mb || 0), 0) / 10; // dummy calculations
  const totalStorageLimit = 15360; // 15 GB
  const totalDbsUsed = databases.length;
  const totalDbsLimit = 10;

  // Filter pending payments
  const pendingPayment = payments.find(p => p.status === 'pending');

  const quickActions = [
    { label: 'Klaim Subdomain', desc: 'Daftarkan virtual host baru', tab: 'plans', icon: <Globe className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-500 border border-blue-500/15' },
    { label: 'MySQL Database', desc: 'Kelola alokasi kontainer DB', tab: 'databases', icon: <Database className="h-5 w-5" />, color: 'bg-green-500/10 text-green-500 border border-green-500/15' },
    { label: 'Tagihan & Invoices', desc: 'Riwayat & transaksi QRIS', tab: 'billing', icon: <CreditCard className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-500 border border-amber-500/15' },
    { label: 'Live Chat Admin', desc: 'Konsol support chat bantuan', tab: 'chat', icon: <MessageSquare className="h-5 w-5" />, color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/15' },
  ];

  const recentEvents = [
    { time: 'Tadi baru saja', type: 'system', desc: 'Sesi login berhasil diverifikasi dari perangkat Anda.' },
    { time: '1 jam yang lalu', type: 'deployment', desc: 'Koneksi virtual host Nginx berjalan optimal.' },
    { time: 'Kemarin', type: 'database', desc: 'Automated backup cluster MySQL berhasil disinkronisasi.' }
  ];

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-primary animate-pulse" />
            {t('welcome')}, Labib!
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Ringkasan status virtual host, alokasi database, dan monitoring resources Anda.
          </p>
        </div>
      </div>

      {/* Unpaid Payment Alert Card */}
      {pendingPayment && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 select-none animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-text-main uppercase tracking-wider">Invoice Belum Terbayar</h4>
              <p className="text-[11px] text-text-muted mt-1 leading-normal">
                Anda memiliki tagihan pending sebesar <span className="font-bold text-amber-500 font-mono">Rp {(pendingPayment.amount + pendingPayment.unique_code).toLocaleString('id-ID')}</span> untuk inisiasi subdomain baru.
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white shrink-0"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
            onClick={() => setActiveTab('billing')}
          >
            Bayar Sekarang
          </Button>
        </div>
      )}

      {/* Resource Utilization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
        <CardPanel title={t('diskUsage')}>
          <StatusProgressBar 
            used={Math.round(totalStorageUsed)} 
            max={totalStorageLimit} 
            unit="MB" 
            label="Dedicated NVMe Storage Space"
          />
        </CardPanel>

        <CardPanel title={t('dbUsage')}>
          <StatusProgressBar 
            used={totalDbsUsed} 
            max={totalDbsLimit} 
            unit="units" 
            label="MySQL Database Slot Containers"
          />
        </CardPanel>
      </div>

      {/* Grid Quick Navigation Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Quick Actions (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-1 select-none">Pintasan Menu Utama</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.tab}
                onClick={() => setActiveTab(action.tab as any)}
                className="w-full text-left p-5 rounded-3xl bg-bg-surface border border-border-main/50 hover:border-brand-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex gap-4 items-center group shadow-xs hover:shadow-md"
              >
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-text-main group-hover:text-brand-primary transition-colors uppercase tracking-wider">{action.label}</h4>
                  <p className="text-[10px] text-text-muted mt-1 truncate">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Recent Events Timeline (Span 1) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-1 select-none">Log Aktivitas Terbaru</h3>
          <CardPanel className="p-5 h-full">
            <div className="space-y-4 select-none">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-brand-primary mt-1.5" />
                    {idx < recentEvents.length - 1 && (
                      <div className="w-0.5 bg-border-main/40 flex-1 my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-text-muted uppercase">{evt.time}</span>
                    <p className="text-xs font-semibold text-text-main leading-normal mt-0.5">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardPanel>
        </div>

      </div>

    </div>
  );
};
export default DashboardOverview;
