// src/pages/admin/views/AdminSubdomainView.tsx
import React, { useState } from 'react';
import { Plus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';

const getRemainingTime = (expiryStr: string | null) => {
  if (!expiryStr) return 'Lifetime';
  const expiry = new Date(expiryStr);
  const diffTime = expiry.getTime() - Date.now();
  if (diffTime <= 0) return 'Expired';
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} months from now (${expiry.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})`;
  }
  return `${diffDays} days left (${expiry.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})`;
};

export const AdminSubdomainView: React.FC = () => {
  const { addToast } = useToastStore();
  const { subdomains, payments, adminUsers, settings, addSubdomain, toggleSubdomainStatus, fetchSubdomains } = useDataStore();

  const [registerOpen, setRegisterOpen]               = useState(false);
  const [selectedPaymentId, setSelectedPaymentId]     = useState<number | null>(null);
  const [registerName, setRegisterName]               = useState('');
  const [isRegistering, setIsRegistering]             = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const rootDomain = settings.system_root_domain || 'subly.host';
    if (!selectedPaymentId) { addToast({ type: 'error', title: 'Validasi Gagal', message: 'Pilih transaksi pembayaran lunas klien.' }); return; }
    if (!registerName || !/^[a-z0-9-_]+$/.test(registerName)) {
      addToast({ type: 'error', title: 'Validasi Gagal', message: 'Nama subdomain tidak valid. Hanya huruf kecil, angka, minus dan underscore.' }); return;
    }
    setIsRegistering(true);
    try {
      await addSubdomain(registerName, selectedPaymentId);
      addToast({ type: 'success', title: 'Subdomain Berhasil Didaftarkan', message: `${registerName}.${rootDomain} telah aktif!` });
      setRegisterOpen(false);
      setSelectedPaymentId(null);
      setRegisterName('');
      await fetchSubdomains();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Gagal', message: err.message || 'Subdomain sudah digunakan atau terjadi kesalahan.' });
    } finally { setIsRegistering(false); }
  };

  const handleToggle = async (subId: number, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    try {
      await toggleSubdomainStatus(subId, next);
      addToast({ type: 'success', title: 'Status Diperbarui', message: `Subdomain berhasil ${next === 'active' ? 'diaktifkan kembali' : 'ditangguhkan (suspend)'}.` });
      await fetchSubdomains();
    } catch (err: any) { addToast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal mengubah status subdomain.' }); }
  };

  const eligiblePayments = payments.filter((p) => p.status === 'success' && !p.subdomain_id);

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">Direktori Subdomain</h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Kelola dan audit situs web klien aktif, periksa jadwal kadaluarsa, dan moderasi jalur live.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setRegisterOpen(true)}>
          DAFTARKAN SUBDOMAIN BARU
        </Button>
      </div>

      <CardPanel title="Direktori Subdomain">
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">PEMILIK</th>
                <th className="py-2.5 pb-2 px-4 font-bold">SUBDOMAIN</th>
                <th className="py-2.5 pb-2 px-4 font-bold">URL LENGKAP</th>
                <th className="py-2.5 pb-2 px-4 font-bold">SISA WAKTU</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">STATUS</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {subdomains.map((sub, idx) => (
                <tr key={sub.id || idx} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-main">{sub.user?.name || 'Client'}</span>
                      <span className="text-[10px] text-text-muted font-mono">{sub.user?.email || ''}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-primary">{sub.name}</td>
                  <td className="py-3 px-4">
                    <a href={`http://${sub.full_domain}`} target="_blank" rel="noopener noreferrer"
                      className="text-text-muted hover:text-brand-primary underline truncate font-mono block max-w-xs">
                      {sub.full_domain}
                    </a>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-text-muted">{getRemainingTime(sub.expired_at)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={sub.status === 'active' ? 'success' : 'inactive'} label={sub.status.toUpperCase()} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggle(Number(sub.id), sub.status)}
                      title={sub.status === 'active' ? 'Tangguhkan (Suspend)' : 'Aktifkan Subdomain'}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 flex items-center justify-center ml-auto ${
                        sub.status === 'active'
                          ? 'text-amber-500 bg-amber-500/10 border-amber-500/15 hover:bg-amber-500/20'
                          : 'text-green-500 bg-green-500/10 border-green-500/15 hover:bg-green-500/20'
                      }`}
                    >
                      {sub.status === 'active' ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
              {subdomains.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-text-muted italic">Tidak ada subdomain aktif.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>

      {/* Register Modal */}
      <Modal isOpen={registerOpen} onClose={() => setRegisterOpen(false)}
        title="Daftarkan Subdomain Klien Baru"
        description="Sebagai Admin, Anda dapat mendaftarkan subdomain baru untuk klien menggunakan slot pembayaran/hosting yang telah lunas.">
        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-main">Pilih Transaksi & Klien</label>
            <Select
              value={selectedPaymentId || ''}
              onChange={(e) => setSelectedPaymentId(e.target.value ? Number(e.target.value) : null)}
              options={eligiblePayments.map((p) => {
                const owner = adminUsers.find((u) => u.id === p.user_id);
                return { value: p.id, label: `${owner?.name || `Client #${p.user_id}`} (${owner?.email || ''}) - ${p.plan?.name || 'Hosting Plan'} - #${p.transaction_id || p.id}` };
              })}
              placeholder="-- Pilih Slot Transaksi Klien (Success & Belum Ada Subdomain) --"
            />
            {eligiblePayments.length === 0 && (
              <p className="text-[10px] text-amber-500 font-semibold">* Tidak ada transaksi pembayaran berstatus 'Success' yang belum terhubung ke subdomain.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-main">Nama Subdomain</label>
            <div className="flex items-stretch">
              <input type="text" value={registerName}
                onChange={(e) => setRegisterName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                placeholder="website-saya"
                className="flex-1 bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl rounded-r-none border-r-0 px-4 py-2.5 text-xs font-mono font-semibold text-text-main outline-none"
                required />
              <span className="bg-border-main/20 border border-border-main border-l-0 px-4 flex items-center rounded-r-xl text-xs font-bold text-text-muted select-none font-mono">
                .{settings.system_root_domain || 'subly.host'}
              </span>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">Hanya diperbolehkan huruf kecil (a-z), angka (0-9), tanda hubung (-) dan garis bawah (_).</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main/50">
            <Button type="button" variant="secondary" onClick={() => setRegisterOpen(false)} disabled={isRegistering}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isRegistering} disabled={eligiblePayments.length === 0}>Aktifkan Subdomain</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
