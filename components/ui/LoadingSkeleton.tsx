'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer rounded-lg',
        className
      )}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* League row */}
      <div className="flex justify-between items-center px-4 pt-3 pb-2">
        <Skeleton className="h-2.5 w-28 rounded" />
        <Skeleton className="h-2.5 w-14 rounded" />
      </div>
      {/* Teams + score */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Skeleton className="w-[34px] h-[34px] rounded-xl" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
        <Skeleton className="w-14 h-9 rounded-xl" />
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="w-[34px] h-[34px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function AnalysisCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
