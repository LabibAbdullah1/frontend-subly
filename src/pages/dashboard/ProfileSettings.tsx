// src/pages/dashboard/ProfileSettings.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().optional().or(z.literal('')),
});

export const ProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { user, updateProfile, deleteAccount } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteAccountClick = () => {
    setDeleteModalOpen(true);
  };

  const handleExecuteDeleteAccount = async () => {
    setDeleteModalOpen(false);
    setLoading(true);
    try {
      await deleteAccount();
      addToast({
        type: 'success',
        title: 'Akun Dihapus',
        message: 'Akun Anda berhasil dihapus secara permanen dari sistem.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memproses penghapusan akun Anda.',
      });
    } finally {
      setLoading(false);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await updateProfile(data.name, data.email);
      addToast({
        type: 'success',
        title: 'Profil Diperbarui',
        message: 'Pengaturan informasi profil cPanel berhasil disimpan.',
      });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Ada kesalahan server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('profile')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Perbarui data diri, email, dan kata sandi akun keamanan Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Edit (Span 2) */}
        <div className="lg:col-span-2">
          <CardPanel title="Identitas Keanggotaan cPanel">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              
              {/* Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                  {t('name')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message as string}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                  {t('email')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('email')}
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message as string}</p>}
              </div>

              {/* Password change */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                  Ganti Kata Sandi (Kosongkan jika tidak ingin diubah)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                  />
                  <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-main/50">
                <Button type="submit" variant="primary" isLoading={loading}>
                  {t('save')}
                </Button>
              </div>
            </form>
          </CardPanel>
        </div>

        {/* Right Column: Security overview */}
        <div className="lg:col-span-1 space-y-6">
          <CardPanel title="Status Keamanan">
            <div className="space-y-4 mt-2 text-xs select-none">
              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <p className="font-bold">E-mail Terverifikasi:</p>
                  <p className="mt-0.5 text-text-muted">Akun Anda berstatus terverifikasi penuh dan diizinkan mengalokasikan storage SSD NVMe cPanel.</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                <span className="text-text-muted font-semibold">Tipe Akun</span>
                <span className="text-brand-primary font-bold">{user?.role || 'Customer'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                <span className="text-text-muted font-semibold">Dibuat Pada</span>
                <span className="text-text-main font-bold">01 Juni 2026</span>
              </div>
            </div>
          </CardPanel>

          <CardPanel title="Zona Bahaya (Danger Zone)">
            <div className="space-y-4 mt-2 text-xs">
              <p className="text-[10px] text-text-muted leading-relaxed">
                Penghapusan akun bersifat permanen. Semua data Anda akan dihapus secara menyeluruh dari sistem dan tidak dapat dipulihkan kembali.
              </p>
              <Button
                type="button"
                onClick={handleDeleteAccountClick}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30 text-[10px] font-bold py-2 rounded-xl transition-all"
                isLoading={loading}
              >
                Hapus Akun Permanen
              </Button>
            </div>
          </CardPanel>
        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Akun Secara Permanen"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-red-500/5 dark:bg-red-500/2 border border-red-500/10 text-red-500 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-text-muted">
              <p className="font-bold text-red-500 mb-0.5">PERINGATAN KERAS!</p>
              <p>Apakah Anda yakin ingin menghapus akun Anda secara permanen? Seluruh subdomain, database MySQL, riwayat pembayaran, dan log deployment Anda akan dihapus selamanya dari sistem dan tidak dapat dipulihkan.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600 text-white font-bold transition-all border-none"
              onClick={handleExecuteDeleteAccount}
              isLoading={loading}
            >
              Hapus Akun Selamanya
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default ProfileSettings;
