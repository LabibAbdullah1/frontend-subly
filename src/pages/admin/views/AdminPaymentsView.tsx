// src/pages/admin/views/AdminPaymentsView.tsx
import React, { useState } from 'react';
import { Eye, Check } from 'lucide-react';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const AdminPaymentsView: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { payments, confirmPayment, fetchAdminStats, fetchSubdomains, fetchAdminDiskUsage } = useDataStore();

  const [confirmPayId, setConfirmPayId] = useState<number | null>(null);
  const [viewProofPath, setViewProofPath] = useState<string | null>(null);

  const UPLOADS_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const handleApprove = async () => {
    if (!confirmPayId) return;
    await confirmPayment(confirmPayId);
    addToast({ type: 'success', title: 'Pembayaran Disetujui', message: 'Klien telah diaktifkan paket hostingnya dan subdomain di-provisioning.' });
    setConfirmPayId(null);
    await Promise.all([fetchAdminStats(), fetchSubdomains(), fetchAdminDiskUsage()]);
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">Konfirmasi Pembayaran Klien</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Tinjau bukti transaksi pembayaran transfer bank / e-wallet secara manual dan aktifkan paket hosting klien.
        </p>
      </div>

      {/* Pending */}
      <CardPanel title="Konfirmasi Pembayaran Menunggu Persetujuan" headerActions={
        <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/15 px-2.5 py-0.5 rounded uppercase">
          {pendingPayments.length} Pending
        </span>
      }>
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[550px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">Trx ID</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Total</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Bukti</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {pendingPayments.map((p) => (
                <tr key={p.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-main font-mono text-[11px] select-all max-w-[90px] sm:max-w-none truncate" title={p.transaction_id}>{p.transaction_id}</td>
                  <td className="py-3 px-4 text-center font-bold text-text-main font-mono text-[11px]">Rp {(p.amount + p.unique_code).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-center">
                    {p.proof_path ? (
                      <button onClick={() => setViewProofPath(p.proof_path)} className="text-brand-primary hover:underline font-bold text-[10px] uppercase flex items-center gap-1 mx-auto cursor-pointer">
                        <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">View</span>
                      </button>
                    ) : <span className="text-[10px] text-text-muted italic">No file</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setConfirmPayId(p.id)}
                      className="bg-text-main text-bg-base shadow-md hover:opacity-90 active:scale-[0.98] transition-all px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer shrink-0 ml-auto">
                      <Check className="h-3.5 w-3.5 shrink-0" /><span className="hidden sm:inline">Approve</span>
                    </button>
                  </td>
                </tr>
              ))}
              {pendingPayments.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-text-muted italic">Tidak ada pembayaran pending yang perlu dikonfirmasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>

      {/* History */}
      <CardPanel title="Semua Riwayat Transaksi Klien">
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">Tanggal</th>
                <th className="py-2.5 pb-2 px-4 font-bold">Trx ID</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Total</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Status</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {payments.filter((p) => p.status !== 'pending').slice(0, 15).map((p) => (
                <tr key={p.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-muted text-[10px] font-mono">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4 font-semibold text-text-main font-mono text-[11px] truncate" title={p.transaction_id}>{p.transaction_id}</td>
                  <td className="py-3 px-4 text-center font-bold text-text-main font-mono text-[11px]">Rp {(p.amount + p.unique_code).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-center"><Badge status={p.status === 'success' ? 'success' : 'inactive'} label={p.status.toUpperCase()} /></td>
                  <td className="py-3 px-4 text-right">
                    {p.proof_path ? (
                      <button onClick={() => setViewProofPath(p.proof_path)} className="text-brand-primary hover:underline font-bold text-[10px] flex items-center gap-1 ml-auto cursor-pointer">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    ) : <span className="text-[10px] text-text-muted italic">No file</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardPanel>

      {/* Modals */}
      <Modal isOpen={confirmPayId !== null} onClose={() => setConfirmPayId(null)} title="Setujui Pembayaran Klien?">
        <div className="p-3.5 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-xs font-bold text-left mb-4">
          Penyetujuan pembayaran ini akan memicu provisioning otomatis subdomain cPanel klien dan mengalokasikan resources RAM/CPU virtual host.
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmPayId(null)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={handleApprove}>{t('approveBtn')}</Button>
        </div>
      </Modal>

      <Modal isOpen={viewProofPath !== null} onClose={() => setViewProofPath(null)} title="Tanda Terima Pembayaran Klien">
        <div className="p-6 bg-slate-900/10 rounded-xl border border-border-main/50 flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-xs border border-border-main bg-white rounded-xl p-3 shadow-md flex items-center justify-center overflow-hidden">
            <img src={`${viewProofPath?.startsWith('http') ? '' : UPLOADS_BASE}/${viewProofPath}`} alt="Proof" className="max-h-64 object-contain rounded-xl" />
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
