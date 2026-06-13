// src/pages/admin/views/AdminNotificationsView.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';

export const AdminNotificationsView: React.FC = () => {
  const { t, language } = useTranslation();
  const { notifications, adminUsers, createNotification, deleteNotification } = useDataStore();
  const { addToast } = useToastStore();

  const [title, setTitle]             = useState('');
  const [message, setMessage]         = useState('');
  const [targetUser, setTargetUser]   = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSubmitting(true);
    try {
      await createNotification(title, message, targetUser === 'all' ? null : targetUser);
      setTitle(''); setMessage(''); setTargetUser('all');
      addToast({ type: 'success', title: t('toastNotifSentTitle'), message: targetUser === 'all' ? t('toastNotifSentMsgAll') : t('toastNotifSentMsgTarget') });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastNotifSentError') });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      addToast({ type: 'success', title: t('toastNotifDeletedTitle'), message: t('toastNotifDeletedMsg') });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastNotifDeletedError') });
    }
  };

  const targetOptions = [
    { value: 'all', label: t('broadcastOption') },
    ...adminUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
  ];

  const dateLocale = language === 'id' ? 'id-ID' : 'en-US';

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">{t('broadcastTitle')}</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          {t('notificationsSubTitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <CardPanel title={t('createNotificationTitle')}>
            <form onSubmit={handleSubmit} className="space-y-4 text-left mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">{t('targetClientLabel')}</label>
                <Select value={targetUser} onChange={(e) => setTargetUser(e.target.value)} options={targetOptions} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">{t('notificationTitleLabel')}</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('notifTitlePlaceholder')}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">{t('notificationMessageLabel')}</label>
                <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('notifMsgPlaceholder')}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none" required />
              </div>
              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>{t('sendNotificationBtn')}</Button>
            </form>
          </CardPanel>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <CardPanel title={t('notificationHistoryTitle')}>
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 px-4 font-bold">{t('colTitleMessage')}</th>
                    <th className="py-2.5 pb-2 px-4 font-bold">{t('colRecipient')}</th>
                    <th className="py-2.5 pb-2 px-4 text-right font-bold">{t('action').toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-text-main">{n.title}</span>
                          <span className="text-[10px] text-text-muted leading-relaxed">{n.message}</span>
                          <span className="text-[9px] text-text-muted/60 mt-1">{new Date(n.createdAt).toLocaleString(dateLocale)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {n.user ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs">{n.user.name}</span>
                            <span className="text-[9px] text-text-muted">{n.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded border border-brand-primary/20">{t('allClientsBadge')}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDelete(n.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors active:scale-95 inline-flex" title={t('delete')}>
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-text-muted italic">{t('noNotifications')}</td></tr>
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

