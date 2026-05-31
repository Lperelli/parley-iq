'use client';

import { cn } from '@/lib/utils';

interface Props {
  label: string;
  probability: number;
  color?: string;
  showValue?: boolean;
  className?: string;
}

export default function ProbabilityBar({ label, probability, color = '#22d3ee', showValue = true, className }: Props) {
  const pct = Math.min(100, Math.max(0, probability));
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300">{label}</span>
        {showValue && (
          <span className="text-sm font-semibold tabular-nums" style={{ color }}>
            {pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
