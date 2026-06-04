// src/pages/dashboard/SubdomainsList.tsx
import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUpRight, Globe, Github, FileArchive, Calendar, AlertTriangle,
  Sparkles, Info, Database, HardDrive
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

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTargetPaymentId) return;

    const regex = /^[a-z0-9-_]+$/;
    if (!claimName) {
      addToast({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama subdomain wajib diisi.',
      });
      return;
    }
    if (!regex.test(claimName)) {
      addToast({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama subdomain tidak valid. Hanya gunakan huruf kecil, angka, minus (-) dan underscore (_).',
      });
      return;
    }

    setIsClaiming(true);
    try {
      await addSubdomain(claimName, claimTargetPaymentId);
      addToast({
        type: 'success',
        title: 'Subdomain Berhasil Diklaim',
        message: `Subdomain ${claimName}.${rootDomain} dan database MySQL Anda telah aktif!`,
      });
      setClaimModalOpen(false);
      setClaimTargetPaymentId(null);
      setClaimName('');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Gagal Mengklaim',
        message: 'Terjadi kesalahan sistem atau subdomain sudah digunakan.',
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
          title: 'Subdomain Dihapus',
          message: 'Subdomain beserta berkas cPanel berhasil dihapus.',
        });
        setSubDeleteTarget(null);
      } catch {
        addToast({
          type: 'error',
          title: 'Gagal',
          message: 'Terjadi masalah pada server.',
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
            Kelola domain cPanel instan Anda, koneksi Git, dan parameter deployment.
          </p>
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          icon={<Plus className="h-4.5 w-4.5" />}
          onClick={() => setActiveTab('plans')}
        >
          Beli Paket Baru
        </Button>
      </div>

      {/* Unclaimed paid slots section */}
      {unclaimedSlots.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <h2 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5 animate-pulse select-none">
            <Sparkles className="h-4 w-4" />
            Paket Siap Diklaim ({unclaimedSlots.length})
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
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block select-none">Sewa Hosting Aktif</span>
                      <h3 className="text-sm font-bold text-text-main mt-0.5">
                        {slot.plan?.name || 'Paket Hosting'}
                      </h3>
                      <p className="text-[10px] text-text-muted mt-1 select-none">
                        Invoice: <span className="font-mono text-text-main font-bold">{slot.transaction_id}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted pt-3.5 border-t border-border-main/50 select-none">
                      <span>Database</span>
                      <span className="text-text-main font-bold">1 MySQL Otomatis</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        setClaimTargetPaymentId(slot.id);
                        setClaimName('');
                        setClaimModalOpen(true);
                      }}
                    >
                      Klaim Subdomain
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
          Subdomain Aktif Anda
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
                    <h4 className="text-sm font-bold text-text-main tracking-tight font-mono select-all">
                      {sub.full_domain}
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
                      <span className="font-mono text-text-main font-bold">
                        {db ? db.db_name : '1 Database Aktif'}
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
                          <span>Upload Manual (.ZIP)</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Expired: {sub.expired_at ? new Date(sub.expired_at).toLocaleDateString() : '-'}</span>
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
                    Manage Portal
                  </Button>
                  <button
                    onClick={() => setSubDeleteTarget(sub.id)}
                    className="text-text-muted hover:text-red-500 p-2.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/10 cursor-pointer active:scale-95 transition-all shrink-0"
                    title="Hapus Subdomain"
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
                Anda belum memiliki domain cPanel aktif. Klaim paket hosting dan dapatkan subdomain Anda sekarang.
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-5 w-full select-none"
                onClick={() => setActiveTab('plans')}
              >
                Klaim Subdomain Baru
              </Button>
            </CardPanel>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={subDeleteTarget !== null}
        onClose={() => setSubDeleteTarget(null)}
        title="Hapus Subdomain?"
        description="Tindakan ini permanen. Virtual host Nginx, sertifikat SSL Let's Encrypt, dan seluruh berkas aplikasi Anda dalam document root akan dihapus total dari server."
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
            Peringatan: Seluruh file website Anda dalam cPanel document root akan dihapus permanen!
          </span>
        </div>
      </Modal>

      {/* Claim Subdomain Wizard Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Klaim Subdomain Baru"
        description="Masukkan nama subdomain yang ingin Anda gunakan untuk slot hosting ini. Sistem akan secara otomatis menyiapkan Nginx virtual host dan database MySQL."
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-main">
              Nama Subdomain
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
              <span>Hanya diperbolehkan huruf kecil (a-z), angka (0-9), tanda hubung (-) dan garis bawah (_). Tanpa spasi atau titik.</span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main/50 select-none">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setClaimModalOpen(false)}
              disabled={isClaiming}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isClaiming}
            >
              Aktifkan Subdomain
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default SubdomainsList;
