// src/pages/dashboard/SubdomainPortal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, KeyRound, Terminal, 
  Settings, FolderKanban, 
  ArrowLeft, Layers, ChevronRight,
  GitPullRequest, CheckCircle2, XCircle, Clock, Zap, RotateCcw, GitBranch, RefreshCw
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
import { apiFetch } from '../../utils/api';

type SubTab = 'overview' | 'git-env' | 'files' | 'logs';

export const SubdomainPortal: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { currentSubdomainId, setActiveTab } = useSystemStore();
  const { 
    subdomains, 
    updateSubdomainGit,
    updateEnvs,
    logs,
    triggerRealDeployment
  } = useDataStore();

  const subdomain = subdomains.find(s => s.id === currentSubdomainId);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');

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
    } catch {
      addToast({ type: 'error', title: 'Kesalahan', message: 'Gagal memperbarui berkas .env.' });
    } finally {
      setIsSavingEnvs(false);
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
      await triggerRealDeployment(subdomain.id);
      setActiveSubTab('logs'); // Redirect to logs tab automatically
    } catch {
      addToast({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal mengaitkan repositori Git.',
      });
    }
  };

  const handleTriggerDeploy = async () => {
    if (subdomain) {
      addToast({
        type: 'info',
        title: 'Deploy Dimulai',
        message: 'Infrastruktur sedang memproses deployment Anda...',
      });
      try {
        await triggerRealDeployment(subdomain.id);
        addToast({
          type: 'success',
          title: 'Deploy Sukses',
          message: 'Website Anda telah dideploy dan aktif.',
        });
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Deploy Gagal',
          message: err.message || 'Terjadi kesalahan saat memproses deployment.',
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
    setPullLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Memulai Git Pull...`,
      `[${new Date().toLocaleTimeString()}] 🔗 Repository: ${subdomain.git_url}`,
      `[${new Date().toLocaleTimeString()}] 🌿 Branch: ${subdomain.git_branch || 'main'}`,
      `[${new Date().toLocaleTimeString()}] ⏳ Menghubungi server Git...`,
    ]);

    // Start elapsed timer
    pullTimerRef.current = setInterval(() => {
      setPullElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // Simulate progressive log updates
      setTimeout(() => setPullLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📡 Fetching objects dari remote...`]), 800);
      setTimeout(() => setPullLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Checking out branch ${subdomain.git_branch || 'main'}...`]), 1800);

      await triggerRealDeployment(subdomain.id);

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (pullTimerRef.current) clearInterval(pullTimerRef.current);

      setPullLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ Pull berhasil dalam ${elapsed}s`,
        `[${new Date().toLocaleTimeString()}] 🎉 Website diperbarui dan aktif.`,
      ]);
      setPullStatus('success');
      setLastPullAt(new Date());

      addToast({
        type: 'success',
        title: 'Git Pull Berhasil',
        message: `Kode terbaru berhasil diambil dari branch ${subdomain.git_branch || 'main'}.`,
      });
    } catch (err: any) {
      if (pullTimerRef.current) clearInterval(pullTimerRef.current);
      setPullLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Error: ${err.message || 'Pull gagal'}`,
        `[${new Date().toLocaleTimeString()}] ⚠️ Periksa token dan URL repository.`,
      ]);
      setPullStatus('error');
      addToast({
        type: 'error',
        title: 'Git Pull Gagal',
        message: err.message || 'Terjadi kesalahan saat melakukan git pull.',
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
        Subdomain tidak ditemukan. Kembali ke dashboard.
      </div>
    );
  }

  const subdomainLogs = logs[subdomain.id] || [];

  return (
    <div className="space-y-6 w-full text-left">
      {/* Back button and badges */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <button 
          onClick={() => setActiveTab('subdomains', null)}
          className="text-xs font-bold text-text-muted hover:text-brand-primary flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Subdomain
        </button>

        <div className="flex gap-2">
          <Badge 
            status={subdomain.status === 'active' ? 'active' : 'inactive'} 
            label={subdomain.status === 'active' ? 'Active' : 'Inactive'} 
          />
          <Badge status="processing" label={subdomain.git_url ? 'Git Connected' : 'Manual ZIP'} />
        </div>
      </div>

      {/* Subdomain Portal Header */}
      <div className="select-none">
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight font-mono select-all">
          {subdomain.name}.subly.host
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <CardPanel title="Virtual Host Details" className="md:col-span-2">
              <div className="space-y-4 text-xs select-none">
                <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                  <span className="text-text-muted font-bold uppercase tracking-wider">Domain Utama</span>
                  <span className="font-mono text-text-main text-[11px] select-all">{subdomain.name}.subly.host</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                  <span className="text-text-muted font-bold uppercase tracking-wider">Document Root Folder</span>
                  <span className="font-mono text-text-main text-[11px] select-all">{subdomain.doc_root}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                  <span className="text-text-muted font-bold uppercase tracking-wider">Metode Sinkronisasi</span>
                  <span className="text-text-main font-bold uppercase">
                    {subdomain.git_url ? 'GitHub Repository' : 'Manual ZIP Upload'}
                  </span>
                </div>
                {subdomain.git_url && (
                  <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                    <span className="text-text-muted font-bold uppercase tracking-wider">Git Repo URL</span>
                    <span className="font-mono text-brand-primary text-[11px] truncate max-w-xs md:max-w-md select-all">{subdomain.git_url}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                  <span className="text-text-muted font-bold uppercase tracking-wider">Limit Penyimpanan Disk</span>
                  <span className="text-text-main font-bold">
                    {subdomain.storage_override_mb ? `${subdomain.storage_override_mb} MB` : 'Default 1.5 GB NVMe'}
                  </span>
                </div>
              </div>
            </CardPanel>

            <CardPanel title="Aksi Infrastruktur" className="md:col-span-1 select-none">
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
                              <span>{lastPullAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
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
                              Pulling...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5" />
                              {pullStatus === 'error' ? 'Coba Lagi' : 'Pull Sekarang'}
                            </>
                          )}
                        </button>
                        {(pullStatus === 'success' || pullStatus === 'error') && (
                          <button
                            onClick={() => { setPullStatus('idle'); setPullLogs([]); }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted transition-all cursor-pointer"
                            title="Reset"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border-main/30" />
                  </>
                ) : null}

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
                        <span>Terakhir pull: <span className="font-bold text-text-main">{lastPullAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></span>
                      </div>
                    )}
                    {pullStatus === 'pulling' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Pulling... {pullElapsed}s</span>
                      </div>
                    )}
                    {pullStatus === 'success' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Pull Sukses!</span>
                      </div>
                    )}
                    {pullStatus === 'error' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Pull Gagal</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {(pullStatus === 'success' || pullStatus === 'error') && (
                        <button
                          onClick={() => { setPullStatus('idle'); setPullLogs([]); }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted transition-all cursor-pointer"
                          title="Reset status"
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
                          <><RefreshCw className="h-4 w-4 animate-spin" /> Sedang Pull...</>
                        ) : (
                          <><Zap className="h-4 w-4" /> {pullStatus === 'error' ? 'Coba Lagi' : 'Pull Sekarang'}</>
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
                    <span>Output log akan muncul di sini saat pull dijalankan</span>
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
                      isLoading={isVerifyingGit}
                      onClick={handleVerifyGit}
                    >
                      Periksa Repo
                    </Button>
                  </div>
                </div>

                {gitVerified && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-main/50 animate-in fade-in duration-200">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                        Personal Access Token (Opsional)
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={gitTokenInput}
                          onChange={(e) => setGitTokenInput(e.target.value)}
                          placeholder="ghp_••••••••••••••••••••"
                          className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all"
                        />
                        <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
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
                              placeholder="Cari branch..."
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
                              <p className="text-[10px] text-text-muted italic p-2 text-center">Branch tidak ditemukan</p>
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
                          Hapus
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
                      Setiap baris merupakan KEY=VALUE. Karakter khusus diparsing otomatis.
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
              onDeployTrigger={handleTriggerDeploy} 
            />
          </div>
        )}

        {/* LOGS & CONSOLE SUB-TAB */}
        {activeSubTab === 'logs' && (
          <div className="w-full animate-in fade-in duration-200">
            <TerminalConsole 
              logs={subdomainLogs} 
              connectionStatus={subdomainLogs.length > 0 ? 'connected' : 'disconnected'}
              onRetryConnection={handleTriggerDeploy}
            />
          </div>
        )}

      </div>
    </div>
  );
};
export default SubdomainPortal;
