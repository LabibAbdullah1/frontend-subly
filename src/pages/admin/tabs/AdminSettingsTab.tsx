// src/pages/admin/tabs/AdminSettingsTab.tsx
import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';

export const AdminSettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useDataStore();
  const { addToast } = useToastStore();

  // QRIS state
  const [merchantName, setMerchantName] = useState('');
  const [qrisImageFile, setQrisImageFile] = useState<File | null>(null);
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isSavingQris, setIsSavingQris] = useState(false);

  // System params state
  const [systemStorageLimit, setSystemStorageLimit] = useState('256');
  const [systemDiskUpgradePrice, setSystemDiskUpgradePrice] = useState('10000');
  const [systemRootDomain, setSystemRootDomain] = useState('subly.my.id');
  const [systemStorageWarningThreshold, setSystemStorageWarningThreshold] = useState('80');
  const [systemSupportSla, setSystemSupportSla] = useState('< 10 Menit');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('');
  const [systemRamLimit, setSystemRamLimit] = useState('4');
  const [systemCpuCoresLimit, setSystemCpuCoresLimit] = useState('4');
  const [systemNprocLimit, setSystemNprocLimit] = useState('200');
  const [isSavingParams, setIsSavingParams] = useState(false);

  // QRIS preview URL
  useEffect(() => {
    if (!qrisImageFile) { setQrisPreviewUrl(null); return; }
    const url = URL.createObjectURL(qrisImageFile);
    setQrisPreviewUrl(url);
    setImageError(false);
    return () => URL.revokeObjectURL(url);
  }, [qrisImageFile]);

  // Sync from store
  useEffect(() => {
    if (settings) {
      setMerchantName(settings.qris_merchant_name || 'SUBLY HOSTING INDONESIA');
      setSystemStorageLimit(settings.system_storage_limit_gb || '256');
      setSystemDiskUpgradePrice(settings.system_disk_upgrade_price_per_gb || '10000');
      setSystemRootDomain(settings.system_root_domain || 'subly.my.id');
      setSystemStorageWarningThreshold(settings.system_storage_warning_threshold || '80');
      setSystemSupportSla(settings.system_support_sla || '< 10 Menit');
      setAdminNotificationEmail(settings.admin_notification_email || 'admin@subly.my.id');
      setSystemRamLimit(settings.system_ram_limit_gb || '4');
      setSystemCpuCoresLimit(settings.system_cpu_cores_limit || '4');
      setSystemNprocLimit(settings.system_nproc_limit || '200');
      setImageError(false);
    }
  }, [settings]);

  const UPLOADS_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';
  const currentQrisImg = settings.qris_image_path
    ? `${settings.qris_image_path.startsWith('http') ? '' : UPLOADS_BASE}/${settings.qris_image_path}`
    : null;
  const hasQrisImage = !!qrisPreviewUrl || (!!currentQrisImg && !imageError);

  const handleSaveQris = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingQris(true);
    try {
      await updateSetting({ qris_merchant_name: merchantName }, qrisImageFile || undefined);
      addToast({ type: 'success', title: t('toastSettingsSavedTitle'), message: t('toastSettingsSavedMsg') });
      setQrisImageFile(null);
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastSettingsSavedError') });
    } finally { setIsSavingQris(false); }
  };

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingParams(true);
    try {
      await updateSetting('system_storage_limit_gb', systemStorageLimit);
      await updateSetting('system_disk_upgrade_price_per_gb', systemDiskUpgradePrice);
      await updateSetting('system_root_domain', systemRootDomain);
      await updateSetting('system_storage_warning_threshold', systemStorageWarningThreshold);
      await updateSetting('system_support_sla', systemSupportSla);
      await updateSetting('admin_notification_email', adminNotificationEmail);
      await updateSetting('system_ram_limit_gb', systemRamLimit);
      await updateSetting('system_cpu_cores_limit', systemCpuCoresLimit);
      await updateSetting('system_nproc_limit', systemNprocLimit);
      addToast({ type: 'success', title: t('toastParamsSavedTitle'), message: t('toastParamsSavedMsg') });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastParamsSavedError') });
    } finally { setIsSavingParams(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      {/* QRIS Config */}
      <CardPanel title={t('qrisSettingsTitle')}>
        <form onSubmit={handleSaveQris} className="space-y-4 mt-2 text-xs">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">{t('merchantNameLabel')}</label>
            <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-main/50">
            {/* QRIS Preview */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                {qrisPreviewUrl ? t('newQrisPreviewLabel') : t('activeQrisPreviewLabel')}
              </span>
              <div className={`bg-white border border-border-main rounded-2xl overflow-hidden shadow-xs transition-all duration-200 ${
                hasQrisImage ? 'w-fit h-fit p-0' : 'w-full sm:w-60 min-h-[144px] flex items-center justify-center p-4 text-center'
              }`}>
                {qrisPreviewUrl ? (
                  <img src={qrisPreviewUrl} alt="Preview QRIS" className="block max-w-full sm:max-w-xs max-h-72 w-auto h-auto" />
                ) : currentQrisImg && !imageError ? (
                  <img src={currentQrisImg} onError={() => setImageError(true)} alt="Active QRIS" className="block max-w-full sm:max-w-xs max-h-72 w-auto h-auto" />
                ) : (
                  <span className="text-[10px] text-text-muted italic">
                    {currentQrisImg ? t('qrisImageNotFound') : t('noQrisActive')}
                  </span>
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-2 text-left flex flex-col justify-between">
              <div>
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block mb-2">{t('uploadQrisLabel')}</label>
                <label htmlFor="qris-image-input"
                  className="block border border-dashed border-border-main hover:border-brand-primary/45 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-36">
                  <input type="file" accept="image/*" onChange={(e) => setQrisImageFile(e.target.files?.[0] || null)} className="hidden" id="qris-image-input" />
                  <div className="flex flex-col items-center gap-1.5 w-full h-full justify-center">
                    <Upload className="h-6 w-6 text-text-muted" />
                    <span className="text-[10px] font-bold text-text-main block truncate max-w-full px-2">
                      {qrisImageFile ? qrisImageFile.name : t('uploadQrisPlaceholder')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={isSavingQris}>{t('saveQrisConfigBtn')}</Button>
        </form>
      </CardPanel>

      {/* System Parameters */}
      <CardPanel title={t('systemParamsTitle')}>
        <form onSubmit={handleSaveParams} className="space-y-4 mt-2 text-xs">
          {[
            { labelKey: 'paramStorageLimit' as const, value: systemStorageLimit, set: setSystemStorageLimit, type: 'number', min: '1' },
            { labelKey: 'paramDiskUpgradePrice' as const, value: systemDiskUpgradePrice, set: setSystemDiskUpgradePrice, type: 'number', min: '0' },
            { labelKey: 'paramRootDomain' as const, value: systemRootDomain, set: setSystemRootDomain, type: 'text', placeholder: 'subly.my.id' },
            { labelKey: 'paramWarningThreshold' as const, value: systemStorageWarningThreshold, set: setSystemStorageWarningThreshold, type: 'number', min: '1', max: '100' },
            { labelKey: 'paramSupportSla' as const, value: systemSupportSla, set: setSystemSupportSla, type: 'text', placeholder: '< 10 Menit' },
            { labelKey: 'paramNotificationEmail' as const, value: adminNotificationEmail, set: setAdminNotificationEmail, type: 'email', placeholder: 'admin@subly.my.id' },
            { labelKey: 'paramRamLimit' as const, value: systemRamLimit, set: setSystemRamLimit, type: 'number', min: '1' },
            { labelKey: 'paramCpuLimit' as const, value: systemCpuCoresLimit, set: setSystemCpuCoresLimit, type: 'number', min: '1' },
            { labelKey: 'paramNprocLimit' as const, value: systemNprocLimit, set: setSystemNprocLimit, type: 'number', min: '1' },
          ].map(({ labelKey, value, set, type, min, max, placeholder }: any) => (
            <div key={labelKey} className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">{t(labelKey)}</label>
              <input
                type={type} value={value} onChange={(e) => set(e.target.value)}
                placeholder={placeholder} min={min} max={max}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-bold text-text-main outline-none"
                required
              />
            </div>
          ))}
          <Button type="submit" variant="primary" isLoading={isSavingParams}>{t('saveParamsBtn')}</Button>
        </form>
      </CardPanel>
    </div>
  );
};
