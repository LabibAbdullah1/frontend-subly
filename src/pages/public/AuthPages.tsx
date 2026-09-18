import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
// Theme Dynamic SVG Illustration (Server + Computer + Domain)
// ----------------------------------------------------
export const AuthIllustration: React.FC = React.memo(() => {
  return (
    <div className="w-full max-w-lg xl:max-w-xl relative select-none flex items-center justify-center">
      {/* Background glow overlay */}
      <div className="absolute -inset-6 bg-brand-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <svg
        viewBox="0 0 520 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-surface)" />
            <stop offset="100%" stopColor="var(--bg-base)" />
          </linearGradient>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brand-primary)" />
            <stop offset="100%" stopColor="var(--brand-secondary)" />
          </linearGradient>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.0" />
          </linearGradient>
          <clipPath id="screenDisplayClip">
            <rect x="10" y="10" width="278" height="205" rx="10" />
          </clipPath>
          <filter id="authShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.18)" />
          </filter>
        </defs>

        {/* Ambient Connection & Data Flow Lines */}
        <path
          d="M 100 80 C 130 35, 230 30, 310 45"
          stroke="var(--brand-primary)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.35"
        />
        <path
          d="M 170 210 C 220 210, 240 240, 270 240"
          stroke="var(--brand-primary)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.4"
        />
        <path
          d="M 120 390 C 170 425, 260 425, 330 405"
          stroke="var(--border-main)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* --- 1. ENTERPRISE SERVER RACK (LEFT) --- */}
        <g transform="translate(24, 80)">
          {/* Main Server Cabinet */}
          <rect
            x="0"
            y="0"
            width="145"
            height="310"
            rx="14"
            fill="var(--bg-surface)"
            stroke="var(--border-main)"
            strokeWidth="2"
            filter="url(#authShadow)"
          />

          {/* Top Server Badge */}
          <rect x="42" y="-12" width="62" height="18" rx="4" fill="url(#brandGrad)" />
          <text x="73" y="1" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">EDGE RACK</text>

          {/* Server Unit 1: Gateway */}
          <rect x="10" y="14" width="125" height="52" rx="7" fill="var(--bg-base)" stroke="var(--border-main)" strokeWidth="1.5" />
          <circle cx="24" cy="30" r="3.5" fill="#22c55e" />
          <circle cx="36" cy="30" r="3.5" fill="var(--brand-primary)" />
          <circle cx="48" cy="30" r="3.5" fill="#22c55e" className="animate-pulse" />
          <line x1="68" y1="28" x2="122" y2="28" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="36" x2="114" y2="36" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <rect x="22" y="46" width="100" height="8" rx="2" fill="var(--bg-surface)" stroke="var(--border-main)" strokeWidth="1" />
          <line x1="28" y1="50" x2="60" y2="50" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />

          {/* Server Unit 2: DNS Engine */}
          <rect x="10" y="76" width="125" height="52" rx="7" fill="var(--bg-base)" stroke="var(--border-main)" strokeWidth="1.5" />
          <circle cx="24" cy="92" r="3.5" fill="#22c55e" />
          <circle cx="36" cy="92" r="3.5" fill="#22c55e" />
          <circle cx="48" cy="92" r="3.5" fill="var(--brand-primary)" className="animate-pulse" />
          <line x1="68" y1="90" x2="122" y2="90" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="98" x2="108" y2="98" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
          <rect x="22" y="108" width="100" height="8" rx="2" fill="var(--bg-surface)" stroke="var(--border-main)" strokeWidth="1" />
          <line x1="28" y1="112" x2="75" y2="112" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

          {/* Server Unit 3: Application Cluster */}
          <rect x="10" y="138" width="125" height="52" rx="7" fill="var(--bg-base)" stroke="var(--border-main)" strokeWidth="1.5" />
          <circle cx="24" cy="154" r="3.5" fill="#22c55e" />
          <circle cx="36" cy="154" r="3.5" fill="#3b82f6" />
          <circle cx="48" cy="154" r="3.5" fill="#22c55e" />
          <line x1="68" y1="152" x2="122" y2="152" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="160" x2="116" y2="160" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <rect x="22" y="170" width="100" height="8" rx="2" fill="var(--bg-surface)" stroke="var(--border-main)" strokeWidth="1" />
          <line x1="28" y1="174" x2="90" y2="174" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />

          {/* Server Unit 4: Storage & Database */}
          <rect x="10" y="200" width="125" height="52" rx="7" fill="var(--bg-base)" stroke="var(--border-main)" strokeWidth="1.5" />
          <circle cx="24" cy="216" r="3.5" fill="#22c55e" />
          <circle cx="36" cy="216" r="3.5" fill="var(--brand-primary)" />
          <circle cx="48" cy="216" r="3.5" fill="#3b82f6" className="animate-pulse" />
          <line x1="68" y1="214" x2="122" y2="214" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="222" x2="105" y2="222" stroke="var(--border-main)" strokeWidth="2" strokeLinecap="round" />
          <rect x="22" y="232" width="100" height="8" rx="2" fill="var(--bg-surface)" stroke="var(--border-main)" strokeWidth="1" />
          <line x1="28" y1="236" x2="55" y2="236" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />

          {/* Bottom Ventilation Grille */}
          <rect x="16" y="264" width="113" height="32" rx="5" fill="var(--bg-base)" stroke="var(--border-main)" strokeWidth="1" />
          <line x1="26" y1="274" x2="119" y2="274" stroke="var(--border-main)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="280" x2="119" y2="280" stroke="var(--border-main)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="286" x2="119" y2="286" stroke="var(--border-main)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* --- 2. WORKSTATION MONITOR / DASHBOARD (CENTER & RIGHT) --- */}
        <g transform="translate(192, 95)">
          {/* Monitor Stand Stem */}
          <path d="M 137 225 L 126 285 L 172 285 L 161 225 Z" fill="var(--border-main)" />
          {/* Stand Base */}
          <rect x="102" y="285" width="94" height="10" rx="5" fill="var(--border-main)" />

          {/* Monitor Outer Chassis */}
          <rect
            x="0"
            y="0"
            width="298"
            height="225"
            rx="14"
            fill="var(--bg-surface)"
            stroke="var(--border-main)"
            strokeWidth="2.5"
            filter="url(#authShadow)"
          />

          {/* Screen Inner Bezel & Display */}
          <rect x="10" y="10" width="278" height="205" rx="10" fill="url(#screenGrad)" />

          {/* Clipped Screen Contents to ensure no bleeding past bezel */}
          <g clipPath="url(#screenDisplayClip)">
            {/* Screen Browser Bar */}
            <rect x="10" y="10" width="278" height="30" fill="var(--bg-surface)" />
            <circle cx="26" cy="25" r="3.5" fill="#ef4444" />
            <circle cx="38" cy="25" r="3.5" fill="#eab308" />
            <circle cx="50" cy="25" r="3.5" fill="#22c55e" />

            {/* URL Address Bar */}
            <rect x="68" y="16" width="195" height="18" rx="5" fill="var(--bg-base)" stroke="var(--border-main)" strokeWidth="1" />
            <text x="165" y="29" fill="var(--brand-primary)" fontSize="9" fontWeight="bold" textAnchor="middle">
              https://dashboard.subly.my.id
            </text>

            {/* Screen Header Badges */}
            <rect x="24" y="52" width="76" height="20" rx="5" fill="#22c55e" opacity="0.15" stroke="#22c55e" strokeWidth="1" />
            <text x="62" y="65" fill="#22c55e" fontSize="8.5" fontWeight="bold" textAnchor="middle">● 200 ONLINE</text>

            <rect x="108" y="52" width="68" height="20" rx="5" fill="var(--brand-primary)" opacity="0.15" stroke="var(--brand-primary)" strokeWidth="1" />
            <text x="142" y="65" fill="var(--brand-primary)" fontSize="8.5" fontWeight="bold" textAnchor="middle">⚡ 12ms DNS</text>

            {/* Dashboard Simulated UI Blocks */}
            <rect x="24" y="82" width="85" height="7" rx="3.5" fill="var(--brand-primary)" opacity="0.8" />
            <rect x="24" y="94" width="120" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="24" y="104" width="70" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.3" />

            {/* Mini Stat Card */}
            <rect x="195" y="52" width="80" height="52" rx="6" fill="var(--bg-surface)" stroke="var(--border-main)" strokeWidth="1.2" />
            <text x="235" y="68" fill="var(--text-muted)" fontSize="7.5" textAnchor="middle">TOTAL VISITS</text>
            <text x="235" y="85" fill="var(--text-main)" fontSize="12.5" fontWeight="bold" textAnchor="middle">24.8K</text>
            <text x="235" y="96" fill="#22c55e" fontSize="7.5" fontWeight="bold" textAnchor="middle">+18.4%</text>

            {/* Live Activity Chart with Gradient Area Fill - Strictly bounded in lower area */}
            <path
              d="M 24 175 C 60 155, 95 168, 130 150 C 165 134, 205 158, 260 140 L 260 196 L 24 196 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M 24 175 C 60 155, 95 168, 130 150 C 165 134, 205 158, 260 140"
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Chart Nodes */}
            <circle cx="24" cy="175" r="3" fill="var(--brand-primary)" />
            <circle cx="130" cy="150" r="3" fill="var(--bg-surface)" stroke="var(--brand-primary)" strokeWidth="2" />
            <circle cx="195" cy="148" r="3" fill="var(--bg-surface)" stroke="var(--brand-primary)" strokeWidth="2" />
            <circle cx="260" cy="140" r="3.5" fill="var(--brand-primary)" />
          </g>
        </g>

        {/* --- 3. FLOATING DOMAIN & SSL BADGES --- */}
        {/* Floating Domain Badge 1 (Top Right) */}
        <g transform="translate(305, 28)">
          <rect
            x="0"
            y="0"
            width="185"
            height="48"
            rx="24"
            fill="var(--bg-surface)"
            stroke="var(--brand-primary)"
            strokeWidth="1.5"
            filter="url(#authShadow)"
          />
          <circle cx="24" cy="24" r="14" fill="var(--brand-primary)" opacity="0.15" />
          {/* Globe Icon */}
          <circle cx="24" cy="24" r="8" stroke="var(--brand-primary)" strokeWidth="1.3" fill="none" />
          <ellipse cx="24" cy="24" rx="3.5" ry="8" stroke="var(--brand-primary)" strokeWidth="1.1" fill="none" />
          <line x1="16" y1="24" x2="32" y2="24" stroke="var(--brand-primary)" strokeWidth="1.1" />

          <text x="48" y="23" fill="var(--text-main)" fontSize="11" fontWeight="bold">dashboard.subly.my.id</text>
          <text x="48" y="35" fill="var(--brand-primary)" fontSize="8.5" fontWeight="bold">DNS Active • Auto SSL</text>
        </g>

        {/* Floating SSL Badge 2 (Bottom Right) */}
        <g transform="translate(345, 370)">
          <rect
            x="0"
            y="0"
            width="160"
            height="44"
            rx="22"
            fill="var(--bg-surface)"
            stroke="var(--border-main)"
            strokeWidth="1.5"
            filter="url(#authShadow)"
          />
          <circle cx="22" cy="22" r="12" fill="var(--brand-primary)" opacity="0.12" />
          {/* Lock Icon */}
          <rect x="16" y="19" width="12" height="10" rx="2" fill="var(--brand-primary)" />
          <path d="M 18 19 V 15 C 18 13 26 13 26 15 V 19" fill="none" stroke="var(--brand-primary)" strokeWidth="1.4" />
          <text x="42" y="21" fill="var(--text-main)" fontSize="10" fontWeight="bold">subly.my.id/portal</text>
          <text x="42" y="33" fill="#22c55e" fontSize="8" fontWeight="bold">Protected & Verified</text>
        </g>

        {/* Dynamic Pulse Signal Dots */}
        <circle cx="178" cy="210" r="3.5" fill="var(--brand-primary)" opacity="0.8" />
        <circle cx="340" cy="85" r="3.5" fill="#22c55e" opacity="0.8" />
        <circle cx="210" cy="395" r="3.5" fill="var(--brand-primary)" opacity="0.6" />
      </svg>
    </div>
  );
});

// ----------------------------------------------------
// Reusable Auth Layout with Side Hero Illustration
// ----------------------------------------------------
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden select-none">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Server + Computer + Domain SVG Illustration (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-6 items-center justify-center w-full">
          <AuthIllustration />
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Unified Auth Pages Container (Persistent Layout)
// ----------------------------------------------------
export const AuthPagesContainer: React.FC = () => {
  const { activeTab } = useSystemStore();

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-full flex justify-center lg:justify-end"
        >
          {activeTab === 'login' && <LoginPage />}
          {activeTab === 'register' && <RegisterPage />}
          {activeTab === 'forgot-password' && <ForgotPasswordPage />}
          {activeTab === 'reset-password' && <ResetPasswordPage />}
          {activeTab === 'verify-email' && <VerifyEmailPage />}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
};

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
      <CardPanel className="w-full max-w-md border shadow-2xl p-8 text-center" title={t('validatingLinkTitle')}>
        <p className="text-xs text-text-muted leading-relaxed mt-2 mb-6">
          {t('validatingLinkSub')}
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary"></div>
        </div>
      </CardPanel>
    );
  }

  if (tokenError) {
    return (
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
    );
  }

  return (
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
  );
};

export default LoginPage;
