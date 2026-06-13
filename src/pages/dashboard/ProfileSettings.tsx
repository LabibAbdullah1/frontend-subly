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

export const ProfileSettings: React.FC = () => {
  const { t, language } = useTranslation();
  const { addToast } = useToastStore();
  const { user, updateProfile, deleteAccount } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const profileSchema = React.useMemo(() => z.object({
    name: z.string().min(3, t('validationNameMin')),
    email: z.string().min(1, t('validationEmailRequired')).email(t('validationEmailInvalid')),
    password: z.string().optional().or(z.literal('')),
  }), [t]);

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
        title: t('toastAccountDeletedTitle'),
        message: t('toastAccountDeletedMsg'),
      });
    } catch {
      addToast({
        type: 'error',
        title: t('error'),
        message: t('toastAccountDeletedError'),
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
        title: t('toastProfileUpdatedTitle'),
        message: t('toastProfileUpdatedMsg'),
      });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastProfileUpdatedError') });
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
            {t('profileSettingsSub')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Edit (Span 2) */}
        <div className="lg:col-span-2">
          <CardPanel title={t('membershipIdentityTitle')}>
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
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
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
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message as string}</p>}
              </div>

              {/* Password change */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                  {t('changePasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                  />
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
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
          <CardPanel title={t('securityStatusTitle')}>
            <div className="space-y-4 mt-2 text-xs select-none">
              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <p className="font-bold">{t('verifiedEmailTitle')}</p>
                  <p className="mt-0.5 text-text-muted">{t('verifiedEmailDesc')}</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                <span className="text-text-muted font-semibold">{t('accountTypeLabel')}</span>
                <span className="text-brand-primary font-bold">{user?.role || 'Customer'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                <span className="text-text-muted font-semibold">{t('createdAtLabel')}</span>
                <span className="text-text-main font-bold">
                  {new Date(user?.created_at || '2026-06-01').toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
          </CardPanel>

          <CardPanel title={t('dangerZoneTitle')}>
            <div className="space-y-4 mt-2 text-xs">
              <p className="text-[10px] text-text-muted leading-relaxed">
                {t('dangerZoneDesc')}
              </p>
              <Button
                type="button"
                onClick={handleDeleteAccountClick}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30 text-[10px] font-bold py-2 rounded-xl transition-all"
                isLoading={loading}
              >
                {t('deleteAccountBtn')}
              </Button>
            </div>
          </CardPanel>
        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('deleteAccountModalTitle')}
        size="sm"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-red-500/5 dark:bg-red-500/2 border border-red-500/10 text-red-500 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-text-muted">
              <p className="font-bold text-red-500 mb-0.5">{t('deleteAccountWarningTitle')}</p>
              <p>{t('deleteAccountWarningDesc')}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600 text-white font-bold transition-all border-none"
              onClick={handleExecuteDeleteAccount}
              isLoading={loading}
            >
              {t('deleteAccountPermanentlyBtn')}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default ProfileSettings;
