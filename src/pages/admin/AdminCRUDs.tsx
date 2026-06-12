// src/pages/admin/AdminCRUDs.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Star, MessageSquare, Edit, ShieldAlert } from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

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
    updatePlan,
    deletePlan,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    updateUser,
    deleteUser,
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
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Edit Plan states
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanType, setEditPlanType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [editPlanStorage, setEditPlanStorage] = useState('');
  const [editPlanDescription, setEditPlanDescription] = useState('');
  const [isSubmittingEditPlan, setIsSubmittingEditPlan] = useState(false);

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('20');
  const [isSubmittingVoucher, setIsSubmittingVoucher] = useState(false);

  // Edit Voucher states
  const [editVoucherModalOpen, setEditVoucherModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [editVoucherCode, setEditVoucherCode] = useState('');
  const [editVoucherDiscount, setEditVoucherDiscount] = useState('');
  const [editVoucherMaxUses, setEditVoucherMaxUses] = useState('');
  const [isSubmittingEditVoucher, setIsSubmittingEditVoucher] = useState(false);

  // Edit User states
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'Admin' | 'Client'>('Client');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [isSubmittingEditUser, setIsSubmittingEditUser] = useState(false);

  // Global Delete Confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<'plan' | 'voucher' | 'user' | 'testimonial' | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalMessage, setDeleteModalMessage] = useState('');
  const [isConfirmDeleting, setIsConfirmDeleting] = useState(false);



  // Settings local states
  const [merchantName, setMerchantName] = useState('');
  const [qrisImageFile, setQrisImageFile] = useState<File | null>(null);
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
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
    if (!qrisImageFile) {
      setQrisPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(qrisImageFile);
    setQrisPreviewUrl(url);
    setImageError(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [qrisImageFile]);

  useEffect(() => {
    fetchAdminUsers();
    fetchSettings();
    fetchAdminTestimonials();
  }, [fetchAdminUsers, fetchSettings, fetchAdminTestimonials]);

  useEffect(() => {
    if (settings) { 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMerchantName(settings.qris_merchant_name || 'SUBLY HOSTING INDONESIA');
      setSystemStorageLimit(settings.system_storage_limit_gb || '256');
      setSystemRootDomain(settings.system_root_domain || 'subly.my.id');
      setSystemStorageWarningThreshold(settings.system_storage_warning_threshold || '80');
      setSystemSupportSla(settings.system_support_sla || '< 10 Menit');
      setAdminNotificationEmail(settings.admin_notification_email || 'admin@subly.my.id');
      setImageError(false);
    }
  }, [settings]);

  // Plans Actions
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;

    setIsSubmittingPlan(true);
    try {
      await addPlan(newPlanName, Number(newPlanPrice), newPlanType, Number(newPlanStorage), newPlanDescription);
      setNewPlanName('');
      setNewPlanDescription('');
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

  const handleDeletePlan = (id: number) => {
    setDeleteTargetId(id);
    setDeleteTargetType('plan');
    setDeleteModalTitle('Konfirmasi Hapus Paket');
    setDeleteModalMessage('Apakah Anda yakin ingin menghapus paket hosting ini secara permanen?');
    setDeleteConfirmOpen(true);
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

  const handleDeleteVoucher = (id: number) => {
    setDeleteTargetId(id);
    setDeleteTargetType('voucher');
    setDeleteModalTitle('Konfirmasi Hapus Voucher');
    setDeleteModalMessage('Apakah Anda yakin ingin menghapus voucher ini secara permanen? Kode diskon ini tidak akan bisa digunakan lagi.');
    setDeleteConfirmOpen(true);
  };

  // Plan Edit Actions
  const handleEditPlanClick = (plan: any) => {
    setSelectedPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price.toString());
    setEditPlanType(plan.type);
    setEditPlanStorage(plan.max_storage_mb.toString());
    setEditPlanDescription(plan.description || '');
    setEditPlanModalOpen(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !editPlanName) return;

    setIsSubmittingEditPlan(true);
    try {
      await updatePlan(
        selectedPlanId,
        editPlanName,
        Number(editPlanPrice),
        editPlanType,
        Number(editPlanStorage),
        editPlanDescription
      );
      setEditPlanModalOpen(false);
      addToast({
        type: 'success',
        title: 'Paket Diperbarui',
        message: `Paket hosting ${editPlanName} berhasil diperbarui.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui paket hosting.',
      });
    } finally {
      setIsSubmittingEditPlan(false);
    }
  };

  // Voucher Edit Actions
  const handleEditVoucherClick = (vc: any) => {
    setSelectedVoucherId(vc.id);
    setEditVoucherCode(vc.code);
    setEditVoucherDiscount(vc.discount_percent.toString());
    setEditVoucherMaxUses(vc.max_uses.toString());
    setEditVoucherModalOpen(true);
  };

  const handleUpdateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucherId || !editVoucherCode) return;

    setIsSubmittingEditVoucher(true);
    try {
      await updateVoucher(
        selectedVoucherId,
        editVoucherCode,
        Number(editVoucherDiscount),
        Number(editVoucherMaxUses)
      );
      setEditVoucherModalOpen(false);
      addToast({
        type: 'success',
        title: 'Voucher Diperbarui',
        message: `Voucher ${editVoucherCode} berhasil diperbarui.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui voucher.',
      });
    } finally {
      setIsSubmittingEditVoucher(false);
    }
  };

  // User Edit Actions
  const handleEditUserClick = (user: any) => {
    setSelectedUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role as 'Admin' | 'Client');
    setEditUserPassword('');
    setEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !editUserName || !editUserEmail) return;

    setIsSubmittingEditUser(true);
    try {
      await updateUser(
        selectedUserId,
        editUserName,
        editUserEmail,
        editUserRole,
        editUserPassword || undefined
      );
      setEditUserModalOpen(false);
      addToast({
        type: 'success',
        title: 'User Diperbarui',
        message: `User ${editUserName} berhasil diperbarui.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: err.message || 'Gagal memperbarui data user.',
      });
    } finally {
      setIsSubmittingEditUser(false);
    }
  };

  const handleDeleteUser = (id: number) => {
    setDeleteTargetId(id);
    setDeleteTargetType('user');
    setDeleteModalTitle('Konfirmasi Hapus Pengguna');
    setDeleteModalMessage('Apakah Anda yakin ingin menghapus user ini secara permanen? PERINGATAN: Semua data relasi seperti subdomain, database cPanel, dan riwayat pembayaran akan ikut terhapus secara permanen.');
    setDeleteConfirmOpen(true);
  };



  const [isSavingLimit, setIsSavingLimit] = useState(false);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSetting({
        qris_merchant_name: merchantName,
      }, qrisImageFile || undefined);

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

  const handleDeleteTestimonial = (id: number) => {
    setDeleteTargetId(id);
    setDeleteTargetType('testimonial');
    setDeleteModalTitle('Konfirmasi Hapus Testimonial');
    setDeleteModalMessage('Apakah Anda yakin ingin menghapus testimonial ini secara permanen? Ulasan pelanggan ini akan dihapus dari data feedback admin.');
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTargetId || !deleteTargetType) return;
    setIsConfirmDeleting(true);
    try {
      if (deleteTargetType === 'plan') {
        await deletePlan(deleteTargetId);
        addToast({
          type: 'success',
          title: 'Paket Dihapus',
          message: 'Paket hosting berhasil dihapus.',
        });
      } else if (deleteTargetType === 'voucher') {
        await deleteVoucher(deleteTargetId);
        addToast({
          type: 'success',
          title: 'Voucher Dihapus',
          message: 'Kode diskon dinonaktifkan.',
        });
      } else if (deleteTargetType === 'user') {
        await deleteUser(deleteTargetId);
        addToast({
          type: 'success',
          title: 'User Dihapus',
          message: 'User berhasil dihapus secara permanen.',
        });
      } else if (deleteTargetType === 'testimonial') {
        await deleteTestimonial(deleteTargetId);
        addToast({
          type: 'success',
          title: 'Testimonial Dihapus',
          message: 'Testimonial berhasil dihapus.',
        });
      }
      setDeleteConfirmOpen(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: err.message || 'Gagal menghapus data.',
      });
    } finally {
      setIsConfirmDeleting(false);
      setDeleteTargetId(null);
      setDeleteTargetType(null);
    }
  };

  const UPLOADS_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
  const currentQrisImg = settings.qris_image_path ? `${settings.qris_image_path.startsWith('http') ? '' : UPLOADS_BASE}/${settings.qris_image_path}` : null;
  const hasQrisImage = !!qrisPreviewUrl || (!!currentQrisImg && !imageError);

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
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 px-4 font-bold">Nama Paket</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Runtime</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">NVMe Storage</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Price</th>
                  <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-main">
                      <div className="flex flex-col">
                        <span>{plan.name}</span>
                        {plan.description && (
                          <span className="text-[10px] text-text-muted font-normal mt-0.5 max-w-xs truncate">
                            {plan.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        plan.type === 'NodeJS'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/15'
                          : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15'
                      }`}>
                        {plan.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">
                      {plan.max_storage_mb} MB
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-text-main font-mono">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditPlanClick(plan)}
                          className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex"
                          title="Edit Paket"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Hapus Paket"
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
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 px-4 font-bold">Kode Voucher</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Diskon</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Maks Penggunaan</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Status</th>
                  <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {vouchers.map((vc) => (
                  <tr key={vc.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">
                      {vc.code}
                    </td>
                    <td className="py-3 px-4 text-center text-text-main font-bold">
                      {vc.discount_percent}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">
                      {vc.max_uses}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        status={vc.is_active ? 'success' : 'inactive'} 
                        label={vc.is_active ? 'Aktif' : 'Expired'} 
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditVoucherClick(vc)}
                          className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex"
                          title="Edit Voucher"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(vc.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Hapus Voucher"
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

      {/* ---------------------------------------------------- */}
      {/* Users Manager tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-users' && (
        <CardPanel title={t('userManager')}>
          <div className="overflow-x-auto w-full mt-2 overflow-y-scroll max-h-[calc(100vh-200px)]">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest select-none">
                  <th className="py-2.5 pb-2 px-4 font-bold">Nama Klien</th>
                  <th className="py-2.5 pb-2 px-4 font-bold">Email</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Subdomain Aktif</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Verifikasi</th>
                  <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {adminUsers.map((client) => {
                  const activeSub = client.subdomains?.[0];
                  return (
                    <tr key={client.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-main">
                        {client.name}
                      </td>
                      <td className="py-3 px-4 text-text-muted select-all">
                        {client.email}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[10px] text-text-main">
                        {activeSub ? `${activeSub.name}.subly.host` : 'None'}
                      </td>
                      <td className="py-3 px-4 text-center select-none">
                        <Badge 
                          status={client.emailVerifiedAt ? 'success' : 'inactive'} 
                          label={client.emailVerifiedAt ? 'Verified' : 'Unverified'} 
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEditUserClick(client)}
                            className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(client.id)}
                            className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                            title="Hapus User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

              {/* Two Column Grid for QRIS Image display & Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-main/50">
                {/* Left Column: Current QRIS display */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                    {qrisPreviewUrl ? 'Pratinjau QRIS Baru' : 'Foto QRIS Aktif Saat Ini'}
                  </span>
                  <div className={`bg-white border border-border-main rounded-2xl overflow-hidden shadow-xs transition-all duration-200 ${
                    hasQrisImage 
                      ? 'w-fit h-fit p-0' 
                      : 'w-full sm:w-60 min-h-[144px] flex items-center justify-center p-4 text-center'
                  }`}>
                    {qrisPreviewUrl ? (
                      <img 
                        src={qrisPreviewUrl} 
                        alt="Preview QRIS" 
                        className="block max-w-full sm:max-w-xs max-h-72 w-auto h-auto" 
                      />
                    ) : currentQrisImg && !imageError ? (
                      <img 
                        src={currentQrisImg} 
                        onError={() => setImageError(true)}
                        alt="Active QRIS" 
                        className="block max-w-full sm:max-w-xs max-h-72 w-auto h-auto" 
                      />
                    ) : (
                      <span className="text-[10px] text-text-muted italic">
                        {currentQrisImg ? 'Gambar QRIS Tidak Ditemukan di Server' : 'Belum ada QRIS aktif'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column: Upload Button/Field */}
                <div className="space-y-2 text-left flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block mb-2">Upload/Ganti QRIS (Opsional)</label>
                    <label 
                      htmlFor="qris-image-input"
                      className="block border border-dashed border-border-main hover:border-brand-primary/45 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-36 relative"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQrisImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="qris-image-input"
                      />
                      <div className="flex flex-col items-center gap-1.5 w-full h-full justify-center">
                        <Upload className="h-6 w-6 text-text-muted" />
                        <span className="text-[10px] font-bold text-text-main block truncate max-w-full px-2">
                          {qrisImageFile ? qrisImageFile.name : 'Upload file gambar QRIS'}
                        </span>
                      </div>
                    </label>
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
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 px-4 font-bold">Klien</th>
                  <th className="py-2.5 pb-2 px-4 font-bold">Subdomain</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Rating</th>
                  <th className="py-2.5 pb-2 px-4 font-bold">Feedback</th>
                  <th className="py-2.5 pb-2 px-4 text-center font-bold">Status</th>
                  <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {adminTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-main">
                      <div className="flex flex-col">
                        <span>{t.user?.name}</span>
                        <span className="text-[10px] text-text-muted font-normal">{t.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-muted font-mono text-[10px]">
                      {t.subdomain 
                        ? `${t.subdomain.name}.subly.my.id` 
                        : (() => {
                            const owner = adminUsers.find(u => u.id === t.user_id);
                            return owner?.subdomains?.[0] 
                              ? `${owner.subdomains[0].name}.subly.my.id` 
                              : 'None';
                          })()
                      }
                    </td>
                    <td className="py-3 px-4 text-center">
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
                    <td className="py-3 px-4 max-w-xs">
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
                    <td className="py-3 px-4 text-center">
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
                    <td className="py-3 px-4 text-right">
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
              <Select
                value={newPlanType}
                onChange={(e) => setNewPlanType(e.target.value as 'PHP' | 'NodeJS')}
                options={[
                  { value: 'PHP', label: 'PHP & Laravel' },
                  { value: 'NodeJS', label: 'Node.js Runtimes' }
                ]}
              />
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Deskripsi Paket (Opsional)</label>
            <textarea
              value={newPlanDescription}
              onChange={(e) => setNewPlanDescription(e.target.value)}
              placeholder="Deskripsi singkat fitur/keunggulan paket ini"
              rows={3}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none"
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
            <Select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as 'pending' | 'approved' | 'featured' | 'rejected')}
              options={[
                { value: 'pending', label: 'Pending (Menunggu Review)' },
                { value: 'approved', label: 'Approved (Disetujui)' },
                { value: 'featured', label: 'Featured (Tampilkan Utama di Landing Page)' },
                { value: 'rejected', label: 'Rejected (Ditolak)' }
              ]}
            />
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

      {/* Edit Plan Modal */}
      <Modal
        isOpen={editPlanModalOpen}
        onClose={() => setEditPlanModalOpen(false)}
        title="Edit Paket Hosting"
      >
        <form onSubmit={handleUpdatePlan} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Nama Paket</label>
            <input
              type="text"
              value={editPlanName}
              onChange={(e) => setEditPlanName(e.target.value)}
              placeholder="Subly PHP Enterprise"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Runtime Type</label>
              <Select
                value={editPlanType}
                onChange={(e) => setEditPlanType(e.target.value as 'PHP' | 'NodeJS')}
                options={[
                  { value: 'PHP', label: 'PHP & Laravel' },
                  { value: 'NodeJS', label: 'Node.js Runtimes' }
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Harga Bulanan (Rp)</label>
              <input
                type="number"
                value={editPlanPrice}
                onChange={(e) => setEditPlanPrice(e.target.value)}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">NVMe Storage Limit (MB)</label>
            <input
              type="number"
              value={editPlanStorage}
              onChange={(e) => setEditPlanStorage(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Deskripsi Paket (Opsional)</label>
            <textarea
              value={editPlanDescription}
              onChange={(e) => setEditPlanDescription(e.target.value)}
              placeholder="Deskripsi singkat fitur/keunggulan paket ini"
              rows={3}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setEditPlanModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEditPlan}>
              Perbarui Paket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Voucher Modal */}
      <Modal
        isOpen={editVoucherModalOpen}
        onClose={() => setEditVoucherModalOpen(false)}
        title="Edit Voucher Diskon"
      >
        <form onSubmit={handleUpdateVoucher} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Kode Diskon</label>
            <input
              type="text"
              value={editVoucherCode}
              onChange={(e) => setEditVoucherCode(e.target.value.toUpperCase())}
              placeholder="SUBLYSUPER"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Persentase Diskon (%)</label>
            <input
              type="number"
              value={editVoucherDiscount}
              onChange={(e) => setEditVoucherDiscount(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Batas Penggunaan</label>
            <input
              type="number"
              value={editVoucherMaxUses}
              onChange={(e) => setEditVoucherMaxUses(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setEditVoucherModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEditVoucher}>
              Perbarui Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        title="Edit User Akun"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Nama Lengkap</label>
            <input
              type="text"
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Email</label>
            <input
              type="email"
              value={editUserEmail}
              onChange={(e) => setEditUserEmail(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Role Hak Akses</label>
            <Select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value as 'Admin' | 'Client')}
              options={[
                { value: 'Client', label: 'Client (Pelanggan)' },
                { value: 'Admin', label: 'Admin (Sistem)' }
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Password Baru (Kosongkan jika tidak ingin ganti)</label>
            <input
              type="password"
              value={editUserPassword}
              onChange={(e) => setEditUserPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setEditUserModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEditUser}>
              Perbarui User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={deleteModalTitle}
        size="sm"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-red-500/5 dark:bg-red-500/2 border border-red-500/10 text-red-500 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-text-muted">
              <p className="font-bold text-red-500 mb-0.5">Tindakan Tidak Dapat Dibatalkan!</p>
              <p>{deleteModalMessage}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Batal
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600 text-white font-bold transition-all border-none"
              onClick={handleExecuteDelete}
              isLoading={isConfirmDeleting}
            >
              Hapus Secara Permanen
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default AdminCRUDs;
