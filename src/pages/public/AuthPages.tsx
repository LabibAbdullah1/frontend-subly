// src/pages/public/AuthPages.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Mail, User, AlertCircle, ArrowLeft } from 'lucide-react';
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

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

const resetPasswordSchema = z.object({
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
              className="premium-input w-full"
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
                onClick={() => setActiveTab('forgot-password')}
                className="text-[10px] text-brand-primary hover:underline font-bold"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="premium-input w-full"
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
              className="premium-input w-full"
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
              className="premium-input w-full"
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
              className="premium-input w-full"
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
              className="premium-input w-full"
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
  const { verifyEmail, user } = useAuthStore();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const handleVerify = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await verifyEmail(token);
      addToast({
        type: 'success',
        title: 'Email Terverifikasi',
        message: 'Selamat! Akun Anda telah aktif sepenuhnya.',
      });
      setActiveTab('login');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Verifikasi Gagal',
        message: err.message || 'Token verifikasi tidak valid atau kedaluwarsa.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 select-none">
      <CardPanel className="w-full max-w-md border shadow-2xl p-8 text-center" title={t('verifyEmailTitle')}>
        <p className="text-xs text-text-muted leading-relaxed mt-2">
          {token 
            ? 'Tautan verifikasi ditemukan! Klik tombol di bawah untuk menyelesaikan proses verifikasi akun Anda.'
            : `${t('verifyEmailSub')} (${user?.email || 'email Anda'})`
          }
        </p>

        <div className="my-8 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center animate-bounce">
            <Mail className="h-8 w-8" />
          </div>
        </div>

        {token ? (
          <Button 
            onClick={handleVerify} 
            variant="primary" 
            className="w-full"
            isLoading={loading}
          >
            {t('verifyBtn')}
          </Button>
        ) : (
          <div className="text-xs font-semibold text-text-muted bg-border-main/20 border border-border-main/50 p-4 rounded-md">
            Menunggu verifikasi... Tautan telah dikirim. Buka tautan tersebut untuk masuk ke sistem.
          </div>
        )}
      </CardPanel>
    </div>
  );
};

// ----------------------------------------------------
// Forgot Password Page Component
// ----------------------------------------------------
export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuthStore();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSuccess(true);
      addToast({
        type: 'success',
        title: 'Email Dikirim',
        message: 'Tautan reset sandi telah dikirim ke email Anda.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Permintaan Gagal',
        message: err.message || 'Terjadi kesalahan saat meminta reset password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <CardPanel className="w-full max-w-md border shadow-2xl relative" title={t('forgotPassword')}>
        <p className="text-[10px] text-text-muted mt-0.5 select-none text-left mb-6">{t('forgotPasswordSub')}</p>

        {success ? (
          <div className="text-center py-6">
            <div className="my-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Mail className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <p className="text-xs font-semibold text-text-main mb-6">
              Instruksi pemulihan kata sandi telah dikirimkan ke email Anda. Silakan periksa kotak masuk atau spam Anda.
            </p>
            <Button
              onClick={() => setActiveTab('login')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToLogin')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-text-muted" />
                {t('email')}
              </label>
              <input
                type="text"
                {...register('email')}
                placeholder="nama@email.com"
                className="premium-input w-full"
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
              {t('sendResetLink')}
            </Button>

            <div className="pt-2 text-center select-none">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs font-bold text-text-muted hover:text-brand-primary hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backToLogin')}
              </button>
            </div>
          </form>
        )}
      </CardPanel>
    </div>
  );
};

// ----------------------------------------------------
// Reset Password Page Component
// ----------------------------------------------------
export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuthStore();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  const email = urlParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token || !email) {
      addToast({
        type: 'error',
        title: 'Reset Gagal',
        message: 'Token reset atau email tidak valid.',
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, token, data.password, data.password_confirmation);
      addToast({
        type: 'success',
        title: 'Sandi Diperbarui',
        message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk kembali.',
      });
      setActiveTab('login');
      // Clean query parameters from URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reset Gagal',
        message: err.message || 'Token reset telah kadaluwarsa atau tidak valid.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <CardPanel className="w-full max-w-md border shadow-2xl p-8 text-center" title="Reset Link Tidak Valid">
          <p className="text-xs text-text-muted leading-relaxed mt-2 mb-6">
            Tautan reset password ini tidak valid atau tidak lengkap. Silakan minta tautan baru.
          </p>
          <Button
            onClick={() => setActiveTab('login')}
            variant="primary"
            className="w-full"
          >
            {t('backToLogin')}
          </Button>
        </CardPanel>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <CardPanel className="w-full max-w-md border shadow-2xl relative" title={t('resetPasswordTitle')}>
        <p className="text-[10px] text-text-muted mt-0.5 select-none text-left mb-6">{t('resetPasswordSub')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Target Email display */}
          <div className="space-y-1.5 text-left select-none">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-text-muted" />
              {t('email')}
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="premium-input w-full opacity-60 cursor-not-allowed bg-border-main/20"
            />
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
              className="premium-input w-full"
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
              placeholder="Konfirmasi sandi baru"
              className="premium-input w-full"
            />
            {errors.password_confirmation && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Simpan Kata Sandi Baru
          </Button>
        </form>
      </CardPanel>
    </div>
  );
};

export default LoginPage;
