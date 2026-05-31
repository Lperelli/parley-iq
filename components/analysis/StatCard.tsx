'use client';

import { cn } from '@/lib/utils';

interface Props {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
  highlight?: 'home' | 'away' | 'none';
  suffix?: string;
  className?: string;
}

export default function StatCard({ label, homeValue, awayValue, highlight = 'none', suffix = '', className }: Props) {
  const home = Number(homeValue);
  const away = Number(awayValue);
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  const awayPct = 100 - homePct;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className={cn('font-semibold tabular-nums', highlight === 'home' ? 'text-cyan-400' : 'text-white')}>
          {homeValue}{suffix}
        </span>
        <span className="text-slate-500 text-xs">{label}</span>
        <span className={cn('font-semibold tabular-nums', highlight === 'away' ? 'text-cyan-400' : 'text-white')}>
          {awayValue}{suffix}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full rounded-l-full transition-all duration-700"
          style={{ width: `${homePct}%`, backgroundColor: highlight === 'home' ? '#22d3ee' : '#3f4f63' }}
        />
        <div
          className="h-full rounded-r-full transition-all duration-700"
          style={{ width: `${awayPct}%`, backgroundColor: highlight === 'away' ? '#22d3ee' : '#2a3a4d' }}
        />
      </div>
    </div>
  );
}
