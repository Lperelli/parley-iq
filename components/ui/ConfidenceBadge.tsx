'use client';

import { cn } from '@/lib/utils';
import { ConfidenceLevel } from '@/types/analysis';

const config: Record<ConfidenceLevel, { label: string; classes: string }> = {
  low: { label: 'Confianza Baja', classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  medium: { label: 'Confianza Media', classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  high: { label: 'Confianza Alta', classes: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
};

interface Props {
  confidence: ConfidenceLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ConfidenceBadge({ confidence, size = 'sm', className }: Props) {
  const { label, classes } = config[confidence];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
