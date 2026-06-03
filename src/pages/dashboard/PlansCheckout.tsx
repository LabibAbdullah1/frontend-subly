// src/pages/dashboard/PlansCheckout.tsx
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, QrCode, FileText, CheckCircle, 
  Clock, AlertTriangle, Upload, HelpCircle, ArrowRight 
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

// Generate QRIS static dummy image using inline SVG data URI to avoid external dependencies
const qrisBase64Svg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='160' height='160' fill='white'/><rect x='10' y='10' width='40' height='40' fill='black'/><rect x='20' y='20' width='20' height='20' fill='white'/><rect x='110' y='10' width='40' height='40' fill='black'/><rect x='120' y='20' width='20' height='20' fill='white'/><rect x='10' y='110' width='40' height='40' fill='black'/><rect x='20' y='120' width='20' height='20' fill='white'/><rect x='60' y='60' width='40' height='40' fill='black'/><rect x='70' y='70' width='20' height='20' fill='white'/><rect x='60' y='10' width='10' height='40' fill='black'/><rect x='10' y='60' width='40' height='10' fill='black'/><rect x='140' y='60' width='10' height='40' fill='black'/><rect x='60' y='140' width='40' height='10' fill='black'/><rect x='110' y='110' width='40' height='40' fill='black'/><rect x='120' y='120' width='20' height='20' fill='white'/></svg>";

export const PlansCheckout: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const { payments, confirmPayment, uploadProof } = useDataStore();

  const [activePaymentId, setActivePaymentId] = useState<number | null>(null);
  const [pollingProgress, setPollingProgress] = useState(0);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Filter current active payment
  const activePayment = payments.find(p => p.id === activePaymentId) || payments.find(p => p.status === 'pending');

  useEffect(() => {
    if (activePayment) {
      setActivePaymentId(activePayment.id);
    }
  }, [activePayment]);

  // Polling simulation every 5 seconds (Section 3.D)
  useEffect(() => {
    if (!activePaymentId || activePayment?.status !== 'pending') return;

    let timer = 0;
    const interval = setInterval(() => {
      setPollingProgress(prev => {
        if (prev >= 100) {
          timer += 1;
          // Auto confirm payment after 3 polling checks (15 seconds) for demonstration
          if (timer >= 2) {
            clearInterval(interval);
            handleMockPaySuccess();
            return 100;
          }
          return 0; // Reset progress bar circle
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [activePaymentId, activePayment?.status]);

  const handleMockPaySuccess = async () => {
    if (activePayment) {
      await confirmPayment(activePayment.id);
      addToast({
        type: 'success',
        title: t('paymentSuccess'),
        message: 'Subdomain Anda telah diaktifkan secara otomatis oleh server.',
      });
      setActivePaymentId(null);
    }
  };

  const handleProofUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayment) return;
    
    setIsUploadingProof(true);
    setTimeout(async () => {
      setIsUploadingProof(false);
      await uploadProof(activePayment.id, '/proofs/proof-uploaded.png');
      addToast({
        type: 'info',
        title: 'Bukti Bayar Diunggah',
        message: 'Administrasi Subly akan meninjau tanda terima transaksi Anda.',
      });
    }, 1000);
  };

  const totalAmount = activePayment ? activePayment.amount + activePayment.unique_code : 0;

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">
            {t('billingTitle')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Periksa invoice transaksi dan bayar via QRIS instan otomatis.
          </p>
        </div>
      </div>

      {activePayment && activePayment.status === 'pending' ? (
        /* Checkout Gateway QRIS view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: QRIS Details (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <CardPanel title="Checkout Gateway QRIS Statis">
              <div className="flex flex-col md:flex-row gap-6 mt-4 items-center md:items-start text-left">
                {/* QR Code container */}
                <div className="p-4 bg-white rounded-3xl border border-border-main shrink-0 flex flex-col items-center gap-2 select-none shadow-md">
                  <img 
                    src={qrisBase64Svg} 
                    alt="QRIS Code" 
                    className="w-40 h-40" 
                  />
                  <div className="px-3 py-1 rounded bg-slate-900 text-white font-black text-[9px] tracking-wider uppercase">
                    QRIS GPN
                  </div>
                </div>

                {/* Details instruction info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                    <QrCode className="h-5 w-5 text-brand-primary" />
                    <span>{t('payInstructions')}</span>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {t('uniqueCodeHint')}
                  </p>

                  <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase block">
                        Tagihan Paket
                      </span>
                      <span className="text-sm font-semibold text-text-main">
                        Rp {activePayment.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase block">
                        Kode Unik Transfer
                      </span>
                      <span className="text-sm font-bold text-brand-primary">
                        + Rp {activePayment.unique_code}
                      </span>
                    </div>
                    <div className="md:col-span-2 border-t border-border-main/50 pt-2">
                      <span className="text-[10px] font-black text-text-muted uppercase block">
                        {t('uniqueAmount')}
                      </span>
                      <span className="text-xl font-black text-brand-primary">
                        Rp {totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Polling progress animation */}
                  <div className="flex items-center gap-3 py-2 text-xs font-bold text-text-muted">
                    <Clock className="h-4.5 w-4.5 animate-spin text-brand-primary shrink-0" />
                    <div className="flex-1">
                      <p>Mengecek status pembayaran (Polling 5s)...</p>
                      <div className="w-full bg-border-main h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-brand-primary h-full transition-all duration-200"
                          style={{ width: `${pollingProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mock Pay tools */}
                  <div className="pt-2 border-t border-border-main/50 flex flex-wrap gap-2.5">
                    <Button 
                      onClick={handleMockPaySuccess} 
                      variant="primary" 
                      size="sm"
                      icon={<CheckCircle className="h-4 w-4" />}
                    >
                      {t('paySuccessBtn')}
                    </Button>
                    <button
                      onClick={() => setActiveTab('chat')} // Help link
                      className="text-xs font-semibold text-brand-primary hover:underline px-3 py-2"
                    >
                      Konfirmasi Manual via Chat
                    </button>
                  </div>
                </div>
              </div>
            </CardPanel>
          </div>

          {/* Right Column: Upload Receipt proof */}
          <div className="lg:col-span-1">
            <CardPanel title={t('uploadReceipt')}>
              <form onSubmit={handleProofUploadSubmit} className="space-y-4 mt-2">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                    Invoice ID
                  </label>
                  <p className="text-xs font-mono font-bold text-text-main bg-border-main/20 p-2.5 rounded-xl break-all">
                    {activePayment.transaction_id}
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                    Unggah Bukti Bayar
                  </label>
                  <div className="border border-dashed border-border-main hover:border-brand-primary rounded-2xl p-4 text-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0]?.name || 'receipt.png')}
                      className="hidden"
                      id="receipt-file-input"
                    />
                    <label htmlFor="receipt-file-input" className="cursor-pointer flex flex-col items-center gap-1.5">
                      <Upload className="h-6 w-6 text-text-muted" />
                      <span className="text-[10px] font-bold text-text-main">
                        {proofFile ? proofFile : 'Pilih file screenshot'}
                      </span>
                    </label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full"
                  disabled={!proofFile}
                  isLoading={isUploadingProof}
                >
                  {t('uploadReceiptBtn')}
                </Button>
              </form>
            </CardPanel>
          </div>
        </div>
      ) : (
        /* Regular invoice table history listing */
        <CardPanel 
          title="Riwayat Invoice Pembayaran"
          headerActions={
            <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 px-2.5 py-0.5 rounded uppercase">
              All Transactions
            </span>
          }
        >
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Transaction ID</th>
                  <th className="py-2.5 pb-2 font-bold">Plan</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Total</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Status</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {payments.map((p) => (
                  <tr 
                    key={p.id} 
                    className="hover:bg-border-main/5 transition-colors cursor-pointer"
                    onClick={() => p.status === 'pending' && setActivePaymentId(p.id)}
                  >
                    <td className="py-3 font-semibold text-text-main font-mono text-[11px]">
                      {p.transaction_id}
                    </td>
                    <td className="py-3 text-text-muted">
                      {p.plan?.name || 'Hosting Plan'}
                    </td>
                    <td className="py-3 text-center font-bold text-text-main font-mono text-[11px]">
                      Rp {(p.amount + p.unique_code).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-center">
                      <Badge 
                        status={p.status === 'success' ? 'success' : p.status === 'pending' ? 'pending' : 'failed'} 
                        label={p.status === 'success' ? 'Paid' : p.status === 'pending' ? 'Unpaid' : 'Failed'} 
                      />
                    </td>
                    <td className="py-3 text-right pr-6 text-[10px] text-text-muted font-semibold">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

    </div>
  );
};
export default PlansCheckout;
