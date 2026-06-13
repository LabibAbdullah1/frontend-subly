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
import type { TestimonialStatus } from '../../../types';

interface Props {
  onDeleteTestimonial: (id: number) => void;
}

export const AdminTestimonialsTab: React.FC<Props> = ({ onDeleteTestimonial }) => {
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
      addToast({ type: 'success', title: 'Review Disimpan', message: 'Status testimonial berhasil diperbarui.' });
      setReviewOpen(false);
      setReviewAdminNote('');
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal memperbarui status testimonial.' });
    } finally { setIsSubmitting(false); }
  };

  const statusOptions = [
    { value: 'pending',  label: 'Pending (Menunggu Review)' },
    { value: 'approved', label: 'Approved (Disetujui)' },
    { value: 'featured', label: 'Featured (Tampilkan Utama di Landing Page)' },
    { value: 'rejected', label: 'Rejected (Ditolak)' },
  ];

  return (
    <>
      <CardPanel title="Review Testimonial & Feedback Klien">
        <div className="overflow-x-auto w-full mt-2 select-none">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">Klien</th>
                <th className="py-2.5 pb-2 px-4 font-bold">Subdomain</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Rating</th>
                <th className="py-2.5 pb-2 px-4 font-bold">Feedback</th>
                <th className="py-2.5 pb-2 px-4 text-center font-bold">Status</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {adminTestimonials.map((t) => (
                <tr key={t.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-main">
                    <div className="flex flex-col">
                      <span>{t.user?.name}</span>
                      <span className="text-[10px] text-text-muted font-normal">{t.user?.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted font-mono text-[10px]">
                    {t.subdomain
                      ? `${t.subdomain.name}.subly.my.id`
                      : (() => {
                          const owner = adminUsers.find((u) => u.id === t.user_id);
                          return owner?.subdomains?.[0] ? `${owner.subdomains[0].name}.subly.my.id` : 'None';
                        })()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted/30'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-text-main line-clamp-1">{t.title}</span>
                      <span className="text-[10px] text-text-muted line-clamp-2 leading-relaxed">"{t.content}"</span>
                      {t.admin_note && (
                        <span className="text-[9px] font-medium text-brand-primary italic mt-1">Note: "{t.admin_note}"</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      status={
                        t.status === 'approved' || t.status === 'featured' ? 'success'
                          : t.status === 'rejected' ? 'inactive' : 'pending'
                      }
                      label={t.status.toUpperCase()}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenReview(t)}
                        className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex" title="Review Testimonial">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDeleteTestimonial(t.id)}
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
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Review Testimonial & Feedback Klien"
        description="Setujui atau tampilkan testimonial ini di landing page utama.">
        <form onSubmit={handleSaveReview} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Status Testimonial</label>
            <Select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as TestimonialStatus)}
              options={statusOptions}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main">Catatan Admin (Opsional)</label>
            <textarea rows={3} value={reviewAdminNote} onChange={(e) => setReviewAdminNote(e.target.value)}
              placeholder="Contoh: Terimakasih atas review jujurnya!"
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
            <Button type="button" variant="secondary" onClick={() => setReviewOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Simpan Review</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
