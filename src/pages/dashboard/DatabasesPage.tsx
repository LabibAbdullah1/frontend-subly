// src/pages/dashboard/DatabasesPage.tsx
import React, { useState } from 'react';
import {
  Globe, Database, ShieldCheck, Info, HardDrive, Server,
  Copy, Check, ExternalLink, Eye, EyeOff, KeyRound
} from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';

// ── Reusable credential row with copy button ──────────────────────────────────
const CredRow: React.FC<{
  label: string;
  value: string;
  secret?: boolean;
}> = ({ label, value, secret = false }) => {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {/* ignore */ }
  };

  const display = secret && !revealed ? '••••••••••••' : value;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0 w-20">
        {label}
      </span>
      <span className="font-mono text-[11px] font-bold text-text-main flex-1 truncate select-all">
        {display}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {secret && (
          <button
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? 'Sembunyikan' : 'Tampilkan'}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-border-main/30 transition-all cursor-pointer"
          >
            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
        <button
          onClick={handleCopy}
          title="Salin"
          className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all cursor-pointer"
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-green-500" />
            : <Copy className="h-3.5 w-3.5" />
          }
        </button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const DatabasesPage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useSystemStore();
  const { databases, subdomains, payments } = useDataStore();

  // Build per-subdomain resource map
  const subdomainResources = subdomains.map((sub) => {
    const db = databases.find((d) => d.subdomain_id === sub.id);

    const linkedPayment = payments.find(
      (p) => p.subdomain_id === sub.id && p.status === 'success'
    );
    const planStorageMb = linkedPayment?.plan?.max_storage_mb ?? 1024;
    const usedStorageMb = sub.storage_override_mb ?? 0;
    const storagePercent = Math.min(100, Math.round((usedStorageMb / planStorageMb) * 100));

    return { sub, db, planStorageMb, usedStorageMb, storagePercent, plan: linkedPayment?.plan };
  });

  const formatStorage = (mb: number) =>
    mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;

  const getBarColor = (pct: number) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-brand-primary';
  };

  return (
    <div className="space-y-6 w-full text-left">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {t('listDatabases')}
          </h1>
          <p className="text-[10px] text-text-muted font-semibold tracking-wide uppercase mt-0.5">
            Disk &amp; kredensial database MySQL per subdomain aktif Anda.
          </p>
        </div>

        {/* phpMyAdmin shortcut */}
        <a
          href="https://db.subly.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-surface border border-border-main hover:border-brand-primary/50 hover:bg-brand-primary/5 text-text-muted hover:text-brand-primary text-xs font-bold transition-all duration-200 select-none shrink-0 cursor-pointer group"
        >
          <Database className="h-4 w-4 shrink-0 group-hover:text-brand-primary" />
          Buka phpMyAdmin
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      {/* Auto-provisioning notice */}
      <div className="max-w-2xl select-none">
        <CardPanel className="bg-brand-primary/5 border border-brand-primary/10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-text-main">Penyediaan Otomatis per Subdomain</h4>
              <p className="text-text-muted leading-relaxed">
                Setiap subdomain yang diklaim mendapatkan satu database MySQL terdedikasi.
                Gunakan kredensial di bawah untuk menghubungkan aplikasi Anda, atau klik{' '}
                <a
                  href="https://db.subly.my.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary underline underline-offset-2 hover:opacity-80 font-bold"
                >
                  db.subly.my.id
                </a>{' '}
                untuk membuka phpMyAdmin dan mengelola data secara visual.
              </p>
            </div>
          </div>
        </CardPanel>
      </div>

      {/* Per-subdomain resource cards */}
      {subdomainResources.length === 0 ? (
        <CardPanel className="max-w-md mx-auto text-center p-8">
          <div className="h-12 w-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4 select-none">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider select-none">
            Belum Ada Subdomain Aktif
          </h3>
          <p className="text-[11px] text-text-muted mt-2 leading-relaxed select-none">
            Klaim subdomain terlebih dahulu untuk melihat disk dan database Anda di sini.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-5 w-full"
            onClick={() => setActiveTab('plans')}
          >
            Beli Paket Hosting
          </Button>
        </CardPanel>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subdomainResources.map(({ sub, db, planStorageMb, usedStorageMb, storagePercent, plan }) => (
            <CardPanel key={sub.id} className="flex flex-col gap-5" glow>

              {/* Card Header: subdomain identity */}
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-main font-mono truncate select-all">
                      {sub.name}.subly.host
                    </h3>
                    <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide mt-0.5 truncate">
                      {plan?.name ?? 'Paket Hosting'} · {plan?.type ?? 'PHP'}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                  sub.status === 'active'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-text-muted/10 text-text-muted border-text-muted/20'
                }`}>
                  {sub.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="border-t border-border-main/50" />

              {/* Disk Storage */}
              <div className="space-y-2.5 select-none">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-text-main">
                    <HardDrive className="h-4 w-4 text-text-muted shrink-0" />
                    Disk Storage NVMe
                  </span>
                  <span className={`font-mono tabular-nums ${
                    storagePercent >= 100 ? 'text-red-500' :
                    storagePercent >= 80  ? 'text-amber-500' :
                    'text-text-muted'
                  }`}>
                    {formatStorage(usedStorageMb)} / {formatStorage(planStorageMb)} ({storagePercent}%)
                  </span>
                </div>
                <div className="w-full bg-border-main/40 h-2.5 rounded-full overflow-hidden border border-border-main/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(storagePercent)}`}
                    style={{ width: `${storagePercent || 1}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-border-main/50" />

              {/* Database Credentials */}
              <div className="space-y-3">
                <div className="flex items-center justify-between select-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                    <Server className="h-4 w-4 text-text-muted shrink-0" />
                    Kredensial Database MySQL
                  </div>
                  {db && (
                    <span className="text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/15 px-2 py-0.5 rounded flex items-center gap-1 select-none">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Aktif
                    </span>
                  )}
                </div>

                {db ? (
                  <>
                    {/* Credentials table */}
                    <div className="rounded-xl border border-border-main overflow-hidden text-[11px] divide-y divide-border-main/40">
                      <CredRow label="DB Name"  value={db.db_name} />
                      <CredRow label="DB User"  value={db.db_user} />
                      <CredRow label="Password" value={db.db_password ?? '(terenkripsi — lihat phpMyAdmin)'} secret={!!db.db_password} />
                      <CredRow label="Host"     value="localhost" />
                    </div>

                    {/* phpMyAdmin CTA */}
                    <a
                      href="https://db.subly.my.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer group select-none"
                    >
                      <KeyRound className="h-4 w-4 shrink-0" />
                      Kelola Database di phpMyAdmin
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border-main/40 bg-border-main/5 px-4 py-5 text-center select-none">
                    <Database className="h-7 w-7 text-text-muted/40 mx-auto mb-2" />
                    <p className="text-[10px] text-text-muted font-semibold leading-relaxed">
                      Database belum tersedia — belum diklaim atau sedang diprovisioning oleh sistem.
                    </p>
                  </div>
                )}
              </div>

            </CardPanel>
          ))}
        </div>
      )}

    </div>
  );
};
export default DatabasesPage;
