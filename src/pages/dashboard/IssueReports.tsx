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

const issueSchema = z.object({
  subdomain_id: z.coerce.number().min(1, 'Pilih subdomain terkait'),
  subject: z.string().min(5, 'Subjek minimal 5 karakter'),
  message: z.string().min(10, 'Jelaskan kendala minimal 10 karakter'),
});

export const IssueReports: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { subdomains, globalIssues, addIssueReport } = useDataStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema)
  });

  const onSubmit = async (data: z.infer<typeof issueSchema>) => {
    setLoading(true);
    try {
      await addIssueReport(data.subdomain_id, data.subject, data.message);
      addToast({
        type: 'success',
        title: 'Isu Dilaporkan',
        message: 'Laporan sukses terkirim. Teknisi Subly segera mengecek status server.',
      });
      reset();
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Ada masalah pengiriman data.' });
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
            Laporkan gangguan performa server, virtual host Nginx, atau database PHP/NodeJS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form (Span 1.5) */}
        <div className="lg:col-span-1.5">
          <CardPanel title="Form Pelaporan Masalah (cPanel ticket)">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              
              {/* Subdomain selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  Subdomain Terkait
                </label>
                <select
                  {...register('subdomain_id')}
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                >
                  <option value="">Pilih Subdomain...</option>
                  {subdomains.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}.subly.host
                    </option>
                  ))}
                </select>
                {errors.subdomain_id && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    {errors.subdomain_id.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  Subjek Kendala
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="Contoh: SSL Expiration warning / Database Overload"
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
                  Detail Gangguan (Min. 10 Karakter)
                </label>
                <textarea
                  rows={4}
                  {...register('message')}
                  placeholder="Jelaskan kronologi error log, kode kesalahan, atau status website saat ini..."
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-3.5 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all resize-none"
                />
                {errors.message && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                Kirim Laporan Gangguan
              </Button>
            </form>
          </CardPanel>
        </div>

        {/* Right Column: Riwayat Isu Laporan (Span 1.5) */}
        <div className="lg:col-span-1.5">
          <CardPanel title="Riwayat Tiket Laporan Anda">
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
                      label={issue.status === 'resolved' ? 'Resolved' : 'Checking'}
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
                <p className="text-xs text-text-muted italic text-center py-6">Belum ada tiket insiden terdaftar.</p>
              )}
            </div>
          </CardPanel>
        </div>

      </div>
    </div>
  );
};
export default IssueReports;
