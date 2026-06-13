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

const ProductMockup: React.FC = () => {
  const { t } = useTranslation();
  const [logCount, setLogCount] = useState(3);

  const initialSteps = [
    t('mockStepInitial1'),
    t('mockStepInitial2'),
    t('mockStepInitial3')
  ];

  const mockSteps = [
    t('mockStep1'),
    t('mockStep2'),
    t('mockStep3'),
    t('mockStep4'),
    t('mockStep5'),
    t('mockStep6'),
    t('mockStep7'),
    t('mockStep8'),
    t('mockStep9'),
    t('mockStep10'),
    t('mockStep11')
  ];

  const allLogs = [...initialSteps, ...mockSteps];

  useEffect(() => {
    const timer = setInterval(() => {
      setLogCount(prev => {
        if (prev < allLogs.length) {
          return prev + 1;
        } else {
          return 3; // Reset
        }
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [allLogs.length]);

  const logs = allLogs.slice(0, logCount);

  return (
    <div className="w-full max-w-5xl mx-auto px-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
      <div className="bg-[#0f1011] border border-[#23252a] rounded-xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)]">
        {/* Chrome header window */}
        <div className="bg-[#0b0c0d] px-4 py-3 border-b border-[#23252a] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
          </div>
          <div className="bg-[#010102] border border-[#23252a]/50 text-[10px] text-zinc-500 font-mono px-6 py-1 rounded-md w-72 text-center truncate">
            portal.subly.host/subdomain/laravel-blog
          </div>
          <div className="w-12"></div>
        </div>
        
        {/* App content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[380px] text-[11px] font-sans">
          {/* Mock sidebar */}
          <div className="bg-[#0b0c0d] border-r border-[#23252a] p-4 space-y-4 select-none text-left">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t('mockProjectPortal')}</div>
            <div className="space-y-1">
              <div className="bg-[#d2ad5e]/10 text-[#d2ad5e] px-3 py-2 rounded-md font-semibold flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockSubdomainDetail')}</span>
              </div>
              <div className="text-zinc-400 hover:text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer transition-colors">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockMysqlDb')}</span>
              </div>
              <div className="text-zinc-400 hover:text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer transition-colors">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockFileManager')}</span>
              </div>
              <div className="text-zinc-400 hover:text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockSslSecurity')}</span>
              </div>
            </div>
          </div>
          
          {/* Mock Main Panel */}
          <div className="col-span-3 p-6 space-y-6 flex flex-col justify-between text-left bg-[#0f1011]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#141516] border border-[#23252a] p-3 rounded-lg">
                <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">{t('colRuntime')}</div>
                <div className="text-zinc-100 text-xs font-semibold mt-1">PHP 8.2 (Laravel)</div>
              </div>
              <div className="bg-[#141516] border border-[#23252a] p-3 rounded-lg">
                <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">{t('mockSslSecurity')}</div>
                <div className="text-emerald-400 text-xs font-semibold mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                  {t('mockActiveSecure')}
                </div>
              </div>
              <div className="bg-[#141516] border border-[#23252a] p-3 rounded-lg">
                <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">{t('dbLinkLabel')}</div>
                <div className="text-zinc-100 text-xs font-semibold mt-1">subly_db_laravel</div>
              </div>
            </div>
            
            {/* Mock terminal output */}
            <div className="bg-[#010102] border border-[#23252a] rounded-lg p-4 font-mono text-[10px] text-zinc-300 flex-1 flex flex-col justify-between overflow-hidden min-h-[180px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#23252a]/20 mb-2 select-none">
                <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider">{t('mockConsoleLogs')}</span>
                <span className="h-2 w-2 bg-[#d2ad5e] rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-1.5 text-left flex-1 overflow-y-auto max-h-[140px] pr-2">
                {logs.map((log, idx) => {
                  const isSuccess = log.includes('successful') || log.includes('completed') || log.includes('berhasil') || log.includes('selesai');
                  const isUrl = log.includes('Active URL') || log.includes('URL Aktif');
                  let colorClass = 'text-zinc-300';
                  if (isSuccess) colorClass = 'text-emerald-400 font-semibold';
                  if (isUrl) colorClass = 'text-[#e0be75] font-semibold hover:underline';
                  return (
                    <div key={idx} className={`${colorClass} flex items-start gap-1`}>
                      <span className="text-zinc-500 font-semibold shrink-0 select-none">$</span>
                      <span>{log}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useSystemStore();
  const { plans, fetchPlans, publicTestimonials, fetchPublicTestimonials, settings, fetchSettings } = useDataStore();
  const { user } = useAuthStore();
  
  const [selectedType, setSelectedType] = useState<'PHP' | 'NodeJS'>('PHP');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchPublicTestimonials();
    fetchSettings();
  }, [fetchPlans, fetchPublicTestimonials, fetchSettings]);

  const rootDomain = settings.system_root_domain || 'subly.my.id';
  const filteredPlans = plans.filter(p => p.type === selectedType);

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A').replace('{domain}', rootDomain) },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  return (
    <div className="flex flex-col flex-1 text-left bg-transparent relative">
        {/* Ambient orange-gold glow behind hero text */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0 select-none opacity-80">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.15)_0%,_rgba(210,173,94,0.06)_40%,_rgba(0,0,0,0)_75%)] blur-3xl" />
        </div>

        {/* Hero Section */}
        <section className="px-6 py-20 md:py-28 text-center max-w-4xl mx-auto flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface border border-border-main text-text-subtle text-[11px] font-medium tracking-wide">
            <Zap className="h-3.5 w-3.5 text-brand-primary" />
            <span>{t('landingBadgeText')}</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-semibold text-text-main tracking-tighter leading-[1.05] max-w-3xl" style={{ letterSpacing: '-2.5px' }}>
            {t('landingTitle')}
          </h1>
          
          <p className="text-xs md:text-sm text-text-muted leading-relaxed max-w-2xl font-normal" style={{ letterSpacing: '-0.1px' }}>
            {t('landingSubtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Button 
              variant="primary" 
              size="md" 
              icon={<ArrowRight className="h-4 w-4" />} 
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
              <Button variant="secondary" size="md">
                {t('plans')}
              </Button>
            </a>
          </div>
        </section>

        {/* Dense Product UI Screenshot - Protagonist of the page */}
        <ProductMockup />

        {/* Live Statistics Section */}
        <section className="px-6 py-8 max-w-5xl mx-auto w-full select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl bg-bg-surface border border-border-main shadow-md">
            <div className="text-center space-y-1">
              <h3 className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statDeployTime')}</h3>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statDeployProcess')}</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/50">
              <h3 className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statUptimeSlaVal')}</h3>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statUptimeSla')}</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/50">
              <h3 className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statSsdStorageVal')}</h3>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statSsdStorage')}</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/50">
              <h3 className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statSslSecureVal')}</h3>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statSslSecure')}</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-16 max-w-5xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-10 select-none">
            <h2 className="text-2xl md:text-3xl font-semibold text-text-main tracking-tight" style={{ letterSpacing: '-1.0px' }}>{t('featuresTitle')}</h2>
            <p className="text-[11px] text-brand-primary mt-1.5 uppercase tracking-widest font-semibold" style={{ letterSpacing: '0.4px' }}>{t('featuresSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title={t('featureSslTitle')}>
                <div className="flex flex-col gap-2">
                  <ShieldCheck className="h-7 w-7 text-brand-primary mb-1.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed font-normal">
                    {t('featureSslDesc')}
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title={t('featureDbTitle')}>
                <div className="flex flex-col gap-2">
                  <Database className="h-7 w-7 text-brand-primary mb-1.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed font-normal">
                    {t('featureDbDesc')}
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title={t('featureRuntimeTitle')}>
                <div className="flex flex-col gap-2">
                  <Cpu className="h-7 w-7 text-brand-primary mb-1.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed font-normal">
                    {t('featureRuntimeDesc')}
                  </p>
                </div>
              </CardPanel>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title={t('featureGitTitle')}>
                <div className="flex flex-col gap-2">
                  <GitBranch className="h-7 w-7 text-brand-primary mb-1.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed font-normal">
                    {t('featureGitDesc')}
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            {/* Feature 5 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title={t('featureLogsTitle')}>
                <div className="flex flex-col gap-2">
                  <Terminal className="h-7 w-7 text-brand-primary mb-1.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed font-normal">
                    {t('featureLogsDesc')}
                  </p>
                </div>
              </CardPanel>
            </motion.div>
            {/* Feature 6 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardPanel glow title={t('featureIsolationTitle')}>
                <div className="flex flex-col gap-2">
                  <Layers className="h-7 w-7 text-brand-primary mb-1.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed font-normal">
                    {t('featureIsolationDesc')}
                  </p>
                </div>
              </CardPanel>
            </motion.div>
          </div>
        </section>

        {/* Detailed Explanation / Why Choose Us Section */}
        <section className="px-6 py-16 bg-bg-surface border-y border-border-main w-full">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-5">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">{t('infraModernBadge')}</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-text-main tracking-tight leading-tight" style={{ letterSpacing: '-0.8px' }}>
                {t('infraModernTitle')}
              </h2>
              <p className="text-xs text-text-muted leading-relaxed font-normal">
                {t('infraModernDesc')}
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs select-none">✓</div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-main">{t('infraBullet1Title')}</h4>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">{t('infraBullet1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs select-none">✓</div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-main">{t('infraBullet2Title')}</h4>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">{t('infraBullet2Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs select-none">✓</div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-main">{t('infraBullet3Title')}</h4>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">{t('infraBullet3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bg-base p-8 rounded-xl border border-border-main relative overflow-hidden shadow-xl text-left">
              <div className="relative space-y-4">
                <div className="inline-block px-2.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-semibold uppercase tracking-wider select-none">
                  {t('liveChatWidgetBadge')}
                </div>
                <h3 className="text-lg font-semibold text-text-main tracking-tight" style={{ letterSpacing: '-0.4px' }}>{t('liveChatWidgetTitle')}</h3>
                <p className="text-xs text-text-muted leading-relaxed font-normal">
                  {t('liveChatWidgetDesc')}
                </p>
                <div className="pt-4 border-t border-border-main/50 flex items-center gap-3 select-none">
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-bg-card border border-border-main flex items-center justify-center text-[9px] font-bold text-white">A1</div>
                    <div className="h-7 w-7 rounded-full bg-brand-primary border border-border-main flex items-center justify-center text-[9px] font-bold text-white">S</div>
                  </div>
                  <span className="text-[10px] text-text-subtle font-semibold">{t('liveChatWidgetFooter')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="px-6 py-16 max-w-5xl mx-auto w-full text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-text-main tracking-tight" style={{ letterSpacing: '-0.8px' }}>{t('pricingTitle')}</h2>
          <p className="text-xs text-text-muted mt-2 max-w-md mx-auto font-normal">{t('pricingSub')}</p>

          {/* Runtime toggle tabs - Linear pill style */}
          <div className="inline-flex bg-zinc-200/60 dark:bg-[#0b0c0d] border border-border-main p-1 rounded-full justify-center gap-1 mt-8 mb-10 select-none">
            <button
              onClick={() => setSelectedType('PHP')}
              className={`px-4.5 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-150 cursor-pointer ${
                selectedType === 'PHP'
                  ? 'bg-bg-card text-text-main shadow-[0_1px_3px_rgba(0,0,0,0.15)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
                  : 'text-text-muted hover:text-text-main dark:text-text-subtle dark:hover:text-text-main'
              }`}
            >
              {t('phpLaravel')}
            </button>
            <button
              onClick={() => setSelectedType('NodeJS')}
              className={`px-4.5 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-150 cursor-pointer ${
                selectedType === 'NodeJS'
                  ? 'bg-bg-card text-text-main shadow-[0_1px_3px_rgba(0,0,0,0.15)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
                  : 'text-text-muted hover:text-text-main dark:text-text-subtle dark:hover:text-text-main'
              }`}
            >
              {t('nodeJsRuntimes')}
            </button>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {filteredPlans.map((plan, idx) => {
              const isFeatured = idx === 1; // Mark secondary tier as featured / surface-2
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col h-full"
                >
                  <CardPanel 
                    className={`flex flex-col justify-between border relative overflow-hidden h-full ${
                      isFeatured ? 'bg-bg-card border-border-strong shadow-md' : 'bg-bg-surface border-border-main'
                    }`}
                  >
                    <div className="text-left space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-text-main">{plan.name}</h3>
                        <span className="text-[9px] font-semibold uppercase bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-2.5 py-0.5 rounded-md select-none">
                          {plan.type}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-1 select-none">
                        <span className="text-2xl font-bold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>
                          Rp {plan.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-text-subtle">/ {plan.duration_months} {t('monthlyPriceSuffix')}</span>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed font-normal">
                        {plan.description || 'Dedicated runtime resource allocation.'}
                      </p>

                      <div className="border-t border-border-main/50 pt-4 space-y-2 text-xs text-text-muted font-normal">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{t('featureStorageLabel').replace('{storage}', plan.max_storage_mb >= 1024 ? `${plan.max_storage_mb / 1024} GB` : `${plan.max_storage_mb} MB`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{t('featureDatabaseLabel')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{t('featureSslLabel')} &amp; {t('featureSubdomainLabel').replace('{domain}', '')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border-main/40 w-full">
                      <Button 
                        variant={isFeatured ? "primary" : "secondary"}
                        className="w-full font-medium"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        {t('orderNowBtn')}
                      </Button>
                    </div>
                  </CardPanel>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Testimonials Section */}
        {publicTestimonials.length > 0 && (
          <section className="px-6 py-16 max-w-5xl mx-auto w-full text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-text-main tracking-tight flex items-center justify-center gap-2" style={{ letterSpacing: '-0.8px' }}>
              <Star className="h-5 w-5 text-brand-primary fill-brand-primary" />
              {t('testimonialsHeading')}
            </h2>
            <p className="text-xs text-text-muted mt-2 max-w-md mx-auto font-normal">
              {t('testimonialsSubheading')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
              {publicTestimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CardPanel className="flex flex-col justify-between h-full border border-border-main p-8 bg-bg-surface">
                    <div className="space-y-4">
                      {/* Rating stars */}
                      <div className="flex items-center gap-1 select-none">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= testimonial.rating ? 'fill-brand-primary text-brand-primary' : 'text-border-main'
                            }`}
                            style={{ opacity: star <= testimonial.rating ? 0.7 : 0.2 }}
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-text-main uppercase tracking-wide">
                          {testimonial.title}
                        </h4>
                        <p className="text-xs text-text-muted leading-relaxed italic font-normal">
                          "{testimonial.content}"
                        </p>
                      </div>
                    </div>

                    {/* Author Profile */}
                    <div className="mt-6 pt-4 border-t border-border-main/50 flex items-center justify-between select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                          {testimonial.user?.name ? testimonial.user.name[0] : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-text-main leading-tight">{testimonial.user?.name || 'Client'}</span>
                          <span className="text-[9px] text-text-subtle font-medium">{t('verifiedClientBadge')}</span>
                        </div>
                      </div>

                      {testimonial.subdomain && (
                        <div className="flex items-center gap-1.5 text-[9px] text-brand-primary font-mono bg-brand-primary/5 border border-brand-primary/10 px-2 py-0.5 rounded-md max-w-[120px] truncate" title={testimonial.subdomain.full_domain}>
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{testimonial.subdomain.name}.{rootDomain}</span>
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
          <h2 className="text-2xl font-semibold text-text-main tracking-tight flex items-center justify-center gap-2" style={{ letterSpacing: '-0.8px' }}>
            <HelpCircle className="h-5 w-5 text-brand-primary" />
            {t('faqHeading')}
          </h2>
          
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-bg-surface rounded-lg overflow-hidden border border-border-main transition-all duration-300"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left text-xs font-semibold text-text-main flex items-center justify-between hover:bg-bg-card/50 cursor-pointer border-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-brand-primary font-bold">{faqOpen === idx ? '−' : '+'}</span>
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
                      <div className="px-5 pb-4 text-xs text-text-muted leading-relaxed text-left border-t border-border-main/30 pt-3 font-normal">
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
        <footer className="mt-auto border-t border-border-main py-16 px-8 bg-bg-base text-left select-none text-[11px] text-text-subtle font-medium">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p>{t('footerCopyright')}</p>
            <div className="flex gap-4">
              <span onClick={() => setActiveTab('legal')} className="hover:text-text-main cursor-pointer transition-colors">{t('footerTerms')}</span>
              <span onClick={() => setActiveTab('legal')} className="hover:text-text-main cursor-pointer transition-colors">{t('footerPrivacy')}</span>
              <span onClick={() => setActiveTab('legal')} className="hover:text-text-main cursor-pointer transition-colors">{t('footerRules')}</span>
            </div>
          </div>
        </footer>
    </div>
  );
};
export default LandingPage;
