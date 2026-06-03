import React, { useState, useEffect } from 'react';
import { 
  Users, Globe, Database, ShieldCheck, Eye
} from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { 
    payments, 
    confirmPayment, 
    adminStats, 
    fetchAdminStats 
  } = useDataStore();

  const [confirmPayId, setConfirmPayId] = useState<number | null>(null);
  const [viewProofPath, setViewProofPath] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const handleApprovePayment = async () => {
    if (confirmPayId) {
      await confirmPayment(confirmPayId);
      addToast({
        type: 'success',
        title: 'Pembayaran Disetujui',
        message: 'Klien telah diaktifkan paket hostingnya dan subdomain di-provisioning.',
      });
      setConfirmPayId(null);
      // Refresh stats since subdomain and databases are created on approval
      await fetchAdminStats();
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const UPLOADS_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  const usedGb = adminStats?.storage.usedMb ? parseFloat((adminStats.storage.usedMb / 1024).toFixed(2)) : 0;
  const limitGb = adminStats?.storage.limitGb ?? 256;
  const storagePercentage = Math.min(100, Math.round((usedGb / limitGb) * 100));

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('adminStats')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Monitoring sistem global, antrean deployment log, dan pembayaran manual.
          </p>
        </div>
      </div>

      {/* Global Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        <CardPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">{t('totalUsers')}</span>
              <span className="text-2xl font-bold text-text-main">{adminStats?.totalUsers ?? 0}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </CardPanel>

        <CardPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">{t('totalSubdomains')}</span>
              <span className="text-2xl font-bold text-text-main">{adminStats?.totalSubdomains ?? 0}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </CardPanel>

        <CardPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">{t('totalDatabases')}</span>
              <span className="text-2xl font-bold text-text-main">{adminStats?.totalDatabases ?? 0}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
          </div>
        </CardPanel>

        <CardPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Queue Jobs</span>
              <span className="text-2xl font-bold text-text-main">{adminStats?.activeQueueJobs ?? 0} Active</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </CardPanel>
      </div>

      {/* Split details panel: capacity + payment validation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Payments QRIS Confirmations (Span 2) */}
        <div className="lg:col-span-2">
          <CardPanel 
            title={t('paymentConfirmation')}
            headerActions={
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/15 px-2.5 py-0.5 rounded uppercase">
                {pendingPayments.length} Pending
              </span>
            }
          >
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 font-bold">Trx ID</th>
                    <th className="py-2.5 pb-2 text-center font-bold">Total</th>
                    <th className="py-2.5 pb-2 text-center font-bold">Bukti</th>
                    <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {pendingPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 font-semibold text-text-main font-mono text-[11px] select-all">
                        {p.transaction_id}
                      </td>
                      <td className="py-3 text-center font-bold text-text-main font-mono text-[11px]">
                        Rp {(p.amount + p.unique_code).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-center">
                        {p.proof_path ? (
                          <button
                            onClick={() => setViewProofPath(p.proof_path)}
                            className="text-brand-primary hover:underline font-bold text-[10px] uppercase flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">No file</span>
                        )}
                      </td>
                      <td className="py-3 text-right pr-6 flex items-center justify-end gap-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => setConfirmPayId(p.id)}
                        >
                          Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {pendingPayments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted italic text-xs">
                        Tidak ada antrean pembayaran pending. Semua tagihan selesai terverifikasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardPanel>
        </div>

        {/* Right Side: Global Disk Analysis capacity (Span 1) */}
        <div className="lg:col-span-1">
          <CardPanel title={t('diskCapacity')}>
            <div className="space-y-4 mt-2 select-none">
              
              {/* Overall disk usage */}
              <div className="space-y-1.5 text-xs text-text-muted">
                <div className="flex justify-between font-bold">
                  <span>Server SSD Occupancy</span>
                  <span className="text-brand-primary">{usedGb} GB / {limitGb} GB ({storagePercentage}%)</span>
                </div>
                <div className="w-full bg-border-main/50 h-3 rounded-full overflow-hidden">
                  <div className="bg-brand-primary h-full rounded-full" style={{ width: `${storagePercentage || 1}%` }} />
                </div>
              </div>

              <div className="border-t border-border-main/50 pt-4 space-y-3.5 text-xs">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                  Top Disk Consumers
                </span>
                
                {(adminStats?.topConsumers || []).map((consumer, index) => (
                  <div key={index} className="flex justify-between items-center py-1.5 border-b border-border-main/20">
                    <span className="font-mono text-text-main text-[11px] truncate max-w-xs">{consumer.name}</span>
                    <span className="font-bold text-text-muted">{consumer.usedMb >= 1024 ? `${(consumer.usedMb / 1024).toFixed(1)} GB` : `${consumer.usedMb} MB`} used</span>
                  </div>
                ))}
                
                {(!adminStats?.topConsumers || adminStats.topConsumers.length === 0) && (
                  <p className="text-[10px] text-text-muted italic">Belum ada subdomain aktif terhitung.</p>
                )}
              </div>
            </div>
          </CardPanel>
        </div>

      </div>

      {/* Manual Payment Confirmation Modal */}
      <Modal
        isOpen={confirmPayId !== null}
        onClose={() => setConfirmPayId(null)}
        title="Setujui Pembayaran Klien?"
        description="Harap pastikan uang transfer nominal eksak unik sudah masuk di rekening bank/QRIS e-wallet Anda."
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setConfirmPayId(null)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleApprovePayment}>
              {t('approveBtn')}
            </Button>
          </>
        }
      >
        <div className="p-3.5 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-xs font-bold text-left">
          Penyetujuan pembayaran ini akan memicu provisioning otomatis subdomain cPanel klien dan mengalokasikan resources RAM/CPU virtual host.
        </div>
      </Modal>

      {/* View Proof Modal */}
      <Modal
        isOpen={viewProofPath !== null}
        onClose={() => setViewProofPath(null)}
        title="Tanda Terima Pembayaran Klien"
      >
        <div className="p-6 bg-slate-900/10 rounded-xl border border-border-main/50 flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-xs border border-border-main bg-white rounded-xl p-3 shadow-md flex items-center justify-center select-none overflow-hidden">
            <img 
              src={`${viewProofPath?.startsWith('http') ? '' : UPLOADS_BASE}/${viewProofPath}`} 
              alt="Screenshot Proof" 
              className="max-h-64 object-contain rounded-xl" 
            />
          </div>
          <div className="text-center text-xs font-bold text-text-muted">
            <p className="truncate max-w-xs">{viewProofPath?.split('/').pop()}</p>
            <p className="text-[10px] font-bold text-brand-primary mt-1">E-WALLET TRANSACTION SUCCESS RECEIPT</p>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default AdminDashboard;
