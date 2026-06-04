// src/components/dashboard/TerminalConsole.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { LogLine } from '../../types';
import { ArrowDown, Copy, CheckCheck } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  // Auto-scroll ke bawah saat log bertambah
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Deteksi scroll manual — nonaktifkan auto-scroll jika user scroll ke atas
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 30;
    setAutoScroll(isAtBottom);
  };

  // Scroll ke bawah secara manual
  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  };

  // Copy semua log ke clipboard
  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="w-full flex flex-col font-mono text-xs text-slate-300 select-none rounded-2xl overflow-hidden shadow-2xl border border-white/8"
      style={{
        background: 'linear-gradient(180deg, #07090f 0%, #050709 100%)',
        minHeight: '480px',
        maxHeight: '70vh',
      }}
    >
      {/* Console Header — macOS style */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase ml-1">
            {title}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Connection status badge */}
          {connectionStatus === 'connected' && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          )}
          {connectionStatus === 'connecting' && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/8 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
              Connecting...
            </span>
          )}
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/8 px-2 py-0.5 rounded border border-red-500/20">
                Disconnected
              </span>
              {onRetryConnection && (
                <button
                  onClick={onRetryConnection}
                  className="text-[9px] font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded cursor-pointer active:scale-95 transition-all"
                >
                  Reconnect
                </button>
              )}
            </div>
          )}

          {/* Copy logs button */}
          {logs.length > 0 && (
            <button
              onClick={handleCopy}
              title="Copy semua log"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
            >
              {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Prompt bar */}
      <div className="px-5 py-2 flex items-center gap-2 border-b border-white/4 shrink-0"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        <span className="text-green-400 font-bold">$</span>
        <span className="text-slate-400 text-[10px]">subly-provisioner --verbose --target=host_env</span>
        <span className="w-2 h-3.5 bg-slate-400/60 animate-pulse ml-0.5 rounded-sm" />
      </div>

      {/* ─── SCROLLABLE LOG AREA ─── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 space-y-1.5 text-left relative"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(100,116,139,0.3) transparent',
        }}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600 py-12">
            <div className="text-3xl opacity-30">_</div>
            <p className="text-[11px] font-semibold tracking-wide">Belum ada log yang tersedia.</p>
            <p className="text-[10px] text-slate-700">Log akan muncul otomatis saat deployment berjalan.</p>
          </div>
        ) : (
          logs.map((log, index) => {
            let lineColor = 'text-slate-300';
            let prefixColor = 'text-slate-600';
            if (log.type === 'stderr') {
              lineColor = 'text-red-400';
              prefixColor = 'text-red-900';
            }
            if (log.type === 'system') {
              lineColor = 'text-cyan-400 font-bold';
              prefixColor = 'text-cyan-900';
            }
            return (
              <div key={index} className={`flex items-start gap-3 leading-relaxed group ${lineColor}`}>
                {/* Line number */}
                <span className="text-slate-700 select-none text-[9px] pt-0.5 w-6 text-right shrink-0 font-mono">
                  {index + 1}
                </span>
                {/* Timestamp */}
                <span className={`${prefixColor} select-none text-[9px] pt-0.5 shrink-0 font-mono whitespace-nowrap`}>
                  [{log.timestamp}]
                </span>
                {/* Message — word-wrap, no horizontal scroll */}
                <span className="whitespace-pre-wrap break-words min-w-0 text-[11px]">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        {/* Auto-scroll anchor */}
        <div ref={terminalEndRef} />
      </div>

      {/* ─── FOOTER BAR ─── */}
      <div
        className="px-4 py-2 border-t border-white/5 flex items-center justify-between shrink-0"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-[9px] text-slate-600 font-mono">
          {logs.length} line{logs.length !== 1 ? 's' : ''} · UTF-8
        </span>
        <div className="flex items-center gap-2">
          {!autoScroll && (
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg hover:bg-orange-500/15 transition-all cursor-pointer animate-bounce"
            >
              <ArrowDown className="h-3 w-3" />
              Scroll ke bawah
            </button>
          )}
          {autoScroll && logs.length > 0 && (
            <span className="text-[9px] text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Auto-scroll aktif
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default TerminalConsole;
