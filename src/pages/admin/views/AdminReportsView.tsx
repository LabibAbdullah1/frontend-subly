// src/pages/admin/views/AdminReportsView.tsx
import React from 'react';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const AdminReportsView: React.FC = () => {
  const { t, language } = useTranslation();
  const { globalIssues, resolveIssue } = useDataStore();
  const { addToast } = useToastStore();

  const handleResolve = async (id: number) => {
    try {
      await resolveIssue(id);
      addToast({ type: 'success', title: t('toastIssueResolvedTitle'), message: t('toastIssueResolvedMsg') });
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastIssueResolvedError') });
    }
  };

  const dateLocale = language === 'id' ? 'id-ID' : 'en-US';

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">{t('supportTicketReports')}</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          {t('reportsSubTitle')}
        </p>
      </div>

      <CardPanel title={t('incomingTicketsTitle')}>
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">{t('colClient')}</th>
                <th className="py-2.5 pb-2 px-4 font-bold">{t('colSubjectIssue')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('status')}</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {globalIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-main">{issue.user_name}</td>
                  <td className="py-3 px-4 max-w-md">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-brand-primary">{issue.subject}</span>
                      <span className="text-text-muted leading-relaxed">"{issue.message}"</span>
                      <span className="text-[9px] text-text-muted/60 mt-1">{new Date(issue.created_at).toLocaleString(dateLocale)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={issue.status === 'resolved' ? 'success' : 'pending'} label={issue.status === 'resolved' ? t('statusResolved') : t('statusOpen')} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {issue.status !== 'resolved' && (
                      <Button size="sm" variant="primary" onClick={() => handleResolve(issue.id)}>{t('resolveBtn')}</Button>
                    )}
                  </td>
                </tr>
              ))}
              {globalIssues.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-text-muted italic">{t('noIncomingTickets')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>
    </div>
  );
};

