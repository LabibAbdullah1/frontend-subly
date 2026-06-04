// src/pages/dashboard/TestimonialPage.tsx
import React, { useState, useEffect } from 'react';
import { Star, Award, Calendar, AlertCircle } from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const TestimonialPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { 
    subdomains, 
    myTestimonials, 
    fetchSubdomains, 
    fetchMyTestimonials, 
    submitTestimonial 
  } = useDataStore();

  const [selectedSubdomainId, setSelectedSubdomainId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    fetchSubdomains();
    fetchMyTestimonials();
  }, [fetchSubdomains, fetchMyTestimonials]);

  const activeSubdomains = subdomains.filter(s => s.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subId = selectedSubdomainId || (activeSubdomains[0]?.id.toString() || '');
    if (!subId || !title.trim() || !content.trim()) {
      addToast({
        type: 'error',
        title: t('error'),
        message: 'Mohon lengkapi semua kolom form.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTestimonial(Number(subId), rating, title, content);
      setTitle('');
      setContent('');
      setRating(5);
      addToast({
        type: 'success',
        title: t('success'),
        message: t('testimonialSubmitSuccess'),
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: t('error'),
        message: err instanceof Error ? err.message : 'Gagal mengirim testimonial.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'featured': return 'success';
      case 'rejected': return 'inactive';
      case 'pending':
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-text-main flex items-center gap-2">
          <Award className="h-6 w-6 text-brand-primary" />
          {t('testimonials')}
        </h1>
        <p className="text-xs text-text-muted">
          Bagikan pengalaman Anda menggunakan layanan Subly Hosting untuk ditampilkan di landing page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form Column */}
        <div className="lg:col-span-1">
          <CardPanel title={t('testimonialTitle')}>
            {activeSubdomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
                <AlertCircle className="h-10 w-10 text-brand-primary/60" />
                <p className="text-xs font-bold text-text-muted leading-relaxed">
                  {t('testimonialNoSubdomains')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4.5 mt-2 text-xs">
                {/* Select Subdomain */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                    {t('selectSubdomain')}
                  </label>
                  <select
                    value={selectedSubdomainId || (activeSubdomains[0]?.id.toString() || '')}
                    onChange={(e) => setSelectedSubdomainId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main outline-none"
                    required
                  >
                    {activeSubdomains.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}.subly.host
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Rating Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                    {t('ratingLabel')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg hover:bg-border-main/20 transition-all border-none cursor-pointer bg-transparent"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= (hoverRating ?? rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-text-muted'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                    {t('commentTitle')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sangat cepat dan andal!"
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none animate-all"
                    required
                  />
                </div>

                {/* Message Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                    {t('commentContent')}
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan pengalaman detail Anda mendeploy aplikasi web dengan Subly..."
                    className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none animate-all"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Kirim Feedback
                </Button>
              </form>
            )}
          </CardPanel>
        </div>

        {/* History / Testimonials list Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-text-muted">
            {t('testimonialListTitle')}
          </h2>

          {myTestimonials.length === 0 ? (
            <CardPanel>
              <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                <Star className="h-8 w-8 text-text-muted" />
                <p className="text-xs text-text-muted font-bold">
                  Belum ada testimonial yang dikirim.
                </p>
              </div>
            </CardPanel>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myTestimonials.map((t) => (
                <CardPanel key={t.id}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted/40'
                              }`}
                            />
                          ))}
                        </div>
                        <h4 className="text-sm font-bold text-text-main">
                          {t.title}
                        </h4>
                        <span className="text-[10px] text-text-muted block font-mono">
                          Subdomain: {t.subdomain ? `${t.subdomain.name}.subly.host` : 'Semua Subdomain'}
                        </span>
                      </div>
                      <Badge
                        status={getStatusColor(t.status)}
                        label={t.status.toUpperCase()}
                      />
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      "{t.content}"
                    </p>

                    <div className="flex flex-col gap-2 pt-2 border-t border-border-main/20 text-[10px] text-text-muted font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Dikirim pada: {new Date(t.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                      </div>
                      
                      {t.admin_note && (
                        <div className="p-2.5 rounded-lg bg-brand-primary/5 border border-brand-primary/10 text-text-main text-left space-y-1">
                          <span className="font-bold text-[9px] uppercase tracking-wider text-brand-primary">Catatan Reviewer:</span>
                          <p className="text-[10px] font-medium leading-relaxed italic text-text-muted">
                            "{t.admin_note}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardPanel>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TestimonialPage;
