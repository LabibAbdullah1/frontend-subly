// src/pages/dashboard/SubdomainPortal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, KeyRound, Terminal, 
  Settings, FolderKanban, 
  ArrowLeft, Layers, ChevronRight,
  GitPullRequest, CheckCircle2, XCircle, Clock, Zap, RotateCcw, GitBranch, RefreshCw,
  Star
} from 'lucide-react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TerminalConsole } from '../../components/dashboard/TerminalConsole';
import { FileManager } from '../../components/dashboard/FileManager';
import { Modal } from '../../components/ui/Modal';
import { apiFetch } from '../../utils/api';

type SubTab = 'overview' | 'git-env' | 'files' | 'logs';

export const SubdomainPortal: React.FC = () => {
  const { t, language } = useTranslation();
  const { addToast } = useToastStore();
  const { currentSubdomainId, setActiveTab } = useSystemStore();
  const { 
    subdomains, 
    updateSubdomainGit,
    disconnectSubdomainGit,
    updateEnvs,
    triggerRealDeployment,
    submitTestimonial,
    fetchMyTestimonials
  } = useDataStore();

  const subdomain = subdomains.find(s => s.id === currentSubdomainId);

  const [activeSubTab, setActiveSubTabState] = useState<SubTab>(() => {
    return (localStorage.getItem('subly-activeSubTab') as SubTab) || 'overview';
  });

  const setActiveSubTab = (tab: SubTab) => {
    setActiveSubTabState(tab);
    localStorage.setItem('subly-activeSubTab', tab);
  };

  // Git integration state
  const [gitUrlInput, setGitUrlInput] = useState('');
  const [gitTokenInput, setGitTokenInput] = useState('');
  const [isVerifyingGit, setIsVerifyingGit] = useState(false);
  const [gitVerified, setGitVerified] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchesList, setBranchesList] = useState<string[]>(['main', 'master']);

  // Git Pull state
  type PullStatus = 'idle' | 'pulling' | 'success' | 'error';
  const [pullStatus, setPullStatus] = useState<PullStatus>('idle');
  const [pullLogs, setPullLogs] = useState<string[]>([]);
  const [lastPullAt, setLastPullAt] = useState<Date | null>(null);
  const [pullElapsed, setPullElapsed] = useState<number>(0);
  const pullTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pullLogsEndRef = useRef<HTMLDivElement>(null);

  const filteredBranches = branchesList.filter(b => b.toLowerCase().includes(branchSearch.toLowerCase()));

  // Environment variables editor state
  const [envMode, setEnvMode] = useState<'form' | 'raw'>('form');
  const [envList, setEnvList] = useState<{ key: string; value: string; id: number }[]>([
    { key: 'APP_NAME', value: 'SublyPortfolio', id: 1 },
    { key: 'APP_ENV', value: 'production', id: 2 },
    { key: 'APP_DEBUG', value: 'false', id: 3 },
    { key: 'DB_CONNECTION', value: 'mysql', id: 4 },
  ]);
  const [rawEnvText, setRawEnvText] = useState('');
  const [isSavingEnvs, setIsSavingEnvs] = useState(false);

  // Testimonial Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Load testimonials on mount
  useEffect(() => {
    fetchMyTestimonials();
  }, [fetchMyTestimonials]);

  // Load existing git settings on open
  useEffect(() => {
    if (subdomain) {
      setGitUrlInput(subdomain.git_url || '');
      setGitVerified(!!subdomain.git_url);
      setSelectedBranch(subdomain.git_branch || 'main');
      if (subdomain.envs && subdomain.envs.length > 0) {
        setEnvList(subdomain.envs.map((e, idx) => ({ key: e.key, value: e.value, id: idx + 10 })));
      }
    }
  }, [subdomain]);

  // Sync env formats when tab changes (Section 3.C)
  const handleEnvModeChange = (mode: 'form' | 'raw') => {
    if (mode === 'raw') {
      // Form -> Raw
      const text = envList.map(e => `${e.key.toUpperCase()}=${e.value}`).join('\n');
      setRawEnvText(text);
    } else {
      // Raw -> Form
      const lines = rawEnvText.split('\n');
      const newList: { key: string; value: string; id: number }[] = [];
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes('=')) {
          const parts = trimmed.split('=');
          const key = parts[0].trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
          const value = parts.slice(1).join('=').trim();
          if (key) {
            newList.push({ key, value, id: idx + 50 });
          }
        }
      });
      setEnvList(newList);
    }
    setEnvMode(mode);
  };

  const handleAddEnvRow = () => {
    setEnvList(prev => [...prev, { key: '', value: '', id: Math.random() }]);
  };

  const handleRemoveEnvRow = (id: number) => {
    setEnvList(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateEnvRowKey = (id: number, val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setEnvList(prev => prev.map(e => e.id === id ? { ...e, key: upper } : e));
  };

  const handleUpdateEnvRowValue = (id: number, val: string) => {
    setEnvList(prev => prev.map(e => e.id === id ? { ...e, value: val } : e));
  };

  const handleSaveEnvs = async () => {
    if (!subdomain) return;
    setIsSavingEnvs(true);
    
    let finalEnvs = [...envList];
    if (envMode === 'raw') {
      const lines = rawEnvText.split('\n');
      finalEnvs = [];
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes('=')) {
          const parts = trimmed.split('=');
          const key = parts[0].trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
          const value = parts.slice(1).join('=').trim();
          if (key) {
            finalEnvs.push({ key, value, id: idx + 100 });
          }
        }
      });
    }

    try {
      await updateEnvs(subdomain.id, finalEnvs);
      addToast({
        type: 'success',
        title: 'Environment Tersimpan',
        message: 'Berkas variabel lingkungan (.env) berhasil diperbarui di server.',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Kesalahan', message: err.message || 'Gagal memperbarui berkas .env.' });
    } finally {
      setIsSavingEnvs(false);
    }
  };
  const checkAndTriggerFeedback = () => {
    const latestSubdomain = useDataStore.getState().subdomains.find(s => s.id === currentSubdomainId);
    const latestMyTestimonials = useDataStore.getState().myTestimonials;
    
    if (!latestSubdomain) return;
    
    const alreadyHasTestimonial = latestMyTestimonials.some(t => Number(t.subdomain_id) === Number(latestSubdomain.id));
    if (alreadyHasTestimonial) return;

    const successDeployments = (latestSubdomain.deployments || []).filter(d => d.status === 'success');
    const isFirstSuccessDeploy = successDeployments.length === 1;
    const hasNoTestimonials = latestMyTestimonials.length === 0;

    if (isFirstSuccessDeploy || hasNoTestimonials) {
      setFeedbackRating(5);
      setFeedbackTitle(t('deploySuccessFeedbackTemplate1').substring(0, 30));
      setFeedbackContent(t('deploySuccessFeedbackTemplate1'));
      setShowFeedbackModal(true);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!subdomain) return;
    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      addToast({
        type: 'error',
        title: t('error'),
        message: t('fillAllFieldsError'),
      });
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await submitTestimonial(subdomain.id, feedbackRating, feedbackTitle, feedbackContent);
      addToast({
        type: 'success',
        title: t('success'),
        message: t('testimonialSubmitSuccess'),
      });
      setShowFeedbackModal(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('error'),
        message: err.message || t('testimonialSubmitError'),
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };


  const handleVerifyGit = async () => {
    if (!gitUrlInput.startsWith('https://github.com/')) {
      addToast({
        type: 'error',
        title: 'Repository Salah',
        message: 'Harap gunakan URL HTTPS repositori GitHub yang valid.',
      });
      return;
    }

    setIsVerifyingGit(true);
    try {
      const res = await apiFetch<{ success: boolean; branches: string[] }>('/subdomains/git/check-repository', {
        method: 'POST',
        body: { git_url: gitUrlInput, git_token: gitTokenInput || null }
      });
      setBranchesList(res.branches);
      if (res.branches.length > 0) {
        setSelectedBranch(res.branches[0]);
      }
      setGitVerified(true);
      addToast({
        type: 'success',
        title: 'Repository Terhubung',
        message: 'Koneksi GitHub sukses diverifikasi. Silakan pilih branch target.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Repository Tidak Ditemukan',
        message: err.message || 'Gagal memverifikasi repository.',
      });
      setGitVerified(false);
    } finally {
      setIsVerifyingGit(false);
    }
  };

  const handleConnectGitRepo = async () => {
    if (!subdomain || !gitVerified) return;
    try {
      await updateSubdomainGit(subdomain.id, gitUrlInput, selectedBranch, gitTokenInput);
      addToast({
        type: 'success',
        title: 'Git Terintegrasi',
        message: `Repositori sukses dikaitkan ke branch ${selectedBranch}.`,
      });
      setActiveSubTab('logs'); // Redirect to logs tab automatically
      checkAndTriggerFeedback();
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal mengaitkan repositori Git.',
      });
    }
  };

  const [isDisconnectingGit, setIsDisconnectingGit] = useState(false);

  const handleDisconnectGit = async () => {
    if (!subdomain) return;
    const confirmText = language === 'id' 
      ? 'Apakah Anda yakin ingin memutuskan hubungan repositori Git? Metode sinkronisasi subdomain akan kembali menjadi Upload ZIP Manual.'
      : 'Are you sure you want to disconnect the Git repository? The subdomain synchronization method will return to Manual ZIP Upload.';
    
    if (!window.confirm(confirmText)) return;

    setIsDisconnectingGit(true);
    try {
      await disconnectSubdomainGit(subdomain.id);
      setGitUrlInput('');
      setGitVerified(false);
      setGitTokenInput('');
      setSelectedBranch('main');
      addToast({
        type: 'success',
        title: language === 'id' ? 'Git Terputus' : 'Git Disconnected',
        message: language === 'id' 
          ? 'Koneksi repositori Git berhasil diputuskan. Metode sinkronisasi kembali ke ZIP Manual.'
          : 'Git repository connection has been successfully disconnected. Synchronization method returned to Manual ZIP.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: language === 'id' ? 'Gagal' : 'Failed',
        message: err.message || (language === 'id' ? 'Gagal memutuskan hubungan Git.' : 'Failed to disconnect Git.'),
      });
    } finally {
      setIsDisconnectingGit(false);
    }
  };

  const handleTriggerDeploy = async () => {
    if (subdomain) {
      addToast({
        type: 'info',
        title: 'Pengajuan Deployment',
        message: 'Infrastruktur sedang memproses pengajuan deployment Anda...',
      });
      try {
        await triggerRealDeployment(subdomain.id);
        addToast({
          type: 'success',
          title: 'Pengajuan Berhasil',
          message: 'Pengajuan deployment berhasil dikirim. Status menunggu persetujuan Admin.',
        });
        checkAndTriggerFeedback();
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Pengajuan Gagal',
          message: err.message || 'Terjadi kesalahan saat mengajukan deployment.',
        });
      }
    }
  };

  // Git Pull handler — pulls latest code from connected GitHub repo
  const handleGitPull = async () => {
    if (!subdomain || !subdomain.git_url) return;

    setPullStatus('pulling');
    setPullElapsed(0);
    const startTime = Date.now();
    const timeStr = () => new Date().toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US');
    setPullLogs([
      `[${timeStr()}] 🚀 ${t('gitPullStartLog')}`,
      `[${timeStr()}] 🔗 ${t('gitPullRepoLog').replace('{url}', subdomain.git_url || '')}`,
      `[${timeStr()}] 🌿 ${t('gitPullBranchLog').replace('{branch}', subdomain.git_branch || 'main')}`,
      `[${timeStr()}] ⏳ ${t('gitPullContactLog')}`,
    ]);

    // Start elapsed timer
    pullTimerRef.current = setInterval(() => {
      setPullElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // Simulate progressive log updates
      setTimeout(() => setPullLogs(prev => [...prev, `[${timeStr()}] 📡 ${t('gitPullFetchLog')}`]), 800);
      setTimeout(() => setPullLogs(prev => [...prev, `[${timeStr()}] 🔄 ${t('gitPullCheckoutLog').replace('{branch}', subdomain.git_branch || 'main')}`]), 1800);

      await triggerRealDeployment(subdomain.id);

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (pullTimerRef.current) clearInterval(pullTimerRef.current);

      setPullLogs(prev => [
        ...prev,
        `[${timeStr()}] ✅ ${t('gitPullSuccessLog').replace('{elapsed}', String(elapsed))}`,
        `[${timeStr()}] 🎉 ${t('gitPullSuccessActiveLog')}`,
      ]);
      setPullStatus('success');
      setLastPullAt(new Date());

      addToast({
        type: 'success',
        title: t('toastGitPullSuccessTitle'),
        message: t('toastGitPullSuccessMsg').replace('{branch}', subdomain.git_branch || 'main'),
      });
      checkAndTriggerFeedback();
    } catch (err: any) {
      if (pullTimerRef.current) clearInterval(pullTimerRef.current);
      setPullLogs(prev => [
        ...prev,
        `[${timeStr()}] ❌ ${t('gitPullErrorLog').replace('{error}', err.message || 'Pull gagal')}`,
        `[${timeStr()}] ⚠️ ${t('gitPullCheckTokenLog')}`,
      ]);
      setPullStatus('error');
      addToast({
        type: 'error',
        title: t('toastGitPullFailedTitle'),
        message: err.message || t('toastGitPullFailedMsg'),
      });
    }
  };

  // Auto-scroll pull logs
  useEffect(() => {
    pullLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pullLogs]);

  if (!subdomain) {
    return (
      <div className="py-12 text-center text-text-muted">
        {t('subdomainNotFound')}
      </div>
    );
  }


  return (
    <div className="space-y-6 w-full text-left">
      {/* Back button and badges */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <button 
          onClick={() => setActiveTab('subdomains', null)}
          className="text-xs font-bold text-text-muted hover:text-brand-primary flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSubdomainList')}
        </button>

        <div className="flex gap-2">
          <Badge 
            status={subdomain.status === 'active' ? 'active' : 'inactive'} 
            label={subdomain.status === 'active' ? t('active') : t('inactive')} 
          />
          <Badge status="processing" label={subdomain.git_url ? t('gitConnectedBadge') : t('manualZipBadge')} />
        </div>
      </div>

      {/* Subdomain Portal Header */}
      <div className="select-none">
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight font-mono select-all">
          {subdomain.full_domain}
        </h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-1">
          Document root: <span className="font-mono text-text-main/80">{subdomain.doc_root}</span>
        </p>
      </div>

      {/* Dynamic Sub-Tab Navigator */}
      <div className="flex border-b border-border-main/60 overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Layers className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveSubTab('git-env')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'git-env'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Settings className="h-4 w-4" />
          Git & Environment
        </button>
        <button
          onClick={() => setActiveSubTab('files')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'files'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          File Explorer
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Terminal className="h-4 w-4" />
          Logs & Console
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        
        {/* OVERVIEW SUB-TAB */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <CardPanel title={t('virtualHostDetailsTitle')} className="md:col-span-2">
                <div className="space-y-4 text-xs select-none">
                  <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                    <span className="text-text-muted font-bold uppercase tracking-wider">{t('primaryDomainLabel')}</span>
                    <span className="font-mono text-text-main text-[11px] select-all">{subdomain.full_domain}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                    <span className="text-text-muted font-bold uppercase tracking-wider">{t('docRootFolderLabel')}</span>
                    <span className="font-mono text-text-main text-[11px] select-all">{subdomain.doc_root}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                    <span className="text-text-muted font-bold uppercase tracking-wider">{t('syncMethodLabel')}</span>
                    <span className="text-text-main font-bold uppercase">
                      {subdomain.git_url ? t('githubRepoVal') : t('manualZipUploadVal')}
                    </span>
                  </div>
                  {subdomain.git_url && (
                    <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                      <span className="text-text-muted font-bold uppercase tracking-wider">{t('gitRepoUrlLabel')}</span>
                      <span className="font-mono text-brand-primary text-[11px] truncate max-w-xs md:max-w-md select-all">{subdomain.git_url}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                    <span className="text-text-muted font-bold uppercase tracking-wider">{t('diskStorageLimitLabel')}</span>
                    <span className="text-text-main font-bold">
                      {subdomain.storage_override_mb ? `${subdomain.storage_override_mb} MB` : t('defaultDiskLimitVal')}
                    </span>
                  </div>
                </div>
              </CardPanel>

              <CardPanel title={t('infraActionsTitle')} className="md:col-span-1 select-none">
                <div className="space-y-4">
                  {/* Git Pull Button — shown when git is connected */}
                  {subdomain.git_url ? (
                    <>
                      {/* Git Pull Status Card */}
                      <div
                        style={{
                          background:
                            pullStatus === 'success'
                              ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.04))'
                              : pullStatus === 'error'
                              ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.04))'
                              : pullStatus === 'pulling'
                              ? 'linear-gradient(135deg, rgba(251,146,60,0.10), rgba(249,115,22,0.05))'
                              : 'linear-gradient(135deg, rgba(251,146,60,0.06), rgba(249,115,22,0.02))',
                          border:
                            pullStatus === 'success'
                              ? '1px solid rgba(34,197,94,0.25)'
                              : pullStatus === 'error'
                              ? '1px solid rgba(239,68,68,0.25)'
                              : '1px solid rgba(251,146,60,0.20)',
                        }}
                        className="rounded-2xl p-4 space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                pullStatus === 'pulling'
                                  ? 'bg-orange-500/20'
                                 : pullStatus === 'success'
                                  ? 'bg-green-500/20'
                                  : pullStatus === 'error'
                                  ? 'bg-red-500/20'
                                  : 'bg-orange-500/10'
                              }`}
                            >
                              <GitPullRequest
                                className={`h-4 w-4 ${
                                  pullStatus === 'pulling'
                                    ? 'text-orange-400 animate-pulse'
                                    : pullStatus === 'success'
                                    ? 'text-green-400'
                                    : pullStatus === 'error'
                                    ? 'text-red-400'
                                    : 'text-orange-400'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-text-main">Git Pull</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <GitBranch className="h-3 w-3 text-text-muted" />
                                <span className="text-[10px] text-text-muted font-mono">{subdomain.git_branch || 'main'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {pullStatus === 'pulling' && (
                              <span className="text-[10px] font-bold text-orange-400 font-mono">{pullElapsed}s</span>
                            )}
                            {pullStatus === 'success' && (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            )}
                            {pullStatus === 'error' && (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                            {pullStatus === 'idle' && lastPullAt && (
                              <div className="text-[10px] text-text-muted flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{t('lastPullLabel').replace('{time}', lastPullAt.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' }))}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pull logs mini console */}
                        {pullLogs.length > 0 && (
                          <div
                            className="rounded-xl bg-black/30 border border-white/5 p-3 max-h-32 overflow-y-auto font-mono text-[9.5px] leading-relaxed space-y-0.5"
                            style={{ scrollbarWidth: 'none' }}
                          >
                            {pullLogs.map((log, i) => (
                              <div
                                key={i}
                                className={`${
                                  log.includes('✅') || log.includes('🎉')
                                    ? 'text-green-400'
                                    : log.includes('❌') || log.includes('⚠️')
                                    ? 'text-red-400'
                                    : log.includes('🚀') || log.includes('🔗') || log.includes('🌿')
                                    ? 'text-orange-300'
                                    : 'text-gray-400'
                                }`}
                              >
                                {log}
                              </div>
                            ))}
                            <div ref={pullLogsEndRef} />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleGitPull}
                            disabled={pullStatus === 'pulling'}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                              pullStatus === 'pulling'
                                ? 'bg-orange-500/10 text-orange-400 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98]'
                            }`}
                            style={{
                              boxShadow: pullStatus !== 'pulling' ? '0 0 20px rgba(249,115,22,0.25)' : 'none'
                            }}
                          >
                            {pullStatus === 'pulling' ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                {t('gitPullRunning')}
                              </>
                            ) : (
                              <>
                                <Zap className="h-3.5 w-3.5" />
                                {pullStatus === 'error' ? t('tryAgain') : t('pullNow')}
                              </>
                            )}
                          </button>
                          {(pullStatus === 'success' || pullStatus === 'error') && (
                            <button
                              onClick={() => { setPullStatus('idle'); setPullLogs([]); }}
                              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted transition-all cursor-pointer"
                              title={t('reset')}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border-main/30" />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] text-text-muted font-semibold leading-normal">
                        Anda menggunakan metode upload file manual via ZIP. Klik tombol di bawah ini untuk memicu deployment manual dari server.
                      </p>
                      <Button
                        onClick={handleTriggerDeploy}
                        variant="primary"
                        className="w-full flex items-center justify-center gap-2 cursor-pointer animate-pulse hover:animate-none"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        {t('deployBtn')}
                      </Button>
                    </div>
                  )}

                </div>
              </CardPanel>
            </div>

            {/* Riwayat & Status Deployment */}
            <CardPanel title={language === 'id' ? 'Riwayat & Status Deployment' : 'Deployment History & Status'}>
              <div className="overflow-x-auto select-none">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main/40 text-text-muted font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Build / Version</th>
                      <th className="py-3 px-4">Tanggal Pengajuan</th>
                      <th className="py-3 px-4">Detail / Catatan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Catatan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/20 font-medium">
                    {subdomain.deployments && subdomain.deployments.length > 0 ? (
                      [...subdomain.deployments]
                        .sort((a, b) => b.version - a.version)
                        .map((dep: any) => (
                          <tr key={dep.id} className="hover:bg-border-main/5 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-text-main">
                              v{dep.version}
                            </td>
                            <td className="py-3 px-4 text-text-muted font-mono">
                              {(() => {
                                if (!dep.created_at) return '-';
                                try {
                                  return new Date(dep.created_at).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch {
                                  return dep.created_at;
                                }
                              })()}
                            </td>
                            <td className="py-3 px-4 text-text-main font-semibold max-w-[200px] truncate" title={dep.notes || ''}>
                              {dep.notes || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {(() => {
                                switch (dep.status) {
                                  case 'queued':
                                    return <Badge status="queued" label={language === 'id' ? 'Menunggu Persetujuan' : 'Waiting Approval'} />;
                                  case 'success':
                                    return <Badge status="success" label={language === 'id' ? 'Berhasil' : 'Success'} />;
                                  case 'error':
                                    return <Badge status="error" label={language === 'id' ? 'Gagal' : 'Failed'} />;
                                  default:
                                    return <Badge status="inactive" label={dep.status} />;
                                }
                              })()}
                            </td>
                            <td className="py-3 px-4 text-text-muted italic text-[11px] max-w-[200px] truncate font-semibold" title={dep.admin_note || ''}>
                              {dep.admin_note || '-'}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-muted font-semibold">
                          {language === 'id' ? 'Belum ada riwayat deployment.' : 'No deployment history available.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardPanel>
          </div>
        )}

        {/* GIT & ENV SUB-TAB */}
        {activeSubTab === 'git-env' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* Git Pull Full Panel — shown at top when git connected */}
            {subdomain.git_url && (
              <div
                className="rounded-2xl p-5 select-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(251,146,60,0.04) 50%, rgba(0,0,0,0) 100%)',
                  border: '1px solid rgba(249,115,22,0.20)',
                }}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/20">
                      <GitPullRequest className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-main">Git Pull</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Github className="h-3 w-3 text-text-muted" />
                          <span className="text-[10px] text-text-muted font-mono truncate max-w-[200px]">{subdomain.git_url}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitBranch className="h-3 w-3 text-orange-400" />
                          <span className="text-[10px] font-bold text-orange-400 font-mono">{subdomain.git_branch || 'main'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-3">
                    {pullStatus === 'idle' && lastPullAt && (
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                        <span>{t('lastPullLabel').replace('{time}', lastPullAt.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' }))}</span>
                      </div>
                    )}
                    {pullStatus === 'pulling' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>{t('pullingTimeLabel').replace('{time}', String(pullElapsed))}</span>
                      </div>
                    )}
                    {pullStatus === 'success' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t('gitPullSuccess')}</span>
                      </div>
                    )}
                    {pullStatus === 'error' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>{t('gitPullFailed')}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {(pullStatus === 'success' || pullStatus === 'error') && (
                        <button
                          onClick={() => { setPullStatus('idle'); setPullLogs([]); }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted transition-all cursor-pointer"
                          title={t('resetStatus')}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={handleGitPull}
                        disabled={pullStatus === 'pulling'}
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                          pullStatus === 'pulling'
                            ? 'bg-orange-500/10 text-orange-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-400 hover:to-orange-300 active:scale-[0.97]'
                        }`}
                        style={{
                          boxShadow: pullStatus !== 'pulling' ? '0 0 24px rgba(249,115,22,0.35), 0 4px 12px rgba(249,115,22,0.20)' : 'none'
                        }}
                      >
                        {pullStatus === 'pulling' ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" /> {t('gitPullRunning')}</>
                        ) : (
                          <><Zap className="h-4 w-4" /> {pullStatus === 'error' ? t('tryAgain') : t('pullNow')}</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Log Console */}
                {pullLogs.length > 0 ? (
                  <div
                    className="rounded-xl border p-4 font-mono text-[10px] leading-relaxed space-y-1 max-h-48 overflow-y-auto"
                    style={{
                      background: 'rgba(0,0,0,0.40)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(249,115,22,0.3) transparent'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                      </div>
                      <span className="text-[9px] text-white/30 font-bold tracking-wider">GIT PULL — LIVE OUTPUT</span>
                    </div>
                    {pullLogs.map((log, i) => (
                      <div
                        key={i}
                        className={`${
                          log.includes('✅') || log.includes('🎉')
                            ? 'text-green-400'
                            : log.includes('❌') || log.includes('⚠️')
                            ? 'text-red-400'
                            : log.includes('🚀') || log.includes('🔗') || log.includes('🌿')
                            ? 'text-orange-300'
                            : log.includes('📡') || log.includes('🔄')
                            ? 'text-blue-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                    <div ref={pullLogsEndRef} />
                  </div>
                ) : (
                  <div
                    className="rounded-xl p-4 flex items-center justify-center gap-2 text-[10px] text-text-muted/50"
                    style={{ background: 'rgba(0,0,0,0.25)', border: '1px dashed rgba(255,255,255,0.05)' }}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{t('gitPullProgressLogs')}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Git Connector */}
            <CardPanel title={t('gitIntegration')}>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                    {t('gitUrl')}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={gitUrlInput}
                        onChange={(e) => {
                          setGitUrlInput(e.target.value);
                          setGitVerified(false);
                        }}
                        placeholder="https://github.com/username/project.git"
                        className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all font-mono"
                      />
                      <Github className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                    </div>
                    <Button 
                      type="button" 
                      variant="secondary"
                      className="rounded-xl text-[11px] font-bold py-2.5"
                      isLoading={isVerifyingGit}
                      onClick={handleVerifyGit}
                    >
                      {t('checkRepoBtn')}
                    </Button>
                    {subdomain.git_url && (
                      <button
                        type="button"
                        onClick={handleDisconnectGit}
                        disabled={isDisconnectingGit}
                        className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[11px] font-bold transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDisconnectingGit 
                          ? (language === 'id' ? 'Memutus...' : 'Disconnecting...') 
                          : (language === 'id' ? 'Putuskan Hubungan Git' : 'Disconnect')
                        }
                      </button>
                    )}
                  </div>
                </div>

                {gitVerified && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-main/50 animate-in fade-in duration-200">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                        {t('personalAccessTokenLabel')}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={gitTokenInput}
                          onChange={(e) => setGitTokenInput(e.target.value)}
                          placeholder="ghp_••••••••••••••••••••"
                          className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all"
                        />
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left relative">
                      <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                        {t('gitBranch')}
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                        className="w-full text-left bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main flex items-center justify-between cursor-pointer font-mono"
                      >
                        <span>{selectedBranch}</span>
                        <ChevronRight className="h-4 w-4 text-text-muted rotate-90" />
                      </button>

                      {branchDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setBranchDropdownOpen(false)} />
                          <div className="absolute left-0 right-0 mt-1 rounded-xl bg-bg-surface border border-border-main shadow-2xl p-2 z-20 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                            <input
                              type="text"
                              value={branchSearch}
                              onChange={(e) => setBranchSearch(e.target.value)}
                              placeholder={t('searchBranchPlaceholder')}
                              className="w-full bg-border-main/20 border border-border-main focus:border-brand-primary rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-text-main outline-none mb-1.5"
                            />
                            {filteredBranches.map(b => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => {
                                  setSelectedBranch(b);
                                  setBranchDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg font-mono text-[11px] font-semibold cursor-pointer ${
                                  selectedBranch === b 
                                    ? 'bg-brand-primary/10 text-brand-primary' 
                                    : 'text-text-muted hover:bg-border-main/30'
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                            {filteredBranches.length === 0 && (
                              <p className="text-[10px] text-text-muted italic p-2 text-center">{t('branchNotFound')}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="md:col-span-2 pt-2 text-right">
                      <Button 
                        variant="primary"
                        onClick={handleConnectGitRepo}
                      >
                        {t('gitBtn')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardPanel>

            {/* Env Editor */}
            <CardPanel 
              title={t('envTitle')}
              headerActions={
                <div className="flex gap-1 select-none bg-border-main/20 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleEnvModeChange('form')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      envMode === 'form' 
                        ? 'bg-bg-surface text-brand-primary shadow-xs' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {t('formMode')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnvModeChange('raw')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      envMode === 'raw' 
                        ? 'bg-bg-surface text-brand-primary shadow-xs' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {t('rawMode')}
                  </button>
                </div>
              }
            >
              <div className="space-y-4 mt-2">
                {envMode === 'form' && (
                  <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                    {envList.map((env) => (
                      <div key={env.id} className="flex gap-2.5 items-center">
                        <input
                          type="text"
                          value={env.key}
                          onChange={(e) => handleUpdateEnvRowKey(env.id, e.target.value)}
                          placeholder="KEY_NAME"
                          className="w-1/3 bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2 text-xs font-semibold font-mono text-text-main uppercase outline-none transition-all"
                        />
                        <input
                          type="text"
                          value={env.value}
                          onChange={(e) => handleUpdateEnvRowValue(env.id, e.target.value)}
                          placeholder="value_setting"
                          className="flex-1 bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-2 text-xs font-semibold font-mono text-text-main outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEnvRow(env.id)}
                          className="text-text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-[0.95] shrink-0 text-xs font-bold"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddEnvRow}
                    >
                      + {t('addEnvBtn')}
                    </Button>
                  </div>
                )}

                {envMode === 'raw' && (
                  <div className="text-left">
                    <textarea
                      rows={6}
                      value={rawEnvText}
                      onChange={(e) => setRawEnvText(e.target.value)}
                      placeholder="KEY_NAME=value_setting"
                      className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl p-4 text-xs font-mono text-text-main outline-none transition-all resize-none"
                    />
                    <p className="text-[10px] text-text-muted mt-1 select-none font-semibold">
                      {t('envRawHint')}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-border-main/50">
                  <Button 
                    variant="primary"
                    isLoading={isSavingEnvs}
                    onClick={handleSaveEnvs}
                  >
                    {t('save')}
                  </Button>
                </div>
              </div>
            </CardPanel>
            </div>{/* end grid cols 2 */}
          </div>
        )}

        {/* FILE EXPLORER SUB-TAB */}
        {activeSubTab === 'files' && (
          <div className="w-full animate-in fade-in duration-200">
            <FileManager 
              subdomainName={subdomain.name} 
              subdomainId={subdomain.id} 
            />
          </div>
        )}

        {/* LOGS & CONSOLE SUB-TAB */}
        {activeSubTab === 'logs' && (
          <div className="w-full animate-in fade-in duration-200 space-y-4">
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs leading-relaxed select-none">
              <span className="font-bold">💡 Info:</span> {language === 'id' 
                ? 'Fitur Live Console Log saat ini hanya mendukung aplikasi dengan runtime Node.js. Jika Anda menggunakan PHP atau Laravel, silakan periksa file logs secara manual (seperti file error_log atau storage/logs/laravel.log) melalui menu File Explorer.'
                : 'Live Console Log is currently only available for Node.js runtime applications. If you are using PHP or Laravel, please check your log files manually (such as error_log or storage/logs/laravel.log) via the File Explorer tab.'
              }
            </div>
            <TerminalConsole
              streamUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/subdomains/${subdomain.id}/logs/stream`}
              title={`${subdomain.name}.${import.meta.env.VITE_ROOT_DOMAIN || 'subly.my.id'} — Live Console`}
            />
          </div>
        )}

      </div>

      {/* SUCCESS & TESTIMONIAL FEEDBACK MODAL */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title={t('deploySuccessFeedbackTitle')}
        size="md"
        footerActions={
          <div className="flex items-center justify-between w-full select-none">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer bg-transparent border-none py-2 px-4"
            >
              {t('deploySuccessFeedbackSkip')}
            </button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingFeedback}
              onClick={handleFeedbackSubmit}
            >
              {t('deploySuccessFeedbackSubmit')}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-text-muted leading-relaxed select-none">
            {t('deploySuccessFeedbackDesc')}
          </p>

          {/* Rating Stars */}
          <div className="space-y-1.5 select-none">
            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
              {t('deploySuccessFeedbackRating')}
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setFeedbackHoverRating(star)}
                  onMouseLeave={() => setFeedbackHoverRating(null)}
                  className="p-1 rounded-lg hover:bg-border-main/20 transition-all border-none cursor-pointer bg-transparent"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (feedbackHoverRating ?? feedbackRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-text-muted/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-1.5 select-none">
            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
              {t('deploySuccessFeedbackTemplates')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'deploySuccessFeedbackTemplate1', icon: '⚡' },
                { key: 'deploySuccessFeedbackTemplate2', icon: '🛠️' },
                { key: 'deploySuccessFeedbackTemplate3', icon: '💎' },
                { key: 'deploySuccessFeedbackTemplate4', icon: '🚀' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const contentText = t(item.key as any);
                    setFeedbackContent(contentText);
                    setFeedbackTitle(contentText.substring(0, 30));
                  }}
                  className="text-left text-[11px] p-3 rounded-xl border border-border-main/60 bg-bg-surface hover:border-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer flex items-start gap-2 text-text-main font-semibold leading-relaxed"
                >
                  <span className="text-base shrink-0 select-none">{item.icon}</span>
                  <span className="line-clamp-2">{t(item.key as any)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Fields */}
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                {t('deploySuccessFeedbackCommentTitle')}
              </label>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder={t('testimonialTitlePlaceholder')}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                {t('commentContent')}
              </label>
              <textarea
                rows={3}
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder={t('testimonialContentPlaceholder')}
                className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none transition-all"
                required
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default SubdomainPortal;
