// src/pages/admin/AdminCRUDs.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, HardDrive, Upload } from 'lucide-react';
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
    updateSetting
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
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
    fetchSettings();
  }, [fetchAdminUsers, fetchSettings]);

  useEffect(() => {
    if (settings) {
      setMerchantName(settings.qris_merchant_name || 'SUBLY HOSTING INDONESIA');
      setQrisNmid(settings.qris_nmid || 'ID102027381928');
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
          <div className="overflow-x-auto w-full mt-2">
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

              {/* QRIS Image file upload */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Foto/Gambar QRIS Baru (Opsional)</label>
                <div className="border border-dashed border-border-main hover:border-amber-500/40 rounded-xl p-4 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setQrisImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="qris-image-input"
                  />
                  <label htmlFor="qris-image-input" className="cursor-pointer flex flex-col items-center gap-1.5">
                    <Upload className="h-6 w-6 text-text-muted" />
                    <span className="text-[10px] font-bold text-text-main">
                      {qrisImageFile ? qrisImageFile.name : 'Upload file gambar QRIS'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Current QRIS display if configured */}
              {currentQrisImg && (
                <div className="pt-2 border-t border-border-main/50 space-y-2">
                  <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">Foto QRIS Aktif Saat Ini</span>
                  <div className="p-3 bg-white border border-border-main rounded-2xl w-32 h-32 flex items-center justify-center overflow-hidden shadow-xs">
                    <img src={currentQrisImg} alt="Active QRIS" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <Button type="submit" variant="primary" isLoading={isSavingSettings}>Simpan QRIS Config</Button>
            </form>
          </CardPanel>
        </div>
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

    </div>
  );
};
export default AdminCRUDs;
