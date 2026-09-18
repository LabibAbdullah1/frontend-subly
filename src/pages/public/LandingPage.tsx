// src/pages/public/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Zap, Database, ShieldCheck, Cpu, 
  ArrowRight, Check, HelpCircle, Star, Globe,
  GitBranch, Terminal, Layers, Folder, FileText, Lock,
  RefreshCw, Gift
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
  const [activeTab, setActiveTab] = useState<'detail' | 'database' | 'files' | 'ssl'>('detail');
  const [forceHttps, setForceHttps] = useState(true);
  const [mockMessage, setMockMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!mockMessage) return;
    const timer = setTimeout(() => {
      setMockMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [mockMessage]);

  const handleDeploySimulation = () => {
    setActiveTab('detail');
    setMockMessage(t('mockToastDeployStart'));
  };

  const browserUrl = `portal.subly.my.id/subdomain/laravel-blog${activeTab === 'detail' ? '' : `/${activeTab}`}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
      <div className="relative bg-bg-surface border border-border-main rounded-2xl overflow-hidden shadow-2xl transition-colors">
        {/* Chrome header window */}
        <div className="bg-bg-base/80 px-4 py-3 border-b border-border-main flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="bg-bg-surface border border-border-main text-[11px] text-text-muted font-mono px-6 py-1 rounded-md w-80 text-center truncate shadow-sm">
            {browserUrl}
          </div>
          <div className="w-12"></div>
        </div>
        
        {/* App content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[380px] text-[11px] font-sans">
          {/* Mock sidebar */}
          <div className="bg-bg-base/50 border-r border-border-main p-4 space-y-4 select-none text-left">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('mockProjectPortal')}</div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('detail')}
                className={`w-full px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                  activeTab === 'detail'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-surface/60 border border-transparent'
                }`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockSubdomainDetail')}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('database')}
                className={`w-full px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                  activeTab === 'database'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-surface/60 border border-transparent'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockMysqlDb')}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('files')}
                className={`w-full px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                  activeTab === 'files'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-surface/60 border border-transparent'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockFileManager')}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('ssl')}
                className={`w-full px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                  activeTab === 'ssl'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-surface/60 border border-transparent'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{t('mockSslSecurity')}</span>
              </button>
            </div>
          </div>
          
          {/* Mock Main Panel */}
          <div className="col-span-3 p-6 space-y-6 flex flex-col justify-between text-left bg-bg-surface">
            {activeTab === 'detail' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Runtime card */}
                  <div 
                    onClick={() => setActiveTab('files')}
                    className="bg-bg-base border border-border-main hover:border-brand-primary/40 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group text-left shadow-sm"
                  >
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('colRuntime')}</div>
                    <div className="text-text-main group-hover:text-brand-primary text-xs font-semibold mt-1 transition-colors">PHP 8.2 (Laravel)</div>
                  </div>
                  
                  {/* SSL card */}
                  <div 
                    onClick={() => setActiveTab('ssl')}
                    className="bg-bg-base border border-border-main hover:border-brand-primary/40 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group text-left shadow-sm"
                  >
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('mockSslSecurity')}</div>
                    <div className="text-emerald-500 text-xs font-semibold mt-1 flex items-center gap-1.5 transition-colors">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                      {t('mockActiveSecure')}
                    </div>
                  </div>
                  
                  {/* Database card */}
                  <div 
                    onClick={() => setActiveTab('database')}
                    className="bg-bg-base border border-border-main hover:border-brand-primary/40 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group text-left shadow-sm"
                  >
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('dbLinkLabel')}</div>
                    <div className="text-text-main group-hover:text-brand-primary text-xs font-semibold mt-1 transition-colors">subly_db_laravel</div>
                  </div>
                </div>
                
                {/* cPanel Standard Account & Server Specifications */}
                <div className="bg-bg-base border border-border-main rounded-xl p-5 flex-1 flex flex-col justify-between shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-main">
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Informasi Subdomain & Server (cPanel)
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">Host: id-srv01.subly.id</span>
                  </div>

                  {/* General Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-lg bg-bg-surface border border-border-main space-y-1">
                      <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Document Root</div>
                      <div className="font-mono text-text-main text-[10px] truncate">/home/sublymyi/laravel.subly.my.id</div>
                    </div>
                    <div className="p-3 rounded-lg bg-bg-surface border border-border-main space-y-1">
                      <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">IP Server & Nameserver</div>
                      <div className="font-mono text-text-main text-[10px]">103.189.234.12 (Shared IP)</div>
                    </div>
                  </div>

                  {/* Resource Usage Bars */}
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 font-medium">
                        <span className="text-text-muted">Penggunaan Disk (Disk Usage)</span>
                        <span className="text-text-main font-mono font-semibold">14.2 MB / 1,500 MB (1%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-border-main/60 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary rounded-full" style={{ width: '1.2%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1 font-medium">
                        <span className="text-text-muted">Bandwidth Bulanan</span>
                        <span className="text-text-main font-mono font-semibold">1.2 GB / 50 GB (2.4%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-border-main/60 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '2.4%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'database' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('credDbName')}</div>
                    <div className="text-text-main text-xs font-semibold mt-1 font-mono">subly_db_laravel</div>
                  </div>
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('credDbUser')}</div>
                    <div className="text-text-main text-xs font-semibold mt-1 font-mono">subly_u_laravel</div>
                  </div>
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('credHost')}</div>
                    <div className="text-text-main text-xs font-semibold mt-1 font-mono">127.0.0.1:3306</div>
                  </div>
                </div>
                
                <div className="bg-bg-base border border-border-main rounded-xl p-5 flex-1 flex flex-col gap-3.5 overflow-hidden min-h-[190px] shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-text-main uppercase tracking-wider">{t('dbCredTitle')}</span>
                      <p className="text-[10px] text-text-muted mt-0.5">Database MySQL terisolasi dengan akses langsung & phpMyAdmin</p>
                    </div>
                    <button 
                      onClick={() => setMockMessage(t('mockToastPhpMyAdmin'))}
                      className="bg-brand-primary text-white border-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    >
                      {t('openPhpMyAdmin')}
                    </button>
                  </div>
                  
                  {/* Database details preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                    <div className="p-3 rounded-lg bg-bg-surface border border-border-main space-y-1">
                      <span className="text-text-muted font-semibold uppercase text-[9px]">Connection String (.env)</span>
                      <div className="font-mono text-text-main text-[10px] truncate">DB_CONNECTION=mysql<br />DB_HOST=127.0.0.1<br />DB_DATABASE=subly_db_laravel</div>
                    </div>
                    <div className="p-3 rounded-lg bg-bg-surface border border-border-main space-y-1">
                      <span className="text-text-muted font-semibold uppercase text-[9px]">Database Health & Status</span>
                      <div className="flex items-center gap-2 text-emerald-500 font-bold mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        MySQL 8.0 Running • 24 Tables Connected
                      </div>
                      <p className="text-text-muted text-[9px] mt-1">Backup otomatis setiap hari jam 02:00 WIB</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'files' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('colFilesMb')}</div>
                    <div className="text-text-main text-xs font-semibold mt-1 font-mono">14.2 MB / 1500 MB</div>
                  </div>
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('syncMethodLabel')}</div>
                    <div className="text-text-main text-xs font-semibold mt-1 flex items-center gap-1.5 font-mono">
                      <GitBranch className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Git Pull (main)</span>
                    </div>
                  </div>
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Status Deployment</div>
                    <div className="text-emerald-500 text-xs font-semibold mt-1 flex items-center gap-1.5 font-mono">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>v1.0.4 • Selesai</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-bg-base border border-border-main rounded-xl p-5 flex-1 flex flex-col gap-3.5 overflow-hidden min-h-[190px] shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-text-main uppercase tracking-wider">Git Webhook & File Deploy</span>
                      <p className="text-[10px] text-text-muted mt-0.5">Deployment otomatis setiap commit baru didorong ke repositori</p>
                    </div>
                    <button 
                      onClick={handleDeploySimulation}
                      className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary px-3.5 py-1.5 rounded-lg text-[10px] font-bold hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
                    >
                      Trigger Git Pull
                    </button>
                  </div>
                  
                  {/* Git Deployment Information Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                    <div className="p-3 rounded-lg bg-bg-surface border border-border-main space-y-1.5">
                      <div className="text-text-muted font-semibold uppercase text-[9px] flex items-center gap-1.5">
                        <GitBranch className="w-3 h-3 text-brand-primary" />
                        Connected Repository
                      </div>
                      <div className="font-mono text-text-main font-semibold text-[11px]">github.com/subly/laravel-blog</div>
                      <p className="text-text-muted text-[9px]">Branch: <span className="font-mono text-brand-primary font-bold">main</span> • Auto deploy enabled</p>
                    </div>

                    <div className="p-3 rounded-lg bg-bg-surface border border-border-main space-y-1.5">
                      <div className="text-text-muted font-semibold uppercase text-[9px] flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-emerald-500" />
                        Last Deploy Commit
                      </div>
                      <div className="font-mono text-text-main font-semibold text-[11px] truncate">feat: live subdomain preview ready</div>
                      <p className="text-text-muted text-[9px]">Build time: 4.2s • Status: 200 OK</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'ssl' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">SSL Provider</div>
                    <div className="text-text-main text-xs font-semibold mt-1">Let's Encrypt Authority</div>
                  </div>
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">{t('colStatus')}</div>
                    <div className="text-emerald-500 text-xs font-semibold mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                      <span>{t('mockActiveSecure')}</span>
                    </div>
                  </div>
                  <div className="bg-bg-base border border-border-main p-3.5 rounded-xl shadow-sm">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Auto Renewal</div>
                    <div className="text-text-main text-xs font-semibold mt-1">Otomatis (Tiap 60 Hari)</div>
                  </div>
                </div>
                
                <div className="bg-bg-base border border-border-main rounded-xl p-5 flex-1 flex flex-col gap-3.5 overflow-hidden min-h-[190px] shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-text-main uppercase tracking-wider">{t('mockSslSecurity')}</span>
                      <p className="text-[10px] text-text-muted mt-0.5">Enkripsi HTTPS 256-bit kelas industri untuk setiap subdomain</p>
                    </div>
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">FORCE HTTPS</span>
                      <div 
                        onClick={() => {
                          const nextVal = !forceHttps;
                          setForceHttps(nextVal);
                          setMockMessage(t(nextVal ? 'mockToastHttpsEnabled' : 'mockToastHttpsDisabled'));
                        }}
                        className={`w-8 h-4 border rounded-full p-0.5 flex transition-all duration-200 cursor-pointer ${
                          forceHttps 
                            ? 'bg-emerald-500/20 border-emerald-500/40 justify-end' 
                            : 'bg-border-main border-border-main justify-start'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full transition-all duration-200 ${forceHttps ? 'bg-emerald-500' : 'bg-text-muted'}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-bg-surface border border-border-main p-3.5 rounded-xl flex items-center gap-3.5 select-none text-left">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-main">Wildcard SSL Certificate (*.subly.id)</div>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">Berlaku otomatis tanpa perlu instalasi cert manual. Semua subdomain terproteksi penuh.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mockup custom notification */}
        <AnimatePresence>
          {mockMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 right-4 bg-bg-surface border border-brand-primary/30 text-brand-primary text-[10px] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 font-mono font-semibold select-none z-50 pointer-events-none"
            >
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-ping"></span>
              <span>{mockMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab, language } = useSystemStore();
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
  const filteredPlans = plans
    .filter(p => p.type === selectedType)
    .sort((a, b) => Number(a.price) - Number(b.price));

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
          {!user && (
            <button
              onClick={() => setActiveTab('register')}
              className="text-[11px] text-brand-primary hover:underline font-bold mt-2.5 bg-transparent border-none cursor-pointer block"
            >
              {t('noAccountRegisterFree')}
            </button>
          )}
        </section>

        {/* Dense Product UI Screenshot - Protagonist of the page */}
        <ProductMockup />

        {/* Live Statistics Section */}
        <section className="px-6 py-8 max-w-5xl mx-auto w-full select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl bg-bg-surface border border-border-main shadow-md">
            <div className="text-center space-y-1">
              <div className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statDeployTime')}</div>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statDeployProcess')}</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/50">
              <div className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statUptimeSlaVal')}</div>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statUptimeSla')}</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/50">
              <div className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statSsdStorageVal')}</div>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statSsdStorage')}</p>
            </div>
            <div className="text-center space-y-1 border-l border-border-main/50">
              <div className="text-xl md:text-2xl font-semibold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>{t('statSslSecureVal')}</div>
              <p className="text-[9px] text-text-subtle uppercase tracking-wider font-semibold">{t('statSslSecure')}</p>
            </div>
          </div>
        </section>

        {/* Standout Free Tier Showcase Section */}
        <section className="px-6 py-12 max-w-5xl mx-auto w-full select-none">
          <div className="relative rounded-2xl overflow-hidden border border-brand-primary/25 bg-bg-surface/80 dark:bg-bg-surface/60 backdrop-blur-xl p-8 md:p-12 shadow-xl dark:shadow-[0_24px_50px_-12px_rgba(249,115,22,0.12)]">
            
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-brand-primary/10 dark:bg-brand-primary/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center relative z-10 text-left">
              {/* Left Column: Offer Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold tracking-wide uppercase">
                  <Gift className="h-3.5 w-3.5" />
                  <span>{t('freeTierPromoBadge')}</span>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-semibold text-text-main tracking-tight leading-tight" style={{ letterSpacing: '-1.0px' }}>
                  {t('freeTierPromoTitle')}
                </h2>
                
                <p className="text-xs md:text-sm text-text-muted leading-relaxed font-normal">
                  {t('freeTierPromoDesc')}
                </p>

                {/* Specs List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 font-bold text-xs select-none">✓</div>
                    <span className="text-xs text-text-main font-medium">{t('freeTierBullet1')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 font-bold text-xs select-none">✓</div>
                    <span className="text-xs text-text-main font-medium">{t('freeTierBullet2')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 font-bold text-xs select-none">✓</div>
                    <span className="text-xs text-text-main font-medium">{t('freeTierBullet3')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 font-bold text-xs select-none">✓</div>
                    <span className="text-xs text-text-main font-medium">{t('freeTierBullet4')}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="primary" 
                    size="md" 
                    icon={<ArrowRight className="h-4 w-4" />} 
                    iconPosition="right"
                    onClick={() => {
                      if (user) {
                        setActiveTab('dashboard');
                      } else {
                        setActiveTab('register');
                      }
                    }}
                  >
                    {t('freeTierCTA')}
                  </Button>
                </div>
              </div>

              {/* Right Column: Smart Hibernation Feature Card */}
              <div className="lg:col-span-5">
                <div className="bg-bg-base border border-border-main p-6 rounded-xl space-y-4 shadow-lg relative overflow-hidden group">
                  {/* Highlight bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-orange-500" />
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-main uppercase tracking-wide">
                        {t('freeTierSmartHibernationTitle')}
                      </h3>
                      <p className="text-[10px] text-text-muted leading-normal mt-1">
                        {t('freeTierSmartHibernationDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border-main/60 pt-4 space-y-3">
                    {/* Status simulation */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-text-muted font-semibold">Status Subdomain (Hari 1-30)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                        ONLINE
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-text-muted font-semibold">Status setelah 30 hari pasif</span>
                      <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-primary rounded-full inline-block"></span>
                        SUSPENDED
                      </span>
                    </div>

                    {/* Action flow */}
                    <div className="bg-bg-surface p-3 rounded-lg border border-border-main text-[10px] space-y-1">
                      <div className="text-brand-primary font-bold flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>{t('freeTierSmartHibernationReactivate')}</span>
                      </div>
                      <p className="text-text-muted leading-relaxed">
                        {t('freeTierSmartHibernationReactivateDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                    <div className="text-xs font-semibold text-text-main">{t('infraBullet1Title')}</div>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">{t('infraBullet1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs select-none">✓</div>
                  <div>
                    <div className="text-xs font-semibold text-text-main">{t('infraBullet2Title')}</div>
                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">{t('infraBullet2Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 font-bold text-xs select-none">✓</div>
                  <div>
                    <div className="text-xs font-semibold text-text-main">{t('infraBullet3Title')}</div>
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
                      Number(plan.price) === 0 
                        ? 'bg-bg-surface border-[#d2ad5e]/40 shadow-[0_0_20px_rgba(210,173,94,0.1)]'
                        : isFeatured 
                          ? 'bg-bg-card border-border-strong shadow-md' 
                          : 'bg-bg-surface border-border-main'
                    }`}
                  >
                    <div className="text-left space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-text-main">{plan.name}</h3>
                        <span className="text-[9px] font-semibold uppercase bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-2.5 py-0.5 rounded-md select-none">
                          {Number(plan.price) === 0 ? 'FREE' : plan.type}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-1 select-none">
                        <span className="text-2xl font-bold text-brand-primary" style={{ letterSpacing: '-0.5px' }}>
                          {Number(plan.price) === 0 ? 'Gratis' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}
                        </span>
                        <span className="text-[10px] text-text-subtle">
                          {Number(plan.price) === 0 
                            ? ` / ${t('lifetime')}` 
                            : `/ ${plan.duration_months} ${language === 'id' ? 'Bulan' : plan.duration_months > 1 ? 'Months' : 'Month'}`}
                        </span>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed font-normal">
                        {plan.description || 'Dedicated runtime resource allocation.'}
                      </p>

                      <div className="border-t border-border-main/50 pt-4 space-y-2 text-xs text-text-muted font-normal">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>
                            {t('featureStorageLabel').replace(
                              '{storage}', 
                              plan.max_storage_mb >= 1024 
                                ? `${(plan.max_storage_mb / 1024) % 1 === 0 ? (plan.max_storage_mb / 1024) : (plan.max_storage_mb / 1024).toFixed(1)} GB`
                                : `${plan.max_storage_mb} MB`
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>
                            {plan.max_databases === 1 
                              ? t('featureDatabaseLabel') 
                              : t('featureDatabaseLabel')
                                  .replace('1', plan.max_databases.toString())
                                  .replace('Database', t('databases') === 'Databases' ? 'Databases' : 'Database')
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{t('featureSslLabel')} &amp; {t('featureSubdomainLabel').replace('{domain}', '')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border-main/40 w-full">
                      <Button 
                        variant="primary"
                        className="w-full font-medium"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        {Number(plan.price) === 0 ? t('startNow') : t('orderNowBtn')}
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
                        <div className="text-xs font-semibold text-text-main uppercase tracking-wide">
                          {testimonial.title}
                        </div>
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
