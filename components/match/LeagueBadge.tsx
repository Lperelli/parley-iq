'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { League } from '@/types/football';

interface Props {
  league: League;
  showCountry?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function LeagueBadge({ league, showCountry = true, size = 'sm', className }: Props) {
  const px = size === 'sm' ? 14 : 18;
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative shrink-0" style={{ width: px, height: px }}>
        <Image
          src={league.logo}
          alt={league.name}
          fill
          className="object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <span className={cn('font-medium text-slate-400', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {showCountry ? `${league.country} · ` : ''}
        <span className="text-slate-300">{league.name}</span>
      </span>
    </div>
  );
}
