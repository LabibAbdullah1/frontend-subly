// src/pages/admin/AdminCRUDs.tsx
// ─── Orchestrator: renders the correct tab based on activeTab ────────────────
import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

// ─── Tab Components ───────────────────────────────────────────────────────────
import { AdminPlansTab }        from './tabs/AdminPlansTab';
import { AdminVouchersTab }     from './tabs/AdminVouchersTab';
import { AdminUsersTab }        from './tabs/AdminUsersTab';
import { AdminSettingsTab }     from './tabs/AdminSettingsTab';
import { AdminTestimonialsTab } from './tabs/AdminTestimonialsTab';

// ─── Types ────────────────────────────────────────────────────────────────────
type DeleteTargetType = 'plan' | 'voucher' | 'user' | 'testimonial' | null;

export const AdminCRUDs: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { activeTab } = useSystemStore();

  const {
    fetchAdminUsers,
    fetchSettings,
    fetchAdminTestimonials,
    deletePlan,
    deleteVoucher,
    deleteUser,
    deleteTestimonial,
    updateUser,
  } = useDataStore();

  // Fetch on mount
  useEffect(() => {
    fetchAdminUsers();
    fetchSettings();
    fetchAdminTestimonials();
  }, [fetchAdminUsers, fetchSettings, fetchAdminTestimonials]);

  // ─── Global Delete Confirmation ──────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen]   = useState(false);
  const [deleteTargetId, setDeleteTargetId]         = useState<number | null>(null);
  const [deleteTargetType, setDeleteTargetType]     = useState<DeleteTargetType>(null);
  const [deleteModalTitle, setDeleteModalTitle]     = useState('');
  const [deleteModalMessage, setDeleteModalMessage] = useState('');
  const [isConfirmDeleting, setIsConfirmDeleting]   = useState(false);

  const openDeleteConfirm = (
    id: number,
    type: NonNullable<DeleteTargetType>,
    title: string,
    message: string
  ) => {
    setDeleteTargetId(id);
    setDeleteTargetType(type);
    setDeleteModalTitle(title);
    setDeleteModalMessage(message);
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTargetId || !deleteTargetType) return;
    setIsConfirmDeleting(true);
    try {
      const toastMap: Record<NonNullable<DeleteTargetType>, { title: string; message: string }> = {
        plan:         { title: 'Paket Dihapus',       message: 'Paket hosting berhasil dihapus.' },
        voucher:      { title: 'Voucher Dihapus',     message: 'Kode diskon dinonaktifkan.' },
        user:         { title: 'User Dihapus',        message: 'User berhasil dihapus secara permanen.' },
        testimonial:  { title: 'Testimonial Dihapus', message: 'Testimonial berhasil dihapus.' },
      };

      if (deleteTargetType === 'plan')        await deletePlan(deleteTargetId);
      else if (deleteTargetType === 'voucher') await deleteVoucher(deleteTargetId);
      else if (deleteTargetType === 'user')    await deleteUser(deleteTargetId);
      else if (deleteTargetType === 'testimonial') await deleteTestimonial(deleteTargetId);

      addToast({ type: 'success', ...toastMap[deleteTargetType] });
      setDeleteConfirmOpen(false);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal menghapus data.' });
    } finally {
      setIsConfirmDeleting(false);
      setDeleteTargetId(null);
      setDeleteTargetType(null);
    }
  };

  // ─── Edit User Modal ─────────────────────────────────────────────────────
  const [editUserOpen, setEditUserOpen]       = useState(false);
  const [editUserId, setEditUserId]           = useState<number | null>(null);
  const [editUserName, setEditUserName]       = useState('');
  const [editUserEmail, setEditUserEmail]     = useState('');
  const [editUserRole, setEditUserRole]       = useState<'Admin' | 'Client'>('Client');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [isEditingUser, setIsEditingUser]     = useState(false);

  const handleEditUserClick = (user: any) => {
    setEditUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role as 'Admin' | 'Client');
    setEditUserPassword('');
    setEditUserOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId || !editUserName || !editUserEmail) return;
    setIsEditingUser(true);
    try {
      await updateUser(editUserId, editUserName, editUserEmail, editUserRole, editUserPassword || undefined);
      setEditUserOpen(false);
      addToast({ type: 'success', title: 'User Diperbarui', message: `User ${editUserName} berhasil diperbarui.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal memperbarui data user.' });
    } finally { setIsEditingUser(false); }
  };

  const roleOptions = [
    { value: 'Client', label: 'Client (Pelanggan)' },
    { value: 'Admin',  label: 'Admin (Sistem)' },
  ];

  // ─── Tab Handlers ─────────────────────────────────────────────────────────
  const handleDeletePlan = (id: number) =>
    openDeleteConfirm(id, 'plan', 'Konfirmasi Hapus Paket',
      'Apakah Anda yakin ingin menghapus paket hosting ini secara permanen?');

  const handleDeleteVoucher = (id: number) =>
    openDeleteConfirm(id, 'voucher', 'Konfirmasi Hapus Voucher',
      'Apakah Anda yakin ingin menghapus voucher ini secara permanen? Kode diskon ini tidak akan bisa digunakan lagi.');

  const handleDeleteUser = (id: number) =>
    openDeleteConfirm(id, 'user', 'Konfirmasi Hapus Pengguna',
      'Apakah Anda yakin ingin menghapus user ini secara permanen? PERINGATAN: Semua data relasi seperti subdomain, database cPanel, dan riwayat pembayaran akan ikut terhapus secara permanen.');

  const handleDeleteTestimonial = (id: number) =>
    openDeleteConfirm(id, 'testimonial', 'Konfirmasi Hapus Testimonial',
      'Apakah Anda yakin ingin menghapus testimonial ini secara permanen?');

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full text-left">

      {activeTab === 'admin-plans' && (
        <AdminPlansTab onDeletePlan={handleDeletePlan} />
      )}

      {activeTab === 'admin-vouchers' && (
        <AdminVouchersTab onDeleteVoucher={handleDeleteVoucher} />
      )}

      {activeTab === 'admin-users' && (
        <AdminUsersTab
          onEditUser={handleEditUserClick}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === 'admin-settings' && (
        <AdminSettingsTab />
      )}

      {activeTab === 'admin-testimonials' && (
        <AdminTestimonialsTab onDeleteTestimonial={handleDeleteTestimonial} />
      )}

      {/* ─── Edit User Modal ────────────────────────────────────────────── */}
      <Modal isOpen={editUserOpen} onClose={() => setEditUserOpen(false)} title="Edit User Akun">
        <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Nama Lengkap</label>
            <input type="text" value={editUserName} onChange={(e) => setEditUserName(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Email</label>
            <input type="email" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Role Hak Akses</label>
            <Select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value as 'Admin' | 'Client')} options={roleOptions} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Password Baru (Kosongkan jika tidak ingin ganti)</label>
            <input type="password" value={editUserPassword} onChange={(e) => setEditUserPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setEditUserOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" isLoading={isEditingUser}>Perbarui User</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Global Delete Confirmation Modal ───────────────────────────── */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title={deleteModalTitle} size="sm">
        <div className="space-y-4 text-left">
          <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-text-muted">
              <p className="font-bold text-red-500 mb-0.5">Tindakan Tidak Dapat Dibatalkan!</p>
              <p>{deleteModalMessage}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
            <Button
              type="button" variant="primary"
              className="bg-red-500 hover:bg-red-600 text-white font-bold transition-all border-none"
              onClick={handleExecuteDelete} isLoading={isConfirmDeleting}
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
