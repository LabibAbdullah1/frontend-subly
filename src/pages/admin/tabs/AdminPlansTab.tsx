// src/pages/admin/tabs/AdminPlansTab.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';

interface Props {
  onDeletePlan: (id: number) => void;
}

export const AdminPlansTab: React.FC<Props> = ({ onDeletePlan }) => {
  const { t } = useTranslation();
  const { plans, addPlan, updatePlan } = useDataStore();
  const { addToast } = useToastStore();

  // ─── Add Plan ─────────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('29000');
  const [newType, setNewType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [newStorage, setNewStorage] = useState('1024');
  const [newDesc, setNewDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsAdding(true);
    try {
      await addPlan(newName, Number(newPrice), newType, Number(newStorage), newDesc);
      setNewName(''); setNewDesc(''); setAddOpen(false);
      addToast({ type: 'success', title: t('toastPlanCreatedTitle'), message: t('toastPlanCreatedMsg').replace('{name}', newName) });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastPlanCreatedError') });
    } finally { setIsAdding(false); }
  };

  // ─── Edit Plan ────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editType, setEditType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [editStorage, setEditStorage] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (plan: any) => {
    setEditId(plan.id);
    setEditName(plan.name);
    setEditPrice(plan.price.toString());
    setEditType(plan.type);
    setEditStorage(plan.max_storage_mb.toString());
    setEditDesc(plan.description || '');
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName) return;
    setIsEditing(true);
    try {
      await updatePlan(editId, editName, Number(editPrice), editType, Number(editStorage), editDesc);
      setEditOpen(false);
      addToast({ type: 'success', title: t('toastPlanUpdatedTitle'), message: t('toastPlanUpdatedMsg').replace('{name}', editName) });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastPlanUpdatedError') });
    } finally { setIsEditing(false); }
  };

  const planTypeOptions = [
    { value: 'PHP',    label: t('phpLaravel') },
    { value: 'NodeJS', label: t('nodeJsRuntimes') },
  ];

  return (
    <>
      <CardPanel
        title={t('planManager')}
        headerActions={
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            {t('addPlan')}
          </Button>
        }
      >
        <div className="overflow-x-auto w-full mt-2 select-none">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">{t('planNameLabel')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('colRuntime')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('colStorage')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('colPrice')}</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">{t('colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-main">
                    <div className="flex flex-col">
                      <span>{plan.name}</span>
                      {plan.description && (
                        <span className="text-[10px] text-text-muted font-normal mt-0.5 max-w-xs truncate">{plan.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      plan.type === 'NodeJS'
                        ? 'bg-green-500/10 text-green-500 border border-green-500/15'
                        : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15'
                    }`}>
                      {plan.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">{plan.max_storage_mb} MB</td>
                  <td className="py-3 px-4 text-center font-bold text-text-main font-mono">
                    Rp {plan.price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEditClick(plan)} className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Edit Paket">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDeletePlan(plan.id)} className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex" title="Hapus Paket">
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

      {/* Add Plan Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={t('addNewPlanTitle')}>
        <form onSubmit={handleAdd} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('planNameLabel')}</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('planNamePlaceholder')}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">{t('runtimeTypeLabel')}</label>
              <Select value={newType} onChange={(e) => setNewType(e.target.value as 'PHP' | 'NodeJS')} options={planTypeOptions} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">{t('monthlyPriceLabel')}</label>
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('storageLimitLabel')}</label>
            <input type="number" value={newStorage} onChange={(e) => setNewStorage(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('planDescriptionLabel')}</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={t('planDescPlaceholder')} rows={3}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" isLoading={isAdding}>{t('savePlanBtn')}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={t('editPlanTitle')}>
        <form onSubmit={handleUpdate} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('planNameLabel')}</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">{t('runtimeTypeLabel')}</label>
              <Select value={editType} onChange={(e) => setEditType(e.target.value as 'PHP' | 'NodeJS')} options={planTypeOptions} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">{t('monthlyPriceLabel')}</label>
              <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('storageLimitLabel')}</label>
            <input type="number" value={editStorage} onChange={(e) => setEditStorage(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('planDescriptionLabel')}</label>
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" isLoading={isEditing}>{t('updatePlanBtn')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
