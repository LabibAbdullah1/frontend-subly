// src/pages/dashboard/PlansPage.tsx
import React, { useState } from 'react';
import { 
  Check, ShoppingCart, Globe, ShieldCheck, HardDrive, Database
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const { plans, applyVoucher, createPayment } = useDataStore();

    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setVoucherCode('');
    setAppliedDiscount(null);
    setCheckoutModalOpen(true);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    const result = await applyVoucher(voucherCode);
    if (result) {
      setAppliedDiscount(result.discount);
      addToast({
        type: 'success',
        title: 'Voucher Diterapkan',
        message: `Voucher diskon ${result.discount}% sukses digunakan!`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Voucher Tidak Valid',
        message: 'Kode voucher salah, kedaluwarsa, atau kuota habis.',
      });
      setAppliedDiscount(null);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsCheckoutInProgress(true);
    try {
      await createPayment(selectedPlan.id, '', appliedDiscount ? voucherCode : null);
      addToast({
        type: 'info',
        title: 'Invoice Tagihan Dibuat',
        message: 'Silakan lakukan pembayaran QRIS untuk mengaktifkan paket Anda.',
      });
      setCheckoutModalOpen(false);
      // Redirect to billing page
      setActiveTab('billing');
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Terdapat masalah server saat memproses invoice.' });
    } finally {
      setIsCheckoutInProgress(false);
    }
  };

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    if (appliedDiscount) {
      return selectedPlan.price - (selectedPlan.price * appliedDiscount) / 100;
    }
    return selectedPlan.price;
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">
            {t('pricingTitle')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            {t('pricingSub')}
          </p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isNode = plan.type === 'NodeJS';
          
          return (
            <CardPanel 
              key={plan.id} 
              className="flex flex-col justify-between h-full border border-border-main/50 relative overflow-hidden group hover:border-brand-primary/50 transition-all duration-300"
              glow={true}
            >
              <div className="space-y-5">
                {/* Plan Badge */}
                <div className="flex justify-between items-center select-none">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isNode 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/15' 
                      : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15'
                  }`}>
                    {plan.type} RUNTIME
                  </span>
                </div>

                {/* Plan Name & Price */}
                <div>
                  <h3 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors">
                    {plan.name}
                  </h3>
                  <div className="mt-2.5 flex items-baseline">
                    <span className="text-xl font-black text-text-main font-mono">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold uppercase ml-1">
                      / bln
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed min-h-12">
                  {plan.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2.5 pt-4 border-t border-border-main/50 text-[11px] font-semibold text-text-muted select-none">
                  <li className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-brand-primary shrink-0" />
                    <span>Storage: <span className="font-mono text-text-main font-bold">{plan.max_storage_mb >= 1024 ? `${plan.max_storage_mb / 1024} GB` : `${plan.max_storage_mb} MB`}</span> NVMe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-brand-primary shrink-0" />
                    <span>Database: <span className="font-mono text-text-main font-bold">{plan.max_databases}</span> MySQL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" />
                    <span>SSL Let's Encrypt Otomatis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-primary shrink-0" />
                    <span>Subdomain Gratis `.subly.host`</span>
                  </li>
                </ul>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 select-none">
                <Button 
                  variant={isNode ? 'outline' : 'primary'} 
                  className="w-full flex items-center justify-center gap-1.5"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  onClick={() => handleOpenCheckout(plan)}
                >
                  Pilih Paket
                </Button>
              </div>
            </CardPanel>
          );
        })}
      </div>

      {/* Claim Subdomain & Checkout Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Klaim Subdomain & Konfirmasi Pembelian"
      >
        {selectedPlan && (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
            {/* Plan Info Summary */}
            <div className="p-4 rounded-2xl bg-bg-surface border border-border-main/60 grid grid-cols-2 gap-3.5 select-none">
              <div>
                <span className="text-[9px] font-bold text-text-muted uppercase block">Paket Terpilih</span>
                <span className="text-xs font-black text-text-main">{selectedPlan.name}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-muted uppercase block">Base Price</span>
                <span className="text-xs font-bold text-text-main font-mono">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Voucher Discount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">
                {t('voucherCode')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME50"
                  className="flex-1 premium-input font-mono"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  onClick={handleApplyVoucher}
                >
                  {t('apply')}
                </Button>
              </div>
              {appliedDiscount && (
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1 select-none">
                  <Check className="h-3.5 w-3.5" />
                  Diskon {appliedDiscount}% berhasil dipasang!
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-border-main/50 pt-4 flex justify-between items-center select-none">
              <div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">Total Pembayaran</span>
                <span className="text-lg font-black text-brand-primary font-mono">
                  Rp {getFinalPrice().toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setCheckoutModalOpen(false)}
                  disabled={isCheckoutInProgress}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  isLoading={isCheckoutInProgress}
                >
                  Buat Tagihan
                </Button>
              </div>
            </div>

          </form>
        )}
      </Modal>
    </div>
  );
};
export default PlansPage;
