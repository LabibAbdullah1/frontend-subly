// src/pages/dashboard/SubdomainsList.tsx
import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUpRight, Globe, Github, FileArchive, Calendar, AlertTriangle,
  Sparkles, Info, Database, HardDrive, CheckCircle2, Loader2, AlertCircle, ShieldCheck,
  Clock, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/date';

export const SubdomainsList: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const { subdomains, deleteSubdomain, payments, addSubdomain, databases, settings } = useDataStore();
  const rootDomain = settings.system_root_domain || 'subly.host';
  const warningThreshold = settings.system_storage_warning_threshold ? parseInt(settings.system_storage_warning_threshold, 10) : 80;

  const [subDeleteTarget, setSubDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Claim modal states
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimTargetPaymentId, setClaimTargetPaymentId] = useState<number | null>(null);
  const [claimName, setClaimName] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStep, setClaimStep] = useState<number>(0);
  const [claimCreatedSub, setClaimCreatedSub] = useState<any>(null);

  const handleCloseClaimModal = () => {
    if (isClaiming) return;
    setClaimModalOpen(false);
    setClaimStep(0);
    setClaimCreatedSub(null);
    setClaimName('');
    setClaimTargetPaymentId(null);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTargetPaymentId) return;

    const regex = /^[a-z0-9-_]+$/;
    if (!claimName) {
      addToast({
        type: 'error',
        title: t('error'),
        message: t('subdomainValidationRequired'),
      });
      return;
    }
    if (!regex.test(claimName)) {
      addToast({
        type: 'error',
        title: t('error'),
        message: t('subdomainValidationInvalid'),
      });
      return;
    }

    setIsClaiming(true);
    setClaimStep(1); // Tahap 1: Validasi

    // Simulasi transisi visual tahap demi tahap selama request berlangsung
    const t2 = setTimeout(() => setClaimStep(2), 700);  // Tahap 2: cPanel & DNS
    const t3 = setTimeout(() => setClaimStep(3), 1600); // Tahap 3: Database
    const t4 = setTimeout(() => setClaimStep(4), 2500); // Tahap 4: File root & permissions

    try {
      const created = await addSubdomain(claimName, claimTargetPaymentId);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setClaimCreatedSub(created);
      setClaimStep(5); // Tahap 5: Berhasil Selesai!

      addToast({
        type: 'success',
        title: t('claimSubdomainSuccessTitle'),
        message: t('claimSubdomainSuccessMsg').replace('{name}', claimName).replace('{domain}', rootDomain),
      });
    } catch (err: any) {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setClaimStep(0);
      addToast({
        type: 'error',
        title: t('claimSubdomainErrorTitle'),
        message: err.message || t('claimSubdomainErrorMsg'),
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleDeleteSub = async () => {
    if (subDeleteTarget) {
      setIsDeleting(true);
      try {
        await deleteSubdomain(subDeleteTarget);
        addToast({
          type: 'success',
          title: t('toastSubdomainDeletedTitle'),
          message: t('toastSubdomainDeletedMsg'),
        });
        setSubDeleteTarget(null);
      } catch {
        addToast({
          type: 'error',
          title: t('error'),
          message: t('toastSubdomainDeletedError'),
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const unclaimedSlots = payments.filter(p => p.status === 'success' && !p.subdomain_id);

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('listSubdomains')}
          </h1>
          <p className="text-[10px] text-text-muted font-semibold tracking-wide uppercase mt-0.5">
            {t('subdomainListSub')}
          </p>
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          icon={<Plus className="h-4.5 w-4.5" />}
          onClick={() => setActiveTab('plans')}
        >
          {t('buyNewPlanBtn')}
        </Button>
      </div>

      {/* Unclaimed paid slots section */}
      {unclaimedSlots.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <h2 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5 animate-pulse select-none">
            <Sparkles className="h-4 w-4" />
            {t('readyToClaimTitle').replace('{count}', String(unclaimedSlots.length))}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unclaimedSlots.map((slot) => (
              <motion.div
                key={slot.id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col h-full"
              >
                <CardPanel 
                  className="border-2 border-brand-primary/30 bg-brand-primary/5 hover:border-amber-500/40 transition-all relative overflow-hidden h-full"
                  glow={true}
                  glowColor="rgba(245, 158, 11, 0.15)"
                >
                  <div className="absolute top-0 right-0 bg-brand-primary text-bg-base text-[8px] font-bold uppercase px-2.5 py-1 rounded-bl-xl tracking-wider shadow-sm select-none">
                    Paid
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block select-none">{t('activePlanRentLabel')}</span>
                      <h3 className="text-sm font-bold text-text-main mt-0.5">
                        {slot.plan?.name || t('plans')}
                      </h3>
                      <p className="text-[10px] text-text-muted mt-1 select-none">
                        Invoice: <span className="font-mono text-text-main font-bold">{slot.transaction_id}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted pt-3.5 border-t border-border-main/50 select-none">
                      <span>Database</span>
                      <span className="text-text-main font-bold">{t('dbAutoLabel')}</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        setClaimTargetPaymentId(slot.id);
                        setClaimName('');
                        setClaimModalOpen(true); // Wait, this was claimModalOpen! Yes, setClaimModalOpen(true). Let's fix that.
                      }}
                    >
                      {t('quickActionClaimSubdomain')}
                    </Button>
                  </div>
                </CardPanel>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Subdomains Header */}
      {subdomains.length > 0 && (
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest select-none pt-2">
          {t('activeSubdomainsTitle')}
        </h2>
      )}

      {/* Grid of Subdomains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col h-full"
            >
              <CardPanel 
                className="flex flex-col justify-between h-full hover:border-amber-500/30 transition-all border border-border-main/50"
                glow={true}
              >
                <div className="space-y-4">
                  {/* Header card info */}
                  <div className="flex items-start justify-between select-none">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1.5">
                      <Badge 
                        status={sub.status === 'active' ? 'active' : 'inactive'} 
                        label={sub.status === 'active' ? t('active') : t('inactive')} 
                      />
                    </div>
                  </div>

                  {/* Domain Name */}
                  <div className="text-left">
                    <h4 className="text-sm font-bold tracking-tight font-mono">
                      {sub.status === 'active' ? (
                        <a 
                          href={`https://${sub.full_domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-text-main hover:text-brand-primary hover:underline inline-flex items-center gap-1"
                        >
                          {sub.full_domain}
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-text-muted inline-flex items-center gap-1.5 cursor-not-allowed select-none" title="Website belum bisa dibuka karena masih dalam proses penyiapan / propagasi DNS">
                          {sub.full_domain}
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans font-semibold">
                            {sub.status === 'inactive' ? 'Nonaktif' : 'Sedang Disiapkan'} (Link Dikunci)
                          </span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[9px] text-text-muted mt-1 select-none font-bold uppercase">
                      Doc root: <span className="font-mono text-text-main/80">{sub.doc_root}</span>
                    </p>
                  </div>

                  {/* Disk Storage & Database Info Combined */}
                  <div className="pt-3.5 border-t border-border-main/50 space-y-2.5">
                    {/* Storage utilization progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3.5 w-3.5 text-text-muted shrink-0" />
                          Storage
                        </span>
                        <span className="font-mono">
                          {usedStorageMb} MB / {planStorageMb} MB ({storagePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-border-main/40 h-1.5 rounded-full overflow-hidden border border-border-main/20">
                        <div
                          className={`h-full rounded-full ${
                            storagePercent >= 100 
                              ? 'bg-red-500' 
                              : storagePercent >= warningThreshold 
                              ? 'bg-amber-500' 
                              : 'bg-brand-primary'
                          }`}
                          style={{ width: `${storagePercent || 1}%` }}
                        />
                      </div>
                    </div>

                    {/* Database info combined */}
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-text-muted flex items-center gap-1">
                        <Database className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                        MySQL Database:
                      </span>
                      <span className="font-mono text-text-main font-bold flex items-center gap-1.5">
                        {db ? (
                          <>
                            <span className="text-emerald-500 text-[9px]">●</span>
                            <span className="truncate max-w-[130px]">{db.db_name}</span>
                          </>
                        ) : (
                          <span className="text-amber-500 font-medium text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Menunggu cPanel
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* GitHub Repo or manual zip */}
                  <div className="pt-3.5 border-t border-border-main/50 space-y-2 text-[10px] font-semibold text-text-muted select-none">
                    <div className="flex items-center gap-2">
                      {sub.git_url ? (
                        <>
                          <Github className="h-4 w-4 text-brand-primary shrink-0" />
                          <span className="truncate">GitHub: <span className="font-mono">{sub.git_branch}</span></span>
                        </>
                      ) : (
                        <>
                          <FileArchive className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{t('manualZipUploadLabel')}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Expired: {formatDate(sub.expired_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions button */}
                <div className="flex gap-2.5 mt-5 pt-4 border-t border-border-main/40 select-none">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    icon={<ArrowUpRight className="h-4 w-4" />}
                    iconPosition="right"
                    onClick={() => setActiveTab('subdomains', sub.id)}
                  >
                    {t('managePortal')}
                  </Button>
                  <button
                    onClick={() => setSubDeleteTarget(sub.id)}
                    className="text-text-muted hover:text-red-500 p-2.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/10 cursor-pointer active:scale-95 transition-all shrink-0"
                    title={t('delete')}
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </CardPanel>
            </motion.div>
          );
        })}

        {subdomains.length === 0 && unclaimedSlots.length === 0 && (
          <div className="col-span-full py-16">
            <CardPanel className="max-w-md mx-auto text-center p-8">
              <div className="h-12 w-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4 select-none">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider select-none">
                {t('emptySubdomains')}
              </h3>
              <p className="text-[11px] text-text-muted mt-2 leading-relaxed select-none">
                {t('noSubdomainDatabases')}
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-5 w-full select-none"
                onClick={() => setActiveTab('plans')}
              >
                {t('quickActionClaimSubdomain')}
              </Button>
            </CardPanel>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={subDeleteTarget !== null}
        onClose={() => setSubDeleteTarget(null)}
        title={t('deleteSubdomainConfirmTitle')}
        description={t('deleteSubdomainConfirmDesc')}
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setSubDeleteTarget(null)} disabled={isDeleting}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteSub} isLoading={isDeleting}>
              {t('delete')}
            </Button>
          </>
        }
      >
        <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 flex items-center gap-2 select-none">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold text-left">
            {t('deleteSubdomainWarningText')}
          </span>
        </div>
      </Modal>

      {/* Claim Subdomain Wizard Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={handleCloseClaimModal}
        title={
          claimStep === 5
            ? 'Subdomain & Database Berhasil Diaktifkan!'
            : claimStep >= 1
            ? 'Memproses Pembuatan Layanan'
            : t('claimSubdomainTitle')
        }
        description={
          claimStep === 5
            ? 'Layanan web hosting dan database MySQL Anda telah selesai disiapkan.'
            : claimStep >= 1
            ? 'Harap tunggu beberapa detik, sistem sedang memproses pendaftaran ke cPanel & DNS.'
            : t('claimSubdomainDesc')
        }
      >
        {claimStep === 0 && (
          <form onSubmit={handleClaimSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main">
                {t('subdomainName')}
              </label>
              <div className="flex items-stretch">
                <input
                  type="text"
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="website-saya"
                  className="flex-1 premium-input rounded-r-none border-r-0 font-mono"
                  required
                />
                <span className="bg-border-main/20 border border-border-main border-l-0 px-4 flex items-center rounded-r-xl text-xs font-bold text-text-muted select-none font-mono">
                  .{rootDomain}
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed flex items-start gap-1.5 select-none pt-1">
                <Info className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                <span>{t('subdomainRulesHint')}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main/50 select-none">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseClaimModal}
                disabled={isClaiming}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isClaiming}
              >
                {t('activateSubdomainBtn')}
              </Button>
            </div>
          </form>
        )}

        {claimStep >= 1 && claimStep <= 4 && (
          <div className="space-y-5 py-2 text-left select-none">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                <span>Status Provisi Otomatis</span>
                <span className="font-mono text-brand-primary">{claimStep * 25}%</span>
              </div>
              <div className="w-full bg-border-main/30 h-2 rounded-full overflow-hidden border border-border-main/20">
                <div
                  className="bg-brand-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${claimStep * 25}%` }}
                />
              </div>
            </div>

            {/* Stepper items */}
            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border-main">
                <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-green-500/10 text-green-500 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-main">1. Validasi Slot & Format Subdomain</p>
                  <p className="text-[10px] text-text-muted font-mono truncate">{claimName}.{rootDomain}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl bg-bg-surface border transition-colors ${
                claimStep === 2 ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-border-main'
              }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  claimStep > 2
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : claimStep === 2
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'bg-border-main/20 text-text-muted'
                }`}>
                  {claimStep > 2 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : claimStep === 2 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main">2. Pendaftaran Subdomain & DNS Cloudflare</p>
                  <p className="text-[10px] text-text-muted">
                    {claimStep > 2
                      ? 'Subdomain aktif & DNS terdaftar'
                      : claimStep === 2
                      ? 'Menghubungi API cPanel & mengatur routing DNS...'
                      : 'Menunggu giliran...'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl bg-bg-surface border transition-colors ${
                claimStep === 3 ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-border-main'
              }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  claimStep > 3
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : claimStep === 3
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'bg-border-main/20 text-text-muted'
                }`}>
                  {claimStep > 3 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : claimStep === 3 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main">3. Pembuatan Database MySQL & User Hak Akses</p>
                  <p className="text-[10px] text-text-muted">
                    {claimStep > 3
                      ? 'Database & kredensial user cPanel siap'
                      : claimStep === 3
                      ? 'Mengalokasikan database, user MySQL, dan hak akses...'
                      : 'Menunggu giliran...'}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl bg-bg-surface border transition-colors ${
                claimStep === 4 ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-border-main'
              }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  claimStep === 4
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'bg-border-main/20 text-text-muted'
                }`}>
                  {claimStep === 4 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main">4. Inisialisasi Direktori & File Default</p>
                  <p className="text-[10px] text-text-muted">
                    {claimStep === 4
                      ? 'Membuat public_html & landing placeholder index.html...'
                      : 'Menunggu giliran...'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-text-muted animate-pulse">
              Mohon jangan menutup jendela browser ini sampai proses pembuatan selesai...
            </p>
          </div>
        )}

        {claimStep === 5 && (
          <div className="space-y-4 py-1 text-left select-none">
            {/* Success Header Box */}
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-green-500">Subdomain & Database Berhasil Dibuat!</h4>
                <p className="text-[11px] text-text-muted">
                  Seluruh konfigurasi server dan kredensial database telah siap.
                </p>
              </div>
            </div>

            {/* Information Cards */}
            <div className="p-3.5 rounded-xl bg-bg-surface border border-border-main space-y-3">
              {/* Domain row */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block">Domain Website</span>
                  <p className="text-xs font-bold text-text-main font-mono truncate select-all mt-0.5">
                    https://{claimCreatedSub?.full_domain || `${claimName}.${rootDomain}`}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                  {claimCreatedSub?.status || 'Active'}
                </span>
              </div>

              <div className="border-t border-border-main/50" />

              {/* Database row */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block">Database MySQL (cPanel)</span>
                  <p className="text-xs font-bold text-text-main font-mono truncate select-all mt-0.5">
                    {claimCreatedSub?.database?.name || (databases.find(d => d.subdomain_id === claimCreatedSub?.id)?.db_name) || 'Kredensial Siap'}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-full shrink-0">
                  {claimCreatedSub?.database?.isReady !== false ? 'Aktif' : 'Menunggu cPanel'}
                </span>
              </div>
            </div>

            {/* Cloudflare DNS Propagation Alert */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Pemberitahuan Propagasi DNS Cloudflare</span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Subdomain baru membutuhkan waktu <strong>15–60 detik</strong> untuk penyebaran DNS Cloudflare global. Jika Anda langsung membuka website dan mendapati pesan Cloudflare (Error 521/522/Host Error), jangan khawatir—ini normal karena DNS baru didaftarkan. Harap tunggu ~30 detik lalu refresh halaman.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-border-main/50">
              <a
                href={`https://${claimCreatedSub?.full_domain || `${claimName}.${rootDomain}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-bg-base text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Globe className="h-4 w-4 shrink-0" />
                Buka Website
                <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
              </a>
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:flex-1"
                onClick={() => {
                  const subId = claimCreatedSub?.id;
                  handleCloseClaimModal();
                  if (subId) {
                    setActiveTab(`subdomain-portal-${subId}`);
                  }
                }}
              >
                Ke Portal Subdomain
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseClaimModal}
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default SubdomainsList;

