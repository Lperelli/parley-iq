'use client';

import { Fixture } from '@/types/football';
import MatchCard from './MatchCard';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { Calendar } from 'lucide-react';

interface Props {
  fixtures: Fixture[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function FixtureList({ fixtures, loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => <MatchCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!fixtures.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="Sin partidos disponibles"
        description="No hay partidos para mostrar en este momento. Intenta con otra fecha o filtro."
      />
    );
  }

  return (
    <div className="space-y-3">
      {fixtures.map((fixture, i) => (
        <MatchCard key={fixture.id} fixture={fixture} index={i} />
      ))}
    </div>
  );
}
