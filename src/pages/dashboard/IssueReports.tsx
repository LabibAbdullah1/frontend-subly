// src/pages/dashboard/IssueReports.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

export const IssueReports: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { subdomains, globalIssues, addIssueReport } = useDataStore();
  const [loading, setLoading] = useState(false);

  const issueSchema = React.useMemo(() => z.object({
    subdomain_id: z.coerce.number().min(1, t('validationSelectSubdomain')),
    subject: z.string().min(5, t('validationSubjectMin')),
    message: z.string().min(10, t('validationMessageMin')),
  }), [t]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema)
  });

  const onSubmit = async (data: z.infer<typeof issueSchema>) => {
    setLoading(true);
    try {
      await addIssueReport(data.subdomain_id, data.subject, data.message);
      addToast({
        type: 'success',
        title: t('toastIssueReportedTitle'),
        message: t('toastIssueReportedMsg'),
      });
      reset();
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastIssueError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('reports')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            {t('issueReportSub')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form (Span 1.5) */}
        <div className="lg:col-span-1.5">
          <CardPanel title={t('issueFormTitle')}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              
              {/* Subdomain selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  {t('relatedSubdomainLabel')}
                </label>
                <Select
                  {...register('subdomain_id')}
                  options={subdomains.map((sub) => ({
                    value: sub.id,
                    label: `${sub.name}.subly.host`
                  }))}
                  placeholder={t('selectSubdomainPlaceholder')}
                />
                {errors.subdomain_id && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    {errors.subdomain_id.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  {t('issueSubjectLabel')}
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder={t('issueSubjectPlaceholder')}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                />
                {errors.subject && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message Details */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                  {t('issueDetailLabel')}
                </label>
                <textarea
                  rows={4}
                  {...register('message')}
                  placeholder={t('issueDetailPlaceholder')}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-3.5 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all resize-none"
                />
                {errors.message && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                {t('sendReportBtn')}
              </Button>
            </form>
          </CardPanel>
        </div>

        {/* Right Column: Riwayat Isu Laporan (Span 1.5) */}
        <div className="lg:col-span-1.5">
          <CardPanel title={t('reportHistoryTitle')}>
            <div className="space-y-3.5 mt-2">
              {globalIssues.map((issue) => (
                <div 
                  key={issue.id}
                  className="p-4 rounded-xl bg-bg-surface border border-border-main select-none flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-text-main truncate max-w-[180px]">{issue.subject}</h4>
                    <Badge 
                      status={issue.status === 'resolved' ? 'success' : 'pending'}
                      label={issue.status === 'resolved' ? t('statusResolved') : t('statusOpen')}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">
                    {issue.message}
                  </p>
                  <div className="border-t border-border-main/50 pt-2 flex justify-between items-center text-[9px] font-semibold text-text-muted uppercase tracking-widest">
                    <span>Subdomain ID: #{issue.subdomain_id}</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {globalIssues.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-6">{t('noIssuesRegistered')}</p>
              )}
            </div>
          </CardPanel>
        </div>

      </div>
    </div>
  );
};
export default IssueReports;

