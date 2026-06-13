// src/pages/public/AuthPages.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../utils/api';
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
// Form Types
// ----------------------------------------------------
interface LoginFormInputs {
  email: string;
  password: string;
}

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface ForgotPasswordFormInputs {
  email: string;
}

interface ResetPasswordFormInputs {
  password: string;
  password_confirmation: string;
}

// ----------------------------------------------------
// Login Page Component
// ----------------------------------------------------
export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const { setActiveTab } = useSystemStore();
  const [loading, setLoading] = useState(false);

  const loginSchema = useMemo(() => z.object({
    email: z.string().min(1, t('validationEmailRequired')).email(t('validationEmailInvalid')),
    password: z.string().min(1, t('validationPasswordRequired')),
  }), [t]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      addToast({
        type: 'success',
        title: t('loginSuccessTitle'),
        message: t('loginSuccessMsg'),
      });
      // Redirect handled by main App shell role check
    } catch {
      addToast({
        type: 'error',
        title: t('loginFailedTitle'),
        message: t('loginFailedMsg'),
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
            {t('signInBtn')}
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

  const registerSchema = useMemo(() => z.object({
    name: z.string().min(3, t('validationNameMin')),
    email: z.string().min(1, t('validationEmailRequired')).email(t('validationEmailInvalid')),
    password: z.string().min(8, t('validationPasswordMin')),
    password_confirmation: z.string().min(1, t('validationConfirmPasswordRequired')),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('validationPasswordsMatch'),
    path: ["password_confirmation"],
  }), [t]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      addToast({
        type: 'success',
        title: t('registerSuccessTitle'),
        message: t('registerSuccessMsg'),
      });
      // Will redirect user to verify-email view
    } catch {
      addToast({
        type: 'error',
        title: t('registerFailedTitle'),
        message: t('registerFailedMsg'),
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
            {t('signUpBtn')}
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
        title: t('emailVerifiedTitle'),
        message: t('emailVerifiedMsg'),
      });
      setActiveTab('login');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('verificationFailedTitle'),
        message: err.message || t('verificationFailedMsg'),
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
            ? t('verifyTokenFound')
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
            {t('waitingVerifyLink')}
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

  const forgotPasswordSchema = useMemo(() => z.object({
    email: z.string().min(1, t('validationEmailRequired')).email(t('validationEmailInvalid')),
  }), [t]);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSuccess(true);
      addToast({
        type: 'success',
        title: t('emailSentTitle'),
        message: t('emailSentMsg'),
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('requestFailedTitle'),
        message: err.message || t('requestFailedMsg'),
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
              {t('forgotPasswordSuccessMsg')}
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
  const [checking, setChecking] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  const email = urlParams.get('email') || '';

  const resetPasswordSchema = useMemo(() => z.object({
    password: z.string().min(8, t('validationPasswordMin')),
    password_confirmation: z.string().min(1, t('validationConfirmPasswordRequired')),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('validationPasswordsMatch'),
    path: ["password_confirmation"],
  }), [t]);

  useEffect(() => {
    if (!token || !email) {
      setTokenError(t('invalidResetLink'));
      setChecking(false);
      return;
    }

    const checkToken = async () => {
      try {
        await apiFetch(`/auth/validate-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
          method: 'GET'
        });
        setTokenError(null);
      } catch (err: any) {
        setTokenError(err.message || t('expiredResetLink'));
      } finally {
        setChecking(false);
      }
    };

    checkToken();
  }, [token, email, t]);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    if (!token || !email || tokenError) {
      addToast({
        type: 'error',
        title: t('resetFailedTitle'),
        message: tokenError || t('resetFailedMsg'),
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, token, data.password, data.password_confirmation);
      addToast({
        type: 'success',
        title: t('passwordUpdatedTitle'),
        message: t('passwordUpdatedMsg'),
      });
      setActiveTab('login');
      // Clean query parameters from URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('resetFailedTitle'),
        message: err.message || t('verificationFailedMsg'),
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 select-none">
        <CardPanel className="w-full max-w-md border shadow-2xl p-8 text-center" title={t('validatingLinkTitle')}>
          <p className="text-xs text-text-muted leading-relaxed mt-2 mb-6">
            {t('validatingLinkSub')}
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary"></div>
          </div>
        </CardPanel>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 select-none">
        <CardPanel className="w-full max-w-md border shadow-2xl p-8 text-center" title={t('invalidLinkTitle')}>
          <p className="text-xs text-red-500 font-semibold leading-relaxed mt-2 mb-6">
            {tokenError}
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
            {t('saveNewPasswordBtn')}
          </Button>
        </form>
      </CardPanel>
    </div>
  );
};

export default LoginPage;
