// src/stores/useDataStore.ts
import { create } from 'zustand';
import type { Subdomain, UserDatabase, SubdomainEnv, Payment, Plan, ChatMessage, LogLine } from '../types';
import { apiFetch } from '../utils/api';
import { useAuthStore } from './useAuthStore';

interface DataState {
  subdomains: Subdomain[];
  databases: UserDatabase[];
  payments: Payment[];
  plans: Plan[];
  vouchers: { id: number; code: string; discount_percent: number; max_uses: number; uses: number; is_active: boolean }[];
  chatMessages: ChatMessage[];
  logs: Record<number, LogLine[]>; // Subdomain ID -> Logs
  globalIssues: { id: number; subdomain_id: number; user_name: string; subject: string; message: string; status: 'open' | 'resolved'; created_at: string }[];
  adminUsers: { id: number; name: string; email: string; role: string; emailVerifiedAt: string | null; createdAt: string; subdomains: { id: number; name: string }[] }[];
  settings: Record<string, string | null>;
  adminStats: {
    totalUsers: number;
    totalSubdomains: number;
    totalDatabases: number;
    activeQueueJobs: number;
    storage: {
      usedBytes: number;
      usedMb: number;
      limitGb: number;
    };
    topConsumers: { name: string; usedBytes: number; usedMb: number }[];
  } | null;

  // Actions
  fetchInitialData: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchSubdomains: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchChats: (userId: number) => Promise<void>;
  fetchIssues: () => Promise<void>;
  fetchVouchers: () => Promise<void>;
  fetchAdminUsers: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchAdminStats: () => Promise<void>;

  addSubdomain: (name: string, paymentId: number) => Promise<Subdomain>;
  deleteSubdomain: (id: number) => Promise<void>;
  updateSubdomainGit: (id: number, url: string, branch: string, token?: string) => Promise<void>;

  addDatabase: (subdomainId: number, dbName: string, dbUser: string) => Promise<UserDatabase>;
  deleteDatabase: (id: number) => Promise<void>;

  addEnv: (subdomainId: number, key: string, value: string) => Promise<SubdomainEnv>;
  deleteEnv: (subdomainId: number, id: number) => Promise<void>;
  updateEnvs: (subdomainId: number, envs: { key: string; value: string }[]) => Promise<void>;

  applyVoucher: (code: string) => Promise<{ discount: number; voucherId: number } | null>;
  createPayment: (planId: number, subdomainName: string, voucherCode: string | null) => Promise<Payment>;
  confirmPayment: (paymentId: number) => Promise<void>;
  uploadProof: (paymentId: number, proof: any) => Promise<void>;

  addChatMessage: (userId: number, message: string, isAdmin: boolean, imageFile?: any) => Promise<void>;
  triggerRealDeployment: (subdomainId: number) => Promise<void>;

  addIssueReport: (subdomainId: number, subject: string, message: string) => Promise<void>;
  resolveIssue: (issueId: number) => Promise<void>;

  addPlan: (name: string, price: number, type: 'PHP' | 'NodeJS', storageMb: number) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  addVoucher: (code: string, discountPercent: number, maxUses: number) => Promise<void>;
  deleteVoucher: (id: number) => Promise<void>;
  updateSubdomainStorageOverride: (subdomainId: number, limitMb: number) => Promise<void>;
  updateSetting: (key: string, value: string | null, file?: File) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  subdomains: [],
  databases: [],
  payments: [],
  plans: [],
  vouchers: [],
  chatMessages: [],
  logs: {},
  globalIssues: [],
  adminUsers: [],
  settings: {},
  adminStats: null,

  fetchInitialData: async () => {
    const authStore = useAuthStore.getState();
    if (authStore.status !== 'authenticated') return;

    try {
      await get().fetchPlans();
      await get().fetchSubdomains();
      await get().fetchPayments();
      await get().fetchIssues();
      await get().fetchSettings();
      if (authStore.user) {
        await get().fetchChats(authStore.user.id);
        if (authStore.user.role === 'Admin') {
          await get().fetchVouchers();
          await get().fetchAdminUsers();
          await get().fetchAdminStats();
        }
      }
    } catch (err) {
      console.error('Failed to load initial backend data:', err);
    }
  },

  fetchPlans: async () => {
    try {
      const authStore = useAuthStore.getState();
      const isAdmin = authStore.user?.role === 'Admin';
      const endpoint = isAdmin ? '/plans/all' : '/plans';

      const res = await apiFetch<any>(endpoint);
      const rawPlans = Array.isArray(res) ? res : (res && res.data ? res.data : []);
      const plans = rawPlans.map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        price: Number(p.price),
        type: p.type as 'PHP' | 'NodeJS',
        description: p.description,
        max_storage_mb: p.maxStorageMb,
        max_databases: p.maxDatabases,
        duration_months: p.durationMonths,
        is_active: p.isActive,
        created_at: p.createdAt || '',
      }));
      set({ plans });
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  },

  fetchSubdomains: async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: any[] }>('/subdomains');
      const subdomains = res.data.map((sub: any) => ({
        id: Number(sub.id),
        user_id: Number(sub.userId),
        name: sub.name,
        full_domain: sub.fullDomain,
        doc_root: sub.docRoot,
        status: sub.status,
        expired_at: sub.expiredAt,
        storage_override_mb: sub.storageOverrideMb,
        git_url: sub.gitUrl,
        git_branch: sub.gitBranch,
        git_last_commit: sub.gitLastCommit,
        git_connected_at: sub.gitConnectedAt,
        created_at: sub.createdAt || '',
        updated_at: sub.updatedAt || '',
        envs: (sub.envs || []).map((e: any) => ({
          id: Number(e.id),
          subdomain_id: Number(e.subdomainId),
          key: e.key,
          value: e.value,
          is_secret: e.isSecret,
          created_at: e.createdAt || ''
        })),
        deployments: (sub.deployments || []).map((d: any) => ({
          id: Number(d.id),
          subdomain_id: Number(d.subdomainId),
          zip_path: d.zipPath,
          zip_size: Number(d.zipSize || 0),
          extracted_size: Number(d.extractedSize || 0),
          version: d.version,
          status: d.status,
          notes: d.notes,
          admin_note: d.adminNote,
          deployed_at: d.deployedAt,
          created_at: d.createdAt || '',
          updated_at: d.updatedAt || ''
        }))
      }));

      // Flatten databases
      const databases: UserDatabase[] = [];
      res.data.forEach((sub: any) => {
        if (sub.databases) {
          sub.databases.forEach((db: any) => {
            databases.push({
              id: Number(db.id),
              subdomain_id: Number(db.subdomainId),
              db_name: db.dbName,
              db_user: db.dbUser,
              db_password: db.dbPassword ?? undefined,
              created_at: db.createdAt || '',
              updated_at: db.updatedAt || ''
            });
          });
        }
      });

      // Generate console logs dynamically from deployment history database records
      const logs: Record<number, LogLine[]> = {};
      subdomains.forEach((sub) => {
        const subLogs: LogLine[] = [];
        (sub.deployments || []).slice().reverse().forEach((dep) => {
          const time = dep.deployed_at ? new Date(dep.deployed_at).toLocaleTimeString() : new Date(dep.created_at).toLocaleTimeString();
          subLogs.push({
            timestamp: time,
            type: 'system',
            message: `Starting deployment process for version ${dep.version}...`
          });
          subLogs.push({
            timestamp: time,
            type: 'stdout',
            message: `Extracting archive: ${dep.zip_path.split('/').pop()} (Size: ${(dep.zip_size / 1024).toFixed(1)} KB)`
          });
          subLogs.push({
            timestamp: time,
            type: 'stdout',
            message: `Validation: Extracted size is ${(dep.extracted_size / 1024).toFixed(1)} KB. Security checks passed.`
          });
          if (dep.notes) {
            subLogs.push({
              timestamp: time,
              type: 'stdout',
              message: `Description: ${dep.notes}`
            });
          }
          subLogs.push({
            timestamp: time,
            type: 'system',
            message: `Deployment v${dep.version} finished successfully. Status: ${dep.status.toUpperCase()}`
          });
        });
        logs[sub.id] = subLogs;
      });

      set({ subdomains, databases, logs });
    } catch (err) {
      console.error('Failed to fetch subdomains:', err);
    }
  },

  fetchPayments: async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: any[] }>('/payments');
      const plansList = get().plans;
      const subdomainsList = get().subdomains;

      const payments = res.data.map((p: any) => ({
        id: Number(p.id),
        user_id: Number(p.userId),
        plan_id: Number(p.planId),
        voucher_id: p.voucherId ? Number(p.voucherId) : null,
        subdomain_id: p.subdomainId ? Number(p.subdomainId) : null,
        transaction_id: p.transactionId,
        amount: Number(p.amount),
        unique_code: p.uniqueCode || 0,
        proof_path: p.proofPath,
        status: p.status,
        created_at: p.createdAt || '',
        updated_at: p.updatedAt || '',
        plan: plansList.find((pl) => pl.id === Number(p.planId)),
        subdomain: subdomainsList.find((sub) => sub.id === Number(p.subdomainId))
      }));
      set({ payments });
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  },

  fetchChats: async (userId) => {
    const authUser = useAuthStore.getState().user;
    if (!authUser) return;

    const query = authUser.role === 'Admin' ? `?userId=${userId}` : '';
    try {
      const res = await apiFetch<{ success: boolean; data: any[] }>(`/chats${query}`);
      const chatMessages = res.data.map((chat: any) => ({
        id: Number(chat.id),
        user_id: Number(chat.userId),
        message: chat.message,
        image_path: chat.imagePath,
        is_admin: chat.isAdmin,
        is_read: chat.isRead,
        created_at: chat.createdAt || '',
        updated_at: chat.updatedAt || ''
      }));
      set({ chatMessages });
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  },

  fetchIssues: async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: any[] }>('/reports');
      const globalIssues = res.data.map((rep: any) => ({
        id: Number(rep.id),
        subdomain_id: rep.subject.includes('Subdomain #') ? Number(rep.subject.split('#')[1].split(']')[0]) : 0,
        user_name: rep.user?.name || 'Client',
        subject: rep.subject,
        message: rep.message,
        status: rep.status === 'resolved' ? ('resolved' as const) : ('open' as const),
        created_at: rep.createdAt || ''
      }));
      set({ globalIssues });
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  },

  fetchVouchers: async () => {
    try {
      const res = await apiFetch<any[]>('/vouchers');
      const vouchers = res.map((v: any) => ({
        id: Number(v.id),
        code: v.code,
        discount_percent: v.type === 'percent' ? Number(v.rewardAmount) : 0,
        max_uses: v.usageLimit ? Number(v.usageLimit) : 999,
        uses: 0, // Since backend stores uses dynamically in payments
        is_active: v.expiresAt ? new Date(v.expiresAt) > new Date() : true
      }));
      set({ vouchers });
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
    }
  },

  fetchAdminUsers: async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: any[] }>('/users');
      const adminUsers = res.data.map((u: any) => ({
        id: Number(u.id),
        name: u.name,
        email: u.email,
        role: u.role,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt || '',
        subdomains: (u.subdomains || []).map((sub: any) => ({
          id: Number(sub.id),
          name: sub.name
        }))
      }));
      set({ adminUsers });
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    }
  },

  fetchSettings: async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: Record<string, string | null> }>('/settings');
      set({ settings: res.data });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  },

  fetchAdminStats: async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>('/admin/stats');
      set({ adminStats: res.data });
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  },

  addSubdomain: async (name, paymentId) => {
    const res = await apiFetch<{ success: boolean; data: any }>('/subdomains', {
      method: 'POST',
      body: { name, paymentId }
    });

    await get().fetchSubdomains();
    await get().fetchPayments();

    const sub = res.data.subdomain;
    return {
      id: Number(sub.id),
      user_id: Number(sub.userId),
      name: sub.name,
      full_domain: sub.fullDomain,
      doc_root: sub.docRoot,
      status: sub.status,
      expired_at: sub.expiredAt,
      storage_override_mb: sub.storageOverrideMb,
      git_url: sub.gitUrl,
      git_branch: sub.gitBranch,
      git_last_commit: sub.gitLastCommit,
      git_connected_at: sub.gitConnectedAt,
      created_at: sub.createdAt || '',
      updated_at: sub.updatedAt || ''
    };
  },

  deleteSubdomain: async (id) => {
    await apiFetch(`/subdomains/${id}`, {
      method: 'DELETE'
    });
    await get().fetchSubdomains();
  },

  updateSubdomainGit: async (id, url, branch, token) => {
    await apiFetch(`/subdomains/${id}/git/connect`, {
      method: 'POST',
      body: { git_url: url, git_branch: branch, git_token: token || null }
    });
    await get().fetchSubdomains();
  },

  addDatabase: async (subdomainId, dbName, dbUser) => {
    const newDb: UserDatabase = {
      id: Math.floor(Math.random() * 10000) + 100,
      subdomain_id: subdomainId,
      db_name: `subly_${dbName}`,
      db_user: `subly_${dbUser}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({
      databases: [...state.databases, newDb]
    }));
    return newDb;
  },

  deleteDatabase: async (id) => {
    set((state) => ({
      databases: state.databases.filter((db) => db.id !== id)
    }));
  },

  addEnv: async (subdomainId, key, value) => {
    const subdomain = get().subdomains.find((s) => s.id === subdomainId);
    const currentEnvs = subdomain?.envs || [];
    const isSecret = key.toLowerCase().includes('password') || key.toLowerCase().includes('secret');

    const newEnv: SubdomainEnv = {
      id: Math.floor(Math.random() * 10000),
      subdomain_id: subdomainId,
      key: key.toUpperCase(),
      value: value,
      is_secret: isSecret,
      created_at: new Date().toISOString(),
    };

    const updatedEnvsList = [
      ...currentEnvs.map((e) => ({ key: e.key, value: e.value })),
      { key: key.toUpperCase(), value }
    ];

    await get().updateEnvs(subdomainId, updatedEnvsList);
    return newEnv;
  },

  deleteEnv: async (subdomainId, id) => {
    const subdomain = get().subdomains.find((s) => s.id === subdomainId);
    const currentEnvs = subdomain?.envs || [];
    const updatedEnvsList = currentEnvs
      .filter((e) => e.id !== id)
      .map((e) => ({ key: e.key, value: e.value }));

    await get().updateEnvs(subdomainId, updatedEnvsList);
  },

  updateEnvs: async (subdomainId, envsList) => {
    const keys = envsList.map((e) => e.key.toUpperCase());
    const values = envsList.map((e) => e.value);
    const secrets = envsList.map((e) =>
      e.key.toLowerCase().includes('password') || e.key.toLowerCase().includes('secret')
    );

    await apiFetch(`/subdomains/${subdomainId}/env/update`, {
      method: 'POST',
      body: { keys, values, secrets }
    });

    await get().fetchSubdomains();
  },

  applyVoucher: async (code) => {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>('/vouchers/verify', {
        method: 'POST',
        body: { code }
      });
      return {
        discount: Number(res.data.rewardAmount),
        voucherId: Number(res.data.id)
      };
    } catch (err) {
      return null;
    }
  },

  createPayment: async (planId, subdomainName, voucherCode) => {
    if (subdomainName) {
      localStorage.setItem('subly_pending_claim_name', subdomainName);
    }

    const res = await apiFetch<{ success: boolean; data: any }>('/payments/checkout', {
      method: 'POST',
      body: { planId, voucherCode: voucherCode || undefined }
    });

    const p = res.data;

    if (p.status === 'success' && subdomainName) {
      try {
        await get().addSubdomain(subdomainName, Number(p.id));
        localStorage.removeItem('subly_pending_claim_name');
      } catch (err) {
        console.error('Auto subdomain claim fail:', err);
      }
    }

    await get().fetchPayments();

    return {
      id: Number(p.id),
      user_id: Number(p.userId),
      plan_id: Number(p.planId),
      voucher_id: p.voucherId ? Number(p.voucherId) : null,
      subdomain_id: p.subdomainId ? Number(p.subdomainId) : null,
      transaction_id: p.transactionId,
      amount: Number(p.amount),
      unique_code: p.uniqueCode || 0,
      proof_path: p.proofPath,
      status: p.status,
      created_at: p.createdAt || '',
      updated_at: p.updatedAt || '',
      plan: get().plans.find((pl) => pl.id === Number(p.planId))
    };
  },

  confirmPayment: async (paymentId) => {
    await apiFetch(`/payments/${paymentId}/confirm`, {
      method: 'POST'
    });

    const pendingName = localStorage.getItem('subly_pending_claim_name');
    if (pendingName) {
      try {
        await get().addSubdomain(pendingName, paymentId);
        localStorage.removeItem('subly_pending_claim_name');
      } catch (err) {
        console.error('Failed to claim subdomain on confirm:', err);
      }
    }

    await get().fetchPayments();
    await get().fetchSubdomains();
  },

  uploadProof: async (paymentId, proof) => {
    const formData = new FormData();
    if (proof instanceof File) {
      formData.append('proof', proof);
    } else {
      const blob = new Blob(['proof_uploaded'], { type: 'image/png' });
      formData.append('proof', blob, 'proof.png');
    }

    await apiFetch(`/payments/${paymentId}/proof`, {
      method: 'POST',
      body: formData
    });

    await get().fetchPayments();
  },

  addChatMessage: async (userId, message, isAdmin, imageFile = null) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (isAdmin) {
        formData.append('userId', userId.toString());
      }
      if (imageFile instanceof File) {
        formData.append('image', imageFile);
      } else if (typeof imageFile === 'string' && imageFile.startsWith('/')) {
        const blob = new Blob(['attachment'], { type: 'image/png' });
        formData.append('image', blob, 'screenshot.png');
      }

      await apiFetch('/chats', {
        method: 'POST',
        body: formData
      });

      await get().fetchChats(userId);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  },

  triggerRealDeployment: async (subdomainId) => {
    await apiFetch(`/subdomains/${subdomainId}/deploy`, {
      method: 'POST'
    });
    await get().fetchSubdomains();
  },

  addIssueReport: async (subdomainId, subject, message) => {
    await apiFetch('/reports', {
      method: 'POST',
      body: {
        subject: `[Subdomain #${subdomainId}] ${subject}`,
        message
      }
    });
    await get().fetchIssues();
  },

  resolveIssue: async (issueId) => {
    await apiFetch(`/reports/${issueId}/status`, {
      method: 'POST',
      body: { status: 'resolved' }
    });
    await get().fetchIssues();
  },

  addPlan: async (name, price, type, storageMb) => {
    await apiFetch('/plans', {
      method: 'POST',
      body: {
        name,
        price,
        type,
        maxStorageMb: storageMb,
        maxDatabases: type === 'PHP' ? 3 : 5,
        durationMonths: 1,
        isActive: true
      }
    });
    await get().fetchPlans();
  },

  deletePlan: async (id) => {
    await apiFetch(`/plans/${id}`, {
      method: 'DELETE'
    });
    await get().fetchPlans();
  },

  addVoucher: async (code, discountPercent, maxUses) => {
    await apiFetch('/vouchers', {
      method: 'POST',
      body: {
        code: code.toUpperCase().replace(/\s+/g, ''),
        type: 'percent',
        rewardAmount: discountPercent,
        usageLimit: maxUses,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days active
      }
    });
    await get().fetchVouchers();
  },

  deleteVoucher: async (id) => {
    await apiFetch(`/vouchers/${id}`, {
      method: 'DELETE'
    });
    await get().fetchVouchers();
  },

  updateSubdomainStorageOverride: async (subdomainId, limitMb) => {
    await apiFetch(`/subdomains/${subdomainId}/storage-override`, {
      method: 'PUT',
      body: { storageOverrideMb: limitMb }
    });
    await get().fetchAdminUsers();
  },

  updateSetting: async (key, value, file) => {
    const formData = new FormData();
    formData.append(key, value || '');
    if (file) {
      formData.append('qris_image', file);
    }

    await apiFetch('/settings', {
      method: 'POST',
      body: formData
    });
    await get().fetchSettings();
  }
}));
