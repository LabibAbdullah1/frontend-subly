// src/components/dashboard/TerminalConsole.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown, Copy, CheckCheck, Wifi, WifiOff, RotateCcw, Pause, Play } from 'lucide-react';

interface LogEntry {
  id: number;
  text: string;
  timestamp: string;
}

interface TerminalConsoleProps {
  /** SSE stream URL, e.g. /api/subdomains/5/logs/stream */
  streamUrl: string;
  title?: string;
}

type ConnStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  streamUrl,
  title = 'Node.js App — Live Console'
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<ConnStatus>('disconnected');
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pauseBufferRef = useRef<LogEntry[]>([]);
  const logCounterRef = useRef(0);

  // Klasifikasi baris log → warna
  const getLineClass = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('[error]') || t.includes('error:') || t.includes('uncaughtexception') || t.includes('unhandledrejection')) {
      return 'text-red-400';
    }
    if (t.includes('[warn]') || t.includes('warning:') || t.includes('deprecated')) {
      return 'text-yellow-400';
    }
    if (t.includes('[info]') || t.includes('listening') || t.includes('connected') || t.includes('started')) {
      return 'text-emerald-400';
    }
    if (t.includes('[debug]') || t.includes('verbose')) {
      return 'text-slate-500';
    }
    if (t.includes('[mock]') || t.includes('simulasi') || t.includes('mode development')) {
      return 'text-orange-400/80 italic';
    }
    if (t.match(/\b(get|post|put|delete|patch)\b/) && (t.includes('200') || t.includes('201') || t.includes('204'))) {
      return 'text-cyan-400';
    }
    if (t.match(/\b(get|post|put|delete|patch)\b/) && (t.includes('4') || t.includes('5'))) {
      return 'text-red-400';
    }
    return 'text-slate-300';
  };

  const addLines = useCallback((entries: LogEntry[]) => {
    if (paused) {
      pauseBufferRef.current.push(...entries);
    } else {
      setLogs(prev => {
        const combined = [...prev, ...entries];
        // Batasi tampilan ke 500 baris terakhir agar tidak berat
        return combined.slice(-500);
      });
    }
  }, [paused]);

  // Koneksi SSE
  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }
    setStatus('connecting');
    setLogs([]);
    logCounterRef.current = 0;

    const token = localStorage.getItem('subly_token');
    // EventSource tidak support custom headers, jadi kirim token via query param
    const url = `${streamUrl}?token=${token}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setStatus('connected');

    es.addEventListener('connected', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const entry: LogEntry = {
        id: logCounterRef.current++,
        text: `── ${data.message} ──`,
        timestamp: data.timestamp
      };
      setLogs([entry]);
    });

    es.addEventListener('batch', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const entries: LogEntry[] = data.lines.map((l: any) => ({
        id: logCounterRef.current++,
        text: l.text,
        timestamp: l.timestamp
      }));
      addLines(entries);
    });

    es.addEventListener('line', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      addLines([{ id: logCounterRef.current++, text: data.text, timestamp: data.timestamp }]);
    });

    es.addEventListener('error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        addLines([{
          id: logCounterRef.current++,
          text: `[ERROR] ${data.message}`,
          timestamp: new Date().toISOString()
        }]);
      } catch { /* ignore parse errors */ }
    });

    es.onerror = () => {
      setStatus('disconnected');
      es.close();
    };
  }, [streamUrl, addLines]);

  // Connect saat komponen mount atau URL berubah
  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [streamUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && !paused) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, paused]);

  // Scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    setAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  };

  // Resume pause — flush buffer
  const handleResume = () => {
    setPaused(false);
    if (pauseBufferRef.current.length > 0) {
      setLogs(prev => [...prev, ...pauseBufferRef.current].slice(-500));
      pauseBufferRef.current = [];
    }
  };

  // Copy semua log
  const handleCopy = () => {
    const text = logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="w-full flex flex-col font-mono text-xs rounded-2xl overflow-hidden border border-white/8 shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #07090f 0%, #050709 100%)',
        minHeight: '220px',
        height: logs.length === 0 ? '220px' : '400px',
        minWidth: 0,
      }}
    >
      {/* ─── HEADER ─── */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/5"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {status === 'connected' && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded border border-emerald-500/20">
              <Wifi className="h-2.5 w-2.5" />
              Live
            </span>
          )}
          {status === 'connecting' && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-amber-400 bg-amber-500/8 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
              Connecting...
            </span>
          )}
          {(status === 'disconnected' || status === 'error') && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-red-400 bg-red-500/8 px-2 py-0.5 rounded border border-red-500/20">
              <WifiOff className="h-2.5 w-2.5" />
              Disconnected
            </span>
          )}

          {/* Pause/Resume */}
          <button
            onClick={() => paused ? handleResume() : setPaused(true)}
            title={paused ? 'Resume stream' : 'Pause stream'}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              paused
                ? 'text-orange-400 bg-orange-500/15 border border-orange-500/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          {/* Reconnect */}
          <button
            onClick={connect}
            title="Reconnect"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Copy */}
          {logs.length > 0 && (
            <button
              onClick={handleCopy}
              title="Copy semua log"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
            >
              {copied
                ? <CheckCheck className="h-3.5 w-3.5 text-green-400" />
                : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ─── PROMPT BAR ─── */}
      <div
        className="px-5 py-1.5 flex items-center gap-2 border-b border-white/4 shrink-0"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        <span className="text-green-400 font-bold text-[11px]">$</span>
        <span className="text-slate-500 text-[10px]">
          tail -f ~/nodelogs/app.log
        </span>
        {status === 'connected' && !paused && (
          <span className="w-1.5 h-3 bg-slate-400/50 animate-pulse ml-0.5 rounded-sm" />
        )}
        {paused && (
          <span className="text-[9px] text-orange-400 font-bold ml-2 bg-orange-500/10 px-2 py-0.5 rounded">
            ⏸ PAUSED — {pauseBufferRef.current.length} baris tertunda
          </span>
        )}
      </div>

      {/* ─── LOG AREA (SCROLLABLE) ─── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 text-left"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(100,116,139,0.25) transparent',
          overflowX: 'hidden',
        }}
      >
        {logs.length === 0 && status === 'connecting' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600 py-6">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-[11px] font-semibold text-slate-600">Menghubungkan ke log stream...</p>
          </div>
        )}

        {logs.length === 0 && status !== 'connecting' && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-700 py-6">
            <WifiOff className="h-8 w-8 opacity-30" />
            <p className="text-[11px] font-semibold">Tidak ada log.</p>
            <button
              onClick={connect}
              className="text-[10px] text-orange-400 hover:text-orange-300 underline cursor-pointer mt-1"
            >
              Coba sambungkan kembali →
            </button>
          </div>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex items-start gap-2.5 leading-relaxed group min-w-0 ${getLineClass(log.text)}`}
          >
            {/* Line number */}
            <span className="text-slate-800 select-none text-[9px] pt-0.5 w-7 text-right shrink-0 font-mono">
              {log.id + 1}
            </span>
            {/* Message */}
            <span className="whitespace-pre-wrap break-words min-w-0 text-[11px] flex-1">
              {log.text}
            </span>
          </div>
        ))}

        <div ref={terminalEndRef} />
      </div>

      {/* ─── FOOTER ─── */}
      <div
        className="px-4 py-2 border-t border-white/5 flex items-center justify-between shrink-0"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-slate-700 font-mono">
            {logs.length} baris
          </span>
          {status === 'connected' && !paused && (
            <span className="text-[9px] text-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live stream aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!autoScroll && logs.length > 0 && (
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg hover:bg-orange-500/15 transition-all cursor-pointer"
            >
              <ArrowDown className="h-3 w-3" />
              Scroll ke bawah
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default TerminalConsole;
