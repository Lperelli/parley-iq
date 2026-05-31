'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Algo salió mal',
  message,
  onRetry,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-rose-400" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
