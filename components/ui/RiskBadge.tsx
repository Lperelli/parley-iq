'use client';

import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types/analysis';

const config: Record<RiskLevel, { label: string; classes: string }> = {
  low: { label: 'Riesgo Bajo', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  medium: { label: 'Riesgo Medio', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  high: { label: 'Riesgo Alto', classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  extreme: { label: 'Riesgo Extremo', classes: 'bg-red-600/20 text-red-400 border-red-600/40' },
};

interface Props {
  risk: RiskLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export default function RiskBadge({ risk, size = 'sm', className }: Props) {
  const { label, classes } = config[risk];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        classes,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
