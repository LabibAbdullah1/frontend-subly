// src/components/dashboard/StatusProgressBar.tsx
import React, { useState } from 'react';
import { AlertTriangle, HardDrive, PlusCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { useToastStore } from '../../stores/useToastStore';
import { useDataStore } from '../../stores/useDataStore';

export interface StatusProgressBarProps {
  used: number;
  max: number;
  unit: 'MB' | 'GB' | 'units';
  label: string;
  showWarningAt?: number; // Nilai persentase (e.g. 80)
  onAlertTrigger?: () => void;
}

export const StatusProgressBar: React.FC<StatusProgressBarProps> = ({
  used,
  max,
  unit,
  label,
  showWarningAt = 80,
  onAlertTrigger
}) => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { settings } = useDataStore();

  const warningLimit = settings.system_storage_warning_threshold ? parseInt(settings.system_storage_warning_threshold, 10) : showWarningAt;

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSize, setRequestSize] = useState('1024');
  const [requestReason, setRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percentage = Math.min(100, Math.round((used / max) * 100));

  // Determine adapt color
  let barColor = 'bg-brand-primary';
  let textColor = 'text-text-muted';

  if (percentage >= 100) {
    barColor = 'bg-red-500';
    textColor = 'text-red-500 dark:text-red-400';
  } else if (percentage >= warningLimit) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-500 dark:text-amber-400';
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestReason.length < 10) {
      addToast({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Alasan permintaan disk tambahan minimal 10 karakter.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRequestModalOpen(false);
      setRequestReason('');
      addToast({
        type: 'success',
        title: 'Permintaan Dikirim',
        message: `Permintaan tambahan disk sebesar ${requestSize} MB telah diajukan ke antrean admin.`,
      });
      if (onAlertTrigger) {
        onAlertTrigger();
      }
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-2.5 text-left select-none">
      {/* Label and detailed counts */}
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-text-main flex items-center gap-1.5">
          <HardDrive className="h-4 w-4 text-text-muted shrink-0" />
          {label}
        </span>
        <span className={`${textColor}`}>
          {used} / {max} {unit} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-border-main/50 h-3.5 rounded-full overflow-hidden border border-border-main/20 relative">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Adaptive Buttons & Warning alerts */}
      {percentage >= warningLimit && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1.5 p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/2 border border-amber-500/10">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>
              {percentage >= 100 
                ? 'Kapasitas penyimpanan penuh! Deployment baru akan diblokir.' 
                : 'Penyimpanan hampir penuh. Ajukan penambahan sebelum kehabisan slot.'
              }
            </span>
          </div>

          <button
            onClick={() => setRequestModalOpen(true)}
            className="text-[9px] font-black uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 transition-colors px-3 py-1.5 rounded-lg active:scale-95 flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-md shadow-amber-500/10"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Minta Tambahan Disk
          </button>
        </div>
      )}

      {/* Request disk override modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Form Permintaan Disk Tambahan"
        description="Ajukan penambahan disk storage space untuk subdomain Anda. Admin akan memverifikasi permohonan."
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4 text-left">
          {/* Preset size selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">
              Ukuran Preset Tambahan
            </label>
            <select
              value={requestSize}
              onChange={(e) => setRequestSize(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4.5 py-3 text-xs font-semibold text-text-main outline-none transition-all"
            >
              <option value="512">512 MB</option>
              <option value="1024">1024 MB (1 GB) - Recommended</option>
              <option value="2048">2048 MB (2 GB)</option>
              <option value="5120">5120 MB (5 GB)</option>
            </select>
          </div>

          {/* Reason text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">
              Alasan Pengajuan (Min. 10 Karakter)
            </label>
            <textarea
              rows={3}
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Jelaskan mengapa Anda membutuhkan ruang penyimpanan tambahan..."
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-2xl px-4.5 py-3.5 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setRequestModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              isLoading={isSubmitting}
            >
              Kirim Pengajuan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StatusProgressBar;
