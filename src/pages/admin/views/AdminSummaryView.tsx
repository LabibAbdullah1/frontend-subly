// src/pages/admin/views/AdminSummaryView.tsx
import React from 'react';
import { Users, Repeat, MessageSquare, CreditCard, ArrowRight, ShieldAlert } from 'lucide-react';
import { useDataStore } from '../../../stores/useDataStore';
import { useSystemStore } from '../../../stores/useSystemStore';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface Props {
  formatUptime: (s: number | undefined) => string;
  getLast6MonthsRevenue: () => { label: string; revenue: number }[];
  getSystemLogs: () => { type: string; message: string; time: Date }[];
  allDeployments: any[];
  activeQueueDeployments: any[];
  monthlyRevenue: number;
}

export const AdminSummaryView: React.FC<Props> = ({
  formatUptime,
  getLast6MonthsRevenue,
  getSystemLogs,
  allDeployments,
  activeQueueDeployments,
  monthlyRevenue,
}) => {
  const { adminStats, adminUsers, settings, globalIssues } = useDataStore();
  const { setActiveTab } = useSystemStore();

  const limitGbSetting = settings.system_storage_limit_gb || '256';
  const totalLimitMb = Number(limitGbSetting) * 1024;
  const overallUsedMb = adminStats?.storage.usedMb ?? 0;
  const storagePercentage = Math.min(100, Math.round((overallUsedMb / totalLimitMb) * 100)) || 0;

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
          Ringkasan Konsol Sistem
        </h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Analitik platform global, log provisioning, dan status sistem real-time.
        </p>
      </div>

      {/* Support Alerts */}
      {globalIssues.filter((i) => i.status !== 'resolved').length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 text-xs font-bold text-red-500 text-left">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <h4 className="font-bold uppercase tracking-wider">Terdapat Tiket Gangguan Klien Aktif</h4>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5">
                Ada {globalIssues.filter((i) => i.status !== 'resolved').length} laporan kendala teknis dari klien.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setActiveTab('admin-reports')}
            className="shrink-0 text-[10px] uppercase font-black tracking-wider border-red-500/30 hover:bg-red-500/10 text-red-500">
            Kelola Tiket
          </Button>
        </div>
      )}

      {/* Counter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        {[
          { label: 'TOTAL KLIEN',         value: adminStats?.totalUsers ?? adminUsers.length,               icon: <Users className="h-5 w-5" /> },
          { label: 'DEPLOYMENT',          value: `${activeQueueDeployments.length} ANTRIAN`,                icon: <Repeat className="h-5 w-5" /> },
          { label: 'TIKET AKTIF',         value: globalIssues.filter((i) => i.status !== 'resolved').length, icon: <MessageSquare className="h-5 w-5" /> },
          { label: 'PENDAPATAN BULANAN',  value: `Rp ${monthlyRevenue.toLocaleString('id-ID')}`,            icon: <CreditCard className="h-5 w-5" /> },
        ].map(({ label, value, icon }) => (
          <CardPanel key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">{label}</span>
                <span className="text-2xl font-bold text-text-main">{value}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">{icon}</div>
            </div>
          </CardPanel>
        ))}
      </div>

      {/* Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Circular Storage + Server Health */}
        <div className="lg:col-span-1 space-y-6">
          {/* Circular Storage */}
          <CardPanel className="p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-black uppercase text-text-muted tracking-wider mb-4">Penyimpanan Server Global</h3>
            <div className="relative h-36 w-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="56" className="stroke-border-main/20" strokeWidth="8" fill="transparent" />
                <circle cx="72" cy="72" r="56" className="stroke-brand-primary" strokeWidth="8" fill="transparent"
                  strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * storagePercentage) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-text-main font-mono">{storagePercentage}%</span>
                <span className="text-[8px] font-black text-text-muted uppercase">Terpakai</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-text-muted mt-4 uppercase">
              {overallUsedMb.toFixed(1)} MB / {totalLimitMb} MB (Limit {limitGbSetting} GB)
            </p>
          </CardPanel>

          {/* Server Health */}
          <CardPanel title="Resource & Spesifikasi Hosting (cPanel)">
            <div className="space-y-4 text-xs font-semibold select-none mt-2">
              {/* RAM */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider">
                  <span>Penggunaan RAM Memory</span>
                  <span>{adminStats?.system
                    ? `${adminStats.system.memoryUsedMb.toFixed(1)} MB / ${adminStats.system.memoryTotalMb >= 1024 ? `${(adminStats.system.memoryTotalMb / 1024).toFixed(0)} GB` : `${adminStats.system.memoryTotalMb.toFixed(0)} MB`} (${Math.round((adminStats.system.memoryUsedMb / adminStats.system.memoryTotalMb) * 100)}%)`
                    : '- / -'}
                  </span>
                </div>
                <div className="w-full bg-border-main/40 h-2.5 rounded-full overflow-hidden border border-border-main/10">
                  <div className="h-full bg-brand-primary rounded-full transition-all duration-300"
                    style={{ width: `${adminStats?.system ? Math.round((adminStats.system.memoryUsedMb / adminStats.system.memoryTotalMb) * 100) : 0}%` }} />
                </div>
              </div>
              {/* CPU */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider">
                  <span>Penggunaan CPU (Core Allocation)</span>
                  <span>{adminStats?.system ? `${adminStats.system.cpuUsagePercent}% / 100%` : '- / -'}</span>
                </div>
                <div className="w-full bg-border-main/40 h-2.5 rounded-full overflow-hidden border border-border-main/10">
                  <div className="h-full bg-brand-primary rounded-full transition-all duration-300"
                    style={{ width: `${adminStats?.system ? adminStats.system.cpuUsagePercent : 0}%` }} />
                </div>
              </div>
              {/* Grid stats */}
              {[
                [
                  { label: 'CPU Cores',           value: adminStats?.system?.cpuCores ? `${adminStats.system.cpuCores} Cores` : '-' },
                  { label: 'NPROC (Limit Proses)', value: adminStats?.system?.activeProcesses ? `${adminStats.system.activeProcesses} / ${adminStats.system.maxProcesses || 200} (${Math.round((adminStats.system.activeProcesses / (adminStats.system.maxProcesses || 200)) * 100)}%)` : '-', accent: true },
                ],
                [
                  { label: 'Entry Processes (EP)', value: adminStats?.system ? `${adminStats.system.entryProcesses} / ${adminStats.system.maxEntryProcesses} (${Math.round((adminStats.system.entryProcesses / adminStats.system.maxEntryProcesses) * 100)}%)` : '-' },
                  { label: 'Uptime Aplikasi',      value: adminStats?.system ? formatUptime(adminStats.system.uptimeSeconds) : '-' },
                ],
                [
                  { label: 'I/O Usage Speed', value: adminStats?.system ? `${adminStats.system.ioSpeedKb > 0 ? `${adminStats.system.ioSpeedKb} KB/s` : '0 bytes/s'} / ${adminStats.system.maxIoSpeedMb} MB/s` : '-' },
                  { label: 'IOPS Limit',      value: adminStats?.system ? `${adminStats.system.iops} / ${adminStats.system.maxIops.toLocaleString('id-ID')} (${Math.round((adminStats.system.iops / adminStats.system.maxIops) * 100)}%)` : '-' },
                ],
              ].map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 gap-4 border-t border-border-main/30 pt-3">
                  {row.map(({ label, value, accent }: any) => (
                    <div key={label}>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider block">{label}</span>
                      <span className={`text-sm font-bold ${accent ? 'text-brand-primary' : 'text-text-main'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardPanel>
        </div>

        {/* Right: Charts + Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Deployments */}
          <CardPanel title="Deployment Terbaru" headerActions={
            <button onClick={() => setActiveTab('admin-deployment')} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1">
              Lihat Antrian <ArrowRight className="h-3 w-3" />
            </button>
          }>
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 px-4 font-bold">KLIEN</th>
                    <th className="py-2.5 pb-2 px-4 font-bold">SUBDOMAIN</th>
                    <th className="py-2.5 pb-2 px-4 text-right font-bold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {allDeployments.slice(0, 5).map((dep, idx) => (
                    <tr key={idx} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-main">{dep.ownerName}</td>
                      <td className="py-3 px-4 text-text-muted font-mono text-[10px]">
                        <div className="flex items-center gap-1">
                          <span>{dep.subdomainName}</span>
                          <span className="text-[8px] px-1 bg-brand-primary/15 text-brand-primary border border-brand-primary/20 rounded">v{dep.version}</span>
                          {dep.gitUrl && <span className="text-[8px] px-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded">GITHUB</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge status={dep.status === 'success' ? 'success' : dep.status === 'error' ? 'inactive' : 'pending'} label={dep.status.toUpperCase()} />
                      </td>
                    </tr>
                  ))}
                  {allDeployments.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-text-muted italic">Tidak ada deployment terbaru.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardPanel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Bar Chart */}
            <CardPanel title="Tren Pendapatan Bulanan (6 Bln)">
              <div className="flex items-end justify-between h-36 pt-4 px-2 select-none mt-2">
                {getLast6MonthsRevenue().map((data, idx) => {
                  const maxRevenue = Math.max(...getLast6MonthsRevenue().map((d) => d.revenue)) || 1;
                  const heightPercent = Math.max(10, Math.round((data.revenue / maxRevenue) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative group w-full flex justify-center">
                        <div className="absolute bottom-full mb-1 bg-slate-900 border border-border-main text-[9px] font-bold text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-10">
                          Rp {data.revenue.toLocaleString('id-ID')}
                        </div>
                        <div className="w-4 sm:w-6 bg-gradient-to-t from-brand-primary/40 to-brand-primary border border-brand-primary/30 rounded-t-md hover:opacity-85 transition-opacity"
                          style={{ height: `${heightPercent}px` }} />
                      </div>
                      <span className="text-[9px] font-bold text-text-muted uppercase">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardPanel>

            {/* Activity Log */}
            <CardPanel title="Log Audit & Aktivitas Terbaru">
              <div className="space-y-3 mt-2 max-h-[144px] overflow-y-auto pr-1">
                {getSystemLogs().map((log, idx) => {
                  const colors: Record<string, string> = {
                    success: 'bg-green-500/10 text-green-500 border-green-500/20',
                    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    user:    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                    info:    'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
                  };
                  return (
                    <div key={idx} className="flex items-start justify-between gap-3 text-[10px] border-b border-border-main/20 pb-2.5 last:border-0 last:pb-0 select-none">
                      <div className="flex items-start gap-2">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${colors[log.type] || colors.info}`}>{log.type}</span>
                        <p className="text-text-main font-medium leading-relaxed">{log.message}</p>
                      </div>
                      <span className="text-[9px] text-text-muted font-mono shrink-0">
                        {log.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                {getSystemLogs().length === 0 && <p className="text-xs text-text-muted italic text-center py-6">Belum ada log aktivitas sistem.</p>}
              </div>
            </CardPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
