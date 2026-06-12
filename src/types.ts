// src/types.ts

export type UserRole = 'Admin' | 'Customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  email_verified_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SubdomainStatus = 'active' | 'inactive';

export interface Subdomain {
  id: number;
  user_id: number;
  name: string;
  full_domain: string;
  doc_root: string;
  status: SubdomainStatus;
  expired_at: string | null;
  storage_override_mb: number | null;
  git_url: string | null;
  git_branch: string | null;
  git_last_commit: string | null;
  git_connected_at: string | null;
  created_at: string;
  updated_at: string;
  userDatabases?: UserDatabase[];
  envs?: SubdomainEnv[];
  deployments?: Deployment[];
  user?: {
    name: string;
    email: string;
  } | null;
}

export interface UserDatabase {
  id: number;
  subdomain_id: number;
  db_name: string;
  db_user: string;
  db_password?: string; // returned by backend on claim, may be undefined if hidden
  created_at: string;
  updated_at: string;
}

export interface SubdomainEnv {
  id: number;
  subdomain_id: number;
  key: string;
  value: string;
  is_secret: boolean;
  created_at: string;
}

export type DeploymentStatus = 'queued' | 'processing' | 'success' | 'error';

export interface Deployment {
  id: number;
  subdomain_id: number;
  zip_path: string | null;
  zip_size: number;
  extracted_size: number;
  version: number;
  status: DeploymentStatus;
  notes: string | null;
  admin_note: string | null;
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: number;
  user_id: number;
  plan_id: number;
  voucher_id: number | null;
  subdomain_id: number | null;
  transaction_id: string;
  amount: number;
  unique_code: number;
  proof_path: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  plan?: Plan;
  subdomain?: Subdomain;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  type: 'PHP' | 'NodeJS';
  description: string | null;
  max_storage_mb: number;
  max_databases: number;
  duration_months: number;
  is_active: boolean;
  created_at: string;
}

export interface LogLine {
  timestamp: string;
  type: 'stdout' | 'stderr' | 'system';
  message: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  image_path: string | null;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export type AppLanguage = 'id' | 'en';
export type AppTheme = 'light' | 'dark';
export type AppDevice = 'desktop' | 'mobile';
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'verifying';
export type ActiveTab = 'dashboard' | 'subdomains' | 'databases' | 'plans' | 'billing' | 'chat' | 'reports' | 'notifications' | 'profile' | 'admin-dashboard' | 'admin-users' | 'admin-plans' | 'admin-vouchers' | 'admin-payments' | 'admin-chat' | 'admin-settings' | 'login' | 'register' | 'legal' | 'testimonials' | 'admin-testimonials' | 'admin-arenhost' | 'admin-deployment' | 'admin-subdomain' | 'admin-database' | 'admin-disk' | 'admin-notifications' | 'admin-reports' | 'forgot-password' | 'reset-password';

export type TestimonialStatus = 'pending' | 'approved' | 'featured' | 'rejected';

export interface Testimonial {
  id: number;
  user_id: number;
  subdomain_id: number | null;
  rating: number;
  title: string;
  content: string;
  status: TestimonialStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email?: string;
  };
  subdomain?: {
    id: number;
    name: string;
    full_domain: string;
  } | null;
}

export interface ClientNotification {
  id: number;
  userId: number | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}


