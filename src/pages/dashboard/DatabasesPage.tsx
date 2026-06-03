// src/pages/dashboard/DatabasesPage.tsx
import React from 'react';
import { 
  ShieldCheck, Info
} from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';

export const DatabasesPage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    databases, 
    subdomains
  } = useDataStore();

  const getSubdomainName = (subdomainId: number) => {
    const sub = subdomains.find(s => s.id === subdomainId);
    return sub ? `${sub.name}.subly.host` : '-';
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">
            {t('listDatabases')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            Monitor cluster database MySQL dan kredensial user untuk subdomain aktif Anda.
          </p>
        </div>
      </div>

      {/* Info notice */}
      <div className="max-w-xl select-none">
        <CardPanel className="bg-brand-primary/5 border border-brand-primary/10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-text-main">Penyediaan Database Otomatis</h4>
              <p className="text-text-muted leading-relaxed">
                Setiap kali Anda mengklaim subdomain baru, sistem secara otomatis membuat satu database MySQL terdedikasi beserta user credentials yang aman. Anda tidak perlu membuat database secara manual.
              </p>
            </div>
          </div>
        </CardPanel>
      </div>

      {/* Database list table */}
      <CardPanel 
        title="Daftar Kontainer Database"
        headerActions={
          <span className="text-[9px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/15 px-2.5 py-0.5 rounded uppercase">
            {databases.length} Database
          </span>
        }
      >
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-3 pb-2.5 font-bold">DB Name</th>
                <th className="py-3 pb-2.5 font-bold">User</th>
                <th className="py-3 pb-2.5 font-bold">Subdomain Terkait</th>
                <th className="py-3 pb-2.5 font-bold">Host</th>
                <th className="py-3 pb-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {databases.map((db) => (
                <tr key={db.id} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3.5 font-semibold text-text-main font-mono text-[11px] select-all">
                    {db.db_name}
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-text-muted select-all">
                    {db.db_user}
                  </td>
                  <td className="py-3.5 text-text-main font-semibold">
                    {getSubdomainName(db.subdomain_id)}
                  </td>
                  <td className="py-3.5 font-mono text-[10px] text-text-muted select-none">
                    127.0.0.1 (localhost)
                  </td>
                  <td className="py-3.5 select-none">
                    <span className="text-[9px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/15 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
              {databases.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted italic text-xs">
                    {t('emptyDatabases')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>
    </div>
  );
};
export default DatabasesPage;
