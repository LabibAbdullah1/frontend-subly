// src/pages/public/LandingPage.tsx
import React, { useState } from 'react';
import { 
  Zap, Database, ShieldCheck, Cpu, 
  ArrowRight, Check, HelpCircle, Star 
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab, setDevice } = useSystemStore();
  const { plans } = useDataStore();
  
  const [selectedType, setSelectedType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const filteredPlans = plans.filter(p => p.type === selectedType);

  const faqs = [
    { q: 'Apakah subdomain yang diklaim gratis selamanya?', a: 'Ya, subdomain .subly.host gratis selamanya selama masa aktif paket hosting Anda aktif.' },
    { q: 'Bagaimana cara mendeploy aplikasi Laravel?', a: 'Anda dapat men-zip folder proyek Anda (pastikan folder public ada di root file ZIP) lalu drag-and-drop di File Manager cPanel kami.' },
    { q: 'Apakah database MySQL mendukung koneksi eksternal?', a: 'Demi keamanan, database MySQL hanya diizinkan diakses secara internal dari server subdomain Anda.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-base transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-28 text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider animate-pulse">
          <Zap className="h-3.5 w-3.5" />
          <span>Vite React TypeScript Enabled</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tight leading-tight uppercase max-w-3xl">
          {t('landingTitle')}
        </h1>
        <p className="text-sm md:text-base text-text-muted leading-relaxed max-w-2xl">
          {t('landingSub')}
        </p>
        <div className="flex gap-4 mt-4">
          <Button 
            variant="primary" 
            size="lg" 
            icon={<ArrowRight className="h-5 w-5" />} 
            iconPosition="right"
            onClick={() => setActiveTab('dashboard')} // Direct mockup entry
          >
            {t('startNow')}
          </Button>
          <a href="#pricing">
            <Button variant="outline" size="lg">
              {t('plans')}
            </Button>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardPanel glow title="Auto SSL Secure">
            <div className="flex flex-col gap-2">
              <ShieldCheck className="h-8 w-8 text-brand-primary mb-2" />
              <p className="text-xs text-text-muted leading-relaxed">
                Setiap subdomain yang diklaim mendapatkan sertifikat SSL HTTPS Let's Encrypt gratis secara otomatis dan instan.
              </p>
            </div>
          </CardPanel>
          <CardPanel glow title="MySQL Database Instan">
            <div className="flex flex-col gap-2">
              <Database className="h-8 w-8 text-brand-primary mb-2" />
              <p className="text-xs text-text-muted leading-relaxed">
                Buat database MySQL baru, atur credentials user, dan sambungkan script PHP/NodeJS Anda hanya dalam hitungan detik.
              </p>
            </div>
          </CardPanel>
          <CardPanel glow title="Runtime PHP & Node.js">
            <div className="flex flex-col gap-2">
              <Cpu className="h-8 w-8 text-brand-primary mb-2" />
              <p className="text-xs text-text-muted leading-relaxed">
                Mendukung deployment file ZIP native PHP maupun Node.js (Vite, Next, Express) dengan monitoring log real-time.
              </p>
            </div>
          </CardPanel>
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="px-6 py-16 max-w-5xl mx-auto w-full text-center">
        <h2 className="text-2xl md:text-3xl font-black text-text-main uppercase tracking-tight">{t('pricingTitle')}</h2>
        <p className="text-xs text-text-muted mt-2 max-w-md mx-auto">{t('pricingSub')}</p>

        {/* Runtime toggle tabs */}
        <div className="flex justify-center gap-2 mt-8 mb-10 select-none">
          <button
            onClick={() => setSelectedType('PHP')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
              selectedType === 'PHP'
                ? 'bg-brand-primary text-white border-transparent shadow-md'
                : 'border-border-main text-text-muted hover:bg-border-main/20'
            }`}
          >
            PHP & Laravel
          </button>
          <button
            onClick={() => setSelectedType('NodeJS')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
              selectedType === 'NodeJS'
                ? 'bg-brand-primary text-white border-transparent shadow-md'
                : 'border-border-main text-text-muted hover:bg-border-main/20'
            }`}
          >
            Node.js Runtimes
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {filteredPlans.map((plan) => (
            <CardPanel 
              key={plan.id}
              className="flex flex-col justify-between border-2 hover:border-brand-primary/40 relative overflow-hidden"
            >
              <div className="text-left space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-text-main">{plan.name}</h3>
                  <span className="text-[9px] font-black uppercase bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-md">
                    {plan.type}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-2xl font-black text-brand-primary">
                    Rp {plan.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-text-muted">/ {plan.duration_months} bln</span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  {plan.description || 'Dedicated runtime resource allocation.'}
                </p>

                <div className="border-t border-border-main/60 pt-4 space-y-2 text-xs text-text-muted font-semibold">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Disk Storage: {plan.max_storage_mb >= 1024 ? `${plan.max_storage_mb / 1024} GB` : `${plan.max_storage_mb} MB`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Database Slot: {plan.max_databases} MySQL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Free SSL & Subdomain gratis</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-main/40 w-full">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => setActiveTab('dashboard')}
                >
                  Order Now
                </Button>
              </div>
            </CardPanel>
          ))}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="px-6 py-16 max-w-3xl mx-auto w-full text-center">
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-brand-primary" />
          Frequently Asked Questions
        </h2>
        
        <div className="mt-8 space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="glass-panel rounded-2xl overflow-hidden border border-border-main transition-all duration-300"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full px-6 py-4.5 text-left text-xs font-bold text-text-main flex items-center justify-between hover:bg-border-main/10 cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-brand-primary">{faqOpen === idx ? '−' : '+'}</span>
              </button>
              {faqOpen === idx && (
                <div className="px-6 pb-4.5 text-xs text-text-muted leading-relaxed text-left border-t border-border-main/30 pt-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-main py-10 bg-bg-surface/50 text-center select-none text-[10px] text-text-muted font-semibold">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Subly Managed Hosting. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">cPanel Rules</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
