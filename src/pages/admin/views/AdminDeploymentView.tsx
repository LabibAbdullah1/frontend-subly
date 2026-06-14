// src/pages/admin/views/AdminDeploymentView.tsx
import React, { useState } from 'react';
import { Globe, AlertCircle, Check, X } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Badge } from '../../../components/ui/Badge';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';

interface Props {
  allDeployments: any[];
  activeQueueDeployments: any[];
}

export const AdminDeploymentView: React.FC<Props> = ({ allDeployments, activeQueueDeployments }) => {
  const { t, language } = useTranslation();
  const { addToast } = useToastStore();
  const { approveDeployment, rejectDeployment } = useDataStore();
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  const [selectedDeployment, setSelectedDeployment] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionSelect = (dep: any, type: 'approve' | 'reject') => {
    setSelectedDeployment(dep);
    setActionType(type);
    setAdminNote('');
  };

  const handleConfirmAction = async () => {
    if (!selectedDeployment || !actionType) return;
    if (actionType === 'reject' && !adminNote.trim()) {
      addToast({
        type: 'error',
        title: 'Catatan Wajib Diisi',
        message: 'Mohon masukkan alasan penolakan deployment.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        await approveDeployment(selectedDeployment.id, adminNote);
        addToast({
          type: 'success',
          title: 'Deployment Disetujui',
          message: `Sukses menyetujui deployment untuk ${selectedDeployment.subdomainName}.`,
        });
      } else {
        await rejectDeployment(selectedDeployment.id, adminNote);
        addToast({
          type: 'success',
          title: 'Deployment Ditolak',
          message: `Sukses menolak deployment untuk ${selectedDeployment.subdomainName}.`,
        });
      }
      setSelectedDeployment(null);
      setActionType(null);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Memproses',
        message: err.message || 'Terjadi kesalahan sistem saat memperbarui status deployment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">{t('adminDeploymentTitle')}</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          {t('deploymentSubTitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Queue */}
        <div className="lg:col-span-1">
          <CardPanel title={t('activeQueueTitle')} headerActions={
            <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
              {activeQueueDeployments.length} {t('queuePendingLabel').toUpperCase()}
            </span>
          }>
            <div className="py-4 space-y-3.5 mt-2">
              {activeQueueDeployments.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-8">{t('noActiveDeployments')}</p>
              ) : (
                activeQueueDeployments.map((q, idx) => (
                  <div key={idx} className="p-4 bg-bg-surface border border-border-main rounded-xl flex flex-col gap-3 text-left shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-text-main text-xs font-mono">{q.subdomainName}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          v{q.version} • {q.ownerName}
                        </p>
                      </div>
                      <Badge status="pending" label={q.status.toUpperCase()} />
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border-main/40">
                      <button
                        onClick={() => handleActionSelect(q, 'approve')}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-2 px-3 rounded-lg bg-green-600 hover:bg-green-500 text-white cursor-pointer active:scale-95 transition-all animate-in fade-in zoom-in-95 duration-150"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Setujui
                      </button>
                      <button
                        onClick={() => handleActionSelect(q, 'reject')}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white cursor-pointer active:scale-95 transition-all animate-in fade-in zoom-in-95 duration-150"
                      >
                        <X className="w-3.5 h-3.5" />
                        Tolak
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardPanel>
        </div>

        {/* Deployment History */}
        <div className="lg:col-span-2">
          <CardPanel title={t('deploymentHistoryTitle')}>
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left min-w-[650px]">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 px-4 font-bold">{t('colArtifact')}</th>
                    <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('colStatus')}</th>
                    <th className="py-2.5 pb-2 px-4 text-right font-bold">{t('colArtifactDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {allDeployments.map((dep, idx) => (
                    <tr key={idx} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-main">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs">{dep.subdomainName}</span>
                          <span className="text-[10px] text-text-muted font-normal">
                            {language === 'id' ? 'Pemilik' : 'Owner'}: {dep.ownerName}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] bg-brand-primary/15 text-brand-primary border border-brand-primary/20 px-1 rounded">
                              {t('buildLabel').replace('{version}', dep.version)}
                            </span>
                            {dep.gitUrl ? (
                              <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1 rounded flex items-center gap-0.5">
                                <Globe className="h-3 w-3" /> GITHUB
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded">
                                {t('zipArchiveLabel')}
                              </span>
                            )}
                          </div>
                          {dep.notes && (
                            <span className="text-[10px] text-text-muted font-normal mt-1 italic">
                              Catatan Client: {dep.notes}
                            </span>
                          )}
                          {dep.admin_note && (
                            <span className="text-[10px] text-emerald-500 font-semibold mt-1">
                              Catatan Admin: {dep.admin_note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge status={dep.status === 'success' ? 'success' : dep.status === 'error' ? 'inactive' : 'pending'} label={dep.status.toUpperCase()} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] text-text-muted">
                        {new Date(dep.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' })},{' '}
                        {new Date(dep.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {allDeployments.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-text-muted italic">{t('noDeploymentsHistory')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardPanel>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={selectedDeployment !== null}
        onClose={() => { setSelectedDeployment(null); setActionType(null); }}
        title={actionType === 'approve' ? 'Setujui Deployment?' : 'Tolak Deployment?'}
        description={
          actionType === 'approve'
            ? `Apakah Anda yakin ingin menyetujui deployment v${selectedDeployment?.version} untuk subdomain ${selectedDeployment?.subdomainName}? Website akan dinyatakan berhasil dideploy.`
            : `Apakah Anda yakin ingin menolak deployment v${selectedDeployment?.version} untuk subdomain ${selectedDeployment?.subdomainName}?`
        }
        footerActions={
          <>
            <Button
              variant="secondary"
              onClick={() => { setSelectedDeployment(null); setActionType(null); }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant={actionType === 'approve' ? 'primary' : 'danger'}
              onClick={handleConfirmAction}
              isLoading={isSubmitting}
            >
              {actionType === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`flex items-start gap-3 p-3 rounded-xl border text-xs text-left ${
            actionType === 'approve' 
              ? 'bg-green-500/5 border-green-500/10 text-green-600 dark:text-green-400' 
              : 'bg-red-500/5 border-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Informasi Deployment:</p>
              <div className="mt-1 font-mono text-[10px] space-y-0.5">
                <p>Subdomain: {selectedDeployment?.subdomainName}</p>
                <p>Versi: v{selectedDeployment?.version}</p>
                <p>Owner: {selectedDeployment?.ownerName}</p>
                {selectedDeployment?.notes && <p>Catatan Klien: "{selectedDeployment.notes}"</p>}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
              Catatan/Alasan Admin {actionType === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'Catatan opsional (misal: Website berjalan dengan baik)'
                  : 'Sebutkan alasan penolakan (misal: Error 500 saat dibuka / File .env tidak valid)'
              }
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl p-3 text-xs text-text-main placeholder-text-muted/60 outline-none transition-all resize-none font-sans"
              required={actionType === 'reject'}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
