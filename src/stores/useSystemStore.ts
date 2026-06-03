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

// Initialize default language and theme
const initialTheme: AppTheme = (typeof window !== 'undefined' && localStorage.getItem('subly-theme') as AppTheme) || 'light';
const initialLang: AppLanguage = (typeof window !== 'undefined' && localStorage.getItem('subly-lang') as AppLanguage) || 'id';

if (typeof window !== 'undefined') {
  document.documentElement.className = initialTheme;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  theme: initialTheme,
  language: initialLang,
  isSidebarCollapsed: false,
  device: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mobile' : 'desktop',
  currentRole: 'Customer',
  activeTab: 'dashboard',
  currentSubdomainId: null,

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subly-theme', theme);
      document.documentElement.className = theme;
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
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
    // Switch default tab on role switch
    const defaultTab = currentRole === 'Admin' ? 'admin-dashboard' : 'dashboard';
    set({ currentRole, activeTab: defaultTab, currentSubdomainId: null });
  },

  setActiveTab: (activeTab, subdomainId = null) => {
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
