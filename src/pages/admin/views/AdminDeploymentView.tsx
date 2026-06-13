// src/pages/admin/views/AdminDeploymentView.tsx
import React from 'react';
import { Globe } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Badge } from '../../../components/ui/Badge';

interface Props {
  allDeployments: any[];
  activeQueueDeployments: any[];
}

export const AdminDeploymentView: React.FC<Props> = ({ allDeployments, activeQueueDeployments }) => {
  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">Antrian Deployment</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Monitoring infrastruktur antrean deploy dan rincian update.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Queue */}
        <div className="lg:col-span-1">
          <CardPanel title="ANTRIAN AKTIF" headerActions={
            <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
              {activeQueueDeployments.length} TERTUNDA
            </span>
          }>
            <div className="py-4 space-y-2 mt-2">
              {activeQueueDeployments.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-8">Tidak ada deployment aktif.</p>
              ) : (
                activeQueueDeployments.map((q, idx) => (
                  <div key={idx} className="p-3 bg-bg-surface border border-border-main rounded-xl flex items-center justify-between text-left">
                    <div>
                      <p className="font-bold text-text-main text-xs">{q.subdomainName}</p>
                      <p className="text-[10px] text-text-muted">v{q.version}</p>
                    </div>
                    <Badge status="pending" label={q.status.toUpperCase()} />
                  </div>
                ))
              )}
            </div>
          </CardPanel>
        </div>

        {/* Deployment History */}
        <div className="lg:col-span-2">
          <CardPanel title="RIWAYAT DEPLOYMENT">
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left min-w-[650px]">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 px-4 font-bold">ARTEFAK</th>
                    <th className="py-2.5 pb-2 px-4 text-center font-bold">STATUS</th>
                    <th className="py-2.5 pb-2 px-4 text-right font-bold">TANGGAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {allDeployments.map((dep, idx) => (
                    <tr key={idx} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-main">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs">{dep.subdomainName}</span>
                          <span className="text-[10px] text-text-muted font-normal">Pemilik: {dep.ownerName}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] bg-brand-primary/15 text-brand-primary border border-brand-primary/20 px-1 rounded">Build v{dep.version}</span>
                            {dep.gitUrl ? (
                              <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1 rounded flex items-center gap-0.5">
                                <Globe className="h-3 w-3" /> GITHUB
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded">ZIP ARCHIVE</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge status={dep.status === 'success' ? 'success' : dep.status === 'error' ? 'inactive' : 'pending'} label={dep.status.toUpperCase()} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] text-text-muted">
                        {new Date(dep.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })},{' '}
                        {new Date(dep.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {allDeployments.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-text-muted italic">Tidak ada riwayat deployment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
};
