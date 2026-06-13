// src/pages/dashboard/PlansCheckout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Clock, Upload } from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const PlansCheckout: React.FC = () => {
  const { t, language } = useTranslation();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const { payments, uploadProof, cancelPayment, settings, fetchSettings, fetchPayments } = useDataStore();

  const [activePaymentId, setActivePaymentId] = useState<number | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [qrisImageError, setQrisImageError] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    if (!proofFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProofPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [proofFile]);

  const lastStatusRef = useRef<string | null>(null);

  // Filter current active payment
  const activePayment = payments.find(p => p.id === activePaymentId) || payments.find(p => p.status === 'pending');

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!activePayment || activePayment.status !== 'pending') return;

    const calculateTimeLeft = () => {
      const createdTime = new Date(activePayment.created_at).getTime();
      const expiryTime = createdTime + 60 * 60 * 1000;
      const difference = expiryTime - Date.now();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        fetchPayments();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activePayment, fetchPayments]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setQrisImageError(false);
  }, [settings?.qris_image_path]);

  useEffect(() => {
    if (activePayment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivePaymentId(activePayment.id);
      
      // Toast notification on status change from pending -> success
      if (lastStatusRef.current === 'pending' && activePayment.status === 'success') {
        addToast({
          type: 'success',
          title: t('paymentSuccess'),
          message: t('paymentSuccess'),
        });
        setActivePaymentId(null);
      }
      lastStatusRef.current = activePayment.status;
    }
  }, [activePayment, addToast, t]);

  // Polling database payments status every 5 seconds
  useEffect(() => {
    if (!activePaymentId || activePayment?.status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        await fetchPayments();
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activePaymentId, activePayment?.status, fetchPayments]);

  const handleProofUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayment || !proofFile) return;
    
    setIsUploadingProof(true);
    try {
      await uploadProof(activePayment.id, proofFile);
      addToast({
        type: 'info',
        title: t('toastProofUploadedTitle'),
        message: t('toastProofUploadedMsg'),
      });
      setProofFile(null);
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: t('toastUploadFailedTitle'),
        message: (err as Error).message || t('toastUploadFailedMsg'),
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  const totalAmount = activePayment ? activePayment.amount : 0;
  
  // QRIS Image URL Configuration
  const UPLOADS_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
  const qrisImgUrl = settings.qris_image_path ? `${settings.qris_image_path.startsWith('http') ? '' : UPLOADS_BASE}/${settings.qris_image_path}` : null;

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('billingTitle')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            {t('billingSubtitle')}
          </p>
        </div>
      </div>

      {activePayment && activePayment.status === 'pending' && (
        /* Checkout Gateway QRIS view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: QRIS Details (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <CardPanel className="!p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row items-stretch w-full min-h-[380px]">
                {/* Left Column: QRIS Image with left spacing */}
                <div className="md:w-[260px] shrink-0 bg-transparent flex flex-col items-center justify-center relative p-4 md:pl-6 md:py-6 md:pr-0">
                  {qrisImgUrl && !qrisImageError ? (
                    <img 
                      src={qrisImgUrl} 
                      onError={() => setQrisImageError(true)}
                      alt="QRIS Code" 
                      className="w-full h-full object-contain select-none" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border-main/50 rounded-2xl w-[212px] h-[212px] select-none text-text-muted">
                      <QrCode className="h-10 w-10 mb-2 text-text-muted/60" />
                      <span className="text-[11px] font-bold text-text-main">{t('qrisNotUploadedTitle')}</span>
                      <span className="text-[9px] opacity-75 mt-0.5">{t('qrisNotUploadedSub')}</span>
                    </div>
                  )}
                  {qrisImgUrl && !qrisImageError && (
                    <div className="absolute bottom-4 px-3 py-1 rounded bg-slate-900/90 text-white font-bold text-[9px] tracking-wider uppercase backdrop-blur-xs select-none">
                      QRIS GPN
                    </div>
                  )}
                </div>

                {/* Right Column: Details & Instructions with padding */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                      {t('qrisGatewayTitle')}
                    </h3>

                    {timeLeft > 0 ? (
                      <div className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-between text-xs font-bold select-none">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 animate-pulse shrink-0" />
                          <span>Selesaikan pembayaran dalam waktu:</span>
                        </div>
                        <span className="font-mono text-xs tracking-wider bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20 shrink-0">
                          {formatTimeLeft(timeLeft)}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-xs font-bold select-none">
                        <Clock className="h-4 w-4 text-red-500 shrink-0" />
                        <span>Sesi pembayaran ini telah kedaluwarsa.</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-text-main">
                      <QrCode className="h-5 w-5 text-brand-primary" />
                      <span>{t('payInstructions')}</span>
                    </div>

                    <p className="text-[11px] text-text-muted leading-relaxed mt-2">
                      {t('uniqueCodeHint')}
                    </p>

                    <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-left select-none">
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">
                          {t('packageInvoiceLabel')}
                        </span>
                        <span className="text-sm font-semibold text-text-main">
                          Rp {(activePayment.amount - activePayment.unique_code).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">
                          {t('uniqueCodeTransferLabel')}
                        </span>
                        <span className="text-sm font-bold text-brand-primary">
                          + Rp {activePayment.unique_code}
                        </span>
                      </div>
                      <div className="md:col-span-2 border-t border-border-main/50 pt-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase block">
                          {t('uniqueAmount')}
                        </span>
                        <span className="text-xl font-bold text-brand-primary">
                          Rp {totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom spinner and manual refresh button */}
                  <div className="p-4 rounded-xl bg-bg-surface border border-border-main flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center shrink-0">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary/20 border-t-brand-primary" />
                        <Clock className="h-3.5 w-3.5 text-brand-primary absolute" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-main">{t('waitingAdminVerificationTitle')}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">{t('waitingAdminVerificationSub')}</p>
                      </div>
                    </div>
                    
                    
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await fetchPayments();
                            addToast({
                              type: 'info',
                              title: t('toastStatusUpdatedTitle'),
                              message: t('toastStatusUpdatedMsg'),
                            });
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          } catch (err) {
                            addToast({
                              type: 'error',
                              title: t('error'),
                              message: t('toastStatusCheckError'),
                            });
                          }
                        }}
                        className="flex items-center gap-1.5"
                      >
                        {t('checkStatusBtn')}
                      </Button>

                      <Button 
                        type="button" 
                        variant="danger" 
                        size="sm"
                        onClick={() => setIsCancelModalOpen(true)}
                      >
                        Batal Pembelian
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-main/50 flex flex-wrap justify-center md:justify-start gap-2.5 select-none">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="text-xs font-semibold text-brand-primary hover:underline py-1"
                    >
                      {t('needHelpChatAdmin')}
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
                  <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                    {t('invoiceIdLabel')}
                  </label>
                  <p className="text-xs font-mono font-bold text-text-main bg-border-main/20 p-2.5 rounded-xl break-all">
                    {activePayment.transaction_id}
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                    {t('uploadReceipt')}
                  </label>
                  <label 
                    htmlFor="receipt-file-input"
                    className="block border border-dashed border-border-main hover:border-brand-primary/45 rounded-xl p-4 text-center cursor-pointer transition-all relative overflow-hidden"
                  >
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/webp"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-file-input"
                    />
                    {proofPreviewUrl ? (
                      <div className="relative group" onClick={(e) => e.stopPropagation()}>
                        <img 
                          src={proofPreviewUrl} 
                          alt="Preview Bukti Bayar" 
                          className="max-h-48 w-full object-contain rounded-lg bg-black/10 p-1 border border-border-main/50 animate-in fade-in duration-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-3">
                          <label 
                            htmlFor="receipt-file-input" 
                            className="px-3 py-1.5 rounded-lg bg-bg-surface text-text-main text-[10px] font-bold cursor-pointer hover:bg-border-main/20 shadow-sm"
                          >
                            {t('changeImage')}
                          </label>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofFile(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold cursor-pointer hover:bg-red-700 shadow-sm"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="h-6 w-6 text-text-muted" />
                        <span className="text-[10px] font-bold text-text-main truncate max-w-full">
                          {t('selectProofFilePlaceholder')}
                        </span>
                      </div>
                    )}
                  </label>
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
      )}

      {/* Always show regular invoice table history listing at the bottom */}
      <CardPanel 
        title={t('invoiceHistoryTitle')}
        headerActions={
          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 px-2.5 py-0.5 rounded uppercase select-none">
            {t('allTransactionsBadge')}
          </span>
        }
      >
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest select-none">
                <th className="py-2.5 pb-2 px-4 font-bold">{t('colTrxIdFull')}</th>
                <th className="py-2.5 pb-2 px-4 font-bold">{t('plans')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('colTotal')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('status')}</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">{t('colDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {payments.map((p) => (
                <tr 
                  key={p.id} 
                  className={`hover:bg-border-main/5 transition-colors cursor-pointer ${
                    activePaymentId === p.id ? 'bg-brand-primary/5 border-l-2 border-l-brand-primary' : ''
                  }`}
                  onClick={() => p.status === 'pending' && setActivePaymentId(p.id)}
                >
                  <td className="py-3 px-4 font-semibold text-text-main font-mono text-[11px] select-all">
                    {p.transaction_id}
                  </td>
                  <td className="py-3 px-4 text-text-muted select-none">
                    {p.plan?.name || t('plans')}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-text-main font-mono text-[11px]">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center select-none">
                    <Badge 
                      status={p.status === 'success' ? 'success' : p.status === 'pending' ? 'pending' : 'failed'} 
                      label={p.status === 'success' ? t('paymentStatusPaid') : p.status === 'pending' ? t('paymentStatusUnpaid') : t('paymentStatusFailed')} 
                    />
                  </td>
                  <td className="py-3 px-4 text-right text-[10px] text-text-muted font-semibold select-none">
                    {new Date(p.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardPanel>

      {/* Cancel Confirmation Modal */}
      {activePayment && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Batalkan Tagihan Pembelian?"
          description="Apakah Anda yakin ingin membatalkan transaksi pembelian ini? Tagihan ini akan dinonaktifkan secara permanen."
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
                Kembali
              </Button>
              <Button 
                variant="danger" 
                onClick={async () => {
                  try {
                    await cancelPayment(activePayment.id);
                    addToast({
                      type: 'success',
                      title: 'Pembelian Dibatalkan',
                      message: 'Transaksi pembayaran berhasil dibatalkan.',
                    });
                    setIsCancelModalOpen(false);
                    setActivePaymentId(null);
                  } catch (err: any) {
                    addToast({
                      type: 'error',
                      title: 'Gagal Membatalkan',
                      message: err.message || 'Gagal membatalkan transaksi.',
                    });
                  }
                }}
              >
                Ya, Batalkan
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 select-none">
            <Clock className="h-5 w-5 shrink-0" />
            <div className="text-xs text-left">
              <p className="font-bold">Membatalkan Transaksi:</p>
              <p className="font-mono mt-0.5 text-[10px] bg-red-500/10 px-2 py-0.5 rounded break-all">
                {activePayment.transaction_id}
              </p>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
export default PlansCheckout;

