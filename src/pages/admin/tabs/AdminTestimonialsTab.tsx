// src/pages/admin/tabs/AdminTestimonialsTab.tsx
import React, { useState } from 'react';
import { Trash2, Star, MessageSquare } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { useTranslation } from '../../../hooks/useTranslation';
import type { TestimonialStatus } from '../../../types';

interface Props {
  onDeleteTestimonial: (id: number) => void;
}

export const AdminTestimonialsTab: React.FC<Props> = ({ onDeleteTestimonial }) => {
  const { t, language } = useTranslation();
  const { adminTestimonials, adminUsers, updateTestimonialStatus } = useDataStore();
  const { addToast } = useToastStore();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<TestimonialStatus>('approved');
  const [reviewAdminNote, setReviewAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReview = (testimonial: any) => {
    setReviewTargetId(testimonial.id);
    setReviewStatus(testimonial.status);
    setReviewAdminNote(testimonial.admin_note || '');
    setReviewOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetId) return;
    setIsSubmitting(true);
    try {
      await updateTestimonialStatus(reviewTargetId, reviewStatus, reviewAdminNote);
      addToast({ type: 'success', title: t('toastTestimonialSavedTitle'), message: t('toastTestimonialSavedMsg') });
      setReviewOpen(false);
      setReviewAdminNote('');
    } catch {
      addToast({ type: 'error', title: t('error'), message: t('toastTestimonialSavedError') });
    } finally { setIsSubmitting(false); }
  };

  const statusOptions = [
    { value: 'pending',  label: language === 'id' ? 'Pending (Menunggu Review)' : 'Pending (Awaiting Review)' },
    { value: 'approved', label: language === 'id' ? 'Approved (Disetujui)' : 'Approved' },
    { value: 'featured', label: language === 'id' ? 'Featured (Tampilkan Utama di Landing Page)' : 'Featured (Show on Landing Page)' },
    { value: 'rejected', label: language === 'id' ? 'Rejected (Ditolak)' : 'Rejected' },
  ];

  return (
    <>
      <CardPanel title={t('testimonialsTitle')}>
        <div className="overflow-x-auto w-full mt-2 select-none">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">{t('colClient')}</th>
                <th className="py-2.5 pb-2 px-4 font-bold">{t('colSubdomain')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('colRating')}</th>
                <th className="py-2.5 pb-2 px-4 font-bold">{t('feedbackLabel')}</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">{t('status')}</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">{t('colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {adminTestimonials.map((testi) => (
                <tr key={testi.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-main">
                    <div className="flex flex-col">
                      <span>{testi.user?.name}</span>
                      <span className="text-[10px] text-text-muted font-normal">{testi.user?.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted font-mono text-[10px]">
                    {testi.subdomain
                      ? `${testi.subdomain.name}.subly.my.id`
                      : (() => {
                           const owner = adminUsers.find((u) => u.id === testi.user_id);
                           return owner?.subdomains?.[0] ? `${owner.subdomains[0].name}.subly.my.id` : t('emptyStatus');
                        })()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= testi.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted/30'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-text-main line-clamp-1">{testi.title}</span>
                      <span className="text-[10px] text-text-muted line-clamp-2 leading-relaxed">"{testi.content}"</span>
                      {testi.admin_note && (
                        <span className="text-[9px] font-medium text-brand-primary italic mt-1">Note: "{testi.admin_note}"</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      status={
                        testi.status === 'approved' || testi.status === 'featured' ? 'success'
                          : testi.status === 'rejected' ? 'inactive' : 'pending'
                      }
                      label={testi.status.toUpperCase()}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenReview(testi)}
                        className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Review Testimonial">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDeleteTestimonial(testi.id)}
                        className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex" title="Hapus Testimonial">
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

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title={t('reviewTestimonialTitle')}
        description={t('reviewTestimonialDesc')}>
        <form onSubmit={handleSaveReview} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('testimonialStatusLabel')}</label>
            <Select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as TestimonialStatus)}
              options={statusOptions}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">{t('adminNoteLabel')}</label>
            <textarea rows={3} value={reviewAdminNote} onChange={(e) => setReviewAdminNote(e.target.value)}
              placeholder={t('adminNotePlaceholder')}
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setReviewOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>{t('saveReviewBtn')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
