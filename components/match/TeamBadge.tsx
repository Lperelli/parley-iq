'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  logo: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  align?: 'left' | 'right' | 'center';
  className?: string;
}

const sizes: Record<string, number> = { sm: 28, md: 40, lg: 52, xl: 68 };
const textSizes: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg font-bold',
};

export default function TeamBadge({
  name,
  logo,
  size = 'md',
  orientation = 'vertical',
  align = 'center',
  className,
}: Props) {
  const px = sizes[size];

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <div className="relative shrink-0" style={{ width: px, height: px }}>
          <Image
            src={logo}
            alt={name}
            fill
            className="object-contain drop-shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <span className={cn('font-semibold text-white', textSizes[size])}>{name}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5',
        align === 'left' && 'items-start',
        align === 'right' && 'items-end',
        className
      )}
    >
      <div className="relative" style={{ width: px, height: px }}>
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain drop-shadow-sm"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <span className={cn('font-semibold text-white text-center leading-tight', textSizes[size])}>
        {name}
      </span>
    </div>
  );
}
