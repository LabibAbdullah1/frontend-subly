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
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {/* ignore */ }
  };

  const display = secret && !revealed ? '••••••••••••' : value;

  return (
    <div className="flex items-center justify-between px-4.5 py-3.5 gap-3">
      <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider shrink-0 w-24">
        {label}
      </span>
      <span className="font-mono text-[11px] font-semibold text-text-main flex-1 truncate select-all">
        {display}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {secret && (
          <button
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? t('cancel') : t('confirm')}
            className="p-1.5 rounded-md text-text-subtle hover:text-text-main hover:bg-border-main/30 transition-all cursor-pointer"
          >
            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
        <button
          onClick={handleCopy}
          title={t('copyLabel')}
          className="p-1.5 rounded-md text-text-subtle hover:text-brand-primary hover:bg-brand-primary/10 transition-all cursor-pointer"
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
            {t('databaseOverviewSub')}
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
          {t('openPhpMyAdmin')}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      {/* Auto-provisioning notice */}
      <div className="max-w-xl mx-auto select-none">
        <CardPanel className="bg-brand-primary/5 border border-brand-primary/10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-text-main">{t('autoProvisioningTitle')}</h4>
              <p className="text-text-muted leading-relaxed">
                {t('autoProvisioningDesc').replace('{link}', 'db.subly.my.id')}
              </p>
            </div>
          </div>
        </CardPanel>
      </div>

      {/* Per-subdomain resource cards */}
      {subdomainResources.length === 0 ? (
        <CardPanel className="max-w-xl mx-auto text-center p-8">
          <div className="h-12 w-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4 select-none">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider select-none">
            {t('emptySubdomains')}
          </h3>
          <p className="text-[11px] text-text-muted mt-2 leading-relaxed select-none">
            {t('noSubdomainDatabases')}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-5 w-full"
            onClick={() => setActiveTab('plans')}
          >
            {t('buyHostingBtn')}
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
                      {plan?.name ?? t('plans')} · {plan?.type ?? 'PHP'}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                  sub.status === 'active'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-text-muted/10 text-text-muted border-text-muted/20'
                }`}>
                  {sub.status === 'active' ? t('activeLabel') : t('inactiveLabel')}
                </span>
              </div>

              <div className="border-t border-border-main/50 my-4.5" />

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

              <div className="border-t border-border-main/50 my-4.5" />

              {/* Database Credentials */}
              <div className="space-y-3">
                <div className="flex items-center justify-between select-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                    <Server className="h-4 w-4 text-text-muted shrink-0" />
                    {t('dbCredTitle')}
                  </div>
                  {db && (
                    <span className="text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/15 px-2 py-0.5 rounded flex items-center gap-1 select-none">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t('activeLabel')}
                    </span>
                  )}
                </div>

                {db ? (
                  <div className="flex flex-col gap-4 mt-2.5">
                    {/* Credentials table */}
                    <div className="rounded-md border border-border-main overflow-hidden text-[11px] divide-y divide-border-main/40 bg-bg-base/20">
                      <CredRow label={t('credDbName')}  value={db.db_name} />
                      <CredRow label={t('credDbUser')}  value={db.db_user} />
                      <CredRow label={t('credPassword')} value={db.db_password ?? t('encryptedLabel')} secret={!!db.db_password} />
                      <CredRow label={t('credHost')}     value="localhost" />
                    </div>

                    {/* phpMyAdmin CTA */}
                    <a
                      href="https://db.subly.my.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-md border border-border-main bg-bg-surface hover:bg-bg-card hover:text-text-main text-text-subtle text-xs font-semibold transition-all duration-150 cursor-pointer select-none group"
                    >
                      <KeyRound className="h-4 w-4 shrink-0" />
                      {t('manageDbPhpMyAdmin')}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border-main/40 bg-border-main/5 px-4 py-5 text-center select-none">
                    <Database className="h-7 w-7 text-text-muted/40 mx-auto mb-2" />
                    <p className="text-[10px] text-text-muted font-semibold leading-relaxed">
                      {t('dbUnavailable')}
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

