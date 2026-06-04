// src/pages/public/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Zap, Database, ShieldCheck, Cpu, 
  ArrowRight, Check, HelpCircle, Star, Globe,
  GitBranch, Terminal, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useSystemStore();
  const { plans, publicTestimonials, fetchPublicTestimonials, settings, fetchSettings } = useDataStore();
  const { user } = useAuthStore();
  
  const [selectedType, setSelectedType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetchPublicTestimonials();
    fetchSettings();
  }, [fetchPublicTestimonials, fetchSettings]);

  const rootDomain = settings.system_root_domain || 'subly.my.id';

  const filteredPlans = plans.filter(p => p.type === selectedType);

  const faqs = [
    { q: 'Apakah subdomain yang diklaim gratis selamanya?', a: `Ya, subdomain .${rootDomain} gratis selamanya selama masa aktif paket hosting Anda aktif.` },
    { q: 'Bagaimana cara mendeploy aplikasi Laravel?', a: 'Anda dapat men-zip folder proyek Anda (pastikan folder public ada di root file ZIP) lalu drag-and-drop di File Manager cPanel kami.' },
    { q: 'Apakah database MySQL mendukung koneksi eksternal?', a: 'Demi keamanan, database MySQL hanya diizinkan diakses secara internal dari server subdomain Anda.' },
  ];

  return (
    <div className="flex flex-col flex-1 text-left">
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32 text-center max-w-4xl mx-auto flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider animate-pulse">
            <Zap className="h-3.5 w-3.5" />
            <span>High-Performance SSD Cloud Server</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-text-main tracking-tight leading-tight uppercase max-w-3xl font-Outfit bg-gradient-to-r from-text-main via-brand-primary to-text-main bg-clip-text text-transparent">
            {t('landingTitle')}
          </h1>
          <p className="text-xs md:text-sm text-text-muted leading-relaxed max-w-2xl font-medium">
            Platform modern untuk mendeploy aplikasi PHP, Laravel, Node.js, Next.js, dan Vite secara instan.
            Dapatkan database MySQL terisolasi, monitoring log real-time, perlindungan SSL Let's Encrypt gratis,
            serta subdomain premium langsung aktif dalam 5 detik.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 select-none">
            <Button 
              variant="primary" 
              size="lg" 
              icon={<ArrowRight className="h-5 w-5" />} 
              iconPosition="right"
              onClick={() => {
                if (user) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('login');
                }
              }}
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

        {/* Live Statistics Section */}
        <section className="px-6 py-10 max-w-6xl mx-auto w-full select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-bg-surface/30 border border-border-main/50 backdrop-blur-md">
            <div className="text-center space-y-1">
              <h3 className="text-2xl md:text-4xl font-extrabold text-brand-primary font-mono">&lt; 5s</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Proses Deployment</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/40">
              <h3 className="text-2xl md:text-4xl font-extrabold text-brand-primary font-mono">99.9%</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Server Uptime SLA</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/40">
              <h3 className="text-2xl md:text-4xl font-extrabold text-brand-primary font-mono">100%</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">SSD NVMe Storage</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/40">
              <h3 className="text-2xl md:text-4xl font-extrabold text-brand-primary font-mono">Gratis</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">SSL Let's Encrypt</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-16 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-12 select-none">
            <h2 className="text-2xl md:text-3xl font-black text-text-main uppercase tracking-tight">Fitur Utama Pengembang</h2>
            <p className="text-[11px] text-text-muted mt-2 uppercase tracking-widest font-bold">Teknologi premium yang mempercepat workflow coding Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title="Auto SSL Secure">
                <div className="flex flex-col gap-2">
                  <ShieldCheck className="h-8 w-8 text-brand-primary mb-2" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Setiap subdomain yang diklaim mendapatkan sertifikat SSL HTTPS Let's Encrypt gratis secara otomatis dan instan demi keamanan lalu lintas data.
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title="MySQL Database Instan">
                <div className="flex flex-col gap-2">
                  <Database className="h-8 w-8 text-brand-primary mb-2" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Buat database MySQL baru, atur credentials user, dan sambungkan script PHP/NodeJS Anda hanya dalam hitungan detik dari panel kontrol terintegrasi.
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title="Runtime PHP & Node.js">
                <div className="flex flex-col gap-2">
                  <Cpu className="h-8 w-8 text-brand-primary mb-2" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Mendukung deployment file ZIP native PHP maupun Node.js (Vite, Next, Express) dengan monitoring log build dan status server secara real-time.
                  </p>
                </div>
              </CardPanel>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title="Integrasi Info Git">
                <div className="flex flex-col gap-2">
                  <GitBranch className="h-8 w-8 text-brand-primary mb-2" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Sambungkan repositori Git Anda dari dashboard untuk melacak branch dan metadata commit deployment target secara teratur.
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            {/* Feature 5 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title="Log Deployment Real-Time">
                <div className="flex flex-col gap-2">
                  <Terminal className="h-8 w-8 text-brand-primary mb-2" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Pantau status validasi arsip zip, keberhasilan ekstraksi, dan riwayat deploy secara instan langsung dari panel kontrol Anda.
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            {/* Feature 6 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title="Isolasi Folder Subdomain">
                <div className="flex flex-col gap-2">
                  <Layers className="h-8 w-8 text-brand-primary mb-2" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Setiap hosting subdomain berjalan pada direktori folder terpisah yang aman untuk mencegah bentrokan file antar aplikasi.
                  </p>
                </div>
              </CardPanel>
            </motion.div>
          </div>
        </section>

        {/* Detailed Explanation / Why Choose Us Section */}
        <section className="px-6 py-16 bg-bg-surface/10 border-y border-border-main/40 w-full">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block">Infrastruktur Modern</span>
              <h2 className="text-3xl font-bold text-text-main uppercase tracking-tight leading-tight">
                Mulai Mendeploy Proyek Anda Tanpa Batasan cPanel Konvensional
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                Subly dirancang khusus untuk memotong birokrasi server yang rumit. Tidak perlu lagi konfigurasi Apache, setup Nginx virtual host manual, atau pusing memikirkan pembaruan SSL berkala.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">Penyediaan Database Otomatis</h4>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">Setiap kali Anda mengklaim subdomain, sistem akan langsung membuat database MySQL unik yang siap dikoneksikan ke proyek Anda.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">Manajer File &amp; Konsol Log Real-Time</h4>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">Unggah source code dalam format ZIP, extract instan, dan lihat log keluaran error runtime aplikasi langsung dari panel navigasi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">Gateaway Pembayaran QRIS Instan</h4>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">Sistem checkout terintegrasi menggunakan Qris statis dengan auto-verifikasi cepat sehingga server hosting langsung aktif tanpa menunggu lama.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-border-main/50 relative overflow-hidden shadow-2xl bg-bg-surface/30">
              <div className="absolute top-0 right-0 h-40 w-40 bg-brand-primary/10 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="inline-block px-3 py-1 rounded bg-brand-primary/15 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                  Fitur Live Chat Agen
                </div>
                <h3 className="text-xl font-bold text-text-main uppercase">Butuh Bantuan Instan?</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Kami mengintegrasikan fitur Live Support Chat real-time langsung di dashboard pengguna Anda. Cukup buka tab chat, ketik pesan, lampirkan gambar kendala, dan admin kami akan merespons dalam waktu kurang dari 10 menit (SLA Terjamin).
                </p>
                <div className="pt-4 border-t border-border-main/40 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-slate-700 border border-border-main flex items-center justify-center text-[9px] font-black text-white">A1</div>
                    <div className="h-7 w-7 rounded-full bg-brand-primary border border-border-main flex items-center justify-center text-[9px] font-black text-white">S</div>
                  </div>
                  <span className="text-[10px] text-text-muted font-bold">Tim Support Subly Siap Membantu 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="px-6 py-16 max-w-5xl mx-auto w-full text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-main uppercase tracking-tight">{t('pricingTitle')}</h2>
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
              <motion.div
                key={plan.id}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col"
              >
                <CardPanel 
                  className="flex flex-col justify-between border-2 hover:border-amber-500/40 relative overflow-hidden h-full"
                >
                  <div className="text-left space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-text-main">{plan.name}</h3>
                      <span className="text-[9px] font-bold uppercase bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-md">
                        {plan.type}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 select-none">
                      <span className="text-2xl font-bold text-brand-primary">
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
                        <span>1 Database MySQL Terdedikasi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Free SSL &amp; Subdomain gratis</span>
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
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        {publicTestimonials.length > 0 && (
          <section className="px-6 py-16 max-w-6xl mx-auto w-full text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-text-main uppercase tracking-tight flex items-center justify-center gap-2">
              <Star className="h-6 w-6 text-brand-primary fill-brand-primary" />
              Apa Kata Klien Kami
            </h2>
            <p className="text-xs text-text-muted mt-2 max-w-md mx-auto">
              Feedback nyata dari developer dan bisnis yang mendeploy aplikasi mereka menggunakan Subly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
              {publicTestimonials.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CardPanel className="flex flex-col justify-between h-full border hover:border-brand-primary/20">
                    <div className="space-y-4">
                      {/* Rating stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted/20'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wide">
                          {t.title}
                        </h4>
                        <p className="text-xs text-text-muted leading-relaxed italic">
                          "{t.content}"
                        </p>
                      </div>
                    </div>

                    {/* Author Profile */}
                    <div className="mt-6 pt-4 border-t border-border-main/50 flex items-center justify-between select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-xs font-black uppercase shadow-sm">
                          {t.user?.name ? t.user.name[0] : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-text-main">{t.user?.name || 'Client'}</span>
                          <span className="text-[9px] text-text-muted font-semibold">Verified Client</span>
                        </div>
                      </div>

                      {t.subdomain && (
                        <div className="flex items-center gap-1 text-[9px] text-brand-primary font-mono bg-brand-primary/5 border border-brand-primary/10 px-2 py-1 rounded-md max-w-[120px] truncate" title={t.subdomain.full_domain}>
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{t.subdomain.name}.{rootDomain}</span>
                        </div>
                      )}
                    </div>
                  </CardPanel>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Accordion FAQ Section */}
        <section className="px-6 py-16 max-w-3xl mx-auto w-full text-center">
          <h2 className="text-2xl font-bold text-text-main uppercase tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-brand-primary" />
            Frequently Asked Questions
          </h2>
          
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="glass-panel rounded-xl overflow-hidden border border-border-main transition-all duration-300"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left text-xs font-bold text-text-main flex items-center justify-between hover:bg-border-main/10 cursor-pointer border-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-brand-primary">{faqOpen === idx ? '−' : '+'}</span>
                </button>
                
                <AnimatePresence initial={false}>
                  {faqOpen === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4.5 text-xs text-text-muted leading-relaxed text-left border-t border-border-main/30 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
