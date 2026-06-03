// src/components/ui/Badge.tsx
import React from 'react';

export interface BadgeProps {
  status: 'active' | 'inactive' | 'success' | 'queued' | 'processing' | 'error' | 'pending' | 'failed';
  label: string;
  animate?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, animate = false }) => {
  // Map statuses to HSL tailored color schemes
  const colorMap = {
    active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    
    inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    
    queued: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    
    processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  const signalMap = {
    active: 'bg-emerald-500',
    success: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    queued: 'bg-amber-500',
    pending: 'bg-amber-500',
    processing: 'bg-blue-500',
    error: 'bg-red-500',
    failed: 'bg-red-500',
  };

  const isPulsing = animate || status === 'processing' || status === 'queued';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border select-none ${colorMap[status]}`}>
      {/* Blinking signal dot */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {isPulsing && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-signal-ping ${signalMap[status]}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${signalMap[status]}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};
export default Badge;
