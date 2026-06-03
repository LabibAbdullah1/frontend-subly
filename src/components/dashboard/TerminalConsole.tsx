// src/components/dashboard/TerminalConsole.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { LogLine } from '../../types';

interface TerminalConsoleProps {
  logs: LogLine[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  onRetryConnection?: () => void;
  title?: string;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  connectionStatus,
  onRetryConnection,
  title = "Infrastruktur Deployment Console"
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Auto-scroll ke bagian bawah log saat logs bertambah
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Handler scroll manual untuk mendeteksi jika user scroll ke atas
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Toleransi 20px dari bawah
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 20;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="w-full bg-[#090d16] border border-border-main rounded-3xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs text-slate-300 select-none">
      {/* Console Header */}
      <div className="px-5 py-3.5 border-b border-border-main bg-slate-950/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase ml-2">{title}</span>
        </div>
        
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected
            </span>
          )}
          {connectionStatus === 'connecting' && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
              Connecting
            </span>
          )}
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/20">
                Disconnected
              </span>
              {onRetryConnection && (
                <button 
                  onClick={onRetryConnection}
                  className="text-[9px] font-bold uppercase tracking-wider text-white hover:underline bg-slate-800 border border-slate-700 px-2 py-0.5 rounded cursor-pointer active:scale-95"
                >
                  Reconnect
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logs Output Box */}
      <div 
        onScroll={handleScroll}
        className="flex-1 p-5 h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent text-left"
      >
        <div className="flex items-start gap-1.5 text-slate-500 mb-2">
          <span>$</span>
          <span className="text-slate-400">subly-provisioner --verbose --target=host_env</span>
        </div>

        {logs.map((log, index) => {
          let lineClass = "text-slate-300"; // Standard stdout
          if (log.type === 'stderr') lineClass = "text-red-400 font-semibold";
          if (log.type === 'system') lineClass = "text-cyan-400 font-bold";

          return (
            <div key={index} className={`flex items-start gap-2.5 leading-relaxed ${lineClass}`}>
              <span className="text-slate-600 select-none text-[10px] pt-0.5">[{log.timestamp}]</span>
              <span className="whitespace-pre-wrap break-all">{log.message}</span>
            </div>
          );
        })}
        
        {/* Helper anchor for auto-scroll */}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
export default TerminalConsole;
