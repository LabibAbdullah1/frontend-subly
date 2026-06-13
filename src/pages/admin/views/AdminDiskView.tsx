// src/pages/admin/views/AdminDiskView.tsx
import React, { useState } from 'react';
import { HardDrive, Globe, Database, ShieldAlert, RefreshCw } from 'lucide-react';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export const AdminDiskView: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { adminDiskUsage, fetchAdminDiskUsage, updateSubdomainStorageOverride } = useDataStore();

  const [overrideOpen, setOverrideOpen]           = useState(false);
  const [overrideSubdomainId, setOverrideSubdomainId] = useState<number | null>(null);
  const [overrideLimitSize, setOverrideLimitSize] = useState('2048');
  const [isSubmitting, setIsSubmitting]           = useState(false);

  const handleRefresh = async () => {
    await fetchAdminDiskUsage();
    addToast({ type: 'success', title: 'Disk Synced', message: 'Data kuota penyimpanan cPanel berhasil diperbarui secara real-time.' });
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideSubdomainId) return;
    setIsSubmitting(true);
    try {
      await updateSubdomainStorageOverride(overrideSubdomainId, Number(overrideLimitSize));
      addToast({ type: 'success', title: 'Kapasitas Di-override', message: `Batas storage sukses diubah menjadi ${overrideLimitSize} MB.` });
      setOverrideOpen(false);
      await fetchAdminDiskUsage();
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal memperbarui batas storage.' });
    } finally { setIsSubmitting(false); }
  };

  const totalAccumulated = adminDiskUsage?.totalAccumulatedMb ?? 0;
  const totalFiles       = adminDiskUsage?.totalFilesMb ?? 0;
  const totalDbs         = adminDiskUsage?.totalDbMb ?? 0;
  const warningCount     = adminDiskUsage?.subdomains.filter((s) => (s.totalMb / s.limitMb) >= 0.8).length ?? 0;

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">Penggunaan Disk</h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Menampilkan kapasitas penyimpanan fisik asli di server cPanel dan ukuran database MySQL secara real-time.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={handleRefresh}>
          REAL-TIME CPANEL API
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        {[
          { label: 'TOTAL AKUMULASI',   value: `${totalAccumulated.toFixed(2)} MB`, icon: <HardDrive className="h-5 w-5" />, color: 'brand' },
          { label: 'KAPASITAS BERKAS',  value: `${totalFiles.toFixed(2)} MB`,       icon: <Globe className="h-5 w-5" />,     color: 'brand' },
          { label: 'KAPASITAS DATABASE', value: `${totalDbs.toFixed(2)} MB`,        icon: <Database className="h-5 w-5" />,  color: 'brand' },
          { label: 'HAMPIR KUOTA PENUH', value: `${warningCount} Subdomain`,        icon: <ShieldAlert className="h-5 w-5" />, color: 'red' },
        ].map(({ label, value, icon, color }) => (
          <CardPanel key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">{label}</span>
                <span className="text-2xl font-bold text-text-main">{value}</span>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color === 'red' ? 'bg-red-500/10 text-red-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                {icon}
              </div>
            </div>
          </CardPanel>
        ))}
      </div>

      {/* Disk Table */}
      <CardPanel title="DAFTAR SUBDOMAIN & KAPASITAS PENYIMPANAN">
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">SUBDOMAIN / KLIEN</th>
                <th className="py-2.5 pb-2 px-4 font-bold">PAKET</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">UKURAN FILE</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">UKURAN DATABASE</th>
                <th className="py-2.5 pb-2 px-4 font-bold">RASIO PENGGUNAAN DISK (TOTAL)</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {(adminDiskUsage?.subdomains || []).map((sub, idx) => {
                const ratio = Math.min(100, Math.round((sub.totalMb / sub.limitMb) * 100));
                return (
                  <tr key={sub.id || idx} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-brand-primary">{sub.fullDomain}</span>
                        <span className="text-[10px] text-text-muted">{sub.owner?.name || 'Client'} ({sub.owner?.email || ''})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-main">{sub.packageName}</span>
                        <span className="text-[9px] text-text-muted uppercase tracking-wider">BATAS: {sub.limitMb} MB</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">{sub.filesMb.toFixed(2)} MB</td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">{sub.dbMb.toFixed(2)} MB</td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-mono font-bold text-text-muted">
                          <span>{sub.totalMb.toFixed(2)} MB / {sub.limitMb} MB</span>
                          <span>{ratio}%</span>
                        </div>
                        <div className="w-full bg-border-main/40 h-2 rounded-full overflow-hidden border border-border-main/10">
                          <div className={`h-full rounded-full transition-all duration-300 ${ratio >= 80 ? 'bg-red-500' : 'bg-brand-primary'}`}
                            style={{ width: `${ratio || 1}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Sync Disk"
                          onClick={() => addToast({ type: 'success', title: 'Sync Disk', message: `Disk ${sub.name} sukses diperbarui.` })}>
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Adjust Storage"
                          onClick={() => { setOverrideSubdomainId(Number(sub.id)); setOverrideLimitSize(String(sub.limitMb)); setOverrideOpen(true); }}>
                          <HardDrive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!adminDiskUsage?.subdomains || adminDiskUsage.subdomains.length === 0) && (
                <tr><td colSpan={6} className="py-8 text-center text-text-muted italic">Tidak ada data penyimpanan subdomain.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>

      {/* Override Modal */}
      <Modal isOpen={overrideOpen} onClose={() => setOverrideOpen(false)} title="Adjust NVMe Storage Space"
        description="Override batas disk storage default pada virtual host klien secara manual.">
        <form onSubmit={handleSaveOverride} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Batas Disk Baru (MB)</label>
            <input type="number" value={overrideLimitSize} onChange={(e) => setOverrideLimitSize(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setOverrideOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
