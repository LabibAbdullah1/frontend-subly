// src/stores/useSystemStore.ts
import { create } from 'zustand';
import type { AppLanguage, AppTheme, AppDevice, UserRole, ActiveTab } from '../types';

interface SystemState {
  theme: AppTheme;
  language: AppLanguage;
  isSidebarCollapsed: boolean;
  device: AppDevice;
  currentRole: UserRole;
  activeTab: ActiveTab;
  currentSubdomainId: number | null; // For subdomain portal detail routing
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setDevice: (device: AppDevice) => void;
  setCurrentRole: (role: UserRole) => void;
  setActiveTab: (tab: ActiveTab, subdomainId?: number | null) => void;
}

const initialTheme: AppTheme = (typeof window !== 'undefined' && localStorage.getItem('subly-theme') as AppTheme) || 'dark';
const initialLang: AppLanguage = (typeof window !== 'undefined' && localStorage.getItem('subly-lang') as AppLanguage) || 'id';
const initialActiveTab: ActiveTab = (typeof window !== 'undefined' && localStorage.getItem('subly-activeTab') as ActiveTab) || 'dashboard';
const initialSubdomainId: number | null = (typeof window !== 'undefined' && localStorage.getItem('subly-currentSubdomainId') ? Number(localStorage.getItem('subly-currentSubdomainId')) : null);
const initialRole: UserRole = (typeof window !== 'undefined' && localStorage.getItem('subly-role') as UserRole) || 'Customer';

if (typeof window !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useSystemStore = create<SystemState>((set, get) => ({
  theme: initialTheme,
  language: initialLang,
  isSidebarCollapsed: false,
  device: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mobile' : 'desktop',
  currentRole: initialRole,
  activeTab: initialActiveTab,
  currentSubdomainId: initialSubdomainId,

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subly-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subly-lang', language);
    }
    set({ language });
  },

  toggleLanguage: () => {
    const nextLang = get().language === 'id' ? 'en' : 'id';
    get().setLanguage(nextLang);
  },

  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  setDevice: (device) => set({ device }),
  
  setCurrentRole: (currentRole) => {
    const previousRole = get().currentRole;
    if (typeof window !== 'undefined') {
      localStorage.setItem('subly-role', currentRole);
    }
    
    const isPublicTab = ['login', 'register', 'forgot-password', 'reset-password', 'legal', 'landing'].includes(get().activeTab);
    
    // Switch default tab ONLY on actual role change OR if currently on a public auth tab
    if (previousRole !== currentRole || isPublicTab) {
      const defaultTab = currentRole === 'Admin' ? 'admin-dashboard' : 'dashboard';
      if (typeof window !== 'undefined') {
        localStorage.setItem('subly-activeTab', defaultTab);
        localStorage.removeItem('subly-currentSubdomainId');
      }
      set({ currentRole, activeTab: defaultTab, currentSubdomainId: null });
    } else {
      set({ currentRole });
    }
  },

  setActiveTab: (activeTab, subdomainId = null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subly-activeTab', activeTab);
      if (subdomainId !== null && subdomainId !== undefined) {
        localStorage.setItem('subly-currentSubdomainId', String(subdomainId));
      } else {
        localStorage.removeItem('subly-currentSubdomainId');
      }
    }
    set({ activeTab, currentSubdomainId: subdomainId });
    // Auto-collapse sidebar on mobile selection
    if (get().device === 'mobile') {
      set({ isSidebarCollapsed: true });
    }
  }
}));

// Set up resize listener to update screen device state dynamically
if (typeof window !== 'undefined') {
  const handleResize = () => {
    const width = window.innerWidth;
    const currentDevice = useSystemStore.getState().device;
    const newDevice = width < 1024 ? 'mobile' : 'desktop';
    
    if (currentDevice !== newDevice) {
      useSystemStore.getState().setDevice(newDevice);
      // Auto-collapse sidebar on mobile
      if (newDevice === 'mobile') {
        useSystemStore.getState().setSidebarCollapsed(true);
      }
    }
  };
  window.addEventListener('resize', handleResize);
}
