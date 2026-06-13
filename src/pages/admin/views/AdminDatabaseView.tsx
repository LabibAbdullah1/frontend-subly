// src/pages/admin/views/AdminDatabaseView.tsx
import React from 'react';
import { useDataStore } from '../../../stores/useDataStore';
import { CardPanel } from '../../../components/ui/CardPanel';

export const AdminDatabaseView: React.FC = () => {
  const { databases, subdomains, adminDiskUsage } = useDataStore();

  const allDatabases = databases.map((db) => {
    const sub = subdomains.find((s) => s.id === db.subdomain_id);
    const diskSub = adminDiskUsage?.subdomains.find(
      (s) => Number(s.id) === db.subdomain_id || (sub && s.name === sub.name)
    );
    return {
      ...db,
      subdomainName: sub ? (sub.full_domain || `${sub.name}.subly.host`) : 'Unknown Subdomain',
      ownerName: sub?.user?.name || 'Client',
      ownerEmail: sub?.user?.email || '',
      dbSizeMb: diskSub?.dbMb ?? 0,
    };
  });

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">Kelola Database</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Lihat koneksi database dan rincian penggunaan disk untuk klien.
        </p>
      </div>

      <CardPanel title="Kredensial Database & Ukuran">
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full text-left min-w-[750px]">
            <thead>
              <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                <th className="py-2.5 pb-2 px-4 font-bold">KLIEN</th>
                <th className="py-2.5 pb-2 px-4 font-bold">SUBDOMAIN</th>
                <th className="py-2.5 pb-2 px-4 font-bold">NAMA DATABASE</th>
                <th className="py-2.5 pb-2 px-4 font-bold">USERNAME</th>
                <th className="py-2.5 pb-2 px-4 text-right font-bold">UKURAN DATABASE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30 text-xs">
              {allDatabases.map((db, idx) => (
                <tr key={db.id || idx} className="hover:bg-border-main/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-main">{db.ownerName}</span>
                      <span className="text-[10px] text-text-muted font-mono">{db.ownerEmail}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{db.subdomainName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-primary">{db.db_name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-text-main">{db.db_user}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-text-muted">
                    {db.dbSizeMb ? `${db.dbSizeMb.toFixed(2)} MB` : '0.00 MB'}
                  </td>
                </tr>
              ))}
              {allDatabases.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-text-muted italic">Tidak ada database terdaftar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardPanel>
    </div>
  );
};
