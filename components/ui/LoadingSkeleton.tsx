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
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="w-16 h-8 rounded-lg" />
        <div className="flex items-center gap-3 flex-1 justify-end">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
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
