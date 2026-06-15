// src/components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  key?: string;
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'success',
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);

  // Animate exit timer bar
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose(id);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/20',
    error: 'border-red-500/20 bg-red-50/90 dark:bg-red-950/20',
    info: 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/20',
    warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/20',
  };

  const barColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className={`relative flex gap-2.5 p-3 rounded-xl border glass-panel ${borders[type]} shadow-lg w-72 max-w-[calc(100vw-2rem)] pointer-events-auto animate-in slide-in-from-right-10 duration-200 select-none overflow-hidden`}>
      {icons[type]}
      <div className="flex-1 text-left min-w-0">
        <h4 className="text-xs font-bold text-text-main leading-snug truncate">{title}</h4>
        <p className="mt-0.5 text-[11px] text-text-muted leading-normal break-words">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)}
        className="text-text-muted hover:text-text-main self-start p-0.5 rounded hover:bg-border-main/20 cursor-pointer shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Auto-dismiss progress bar */}
      <div 
        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-75 ease-linear ${barColor[type]}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
export default Toast;
