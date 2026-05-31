'use client';

import { cn } from '@/lib/utils';

interface Props {
  score: number;
  className?: string;
}

export default function DataQualityBadge({ score, className }: Props) {
  const label = score >= 75 ? 'Datos Sólidos' : score >= 50 ? 'Datos Parciales' : 'Datos Limitados';
  const classes =
    score >= 75
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : score >= 50
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase',
        classes,
        className
      )}
    >
      <span className="tabular-nums">{score}%</span>
      {label}
    </span>
  );
}
