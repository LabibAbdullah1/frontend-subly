// src/pages/dashboard/SubdomainPortal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Github, KeyRound, Terminal, 
  Settings, FolderKanban, 
  ArrowLeft, RefreshCw, Layers, ChevronRight, Info
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
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Trigger deploy ulang secara manual jika Anda melakukan perubahan file mentah di storage cPanel atau ingin menyegarkan cache virtual host.
                </p>
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 mt-4"
                  onClick={handleTriggerDeploy}
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  Trigger Deploy Manual
                </Button>
                <div className="p-3.5 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary flex items-start gap-2.5">
                  <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div className="text-[9.5px] leading-relaxed">
                    <p className="font-bold">Informasi Deployment:</p>
                    <p className="mt-0.5 text-text-muted">Proses deploy manual aman dilakukan kapan saja tanpa menghapus database MySQL Anda.</p>
                  </div>
                </div>
              </div>
            </CardPanel>
          </div>
        )}

        {/* GIT & ENV SUB-TAB */}
        {activeSubTab === 'git-env' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
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
