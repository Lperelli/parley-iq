'use client';

import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'inline' | 'footer';
  className?: string;
}

export default function DisclaimerBanner({ variant = 'inline', className }: Props) {
  if (variant === 'footer') {
    return (
      <div className={cn('text-center py-4 px-4 space-y-1', className)}>
        <p className="text-slate-600 text-[11px]">
          Parley IQ es una herramienta de análisis estadístico deportivo. No es asesoría financiera ni de apuestas.
        </p>
        <p className="text-slate-700 text-[11px]">
          Ninguna predicción es garantizada. Solo usa esta información de forma responsable.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15', className)}>
      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-[11px] text-amber-300/70 leading-relaxed">
        <span className="font-semibold text-amber-300/90">Solo análisis estadístico.</span>{' '}
        No es un consejo de apuesta. La probabilidad no es certeza.
      </p>
    </div>
  );
}
