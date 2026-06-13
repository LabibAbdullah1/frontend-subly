// src/pages/admin/tabs/AdminVouchersTab.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';

interface Props {
  onDeleteVoucher: (id: number) => void;
}

export const AdminVouchersTab: React.FC<Props> = ({ onDeleteVoucher }) => {
  const { vouchers, addVoucher, updateVoucher } = useDataStore();
  const { addToast } = useToastStore();

  // ─── Add Voucher ──────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('20');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setIsAdding(true);
    try {
      await addVoucher(newCode, Number(newDiscount), 100);
      setNewCode(''); setAddOpen(false);
      addToast({ type: 'success', title: 'Voucher Aktif', message: `Voucher ${newCode} sukses dirilis.` });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal menyimpan voucher.' });
    } finally { setIsAdding(false); }
  };

  // ─── Edit Voucher ─────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editMaxUses, setEditMaxUses] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (vc: any) => {
    setEditId(vc.id);
    setEditCode(vc.code);
    setEditDiscount(vc.discount_percent.toString());
    setEditMaxUses(vc.max_uses.toString());
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editCode) return;
    setIsEditing(true);
    try {
      await updateVoucher(editId, editCode, Number(editDiscount), Number(editMaxUses));
      setEditOpen(false);
      addToast({ type: 'success', title: 'Voucher Diperbarui', message: `Voucher ${editCode} berhasil diperbarui.` });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal memperbarui voucher.' });
    } finally { setIsEditing(false); }
  };

  return (
    <>
      <CardPanel
        title="Kelola Voucher Diskon"
        headerActions={
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Tambah Voucher
          </Button>
        }
      >
        <div className="overflow-x-auto w-full mt-2 select-none">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">Kode Voucher</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Diskon</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Maks Penggunaan</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Status</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {vouchers.map((vc) => (
                <tr key={vc.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-primary">{vc.code}</td>
                  <td className="py-3 px-4 text-center text-text-main font-bold">{vc.discount_percent}%</td>
                  <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">{vc.max_uses}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={vc.is_active ? 'success' : 'inactive'} label={vc.is_active ? 'Aktif' : 'Expired'} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEditClick(vc)} className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Edit Voucher">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDeleteVoucher(vc.id)} className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex" title="Hapus Voucher">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardPanel>

      {/* Add Voucher Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Buat Kode Voucher Diskon">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Kode Diskon</label>
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="SUBLYSUPER"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Persentase Diskon (%)</label>
            <input type="number" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isAdding}>Aktifkan Voucher</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Voucher Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Voucher Diskon">
        <form onSubmit={handleUpdate} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Kode Diskon</label>
            <input type="text" value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Persentase Diskon (%)</label>
            <input type="number" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Batas Penggunaan</label>
            <input type="number" value={editMaxUses} onChange={(e) => setEditMaxUses(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isEditing}>Perbarui Voucher</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
