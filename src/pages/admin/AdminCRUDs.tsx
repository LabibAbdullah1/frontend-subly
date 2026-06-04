// src/pages/admin/AdminCRUDs.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, HardDrive, Upload, Star, MessageSquare } from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AdminCRUDs: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { activeTab } = useSystemStore();
  
  const { 
    plans, 
    vouchers, 
    adminUsers,
    settings,
    fetchAdminUsers,
    fetchSettings,
    addPlan,
    deletePlan,
    addVoucher,
    deleteVoucher,
    updateSubdomainStorageOverride,
    updateSetting,
    adminTestimonials,
    fetchAdminTestimonials,
    updateTestimonialStatus,
    deleteTestimonial
  } = useDataStore();

  // Modal open states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('29000');
  const [newPlanType, setNewPlanType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [newPlanStorage, setNewPlanStorage] = useState('1024');
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('20');
  const [isSubmittingVoucher, setIsSubmittingVoucher] = useState(false);

  const [overrideUserModal, setOverrideUserModal] = useState(false);
  const [overrideTargetId, setOverrideTargetId] = useState<number | null>(null);
  const [overrideLimitSize, setOverrideLimitSize] = useState('2048');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Settings local states
  const [merchantName, setMerchantName] = useState('');
  const [qrisNmid, setQrisNmid] = useState('');
  const [qrisImageFile, setQrisImageFile] = useState<File | null>(null);
  const [systemStorageLimit, setSystemStorageLimit] = useState('256');
  const [systemRootDomain, setSystemRootDomain] = useState('subly.my.id');
  const [systemStorageWarningThreshold, setSystemStorageWarningThreshold] = useState('80');
  const [systemSupportSla, setSystemSupportSla] = useState('< 10 Menit');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Testimonials Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'featured' | 'rejected'>('approved');
  const [reviewAdminNote, setReviewAdminNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
    fetchSettings();
    fetchAdminTestimonials();
  }, [fetchAdminUsers, fetchSettings, fetchAdminTestimonials]);

  useEffect(() => {
    if (settings) { 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMerchantName(settings.qris_merchant_name || 'SUBLY HOSTING INDONESIA');
      setQrisNmid(settings.qris_nmid || 'ID102027381928');
      setSystemStorageLimit(settings.system_storage_limit_gb || '256');
      setSystemRootDomain(settings.system_root_domain || 'subly.my.id');
      setSystemStorageWarningThreshold(settings.system_storage_warning_threshold || '80');
      setSystemSupportSla(settings.system_support_sla || '< 10 Menit');
      setAdminNotificationEmail(settings.admin_notification_email || 'admin@subly.my.id');
    }
  }, [settings]);

  // Plans Actions
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;

    setIsSubmittingPlan(true);
    try {
      await addPlan(newPlanName, Number(newPlanPrice), newPlanType, Number(newPlanStorage));
      setNewPlanName('');
      setPlanModalOpen(false);
      addToast({
        type: 'success',
        title: 'Paket Dibuat',
        message: `Paket hosting ${newPlanName} berhasil didaftarkan.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal mendaftarkan paket baru di database.',
      });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      await deletePlan(id);
      addToast({
        type: 'success',
        title: 'Paket Dihapus',
        message: 'Paket hosting berhasil dihapus.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menghapus paket hosting.',
      });
    }
  };

  // Vouchers Actions
  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode) return;

    setIsSubmittingVoucher(true);
    try {
      await addVoucher(newVoucherCode, Number(newVoucherDiscount), 100);
      setNewVoucherCode('');
      setVoucherModalOpen(false);
      addToast({
        type: 'success',
        title: 'Voucher Aktif',
        message: `Voucher diskon ${newVoucherCode} sukses dirilis.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menyimpan voucher di database.',
      });
    } finally {
      setIsSubmittingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    try {
      await deleteVoucher(id);
      addToast({
        type: 'success',
        title: 'Voucher Dihapus',
        message: 'Kode diskon dinonaktifkan.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menghapus voucher.',
      });
    }
  };

  // User Storage Limit Overrides
  const handleSaveStorageOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTargetId) return;

    setIsSubmittingOverride(true);
    try {
      const client = adminUsers.find(u => u.id === overrideTargetId);
      const activeSub = client?.subdomains?.[0];
      if (!activeSub) {
        addToast({
          type: 'error',
          title: 'Tidak Ada Subdomain',
          message: 'Klien tidak memiliki subdomain aktif untuk di-override.',
        });
        return;
      }

      await updateSubdomainStorageOverride(activeSub.id, Number(overrideLimitSize));
      addToast({
        type: 'success',
        title: 'Kapasitas Di-override',
        message: `Batas storage untuk subdomain ${activeSub.name}.subly.host sukses diubah menjadi ${overrideLimitSize} MB.`,
      });
      setOverrideUserModal(false);
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui batas storage.',
      });
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const [isSavingLimit, setIsSavingLimit] = useState(false);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSetting('qris_merchant_name', merchantName);
      await updateSetting('qris_nmid', qrisNmid, qrisImageFile || undefined);

      addToast({
        type: 'success',
        title: 'Pengaturan Disimpan',
        message: 'Konfigurasi QRIS statis sistem berhasil diperbarui.',
      });
      setQrisImageFile(null);
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui pengaturan sistem.',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveStorageLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLimit(true);
    try {
      await updateSetting('system_storage_limit_gb', systemStorageLimit);
      await updateSetting('system_root_domain', systemRootDomain);
      await updateSetting('system_storage_warning_threshold', systemStorageWarningThreshold);
      await updateSetting('system_support_sla', systemSupportSla);
      await updateSetting('admin_notification_email', adminNotificationEmail);
      addToast({
        type: 'success',
        title: 'Pengaturan Disimpan',
        message: 'Konfigurasi parameter sistem global berhasil diperbarui.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui parameter sistem global.',
      });
    } finally {
      setIsSavingLimit(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetId) return;

    setIsSubmittingReview(true);
    try {
      await updateTestimonialStatus(reviewTargetId, reviewStatus, reviewAdminNote);
      addToast({
        type: 'success',
        title: 'Review Disimpan',
        message: 'Status testimonial berhasil diperbarui.',
      });
      setReviewModalOpen(false);
      setReviewAdminNote('');
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui status testimonial.',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus testimonial ini?')) return;
    try {
      await deleteTestimonial(id);
      addToast({
        type: 'success',
        title: 'Dihapus',
        message: 'Testimonial berhasil dihapus.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menghapus testimonial.',
      });
    }
  };

  const UPLOADS_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const currentQrisImg = settings.qris_image_path ? `${settings.qris_image_path.startsWith('http') ? '' : UPLOADS_BASE}/${settings.qris_image_path}` : null;

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* ---------------------------------------------------- */}
      {/* Plans CRUD tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-plans' && (
        <CardPanel 
          title={t('planManager')}
          headerActions={
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setPlanModalOpen(true)}
            >
              Tambah Paket
            </Button>
          }
        >
          <div className="overflow-x-auto w-full mt-2 select-none">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Nama Paket</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Runtime</th>
                  <th className="py-2.5 pb-2 text-center font-bold">NVMe Storage</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Price</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-semibold text-text-main">
                      {plan.name}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        plan.type === 'NodeJS'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/15'
                          : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15'
                      }`}>
                        {plan.type}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono text-[10px] text-text-muted">
                      {plan.max_storage_mb} MB
                    </td>
                    <td className="py-3 text-center font-bold text-text-main font-mono">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right pr-6">
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                        title="Hapus Paket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ---------------------------------------------------- */}
      {/* Vouchers CRUD tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-vouchers' && (
        <CardPanel 
          title={t('voucherManager')}
          headerActions={
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setVoucherModalOpen(true)}
            >
              Tambah Voucher
            </Button>
          }
        >
          <div className="overflow-x-auto w-full mt-2 select-none">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Kode Voucher</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Diskon</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Maks Penggunaan</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Status</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {vouchers.map((vc) => (
                  <tr key={vc.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-primary">
                      {vc.code}
                    </td>
                    <td className="py-3 text-center text-text-main font-bold">
                      {vc.discount_percent}%
                    </td>
                    <td className="py-3 text-center font-mono text-[10px] text-text-muted">
                      {vc.max_uses}
                    </td>
                    <td className="py-3 text-center">
                      <Badge 
                        status={vc.is_active ? 'success' : 'inactive'} 
                        label={vc.is_active ? 'Aktif' : 'Expired'} 
                      />
                    </td>
                    <td className="py-3 text-right pr-6">
                      <button
                        onClick={() => handleDeleteVoucher(vc.id)}
                        className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ---------------------------------------------------- */}
      {/* Users Manager tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-users' && (
        <CardPanel title={t('userManager')}>
          <div className="overflow-x-auto w-full mt-2 overflow-y-scroll max-h-[calc(100vh-200px)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest select-none">
                  <th className="py-2.5 pb-2 font-bold">Nama Klien</th>
                  <th className="py-2.5 pb-2 font-bold">Email</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Subdomain Aktif</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Verifikasi</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Override Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {adminUsers.map((client) => {
                  const activeSub = client.subdomains?.[0];
                  return (
                    <tr key={client.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 font-semibold text-text-main">
                        {client.name}
                      </td>
                      <td className="py-3 text-text-muted select-all">
                        {client.email}
                      </td>
                      <td className="py-3 text-center font-mono text-[10px] text-text-main">
                        {activeSub ? `${activeSub.name}.subly.host` : 'None'}
                      </td>
                      <td className="py-3 text-center select-none">
                        <Badge 
                          status={client.emailVerifiedAt ? 'success' : 'inactive'} 
                          label={client.emailVerifiedAt ? 'Verified' : 'Unverified'} 
                        />
                      </td>
                      <td className="py-3 text-right pr-6 select-none">
                        <Button 
                          variant="outline" 
                          size="sm"
                          icon={<HardDrive className="h-3.5 w-3.5" />}
                          disabled={!activeSub}
                          onClick={() => {
                            setOverrideTargetId(client.id);
                            setOverrideUserModal(true);
                          }}
                        >
                          Adjust Storage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ---------------------------------------------------- */}
      {/* Global Settings tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          <CardPanel title="Pengaturan QRIS Statis Sistem">
            <form onSubmit={handleSaveSettings} className="space-y-4 mt-2 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Merchant Name</label>
                <input 
                  type="text" 
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                  required
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">NMID QRIS</label>
                <input 
                  type="text" 
                  value={qrisNmid}
                  onChange={(e) => setQrisNmid(e.target.value)}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none" 
                  required
                />
              </div>

              {/* Two Column Grid for QRIS Image display & Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-main/50">
                {/* Left Column: Current QRIS display */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">Foto QRIS Aktif Saat Ini</span>
                  <div className="p-3 bg-white border border-border-main rounded-2xl w-full h-36 flex items-center justify-center overflow-hidden shadow-xs">
                    {currentQrisImg ? (
                      <img src={currentQrisImg} alt="Active QRIS" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-text-muted italic">Belum ada QRIS aktif</span>
                    )}
                  </div>
                </div>

                {/* Right Column: Upload Button/Field */}
                <div className="space-y-2 text-left flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block mb-2">Upload/Ganti QRIS (Opsional)</label>
                    <div className="border border-dashed border-border-main hover:border-amber-500/40 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-36 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQrisImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="qris-image-input"
                      />
                      <label htmlFor="qris-image-input" className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full justify-center">
                        <Upload className="h-6 w-6 text-text-muted" />
                        <span className="text-[10px] font-bold text-text-main block truncate max-w-full px-2">
                          {qrisImageFile ? qrisImageFile.name : 'Upload file gambar QRIS'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="primary" isLoading={isSavingSettings}>Simpan QRIS Config</Button>
            </form>
          </CardPanel>

          <CardPanel title="Parameter Sistem & Storage Global">
            <form onSubmit={handleSaveStorageLimit} className="space-y-4 mt-2 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Total Kapasitas NVMe Server (GB)</label>
                <input 
                  type="number" 
                  value={systemStorageLimit}
                  onChange={(e) => setSystemStorageLimit(e.target.value)}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                  required
                  min="1"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Root Domain Utama (cPanel)</label>
                <input 
                  type="text" 
                  value={systemRootDomain}
                  onChange={(e) => setSystemRootDomain(e.target.value)}
                  placeholder="subly.my.id"
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Batas Warning Storage Klien (%)</label>
                <input 
                  type="number" 
                  value={systemStorageWarningThreshold}
                  onChange={(e) => setSystemStorageWarningThreshold(e.target.value)}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                  required
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">SLA Waktu Respon Live Chat (Klien)</label>
                <input 
                  type="text" 
                  value={systemSupportSla}
                  onChange={(e) => setSystemSupportSla(e.target.value)}
                  placeholder="< 10 Menit"
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Email Notifikasi Admin (Penerimaan Bukti Bayar)</label>
                <input 
                  type="email" 
                  value={adminNotificationEmail}
                  onChange={(e) => setAdminNotificationEmail(e.target.value)}
                  placeholder="admin@subly.my.id"
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                  required
                />
              </div>

              <Button type="submit" variant="primary" isLoading={isSavingLimit}>Simpan Parameter Sistem</Button>
            </form>
          </CardPanel>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Testimonials Review tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-testimonials' && (
        <CardPanel title={t('adminTestimonials')}>
          <div className="overflow-x-auto w-full mt-2 select-none">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Klien</th>
                  <th className="py-2.5 pb-2 font-bold">Subdomain</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Rating</th>
                  <th className="py-2.5 pb-2 font-bold">Feedback</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Status</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {adminTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-semibold text-text-main">
                      <div className="flex flex-col">
                        <span>{t.user?.name}</span>
                        <span className="text-[10px] text-text-muted font-normal">{t.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3 text-text-muted font-mono text-[10px]">
                      {t.subdomain ? `${t.subdomain.name}.subly.host` : 'None'}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted/30'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 max-w-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-text-main line-clamp-1">{t.title}</span>
                        <span className="text-[10px] text-text-muted line-clamp-2 leading-relaxed">
                          "{t.content}"
                        </span>
                        {t.admin_note && (
                          <span className="text-[9px] font-medium text-brand-primary italic mt-1">
                            Note: "{t.admin_note}"
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        status={
                          t.status === 'approved' || t.status === 'featured'
                            ? 'success'
                            : t.status === 'rejected'
                            ? 'inactive'
                            : 'pending'
                        }
                        label={t.status.toUpperCase()}
                      />
                    </td>
                    <td className="py-3 text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setReviewTargetId(t.id);
                            setReviewStatus(t.status);
                            setReviewAdminNote(t.admin_note || '');
                            setReviewModalOpen(true);
                          }}
                          className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex"
                          title="Review Testimonial"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Hapus Testimonial"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* Add Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Daftarkan Paket Hosting Baru"
      >
        <form onSubmit={handleAddPlan} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Nama Paket</label>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Subly PHP Enterprise"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Runtime Type</label>
              <select
                value={newPlanType}
                onChange={(e) => setNewPlanType(e.target.value as 'PHP' | 'NodeJS')}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main outline-none"
              >
                <option value="PHP">PHP & Laravel</option>
                <option value="NodeJS">Node.js Runtimes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Harga Bulanan (Rp)</label>
              <input
                type="number"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(e.target.value)}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">NVMe Storage Limit (MB)</label>
            <input
              type="number"
              value={newPlanStorage}
              onChange={(e) => setNewPlanStorage(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setPlanModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingPlan}>
              Simpan Paket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Voucher Modal */}
      <Modal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        title="Buat Kode Voucher Diskon"
      >
        <form onSubmit={handleAddVoucher} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Kode Diskon</label>
            <input
              type="text"
              value={newVoucherCode}
              onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
              placeholder="SUBLYSUPER"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Persentase Diskon (%)</label>
            <input
              type="number"
              value={newVoucherDiscount}
              onChange={(e) => setNewVoucherDiscount(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setVoucherModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingVoucher}>
              Aktifkan Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Override User Storage Limit Modal */}
      <Modal
        isOpen={overrideUserModal}
        onClose={() => setOverrideUserModal(false)}
        title={`Adjust NVMe Storage Space: Client #${overrideTargetId}`}
        description="Override batas disk storage default pada virtual host klien secara manual."
      >
        <form onSubmit={handleSaveStorageOverride} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Batas Disk Baru (MB)</label>
            <input
              type="number"
              value={overrideLimitSize}
              onChange={(e) => setOverrideLimitSize(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setOverrideUserModal(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingOverride}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Testimonial Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Testimonial & Feedback Klien"
        description="Setujui atau tampilkan testimonial ini di landing page utama."
      >
        <form onSubmit={handleSaveReview} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Status Testimonial</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as 'pending' | 'approved' | 'featured' | 'rejected')}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main outline-none"
            >
              <option value="pending">Pending (Menunggu Review)</option>
              <option value="approved">Approved (Disetujui)</option>
              <option value="featured">Featured (Tampilkan Utama di Landing Page)</option>
              <option value="rejected">Rejected (Ditolak)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Catatan Admin (Opsional)</label>
            <textarea
              rows={3}
              value={reviewAdminNote}
              onChange={(e) => setReviewAdminNote(e.target.value)}
              placeholder="Contoh: Terimakasih atas review jujurnya!"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setReviewModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingReview}>
              Simpan Review
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default AdminCRUDs;
