// src/App.tsx
import React from 'react';
import { 
  Languages, Sun, Moon
} from 'lucide-react';

// Store integrations
import { useSystemStore } from './stores/useSystemStore';
import { useAuthStore } from './stores/useAuthStore';
import { useToastStore } from './stores/useToastStore';

// UI Atoms
import { Toast } from './components/ui/Toast';
import { Button } from './components/ui/Button';

// Layouts
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage, RegisterPage, VerifyEmailPage } from './pages/public/AuthPages';
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

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCRUDs } from './pages/admin/AdminCRUDs';
import { useDataStore } from './stores/useDataStore';

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
  }, [checkAuth]);

  React.useEffect(() => {
    if (status === 'authenticated') {
      useDataStore.getState().fetchInitialData();
    }
  }, [status]);

  // ----------------------------------------------------
  // Unauthenticated Public Router / Layout
  // ----------------------------------------------------
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col bg-bg-base text-text-main transition-colors duration-300">
        
        {/* Public Landing Navbar Header */}
        <header className="h-16 border-b border-border-main bg-bg-surface/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-6 z-40 select-none">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span 
              onClick={() => setActiveTab('dashboard')} // Go back to landing in unauth
              className="font-black text-lg tracking-tight bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent cursor-pointer"
            >
              SUBLY
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('legal')}
              className={`text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'legal' ? 'text-brand-primary' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Legal Docs
            </button>
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-border-main/40 text-text-muted hover:text-text-main cursor-pointer flex items-center gap-1"
            >
              <Languages className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase">{language}</span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-border-main/40 text-text-muted hover:text-text-main cursor-pointer"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`text-xs font-bold transition-colors cursor-pointer px-3 py-1.5 rounded-xl ${
                activeTab === 'login' ? 'text-brand-primary' : 'text-text-muted hover:text-text-main'
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
        <main className="flex-1 flex flex-col">
          {activeTab === 'legal' && <LegalPages />}
          {activeTab === 'login' && <LoginPage />}
          {activeTab === 'register' && <RegisterPage />}
          {activeTab !== 'legal' && activeTab !== 'login' && activeTab !== 'register' && <LandingPage />}
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
    );
  }

  // ----------------------------------------------------
  // Email Verification Router / Layout
  // ----------------------------------------------------
  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col bg-bg-base text-text-main justify-center items-center">
        <VerifyEmailPage />
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated Portal Layout (Customer & Admin)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen flex bg-bg-base text-text-main transition-colors duration-300">
      
      {/* Collapsible/Drawer Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Dashboard Header */}
        <Header />

        {/* Main Dashboard Pages router content wrapper */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          
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
            </>
          )}

          {/* Admin Panel Router */}
          {currentRole === 'Admin' && (
            <>
              {activeTab === 'admin-dashboard' && <AdminDashboard />}
              {activeTab === 'admin-plans' && <AdminCRUDs />}
              {activeTab === 'admin-vouchers' && <AdminCRUDs />}
              {activeTab === 'admin-users' && <AdminCRUDs />}
              {activeTab === 'admin-payments' && <AdminDashboard />} {/* Payment confirms inside admin dashboard overview */}
              {activeTab === 'admin-chat' && <SupportChat />}        {/* Shared chat console component */}
              {activeTab === 'admin-settings' && <AdminCRUDs />}
            </>
          )}

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
    </div>
  );
};
export default App;
