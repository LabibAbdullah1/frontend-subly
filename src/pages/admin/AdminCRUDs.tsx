// src/pages/admin/AdminCRUDs.tsx
import React, { useState } from 'react';
import { 
  ShoppingBag, Percent, Users, Settings, 
  Plus, Trash2, ArrowUpRight, Check, 
  HelpCircle, Edit3, HardDrive, Key 
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AdminCRUDs: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { activeTab } = useSystemStore();
  const { 
    plans, 
    vouchers, 
    subdomains,
    payments
  } = useDataStore();

  // Plans CRUD Mock states
  const [plansList, setPlansList] = useState(plans);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('29000');
  const [newPlanType, setNewPlanType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [newPlanStorage, setNewPlanStorage] = useState('1024');

  // Vouchers CRUD Mock states
  const [vouchersList, setVouchersList] = useState(vouchers);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('20');

  // Users Directory override states
  const [overrideUserModal, setOverrideUserModal] = useState(false);
  const [overrideTargetId, setOverrideTargetId] = useState<number | null>(null);
  const [overrideLimitSize, setOverrideLimitSize] = useState('2048');

  // Mock Clients list
  const [clientsList, setClientsList] = useState([
    { id: 1, name: 'Labib', email: 'client@subly.net', verified: true, joinDate: '2026-06-01', activeSubdomain: 'myportfolio' },
    { id: 2, name: 'Farhan', email: 'farhan@gmail.com', verified: true, joinDate: '2026-05-15', activeSubdomain: 'blog-dev' },
    { id: 3, name: 'Siti Nur', email: 'siti@unverified.net', verified: false, joinDate: '2026-06-03', activeSubdomain: 'None' },
  ]);

  // Plans Actions
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;

    const newPlan = {
      id: plansList.length + 1,
      name: newPlanName,
      price: Number(newPlanPrice),
      type: newPlanType,
      description: `Dedicated ${newPlanType} cPanel environment.`,
      max_storage_mb: Number(newPlanStorage),
      max_databases: newPlanType === 'PHP' ? 3 : 5,
      duration_months: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setPlansList(prev => [...prev, newPlan]);
    setNewPlanName('');
    setPlanModalOpen(false);
    addToast({
      type: 'success',
      title: 'Paket Dibuat',
      message: `Paket hosting ${newPlanName} berhasil didaftarkan.`,
    });
  };

  const handleDeletePlan = (id: number) => {
    setPlansList(prev => prev.filter(p => p.id !== id));
    addToast({
      type: 'success',
      title: 'Paket Dihapus',
      message: 'Paket hosting dihapus permanen dari cPanel billing.',
    });
  };

  // Vouchers Actions
  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode) return;

    const newVoucher = {
      id: vouchersList.length + 1,
      code: newVoucherCode.toUpperCase().replace(/\s+/g, ''),
      discount_percent: Number(newVoucherDiscount),
      max_uses: 50,
      uses: 0,
      is_active: true,
    };

    setVouchersList(prev => [...prev, newVoucher]);
    setNewVoucherCode('');
    setVoucherModalOpen(false);
    addToast({
      type: 'success',
      title: 'Voucher Aktif',
      message: `Voucher diskon ${newVoucherCode} sukses dirilis.`,
    });
  };

  const handleDeleteVoucher = (id: number) => {
    setVouchersList(prev => prev.filter(v => v.id !== id));
    addToast({
      type: 'success',
      title: 'Voucher Dihapus',
      message: 'Kode diskon dinonaktifkan.',
    });
  };

  // User Storage Limit Overrides
  const handleSaveStorageOverride = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Kapasitas Di-override',
      message: `Batas storage untuk Klien ID #${overrideTargetId} sukses diubah menjadi ${overrideLimitSize} MB.`,
    });
    setOverrideUserModal(false);
  };

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* ---------------------------------------------------- */}
      {/* Plans CRUD tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-plans' && (
        <CardPanel 
          title={t('planManager')}
          headerActions={
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setPlanModalOpen(true)}
            >
              Tambah Paket
            </Button>
          }
        >
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Nama Paket</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Runtime</th>
                  <th className="py-2.5 pb-2 text-center font-bold">NVMe Storage</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Price</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {plansList.map((plan) => (
                  <tr key={plan.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-semibold text-text-main">
                      {plan.name}
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-[9px] font-black uppercase bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">
                        {plan.type}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono text-[10px] text-text-muted">
                      {plan.max_storage_mb} MB
                    </td>
                    <td className="py-3 text-center font-bold text-text-main font-mono">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right pr-6">
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                        title="Hapus Paket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ---------------------------------------------------- */}
      {/* Vouchers CRUD tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-vouchers' && (
        <CardPanel 
          title={t('voucherManager')}
          headerActions={
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setVoucherModalOpen(true)}
            >
              Tambah Voucher
            </Button>
          }
        >
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Kode Voucher</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Diskon</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Maks Penggunaan</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Terpakai</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {vouchersList.map((vc) => (
                  <tr key={vc.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-primary">
                      {vc.code}
                    </td>
                    <td className="py-3 text-center text-text-main font-bold">
                      {vc.discount_percent}%
                    </td>
                    <td className="py-3 text-center font-mono text-[10px] text-text-muted">
                      {vc.max_uses}
                    </td>
                    <td className="py-3 text-center font-mono text-[10px] text-emerald-500 font-bold">
                      {vc.uses}
                    </td>
                    <td className="py-3 text-right pr-6">
                      <button
                        onClick={() => handleDeleteVoucher(vc.id)}
                        className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ---------------------------------------------------- */}
      {/* Users Manager tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-users' && (
        <CardPanel title={t('userManager')}>
          <div className="overflow-x-auto w-full mt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                  <th className="py-2.5 pb-2 font-bold">Nama Klien</th>
                  <th className="py-2.5 pb-2 font-bold">Email</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Subdomain Aktif</th>
                  <th className="py-2.5 pb-2 text-center font-bold">Verifikasi</th>
                  <th className="py-2.5 pb-2 text-right pr-6 font-bold">Override Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-xs">
                {clientsList.map((client) => (
                  <tr key={client.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 font-semibold text-text-main">
                      {client.name}
                    </td>
                    <td className="py-3 text-text-muted">
                      {client.email}
                    </td>
                    <td className="py-3 text-center font-mono text-[10px] text-text-main">
                      {client.activeSubdomain !== 'None' ? `${client.activeSubdomain}.subly.host` : 'None'}
                    </td>
                    <td className="py-3 text-center">
                      <Badge 
                        status={client.verified ? 'success' : 'inactive'} 
                        label={client.verified ? 'Verified' : 'Unverified'} 
                      />
                    </td>
                    <td className="py-3 text-right pr-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        icon={<HardDrive className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setOverrideTargetId(client.id);
                          setOverrideUserModal(true);
                        }}
                      >
                        Adjust Storage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ---------------------------------------------------- */}
      {/* Global Settings tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'admin-settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          <CardPanel title="Pengaturan QRIS Statis Sistem">
            <div className="space-y-4 mt-2 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Merchant Name</label>
                <input 
                  type="text" 
                  defaultValue="SUBLY HOSTING INDONESIA" 
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" 
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">NMID QRIS</label>
                <input 
                  type="text" 
                  defaultValue="ID102027381928" 
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none" 
                />
              </div>
              <Button variant="primary">Simpan QRIS Config</Button>
            </div>
          </CardPanel>
        </div>
      )}

      {/* Add Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Daftarkan Paket Hosting Baru"
      >
        <form onSubmit={handleAddPlan} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Nama Paket</label>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Subly PHP Enterprise"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Runtime Type</label>
              <select
                value={newPlanType}
                onChange={(e) => setNewPlanType(e.target.value as 'PHP' | 'NodeJS')}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main outline-none"
              >
                <option value="PHP">PHP & Laravel</option>
                <option value="NodeJS">Node.js Runtimes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Harga Bulanan (Rp)</label>
              <input
                type="number"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(e.target.value)}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">NVMe Storage Limit (MB)</label>
            <input
              type="number"
              value={newPlanStorage}
              onChange={(e) => setNewPlanStorage(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setPlanModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary">
              Simpan Paket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Voucher Modal */}
      <Modal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        title="Buat Kode Voucher Diskon"
      >
        <form onSubmit={handleAddVoucher} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Kode Diskon</label>
            <input
              type="text"
              value={newVoucherCode}
              onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
              placeholder="SUBLYSUPER"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Persentase Diskon (%)</label>
            <input
              type="number"
              value={newVoucherDiscount}
              onChange={(e) => setNewVoucherDiscount(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setVoucherModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary">
              Aktifkan Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Override User Storage Limit Modal */}
      <Modal
        isOpen={overrideUserModal}
        onClose={() => setOverrideUserModal(false)}
        title={`Adjust NVMe Storage Space: Client #${overrideTargetId}`}
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
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setOverrideUserModal(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default AdminCRUDs;
