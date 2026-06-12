// src/App.tsx
import React from 'react';
import { 
  Languages, Zap, Sun, Moon
} from 'lucide-react';

// Store integrations
import { useSystemStore } from './stores/useSystemStore';
import { useAuthStore } from './stores/useAuthStore';
import { useToastStore } from './stores/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';

// UI Atoms
import { Toast } from './components/ui/Toast';
import { Button } from './components/ui/Button';

// Layouts
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage } from './pages/public/AuthPages';
import { LegalPages } from './pages/public/LegalPages';

// Client Pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { SubdomainsList } from './pages/dashboard/SubdomainsList';
import { SubdomainPortal } from './pages/dashboard/SubdomainPortal';
import { DatabasesPage } from './pages/dashboard/DatabasesPage';
import { PlansPage } from './pages/dashboard/PlansPage';
import { PlansCheckout } from './pages/dashboard/PlansCheckout';
import { SupportChat } from './pages/dashboard/SupportChat';
import { IssueReports } from './pages/dashboard/IssueReports';
import { ProfileSettings } from './pages/dashboard/ProfileSettings';
import { TestimonialPage } from './pages/dashboard/TestimonialPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCRUDs } from './pages/admin/AdminCRUDs';
import { useDataStore } from './stores/useDataStore';
import { GlowingGridBackground } from './components/ui/GlowingGridBackground';

export const App: React.FC = () => {
  const { status, checkAuth } = useAuthStore();
  const { 
    theme,
    toggleTheme,
    language, 
    toggleLanguage, 
    activeTab, 
    setActiveTab, 
    currentRole,
    currentSubdomainId
  } = useSystemStore();

  const { toasts, removeToast } = useToastStore();

  React.useEffect(() => {
    checkAuth();
    
    // Detect special paths on initial mount
    const path = window.location.pathname;
    if (path === '/verify-email') {
      useAuthStore.setState({ status: 'verifying' });
    } else if (path === '/reset-password') {
      setActiveTab('reset-password');
    }
  }, [checkAuth, setActiveTab]);

  React.useEffect(() => {
    if (status === 'authenticated') {
      useDataStore.getState().fetchInitialData();
    }
  }, [status]);

  return (
    <AnimatePresence mode="wait">
      {status === 'loading' ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-text-main relative overflow-hidden w-full"
        >
          <GlowingGridBackground />
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo container with running outline stroke */}
            <div className="relative w-20 h-20 flex items-center justify-center select-none">
              {/* SVG border animation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* Static background outline (muted border) */}
                <rect
                  x="4"
                  y="4"
                  width="92"
                  height="92"
                  rx="20"
                  fill="none"
                  stroke="var(--border-main)"
                  strokeWidth="2"
                  className="opacity-20"
                />
                {/* Animated running border outline */}
                <rect
                  x="4"
                  y="4"
                  width="92"
                  height="92"
                  rx="20"
                  fill="none"
                  stroke="var(--brand-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="animate-running-outline"
                  style={{
                    strokeDasharray: '368',
                  }}
                />
              </svg>
              
              {/* Center Zap Logo Icon */}
              <div className="relative z-10 w-11 h-11 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/25">
                <Zap className="h-5.5 w-5.5 text-white fill-white shrink-0" />
              </div>
            </div>
            <p className="text-xs font-bold text-text-muted tracking-wider uppercase animate-pulse select-none">
              Memproses Autentikasi...
            </p>
          </div>
        </motion.div>
      ) : status === 'unauthenticated' ? (
        <motion.div
          key="unauthenticated"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen flex flex-col bg-bg-base text-text-main transition-colors duration-300 relative overflow-hidden w-full"
        >
          {/* Dynamic Symmetrical Glow Grid Background */}
          <GlowingGridBackground />

          <div className="relative z-10 flex flex-col flex-1">
            {/* Public Landing Navbar Header */}
            <header className="h-14 border-b border-border-main bg-bg-base/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 sm:px-6 z-40 select-none">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-brand-primary flex items-center justify-center text-white font-black text-lg">
                  <Zap className="h-4.5 w-4.5 text-white fill-white shrink-0" />
                </div>
                <span 
                  onClick={() => setActiveTab('dashboard')} // Go back to landing in unauth
                  className="font-bold text-lg tracking-tighter text-text-main cursor-pointer hover:opacity-90"
                  style={{ letterSpacing: '-0.6px' }}
                >
                  SUBLY
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3">
                <button 
                  onClick={() => setActiveTab('legal')}
                  className={`text-xs font-bold transition-colors cursor-pointer hidden sm:inline ${
                    activeTab === 'legal' ? 'text-brand-primary' : 'text-text-subtle hover:text-text-main'
                  }`}
                >
                  Legal Docs
                </button>
                <button 
                  onClick={toggleLanguage}
                  className="p-2 rounded-lg hover:bg-border-main/40 text-text-subtle hover:text-text-main cursor-pointer flex items-center gap-1"
                >
                  <Languages className="h-4.5 w-4.5" />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">{language}</span>
                </button>
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-border-main/40 text-text-subtle hover:text-text-main cursor-pointer"
                  title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`text-xs font-bold transition-colors cursor-pointer px-2 sm:px-3 py-1.5 rounded-md ${
                    activeTab === 'login' ? 'text-brand-primary' : 'text-text-subtle hover:text-text-main'
                  }`}
                >
                  Sign In
                </button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setActiveTab('register')}
                >
                  Sign Up
                </Button>
              </div>
            </header>

            {/* Public Content pages */}
            <main className="flex-1 flex flex-col overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="flex-1 flex flex-col"
                >
                  {activeTab === 'legal' && <LegalPages />}
                  {activeTab === 'login' && <LoginPage />}
                  {activeTab === 'register' && <RegisterPage />}
                  {activeTab === 'forgot-password' && <ForgotPasswordPage />}
                  {activeTab === 'reset-password' && <ResetPasswordPage />}
                  {activeTab !== 'legal' && activeTab !== 'login' && activeTab !== 'register' && activeTab !== 'forgot-password' && activeTab !== 'reset-password' && <LandingPage />}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Global Floating Toast Alerts Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
              {toasts.map((toast) => (
                <Toast 
                  key={toast.id} 
                  id={toast.id} 
                  type={toast.type} 
                  title={toast.title} 
                  message={toast.message} 
                  duration={toast.duration} 
                  onClose={removeToast} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : status === 'verifying' ? (
        <motion.div
          key="verifying"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen flex flex-col bg-bg-base text-text-main justify-center items-center relative overflow-hidden w-full"
        >
          {/* Dynamic Symmetrical Glow Grid Background */}
          <GlowingGridBackground />
          
          <div className="relative z-10 w-full">
            <VerifyEmailPage />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="authenticated"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen flex bg-bg-base text-text-main transition-colors duration-300 relative overflow-hidden w-full"
        >
          {/* Dynamic Symmetrical Glow Grid Background */}
          <GlowingGridBackground />

          {/* Collapsible/Drawer Sidebar */}
          <Sidebar />

          {/* Main Container */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10">
            
            {/* Sticky Dashboard Header */}
            <Header />

            {/* Main Dashboard Pages router content wrapper */}
            <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-7xl mx-auto overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentRole}-${activeTab}-${currentSubdomainId}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="w-full"
                >
                  {/* Customer Dashboard Router */}
                  {currentRole === 'Customer' && (
                    <>
                      {activeTab === 'dashboard' && <DashboardOverview />}
                      {activeTab === 'subdomains' && (
                        currentSubdomainId === null 
                          ? <SubdomainsList /> 
                          : <SubdomainPortal />
                      )}
                      {activeTab === 'databases' && <DatabasesPage />}
                      {activeTab === 'plans' && <PlansPage />}
                      {activeTab === 'billing' && <PlansCheckout />}
                      {activeTab === 'chat' && <SupportChat />}
                      {activeTab === 'reports' && <IssueReports />}
                      {activeTab === 'profile' && <ProfileSettings />}
                      {activeTab === 'testimonials' && <TestimonialPage />}
                    </>
                  )}

                  {/* Admin Panel Router */}
                  {currentRole === 'Admin' && (
                    <>
                      {activeTab === 'admin-dashboard' && <AdminDashboard />}
                      {activeTab === 'admin-deployment' && <AdminDashboard />}
                      {activeTab === 'admin-subdomain' && <AdminDashboard />}
                      {activeTab === 'admin-database' && <AdminDashboard />}
                      {activeTab === 'admin-disk' && <AdminDashboard />}
                      {activeTab === 'admin-notifications' && <AdminDashboard />}
                      {activeTab === 'admin-reports' && <AdminDashboard />}
                      {activeTab === 'admin-plans' && <AdminCRUDs />}
                      {activeTab === 'admin-vouchers' && <AdminCRUDs />}
                      {activeTab === 'admin-users' && <AdminCRUDs />}
                      {activeTab === 'admin-payments' && <AdminDashboard />} {/* Payment confirms inside admin dashboard overview */}
                      {activeTab === 'admin-chat' && <SupportChat />}        {/* Shared chat console component */}
                      {activeTab === 'admin-settings' && <AdminCRUDs />}
                      {activeTab === 'admin-testimonials' && <AdminCRUDs />}
                      {activeTab === 'profile' && <ProfileSettings />}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Global Floating Toast Alerts Container */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
            {toasts.map((toast) => (
              <Toast 
                key={toast.id} 
                id={toast.id} 
                type={toast.type} 
                title={toast.title} 
                message={toast.message} 
                duration={toast.duration} 
                onClose={removeToast} 
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default App;
