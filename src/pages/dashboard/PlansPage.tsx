// src/pages/dashboard/PlansPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Check, ShoppingCart, Globe, ShieldCheck, HardDrive, Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { Plan } from '../../types';

export const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const { plans, applyVoucher, createPayment, settings, fetchSettings } = useDataStore();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [subdomainName, setSubdomainName] = useState('');
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'PHP' | 'NodeJS'>('ALL');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const rootDomain = settings.system_root_domain || 'subly.my.id';

  const filteredPlans = plans
    .filter((plan) => {
      if (filterType === 'ALL') return true;
      return plan.type === filterType;
    })
    .sort((a, b) => Number(a.price) - Number(b.price));

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setVoucherCode('');
    setAppliedDiscount(null);
    setSubdomainName('');
    setCheckoutModalOpen(true);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    const result = await applyVoucher(voucherCode);
    if (result) {
      setAppliedDiscount(result.discount);
      addToast({
        type: 'success',
        title: t('toastVoucherAppliedTitle'),
        message: t('toastVoucherAppliedMsg').replace('{discount}', String(result.discount)),
      });
    } else {
      addToast({
        type: 'error',
        title: t('toastVoucherInvalidTitle'),
        message: t('toastVoucherInvalidMsg'),
      });
      setAppliedDiscount(null);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const isFree = Number(selectedPlan.price) === 0;

    if (isFree) {
      if (!subdomainName.trim()) {
        addToast({
          type: 'error',
          title: t('error'),
          message: t('subdomainValidationRequired'),
        });
        return;
      }

      const cleanName = subdomainName.trim().toLowerCase();
      if (!/^[a-z0-9_-]+$/.test(cleanName)) {
        addToast({
          type: 'error',
          title: t('error'),
          message: t('subdomainValidationInvalid'),
        });
        return;
      }
    }

    setIsCheckoutInProgress(true);
    try {
      if (isFree) {
        await createPayment(selectedPlan.id, subdomainName.trim().toLowerCase(), null);
        addToast({
          type: 'success',
          title: t('success'),
          message: t('toastFreeClaimSuccess'),
        });
        setCheckoutModalOpen(false);
        setActiveTab('subdomains');
      } else {
        await createPayment(selectedPlan.id, '', appliedDiscount ? voucherCode : null);
        addToast({
          type: 'info',
          title: t('toastInvoiceCreatedTitle'),
          message: t('toastInvoiceCreatedMsg'),
        });
        setCheckoutModalOpen(false);
        setActiveTab('billing');
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('error'),
        message: err.message || t('toastInvoiceCreatedError')
      });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none border-b border-border-main/20 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('pricingTitle')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            {t('pricingSub')}
          </p>
        </div>

        {/* Runtime filter tabs */}
        <div className="inline-flex bg-bg-surface border border-border-main p-1 rounded-full shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-150 cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-bg-card text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {t('filterAll')}
          </button>
          <button
            onClick={() => setFilterType('PHP')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-150 cursor-pointer ${
              filterType === 'PHP'
                ? 'bg-bg-card text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {t('filterPhp')}
          </button>
          <button
            onClick={() => setFilterType('NodeJS')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-150 cursor-pointer ${
              filterType === 'NodeJS'
                ? 'bg-bg-card text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {t('filterNode')}
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => {
          const isNode = plan.type === 'NodeJS';
          
          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col h-full"
            >
              <CardPanel 
                className="flex flex-col justify-between h-full border border-border-main/50 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300"
                glow={true}
              >
                <div className="space-y-5">
                  {/* Plan Badge */}
                  <div className="flex justify-between items-center select-none">
                    <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isNode 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/15' 
                        : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15'
                    }`}>
                      {t('pricingRuntimeSuffix').replace('{runtime}', plan.type)}
                    </span>
                  </div>

                  {/* Plan Name & Price */}
                  <div>
                    <h3 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors">
                      {plan.name}
                    </h3>
                    <div className="mt-2.5 flex items-baseline">
                      <span className="text-xl font-bold text-text-main font-mono">
                        Rp {plan.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold uppercase ml-1">
                        {t('monthlyPriceSuffix')}
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
                      <span>{t('featureStorageLabel').replace('{storage}', plan.max_storage_mb >= 1024 ? `${plan.max_storage_mb / 1024} GB` : `${plan.max_storage_mb} MB`)}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>{t('featureDatabaseLabel')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>{t('featureSslLabel')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>{t('featureSubdomainLabel').replace('{domain}', `.${rootDomain}`)}</span>
                    </li>
                  </ul>
                </div>

                {/* Action */}
                <div className="mt-6 pt-4 select-none">
                  <Button 
                    variant="primary" 
                    className="w-full flex items-center justify-center gap-1.5"
                    icon={<ShoppingCart className="h-4 w-4" />}
                    onClick={() => handleOpenCheckout(plan)}
                  >
                    {t('selectPlan')}
                  </Button>
                </div>
              </CardPanel>
            </motion.div>
          );
        })}
      </div>

      {/* Claim Subdomain & Checkout Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={t('billingModalTitle')}
      >
        {selectedPlan && (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
            {/* Plan Info Summary */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-main/60 grid grid-cols-2 gap-3.5 select-none">
              <div>
                <span className="text-[9px] font-bold text-text-muted uppercase block">{t('billingSelectedPlanLabel')}</span>
                <span className="text-xs font-bold text-text-main">{selectedPlan.name}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-muted uppercase block">{t('billingBasePriceLabel')}</span>
                <span className="text-xs font-bold text-text-main font-mono">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {Number(selectedPlan.price) === 0 ? (
              /* Subdomain Name Input for Free Tier */
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-text-main">
                  {t('billingSubdomainNameFree')}
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={subdomainName}
                      onChange={(e) => setSubdomainName(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder={t('billingSubdomainNameFreePlaceholder')}
                      className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none font-mono"
                      required
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-muted font-mono select-none">
                    .{rootDomain}
                  </span>
                </div>
                <p className="text-[9.5px] text-text-muted leading-relaxed select-none">
                  {t('subdomainRulesHint')}
                </p>
              </div>
            ) : (
              /* Voucher Discount */
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
                    {t('billingVoucherAppliedSuccess').replace('{discount}', String(appliedDiscount))}
                  </p>
                )}
              </div>
            )}

            {/* Price Calculations */}
            <div className="border-t border-border-main/50 pt-4 flex justify-between items-center select-none">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">{t('billingTotalLabel')}</span>
                <span className="text-lg font-bold text-brand-primary font-mono">
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
                  {Number(selectedPlan.price) === 0 
                    ? t('billingCheckoutFreeBtn') 
                    : t('billingCreateInvoiceBtn')}
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

