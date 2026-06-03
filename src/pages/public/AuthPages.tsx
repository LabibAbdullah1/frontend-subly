// src/pages/public/AuthPages.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Mail, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';

// ----------------------------------------------------
// Validation Schemas
// ----------------------------------------------------
const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  password_confirmation: z.string().min(1, 'Konfirmasi sandi wajib diisi'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi sandi harus cocok",
  path: ["password_confirmation"],
});



// ----------------------------------------------------
// Login Page Component
// ----------------------------------------------------
export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      addToast({
        type: 'success',
        title: 'Login Sukses',
        message: `Selamat datang kembali di panel Subly!`,
      });
      // Redirect handled by main App shell role check
    } catch {
      addToast({
        type: 'error',
        title: 'Login Gagal',
        message: 'Periksa kembali email atau kata sandi Anda.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <CardPanel className="w-full max-w-md border shadow-2xl relative" title={t('loginTitle')}>
        <p className="text-[10px] text-text-muted mt-0.5 select-none text-left mb-6">{t('loginSub')}</p>

        {/* Demo instructions */}
        <div className="p-3 mb-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary flex items-start gap-2.5">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="text-[10px] text-left leading-normal font-semibold">
            <p><strong>Prototype Tip:</strong></p>
            <p>• Ketik <code className="bg-brand-primary/10 px-1 rounded">client@subly.net</code> untuk masuk sebagai Customer.</p>
            <p>• Ketik <code className="bg-brand-primary/10 px-1 rounded">admin@subly.net</code> untuk masuk sebagai Admin.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-text-muted" />
              {t('email')}
            </label>
            <input
              type="text"
              {...register('email')}
              placeholder="nama@email.com"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
            />
            {errors.email && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-text-muted" />
                {t('password')}
              </label>
              <button 
                type="button" 
                onClick={() => setActiveTab('profile')} // Just mapping
                className="text-[10px] text-brand-primary hover:underline font-bold"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
            />
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Sign In
          </Button>

          <div className="pt-2 text-center select-none">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="text-xs font-bold text-text-muted hover:text-brand-primary hover:underline"
            >
              {t('noAccount')}
            </button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
};

// ----------------------------------------------------
// Register Page Component
// ----------------------------------------------------
export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      addToast({
        type: 'success',
        title: 'Registrasi Sukses',
        message: 'Akun Anda berhasil didaftarkan. Harap verifikasi email Anda.',
      });
      // Will redirect user to verify-email view
    } catch {
      addToast({
        type: 'error',
        title: 'Registrasi Gagal',
        message: 'Email sudah terdaftar atau terdapat masalah jaringan.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <CardPanel className="w-full max-w-md border shadow-2xl relative" title={t('registerTitle')}>
        <p className="text-[10px] text-text-muted mt-0.5 select-none text-left mb-6">{t('registerSub')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-text-muted" />
              {t('name')}
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="Nama Lengkap Anda"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
            />
            {errors.name && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-text-muted" />
              {t('email')}
            </label>
            <input
              type="text"
              {...register('email')}
              placeholder="nama@email.com"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
            />
            {errors.email && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-text-muted" />
              {t('password')}
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="Minimal 8 Karakter"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
            />
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Password Confirmation field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-text-muted" />
              {t('confirmPassword')}
            </label>
            <input
              type="password"
              {...register('password_confirmation')}
              placeholder="Konfirmasi kata sandi"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
            />
            {errors.password_confirmation && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Sign Up
          </Button>

          <div className="pt-2 text-center select-none">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-xs font-bold text-text-muted hover:text-brand-primary hover:underline"
            >
              {t('hasAccount')}
            </button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
};

// ----------------------------------------------------
// Verify Email Page Component
// ----------------------------------------------------
export const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const { verifyEmail } = useAuthStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    await verifyEmail();
    addToast({
      type: 'success',
      title: 'Email Terverifikasi',
      message: 'Selamat! Akun Anda telah aktif sepenuhnya.',
    });
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 select-none">
      <CardPanel className="w-full max-w-md border shadow-2xl p-8 text-center" title={t('verifyEmailTitle')}>
        <p className="text-xs text-text-muted leading-relaxed mt-2">
          {t('verifyEmailSub')}
        </p>

        <div className="my-8 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center animate-bounce">
            <Mail className="h-8 w-8" />
          </div>
        </div>

        <Button 
          onClick={handleVerify} 
          variant="primary" 
          className="w-full"
          isLoading={loading}
        >
          {t('verifyBtn')}
        </Button>
      </CardPanel>
    </div>
  );
};
export default LoginPage;
