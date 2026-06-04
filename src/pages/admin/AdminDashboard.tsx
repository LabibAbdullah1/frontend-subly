import React, { useState, useEffect } from 'react';
import { 
  Users, Globe, Database, ShieldCheck, Eye, Check, Repeat, MessageSquare, CreditCard, HardDrive, Plus, ArrowRight, RefreshCw, ShieldAlert
} from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { activeTab, setActiveTab } = useSystemStore();
  const { 
    payments, 
    confirmPayment, 
    adminStats, 
    fetchAdminStats,
    subdomains,
    fetchSubdomains,
    adminUsers,
    fetchAdminUsers,
    adminDiskUsage,
    fetchAdminDiskUsage,
    settings,
    addSubdomain,
    updateSubdomainStorageOverride,
    toggleSubdomainStatus,
    fetchNotifications,
    fetchIssues
  } = useDataStore();

  const [confirmPayId, setConfirmPayId] = useState<number | null>(null);
  const [viewProofPath, setViewProofPath] = useState<string | null>(null);

  // Subdomain registration modal states for admin
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [registerSubdomainName, setRegisterSubdomainName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Storage override states for admin disk view
  const [overrideDiskModal, setOverrideDiskModal] = useState(false);
  const [overrideSubdomainId, setOverrideSubdomainId] = useState<number | null>(null);
  const [overrideLimitSize, setOverrideLimitSize] = useState('2048');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  useEffect(() => {
    fetchAdminStats();
    fetchSubdomains();
    fetchAdminUsers();
    fetchAdminDiskUsage();
    fetchNotifications();
    fetchIssues();
  }, [fetchAdminStats, fetchSubdomains, fetchAdminUsers, fetchAdminDiskUsage, fetchNotifications, fetchIssues, activeTab]);

  const handleApprovePayment = async () => {
    if (confirmPayId) {
      await confirmPayment(confirmPayId);
      addToast({
        type: 'success',
        title: 'Pembayaran Disetujui',
        message: 'Klien telah diaktifkan paket hostingnya dan subdomain di-provisioning.',
      });
      setConfirmPayId(null);
      await fetchAdminStats();
      await fetchSubdomains();
      await fetchAdminDiskUsage();
    }
  };

  const handleRegisterSubdomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rootDomain = settings.system_root_domain || 'subly.host';
    if (!selectedPaymentId) {
      addToast({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Pilih transaksi pembayaran lunas klien.',
      });
      return;
    }
    const regex = /^[a-z0-9-_]+$/;
    if (!registerSubdomainName) {
      addToast({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama subdomain wajib diisi.',
      });
      return;
    }
    if (!regex.test(registerSubdomainName)) {
      addToast({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama subdomain tidak valid. Hanya gunakan huruf kecil, angka, minus (-) dan underscore (_).',
      });
      return;
    }

    setIsRegistering(true);
    try {
      await addSubdomain(registerSubdomainName, selectedPaymentId);
      addToast({
        type: 'success',
        title: 'Subdomain Berhasil Didaftarkan',
        message: `Subdomain ${registerSubdomainName}.${rootDomain} telah aktif oleh Admin!`,
      });
      setRegisterModalOpen(false);
      setSelectedPaymentId(null);
      setRegisterSubdomainName('');
      await fetchSubdomains();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Mendaftarkan',
        message: err.message || 'Terjadi kesalahan sistem atau subdomain sudah digunakan.',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSaveStorageOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideSubdomainId) return;

    setIsSubmittingOverride(true);
    try {
      await updateSubdomainStorageOverride(overrideSubdomainId, Number(overrideLimitSize));
      addToast({
        type: 'success',
        title: 'Kapasitas Di-override',
        message: `Batas storage sukses diubah menjadi ${overrideLimitSize} MB.`,
      });
      setOverrideDiskModal(false);
      await fetchAdminDiskUsage();
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui batas storage.',
      });
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleToggleSubdomain = async (subId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleSubdomainStatus(subId, nextStatus);
      addToast({
        type: 'success',
        title: 'Status Diperbarui',
        message: `Subdomain berhasil ${nextStatus === 'active' ? 'diaktifkan kembali' : 'ditangguhkan (suspend)'}.`,
      });
      await fetchSubdomains();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: err.message || 'Gagal merubah status subdomain.',
      });
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const UPLOADS_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  // Calculate monthly revenue from payments
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = payments
    .filter(p => {
      if (p.status !== 'success') return false;
      const d = new Date(p.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (p.amount + p.unique_code), 0);

  // Flatten all deployments from all subdomains
  const allDeployments = subdomains.flatMap(sub => 
    (sub.deployments || []).map(dep => ({
      ...dep,
      subdomainName: sub.full_domain || `${sub.name}.subly.host`,
      ownerName: sub.user?.name || 'Client',
      gitUrl: sub.git_url
    }))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const activeQueueDeployments = allDeployments.filter(d => d.status === 'queued' || d.status === 'processing');

  // Flatten all databases with size lookup
  const allDatabases = subdomains.flatMap(sub => 
    ((sub as any).databases || []).map((db: any) => {
      const diskSub = adminDiskUsage?.subdomains.find(s => Number(s.id) === sub.id || s.name === sub.name);
      const dbSizeMb = diskSub ? diskSub.dbMb : 0;
      return {
        ...db,
        subdomainName: sub.full_domain || `${sub.name}.subly.host`,
        ownerName: sub.user?.name || 'Client',
        ownerEmail: sub.user?.email || '',
        dbSizeMb
      };
    })
  );

  // Remaining time format helper
  const getRemainingTime = (expiryStr: string | null) => {
    if (!expiryStr) return 'Lifetime';
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    if (diffTime <= 0) return 'Expired';
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} months from now (${expiry.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})`;
    }
    return `${diffDays} days left (${expiry.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})`;
  };

  // -----------------------------------------------------------------------------
  // VIEW: RINGKASAN (`admin-dashboard`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-dashboard') {
    const limitGbSetting = settings.system_storage_limit_gb || '256';
    const totalLimitMb = Number(limitGbSetting) * 1024;
    const overallUsedMb = adminStats?.storage.usedMb ?? 0;
    const storagePercentage = Math.min(100, Math.round((overallUsedMb / totalLimitMb) * 100)) || 0;

    return (
      <div className="space-y-6 w-full text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            Ringkasan Konsol Sistem
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Analitik platform global, log provisioning, dan status sistem real-time.
          </p>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">TOTAL KLIEN</span>
                <span className="text-2xl font-bold text-text-main">{adminStats?.totalUsers ?? adminUsers.length}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>

          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">DEPLOYMENT</span>
                <span className="text-2xl font-bold text-text-main">{activeQueueDeployments.length} ANTRIAN</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Repeat className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>

          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">CHAT BELUM DIBACA</span>
                <span className="text-2xl font-bold text-text-main">0</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>

          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">PENDAPATAN BULANAN</span>
                <span className="text-2xl font-bold text-text-main">Rp {monthlyRevenue.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>
        </div>

        {/* Charts & Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circular Progress Data Card */}
          <div className="lg:col-span-1">
            <CardPanel className="p-6 flex flex-col items-center justify-center text-center h-full">
              <h3 className="text-xs font-black uppercase text-text-muted tracking-wider mb-4">Penyimpanan Server Global</h3>
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="56"
                    className="stroke-border-main/20"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="56"
                    className="stroke-brand-primary"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * storagePercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-text-main font-mono">{storagePercentage}%</span>
                  <span className="text-[8px] font-black text-text-muted uppercase">Terpakai</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-text-muted mt-4 uppercase">
                {overallUsedMb.toFixed(1)} MB / {totalLimitMb} MB (Limit {limitGbSetting} GB)
              </p>
            </CardPanel>
          </div>

          {/* Table deployments */}
          <div className="lg:col-span-2">
            <CardPanel 
              title="Deployment Terbaru" 
              headerActions={
                <button onClick={() => setActiveTab('admin-deployment')} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1">
                  Lihat Antrian <ArrowRight className="h-3 w-3" />
                </button>
              }
            >
              <div className="overflow-x-auto w-full mt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                      <th className="py-2.5 pb-2 font-bold">KLIEN</th>
                      <th className="py-2.5 pb-2 font-bold">SUBDOMAIN</th>
                      <th className="py-2.5 pb-2 text-right pr-6 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/30 text-xs">
                    {allDeployments.slice(0, 5).map((dep, idx) => (
                      <tr key={idx} className="hover:bg-border-main/5 transition-colors">
                        <td className="py-3 font-semibold text-text-main">{dep.ownerName}</td>
                        <td className="py-3 text-text-muted font-mono text-[10px]">
                          <div className="flex items-center gap-1">
                            <span>{dep.subdomainName}</span>
                            <span className="text-[8px] px-1 bg-brand-primary/15 text-brand-primary border border-brand-primary/20 rounded">
                              v{dep.version}
                            </span>
                            {dep.gitUrl && (
                              <span className="text-[8px] px-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded">
                                GITHUB
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right pr-6">
                          <Badge 
                            status={dep.status === 'success' ? 'success' : dep.status === 'error' ? 'inactive' : 'pending'} 
                            label={dep.status.toUpperCase()} 
                          />
                        </td>
                      </tr>
                    ))}
                    {allDeployments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-text-muted italic">Tidak ada deployment terbaru.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardPanel>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // VIEW: PEMBAYARAN KLIEN (`admin-payments`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-payments') {
    return (
      <div className="space-y-6 w-full text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            Konfirmasi Pembayaran Klien
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Tinjau bukti transaksi pembayaran transfer bank / e-wallet secara manual dan aktifkan paket hosting klien.
          </p>
        </div>

        {/* Pending payments table */}
        <CardPanel 
          title="Konfirmasi Pembayaran Menunggu Persetujuan"
          headerActions={
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/15 px-2.5 py-0.5 rounded uppercase">
              {pendingPayments.length} Pending
            </span>
          }
        >
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Trx ID</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Total</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Bukti</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {pendingPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-semibold text-text-main font-mono text-[11px] select-all max-w-[90px] sm:max-w-none truncate" title={p.transaction_id}>
                      {p.transaction_id}
                    </td>
                    <td className="py-3 text-center font-bold text-text-main font-mono text-[11px]">
                      Rp {(p.amount + p.unique_code).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-center">
                      {p.proof_path ? (
                        <button
                          onClick={() => setViewProofPath(p.proof_path)}
                          className="text-brand-primary hover:underline font-bold text-[10px] uppercase flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-text-muted italic">No file</span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-6 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setConfirmPayId(p.id)}
                        className="bg-text-main text-bg-base shadow-md hover:opacity-90 active:scale-[0.98] transition-all border border-transparent px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted italic">Tidak ada pembayaran pending yang perlu dikonfirmasi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardPanel>

        {/* Payment History Card */}
        <CardPanel title="Semua Riwayat Transaksi Klien">
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Tanggal</th>
                  <th className="py-2.5 pb-2 font-bold">Trx ID</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Total</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Status</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {payments
                  .filter(p => p.status !== 'pending')
                  .slice(0, 15)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 font-semibold text-text-muted text-[10px] font-mono">
                        {new Date(p.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 font-semibold text-text-main font-mono text-[11px] truncate" title={p.transaction_id}>
                        {p.transaction_id}
                      </td>
                      <td className="py-3 text-center font-bold text-text-main font-mono text-[11px]">
                        Rp {(p.amount + p.unique_code).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-center">
                        <Badge 
                          status={p.status === 'success' ? 'success' : 'inactive'} 
                          label={p.status.toUpperCase()} 
                        />
                      </td>
                      <td className="py-3 text-right pr-6">
                        {p.proof_path ? (
                          <button
                            onClick={() => setViewProofPath(p.proof_path)}
                            className="text-brand-primary hover:underline font-bold text-[10px] uppercase flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">No file</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardPanel>

        {/* Modal proofs */}
        <Modal isOpen={confirmPayId !== null} onClose={() => setConfirmPayId(null)} title="Setujui Pembayaran Klien?">
          <div className="p-3.5 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-xs font-bold text-left mb-4">
            Penyetujuan pembayaran ini akan memicu provisioning otomatis subdomain cPanel klien dan mengalokasikan resources RAM/CPU virtual host.
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmPayId(null)}>{t('cancel')}</Button>
            <Button variant="primary" onClick={handleApprovePayment}>{t('approveBtn')}</Button>
          </div>
        </Modal>

        <Modal isOpen={viewProofPath !== null} onClose={() => setViewProofPath(null)} title="Tanda Terima Pembayaran Klien">
          <div className="p-6 bg-slate-900/10 rounded-xl border border-border-main/50 flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-xs border border-border-main bg-white rounded-xl p-3 shadow-md flex items-center justify-center overflow-hidden">
              <img src={`${viewProofPath?.startsWith('http') ? '' : UPLOADS_BASE}/${viewProofPath}`} alt="Screenshot Proof" className="max-h-64 object-contain rounded-xl" />
            </div>
            <div className="text-center text-xs font-bold text-text-muted">
              <p className="truncate max-w-xs">{viewProofPath?.split('/').pop()}</p>
              <p className="text-[10px] font-bold text-brand-primary mt-1">E-WALLET TRANSACTION SUCCESS RECEIPT</p>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // VIEW: DEPLOYMENT (`admin-deployment`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-deployment') {
    return (
      <div className="space-y-6 w-full text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            ANTRIAN DEPLOYMENT
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Monitoring infrastruktur antrean deploy dan rincian update.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CardPanel title="ANTRIAN AKTIF" headerActions={
              <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                {activeQueueDeployments.length} TERTUNDA
              </span>
            }>
              <div className="py-12 text-center text-xs text-text-muted italic">
                {activeQueueDeployments.length === 0 ? 'Tidak ada deployment aktif.' : (
                  <div className="space-y-2">
                    {activeQueueDeployments.map((q, idx) => (
                      <div key={idx} className="p-3 bg-bg-surface border border-border-main rounded-xl flex items-center justify-between text-left">
                        <div>
                          <p className="font-bold text-text-main">{q.subdomainName}</p>
                          <p className="text-[10px] text-text-muted">v{q.version}</p>
                        </div>
                        <Badge status="pending" label={q.status.toUpperCase()} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardPanel>
          </div>

          <div className="lg:col-span-2">
            <CardPanel title="RIWAYAT DEPLOYMENT">
              <div className="overflow-x-auto w-full mt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                      <th className="py-2.5 pb-2 font-bold">ARTEFAK</th>
                      <th className="py-2.5 pb-2 text-center font-bold">STATUS</th>
                      <th className="py-2.5 pb-2 text-right pr-6 font-bold">TANGGAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/30 text-xs">
                    {allDeployments.map((dep, idx) => (
                      <tr key={idx} className="hover:bg-border-main/5 transition-colors">
                        <td className="py-3 font-semibold text-text-main">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs">{dep.subdomainName}</span>
                            <span className="text-[10px] text-text-muted font-normal">Pemilik: {dep.ownerName}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] bg-brand-primary/15 text-brand-primary border border-brand-primary/20 px-1 rounded">
                                Build v{dep.version}
                              </span>
                              {dep.gitUrl ? (
                                <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1 rounded flex items-center gap-0.5">
                                  <Globe className="h-3 w-3" /> GITHUB
                                </span>
                              ) : (
                                <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded flex items-center gap-0.5">
                                  ZIP ARCHIVE
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <Badge 
                            status={dep.status === 'success' ? 'success' : dep.status === 'error' ? 'inactive' : 'pending'} 
                            label={dep.status.toUpperCase()} 
                          />
                        </td>
                        <td className="py-3 text-right pr-6 font-mono text-[10px] text-text-muted">
                          {new Date(dep.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}, {new Date(dep.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {allDeployments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-text-muted italic">Tidak ada riwayat deployment.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardPanel>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // VIEW: SUBDOMAIN (`admin-subdomain`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-subdomain') {
    return (
      <div className="space-y-6 w-full text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
              DIREKTORI SUBDOMAIN
            </h1>
            <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
              Kelola dan audit situs web klien aktif, periksa jadwal kadaluarsa, dan moderasi jalur live.
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setRegisterModalOpen(true)}>
            DAFTARKAN SUBDOMAIN BARU
          </Button>
        </div>

        <CardPanel title="Direktori Subdomain">
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">PEMILIK</th>
                  <th className="py-2.5 pb-2 font-bold">SUBDOMAIN</th>
                  <th className="py-2.5 pb-2 font-bold">URL LENGKAP</th>
                  <th className="py-2.5 pb-2 font-bold">SISA WAKTU</th>
                  <th className="py-2.5 pb-2 text-center font-bold">STATUS</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {subdomains.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-main">{sub.user?.name || 'Client'}</span>
                        <span className="text-[10px] text-text-muted font-mono">{sub.user?.email || ''}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-brand-primary">{sub.name}</td>
                    <td className="py-3">
                      <a href={`http://${sub.full_domain}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary underline truncate font-mono block max-w-xs">
                        {sub.full_domain}
                      </a>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-text-muted">{getRemainingTime(sub.expired_at)}</td>
                    <td className="py-3 text-center">
                      <Badge 
                        status={sub.status === 'active' ? 'success' : 'inactive'} 
                        label={sub.status.toUpperCase()} 
                      />
                    </td>
                    <td className="py-3 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                            sub.status === 'active' 
                              ? 'text-amber-500 bg-amber-500/10 border-amber-500/15 hover:bg-amber-500/20' 
                              : 'text-green-500 bg-green-500/10 border-green-500/15 hover:bg-green-500/20'
                          }`}
                          title={sub.status === 'active' ? 'Tangguhkan Subdomain (Suspend)' : 'Aktifkan Subdomain'}
                          onClick={() => handleToggleSubdomain(Number(sub.id), sub.status)}
                        >
                          {sub.status === 'active' ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subdomains.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted italic">Tidak ada subdomain aktif.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardPanel>

        {/* Admin Claim/Register Subdomain Wizard Modal */}
        <Modal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          title="Daftarkan Subdomain Klien Baru"
          description="Sebagai Admin, Anda dapat mendaftarkan subdomain baru untuk klien menggunakan slot pembayaran/hosting yang telah lunas (success)."
        >
          <form onSubmit={handleRegisterSubdomainSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main">
                Pilih Transaksi & Klien
              </label>
              <select
                value={selectedPaymentId || ''}
                onChange={(e) => setSelectedPaymentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full premium-input font-sans text-xs bg-bg-surface border border-border-main text-text-main rounded-xl p-2.5 outline-none"
                required
              >
                <option value="">-- Pilih Slot Transaksi Klien (Success & Belum Ada Subdomain) --</option>
                {payments
                  .filter(p => p.status === 'success' && !p.subdomain_id)
                  .map(p => {
                    const owner = adminUsers.find(u => u.id === p.user_id);
                    const clientName = owner ? owner.name : `Client ID #${p.user_id}`;
                    const clientEmail = owner ? owner.email : '';
                    const planName = p.plan?.name || 'Hosting Plan';
                    return (
                      <option key={p.id} value={p.id} className="bg-bg-surface text-text-main">
                        {clientName} ({clientEmail}) - {planName} - Invoice #{p.transaction_id || p.id}
                      </option>
                    );
                  })
                }
              </select>
              {payments.filter(p => p.status === 'success' && !p.subdomain_id).length === 0 && (
                <p className="text-[10px] text-amber-500 font-semibold select-none pt-1">
                  * Tidak ada transaksi pembayaran berstatus 'Success' yang belum terhubung ke subdomain.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main">
                Nama Subdomain
              </label>
              <div className="flex items-stretch">
                <input
                  type="text"
                  value={registerSubdomainName}
                  onChange={(e) => setRegisterSubdomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="website-saya"
                  className="flex-1 premium-input rounded-r-none border-r-0 font-mono text-xs"
                  required
                />
                <span className="bg-border-main/20 border border-border-main border-l-0 px-4 flex items-center rounded-r-xl text-xs font-bold text-text-muted select-none font-mono">
                  .{settings.system_root_domain || 'subly.host'}
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed flex items-start gap-1.5 select-none pt-1">
                <span>Hanya diperbolehkan huruf kecil (a-z), angka (0-9), tanda hubung (-) dan garis bawah (_). Tanpa spasi atau titik.</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main/50 select-none">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRegisterModalOpen(false)}
                disabled={isRegistering}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isRegistering}
                disabled={payments.filter(p => p.status === 'success' && !p.subdomain_id).length === 0}
              >
                Aktifkan Subdomain
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  if (activeTab === 'admin-database') {
    return (
      <div className="space-y-6 w-full text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
              KELOLA DATABASE
            </h1>
            <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
              Lihat koneksi database dan rincian penggunaan disk untuk klien.
            </p>
          </div>
        </div>

        <CardPanel title="Kredensial Database & Ukuran">
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">KLIEN</th>
                  <th className="py-2.5 pb-2 font-bold">SUBDOMAIN</th>
                  <th className="py-2.5 pb-2 font-bold">NAMA DATABASE</th>
                  <th className="py-2.5 pb-2 font-bold">USERNAME</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">UKURAN DATABASE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {allDatabases.map((db, idx) => (
                  <tr key={db.id || idx} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-main">{db.ownerName}</span>
                        <span className="text-[10px] text-text-muted font-mono">{db.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-text-muted">{db.subdomainName}</td>
                    <td className="py-3 font-mono font-bold text-brand-primary">{db.db_name}</td>
                    <td className="py-3 font-mono text-[11px] text-text-main">{db.db_user}</td>
                    <td className="py-3 text-right pr-6 font-mono font-bold text-text-muted">
                      {(db as any).dbSizeMb ? `${(db as any).dbSizeMb.toFixed(2)} MB` : '0.00 MB'}
                    </td>
                  </tr>
                ))}
                {allDatabases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted italic">Tidak ada database terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardPanel>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // VIEW: PENGGUNAAN DISK (`admin-disk`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-disk') {
    const totalAccumulated = adminDiskUsage?.totalAccumulatedMb ?? 0;
    const totalFiles = adminDiskUsage?.totalFilesMb ?? 0;
    const totalDbs = adminDiskUsage?.totalDbMb ?? 0;
    const warningSubdomainsCount = adminDiskUsage?.subdomains.filter(s => (s.totalMb / s.limitMb) >= 0.8).length ?? 0;

    return (
      <div className="space-y-6 w-full text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
              PENGGUNAAN DISK
            </h1>
            <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
              Menampilkan kapasitas penyimpanan fisik asli di server cPanel (Filesystem Direktori) dan ukuran database MySQL secara terpadu dan real-time.
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={async () => {
            await fetchAdminDiskUsage();
            addToast({ type: 'success', title: 'Disk Synced', message: 'Data kuota penyimpanan cPanel berhasil diperbarui secara real-time.' });
          }}>
            REAL-TIME CPANEL API
          </Button>
        </div>

        {/* Info grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">TOTAL AKUMULASI</span>
                <span className="text-2xl font-bold text-text-main">{totalAccumulated.toFixed(2)} MB</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <HardDrive className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>

          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">KAPASITAS BERKAS</span>
                <span className="text-2xl font-bold text-text-main">{totalFiles.toFixed(2)} MB</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>

          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">KAPASITAS DATABASE</span>
                <span className="text-2xl font-bold text-text-main">{totalDbs.toFixed(2)} MB</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>

          <CardPanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">HAMPIR KUOTA PENUH</span>
                <span className="text-2xl font-bold text-text-main">{warningSubdomainsCount} Subdomain</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </CardPanel>
        </div>

        <CardPanel title="DAFTAR SUBDOMAIN & KAPASITAS PENYIMPANAN">
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">SUBDOMAIN / KLIEN</th>
                  <th className="py-2.5 pb-2 font-bold">PAKET</th>
                  <th className="py-2.5 pb-2 text-center font-bold">UKURAN FILE</th>
                  <th className="py-2.5 pb-2 text-center font-bold">UKURAN DATABASE</th>
                  <th className="py-2.5 pb-2 font-bold">RASIO PENGGUNAAN DISK (TOTAL)</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {(adminDiskUsage?.subdomains || []).map((sub, idx) => {
                  const ratio = Math.min(100, Math.round((sub.totalMb / sub.limitMb) * 100));
                  return (
                    <tr key={sub.id || idx} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-brand-primary">{sub.fullDomain}</span>
                          <span className="text-[10px] text-text-muted">{sub.owner?.name || 'Client'} ({sub.owner?.email || ''})</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-main">{sub.packageName}</span>
                          <span className="text-[9px] text-text-muted uppercase tracking-wider">BATAS: {sub.limitMb} MB</span>
                        </div>
                      </td>
                      <td className="py-3 text-center font-mono text-[10px] text-text-muted">{sub.filesMb.toFixed(2)} MB</td>
                      <td className="py-3 text-center font-mono text-[10px] text-text-muted">{sub.dbMb.toFixed(2)} MB</td>
                      <td className="py-3 max-w-[200px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-mono font-bold text-text-muted">
                            <span>{sub.totalMb.toFixed(2)} MB / {sub.limitMb} MB</span>
                            <span>{ratio}%</span>
                          </div>
                          <div className="w-full bg-border-main/40 h-2 rounded-full overflow-hidden border border-border-main/10">
                            <div className={`h-full rounded-full transition-all duration-300 ${ratio >= 80 ? 'bg-red-500' : 'bg-brand-primary'}`} style={{ width: `${ratio || 1}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right pr-6">
                        <button className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Sync Disk" onClick={() => addToast({ type: 'success', title: 'Sync Disk', message: `Disk ${sub.name} sukses diperbarui.` })}>
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex ml-1.5" 
                          title="Adjust Storage" 
                          onClick={() => {
                            setOverrideSubdomainId(Number(sub.id));
                            setOverrideLimitSize(String(sub.limitMb));
                            setOverrideDiskModal(true);
                          }}
                        >
                          <HardDrive className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(!adminDiskUsage?.subdomains || adminDiskUsage.subdomains.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted italic">Tidak ada data penyimpanan subdomain.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardPanel>

        {/* Override User Storage Limit Modal */}
        <Modal
          isOpen={overrideDiskModal}
          onClose={() => setOverrideDiskModal(false)}
          title={`Adjust NVMe Storage Space`}
          description="Override batas disk storage default pada virtual host klien secara manual."
        >
          <form onSubmit={handleSaveStorageOverride} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Batas Disk Baru (MB)</label>
              <input
                type="number"
                value={overrideLimitSize}
                onChange={(e) => setOverrideLimitSize(e.target.value)}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
              <Button type="button" variant="secondary" onClick={() => setOverrideDiskModal(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmittingOverride}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // VIEW: NOTIFIKASI (`admin-notifications`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-notifications') {
    return <AdminNotificationsView />;
  }

  // -----------------------------------------------------------------------------
  // VIEW: TIKET DUKUNGAN (`admin-reports`)
  // -----------------------------------------------------------------------------
  if (activeTab === 'admin-reports') {
    return <AdminReportsView />;
  }

  return null;
};

// Component implementations
const AdminNotificationsView: React.FC = () => {
  const { notifications, adminUsers, createNotification, deleteNotification } = useDataStore();
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUser, setTargetUser] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSubmitting(true);
    try {
      await createNotification(title, message, targetUser === 'all' ? null : targetUser);
      setTitle('');
      setMessage('');
      setTargetUser('all');
      addToast({
        type: 'success',
        title: 'Notifikasi Terkirim',
        message: targetUser === 'all' ? 'Notifikasi broadcast telah berhasil dikirim.' : 'Notifikasi telah dikirim ke klien target.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal membuat notifikasi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      addToast({
        type: 'success',
        title: 'Notifikasi Dihapus',
        message: 'Notifikasi berhasil dihapus.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menghapus notifikasi.',
      });
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
          Broadcast Notifikasi Klien
        </h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Buat dan kirim notifikasi ke seluruh klien atau ke klien tertentu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CardPanel title="BUAT NOTIFIKASI">
            <form onSubmit={handleSubmit} className="space-y-4 text-left mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">Target Klien</label>
                <select
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main outline-none"
                >
                  <option value="all">Broadcast (Semua Klien)</option>
                  {adminUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">Judul Notifikasi</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Pengumuman Penting"
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">Isi Notifikasi</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik isi notifikasi di sini..."
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none"
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Kirim Notifikasi
              </Button>
            </form>
          </CardPanel>
        </div>

        <div className="lg:col-span-2">
          <CardPanel title="RIWAYAT NOTIFIKASI">
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 font-bold">Judul & Pesan</th>
                    <th className="py-2.5 pb-2 font-bold">Penerima</th>
                    <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-text-main">{n.title}</span>
                          <span className="text-[10px] text-text-muted leading-relaxed">{n.message}</span>
                          <span className="text-[9px] text-text-muted/60 mt-1">{new Date(n.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {n.user ? (
                          <div className="flex flex-col">
                            <span className="font-semibold">{n.user.name}</span>
                            <span className="text-[9px] text-text-muted">{n.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded border border-brand-primary/20">SEMUA KLIEN</span>
                        )}
                      </td>
                      <td className="py-3 text-right pr-6">
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors active:scale-95 inline-flex"
                          title="Hapus"
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-text-muted italic">Belum ada notifikasi yang dibuat.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
};

const AdminReportsView: React.FC = () => {
  const { globalIssues, resolveIssue } = useDataStore();
  const { addToast } = useToastStore();

  const handleResolve = async (id: number) => {
    try {
      await resolveIssue(id);
      addToast({
        type: 'success',
        title: 'Masalah Diselesaikan',
        message: 'Laporan tiket dukungan berhasil ditandai sebagai selesai.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menyelesaikan masalah.',
      });
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
          Laporan Tiket Dukungan
        </h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Kelola laporan masalah dan keluhan yang dikirimkan oleh klien.
        </p>
      </div>

      <CardPanel title="TIKET MASUK">
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 font-bold">Klien</th>
                <th className="py-2.5 pb-2 font-bold">Subjek / Masalah</th>
                <th className="py-2.5 pb-2 text-center font-bold">Status</th>
                <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {globalIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 font-semibold text-text-main">
                    {issue.user_name}
                  </td>
                  <td className="py-3 max-w-md pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-brand-primary">{issue.subject}</span>
                      <span className="text-text-muted leading-relaxed mt-0.5">"{issue.message}"</span>
                      <span className="text-[9px] text-text-muted/60 mt-1">{new Date(issue.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge
                      status={issue.status === 'resolved' ? 'success' : 'pending'}
                      label={issue.status === 'resolved' ? 'SELESAI' : 'BUKA'}
                    />
                  </td>
                  <td className="py-3 text-right pr-6">
                    {issue.status !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleResolve(issue.id)}
                      >
                        Selesaikan
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {globalIssues.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted italic">Tidak ada tiket dukungan masuk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>
    </div>
  );
};

export default AdminDashboard;
