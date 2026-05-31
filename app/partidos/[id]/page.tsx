'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, GitCompare, DollarSign,
  Plus, Check, Shield, Layers,
} from 'lucide-react';
import { Fixture } from '@/types/football';
import { MatchAnalysis, MarketAnalysis } from '@/types/analysis';
import { ParleyPick } from '@/types/parley';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';
import StatCard from '@/components/analysis/StatCard';
import LeagueBadge from '@/components/match/LeagueBadge';
import RiskBadge from '@/components/ui/RiskBadge';
import { useParleyStore } from '@/store/parleyStore';
import { formatDateTime, getStatusLabel, isLive, isFinished, cn, generateId } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

// ─── StatBar ────────────────────────────────────────────────────────────────
function StatBar({
  label,
  homeVal,
  awayVal,
  suffix = '',
}: {
  label: string;
  homeVal: number;
  awayVal: number;
  suffix?: string;
}) {
  const total = homeVal + awayVal;
  const homePct = total > 0 ? (homeVal / total) * 100 : 50;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white font-semibold tabular-nums">
          {homeVal}
          {suffix}
        </span>
        <span className="text-slate-500 text-[10px] text-center px-2">{label}</span>
        <span className="text-white font-semibold tabular-nums">
          {awayVal}
          {suffix}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div
          className="rounded-l-full bg-cyan-500/60 transition-all duration-700"
          style={{ width: `${homePct}%` }}
        />
        <div className="flex-1 rounded-r-full bg-slate-600/40" />
      </div>
    </div>
  );
}

// ─── PickCard ───────────────────────────────────────────────────────────────
function PickCard({
  market,
  fixtureId,
  matchName,
  league,
}: {
  market: MarketAnalysis & { selection?: string; odds?: number };
  fixtureId: string;
  matchName: string;
  league: string;
}) {
  const { picks, addPick } = useParleyStore();
  const { toast } = useToast();
  const added = picks.some(
    (p) => p.fixtureId === fixtureId && p.market === market.market
  );

  const accentColor =
    market.confidence === 'high'
      ? 'bg-emerald-500'
      : market.confidence === 'medium'
      ? 'bg-amber-500'
      : 'bg-slate-500';

  const probColor =
    market.confidence === 'high'
      ? 'bg-emerald-500'
      : market.confidence === 'medium'
      ? 'bg-amber-500'
      : 'bg-slate-500';

  function handleAdd() {
    const pick: Omit<ParleyPick, 'id' | 'addedAt'> = {
      fixtureId,
      matchName,
      league,
      market: market.market,
      selection: market.selection ?? market.market,
      odds:
        market.odds ??
        parseFloat((1 / (market.estimatedProbability / 100)).toFixed(2)),
      estimatedProbability: market.estimatedProbability,
      confidence: market.confidence,
      risk: market.risk,
      aiReasoning: market.reasoning,
    };
    addPick(pick);
    toast('Selección agregada al parley', 'success');
  }

  return (
    <div className="group/tooltip relative">
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-56 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200">
        <div className="glass-card rounded-xl p-3 border border-white/[0.08] shadow-xl">
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {market.reasoning}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <RiskBadge risk={market.risk} />
            <span className="text-[10px] text-slate-500">
              Confianza:{' '}
              <span className="text-white font-semibold capitalize">
                {market.confidence}
              </span>
            </span>
          </div>
        </div>
        <div className="w-2 h-2 bg-white/[0.08] rotate-45 mx-auto -mt-1" />
      </div>

      {/* Card */}
      <div className="glass-card rounded-xl overflow-hidden border border-white/[0.05] flex">
        {/* Left accent bar */}
        <div className={`w-1 shrink-0 ${accentColor}`} />
        <div className="flex-1 p-3 space-y-2">
          <p className="text-white text-sm font-bold leading-tight line-clamp-2">
            {market.market}
          </p>
          {/* Probability bar */}
          <div className="space-y-0.5">
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${probColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${market.estimatedProbability}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' as const }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-500 truncate pr-2 leading-relaxed line-clamp-2">
                {market.reasoning}
              </p>
              <span className="text-xs font-bold text-white tabular-nums shrink-0">
                {market.estimatedProbability.toFixed(0)}%
              </span>
            </div>
          </div>
          {/* + Parley button */}
          <button
            onClick={handleAdd}
            disabled={added}
            className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              added
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3" /> Agregado
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" /> Parley
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PickSkeleton ─────────────────────────────────────────────────────────
function PickSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden border border-white/[0.05] flex animate-pulse">
      <div className="w-1 shrink-0 bg-white/[0.06]" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-3 bg-white/[0.06] rounded w-3/4" />
        <div className="h-1.5 bg-white/[0.04] rounded-full" />
        <div className="h-2 bg-white/[0.04] rounded w-full" />
        <div className="h-7 bg-white/[0.04] rounded-lg" />
      </div>
    </div>
  );
}

// ─── MarketRow (for odds section) ────────────────────────────────────────
function MarketRow({
  market,
  fixtureId,
  matchName,
  league,
}: {
  market: MarketAnalysis & { selection?: string; odds?: number };
  fixtureId: string;
  matchName: string;
  league: string;
}) {
  const { picks, addPick } = useParleyStore();
  const { toast } = useToast();
  const added = picks.some(
    (p) => p.fixtureId === fixtureId && p.market === market.market
  );

  function handleAdd() {
    const pick: Omit<ParleyPick, 'id' | 'addedAt'> = {
      fixtureId,
      matchName,
      league,
      market: market.market,
      selection: market.selection ?? market.market,
      odds:
        market.odds ??
        parseFloat((1 / (market.estimatedProbability / 100)).toFixed(2)),
      estimatedProbability: market.estimatedProbability,
      confidence: market.confidence,
      risk: market.risk,
      aiReasoning: market.reasoning,
    };
    addPick(pick);
    toast('Selección agregada al parley', 'success');
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">
          {market.selection ?? market.market}
        </p>
        <p className="text-white text-sm font-medium mt-0.5 truncate">
          {market.market}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p className="text-white font-bold text-lg tabular-nums">
            {market.odds?.toFixed(2) ?? '—'}
          </p>
          <p className="text-[10px] text-slate-500">
            {market.estimatedProbability.toFixed(0)}% impl.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            added
              ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
              : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 active:scale-95'
          }`}
        >
          {added ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<MatchAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Comparativa toggle
  const [compareMode, setCompareMode] = useState<'temporada' | 'h2h'>('temporada');

  useEffect(() => {
    fetch(`/api/fixture/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFixture(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar el partido');
        setLoading(false);
      });
  }, [id]);

  // Auto-trigger AI after fixture is loaded
  useEffect(() => {
    if (!fixture) return;
    setAiLoading(true);
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: fixture.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setAiAnalysis(data);
      })
      .catch((e) => console.log('AI analysis error:', e))
      .finally(() => setAiLoading(false));
  }, [fixture]);

  if (loading)
    return (
      <div className="max-w-2xl md:max-w-3xl mx-auto px-4 py-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );

  if (error || !fixture)
    return (
      <div className="max-w-2xl md:max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-rose-400 mb-4">{error ?? 'Partido no encontrado'}</p>
        <Link
          href="/partidos"
          className="inline-flex items-center gap-2 text-cyan-400 text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>
    );

  const live = isLive(fixture.status);
  const finished = isFinished(fixture.status);
  const matchName = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
  const hs = fixture.homeStats;
  const as_ = fixture.awayStats;

  // H2H stats
  const h2h = fixture.headToHead ?? [];
  const h2hHomeWins = h2h.filter((m) => m.winner === 'home').length;
  const h2hDraws = h2h.filter((m) => m.winner === 'draw').length;
  const h2hAwayWins = h2h.filter((m) => m.winner === 'away').length;
  const h2hTotalGoals = h2h.reduce(
    (acc, m) => acc + (m.homeGoals ?? 0) + (m.awayGoals ?? 0),
    0
  );
  const h2hAvgGoals =
    h2h.length > 0 ? (h2hTotalGoals / h2h.length).toFixed(2) : '—';

  const aiPicks = aiAnalysis?.marketsToConsider?.slice(0, 3) ?? [];

  return (
    <div className="max-w-2xl md:max-w-3xl mx-auto px-4 py-5 space-y-5">
      {/* Back */}
      <Link
        href="/partidos"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Partidos
      </Link>

      {/* ═══════════════════════════════════════════════════════════
          1. HERO BANNER
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
        {/* Background gradient + glow blobs */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-cyan-500/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-500/[0.06] blur-3xl pointer-events-none" />

        <div className="relative px-4 pt-4 pb-5">
          {/* Top row: league + date/venue */}
          <div className="flex items-start justify-between mb-5">
            <LeagueBadge league={fixture.league} />
            <div className="text-right space-y-0.5">
              {live && (
                <span className="flex items-center gap-1.5 justify-end px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-bold text-emerald-400 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EN VIVO {fixture.elapsed && `${fixture.elapsed}'`}
                </span>
              )}
              <div className="flex items-center gap-1 justify-end text-[11px] text-slate-500">
                <Calendar className="w-3 h-3" />
                {formatDateTime(fixture.date)}
              </div>
              {fixture.venue && (
                <div className="flex items-center gap-1 justify-end text-[11px] text-slate-600">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[140px]">{fixture.venue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Teams + score */}
          <div className="flex items-center gap-3">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div className="relative">
                {/* Animated ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-cyan-500/10 blur-sm"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const }}
                />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                  <Image
                    src={fixture.homeTeam.logo}
                    alt={fixture.homeTeam.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-2">
                  {fixture.homeTeam.name}
                </p>
                {fixture.homeStanding && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-semibold">
                    #{fixture.homeStanding} en liga
                  </span>
                )}
              </div>
            </div>

            {/* Score / VS */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              {(live || finished) && fixture.homeGoals !== undefined ? (
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl',
                    live
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-white/[0.05] border border-white/[0.08]'
                  )}
                >
                  <span className="font-display text-4xl font-bold text-white tabular-nums">
                    {fixture.homeGoals} – {fixture.awayGoals}
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <span className="font-display text-4xl font-bold text-slate-700">
                    VS
                  </span>
                </div>
              )}
              <p className="text-[10px] text-slate-600">
                {getStatusLabel(fixture.status, fixture.elapsed)}
              </p>
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div className="relative">
                {/* Animated ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-violet-500/10 blur-sm"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const, delay: 1.5 }}
                />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                  <Image
                    src={fixture.awayTeam.logo}
                    alt={fixture.awayTeam.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-2">
                  {fixture.awayTeam.name}
                </p>
                {fixture.awayStanding && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[10px] text-slate-400 font-semibold">
                    #{fixture.awayStanding} en liga
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. 3 PICKS IA (auto-loaded)
      ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">
            IA
          </span>
          3 Picks IA
        </h2>

        {aiLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PickSkeleton />
            <PickSkeleton />
            <PickSkeleton />
          </div>
        ) : aiPicks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {aiPicks.map((pick, i) => (
              <PickCard
                key={i}
                market={pick}
                fixtureId={fixture.id}
                matchName={matchName}
                league={fixture.league.name}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-slate-500 text-sm">
              Sin análisis IA disponible para este partido.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. ÚLTIMOS 5 PARTIDOS
      ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <h2 className="text-white font-bold text-base">Últimos 5 Partidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Home */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <Image
                  src={fixture.homeTeam.logo}
                  alt={fixture.homeTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-cyan-400 font-semibold text-sm">
                {fixture.homeTeam.name}
              </span>
            </div>
            {fixture.homeForm?.length ? (
              <div className="space-y-1">
                {fixture.homeForm.slice(0, 5).map((match, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5 border-b border-white/[0.03] last:border-0"
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0',
                        match.result === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : match.result === 'D'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      )}
                    >
                      {match.result}
                    </span>
                    <span className="text-slate-400 text-xs flex-1 truncate">
                      {match.isHome ? 'vs' : 'en'} {match.opponent}
                    </span>
                    <span className="text-white text-xs font-semibold tabular-nums shrink-0">
                      {match.goalsScored}–{match.goalsConceded}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-xs py-2">Sin datos de forma</p>
            )}
          </div>

          {/* Away */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <Image
                  src={fixture.awayTeam.logo}
                  alt={fixture.awayTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-slate-300 font-semibold text-sm">
                {fixture.awayTeam.name}
              </span>
            </div>
            {fixture.awayForm?.length ? (
              <div className="space-y-1">
                {fixture.awayForm.slice(0, 5).map((match, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5 border-b border-white/[0.03] last:border-0"
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0',
                        match.result === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : match.result === 'D'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      )}
                    >
                      {match.result}
                    </span>
                    <span className="text-slate-400 text-xs flex-1 truncate">
                      {match.isHome ? 'vs' : 'en'} {match.opponent}
                    </span>
                    <span className="text-white text-xs font-semibold tabular-nums shrink-0">
                      {match.goalsScored}–{match.goalsConceded}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-xs py-2">Sin datos de forma</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. COMPARATIVA CON TOGGLE
      ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Comparativa</h2>
          {/* Pill Toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => setCompareMode('temporada')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                compareMode === 'temporada'
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Temporada
            </button>
            <button
              onClick={() => setCompareMode('h2h')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                compareMode === 'h2h'
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              H2H
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={compareMode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' as const }}
          >
            {compareMode === 'temporada' ? (
              // Season stats
              hs && as_ ? (
                <div className="glass-card rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-cyan-400 font-semibold">
                      {fixture.homeTeam.name}
                    </span>
                    <span className="text-slate-500">Stats</span>
                    <span className="text-white font-semibold">
                      {fixture.awayTeam.name}
                    </span>
                  </div>
                  <StatBar
                    label="Prom. goles marcados"
                    homeVal={hs.home.avgGoalsScored}
                    awayVal={as_.away.avgGoalsScored}
                  />
                  <StatBar
                    label="Prom. goles recibidos"
                    homeVal={hs.home.avgGoalsConceded}
                    awayVal={as_.away.avgGoalsConceded}
                  />
                  <StatBar
                    label="% Valla invicta"
                    homeVal={hs.home.cleanSheetPercentage}
                    awayVal={as_.away.cleanSheetPercentage}
                    suffix="%"
                  />
                  <StatBar
                    label="% Ambos anotan"
                    homeVal={hs.home.bttsPercentage}
                    awayVal={as_.away.bttsPercentage}
                    suffix="%"
                  />
                  <StatBar
                    label="% +2.5 goles"
                    homeVal={hs.home.over25Percentage}
                    awayVal={as_.away.over25Percentage}
                    suffix="%"
                  />
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-4 text-center">
                  <p className="text-slate-500 text-sm">Sin estadísticas de temporada</p>
                </div>
              )
            ) : (
              // H2H
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <GitCompare className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-semibold text-sm">
                    Historial de enfrentamientos
                  </span>
                </div>
                {h2h.length === 0 ? (
                  <p className="text-slate-500 text-sm py-3 text-center">
                    Sin datos de enfrentamientos directos
                  </p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {h2h.slice(0, 8).map((match, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                          <span className="text-[10px] text-slate-600 shrink-0 w-14">
                            {match.date.slice(0, 7)}
                          </span>
                          <div className="flex-1 flex items-center justify-between gap-1.5 min-w-0">
                            <span
                              className={cn(
                                'text-xs font-medium flex-1 truncate',
                                match.winner === 'home'
                                  ? 'text-emerald-400'
                                  : 'text-slate-400'
                              )}
                            >
                              {match.homeTeam}
                            </span>
                            <span className="text-white text-sm font-bold tabular-nums shrink-0 px-2">
                              {match.homeGoals}–{match.awayGoals}
                            </span>
                            <span
                              className={cn(
                                'text-xs font-medium flex-1 truncate text-right',
                                match.winner === 'away'
                                  ? 'text-emerald-400'
                                  : 'text-slate-400'
                              )}
                            >
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* H2H summary */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.04]">
                      {[
                        { label: 'V. local', value: String(h2hHomeWins) },
                        { label: 'Empates', value: String(h2hDraws) },
                        { label: 'V. visit.', value: String(h2hAwayWins) },
                        { label: 'Prom. goles', value: h2hAvgGoals },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-white font-bold text-base tabular-nums">
                            {stat.value}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          5. CUOTAS
      ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" /> Cuotas
        </h2>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
          <DollarSign className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-300/70 leading-relaxed">
            Cuotas referenciales únicamente. No promovemos ninguna casa de
            apuestas.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          {!fixture.odds?.length ? (
            <p className="text-slate-500 text-sm">Sin cuotas disponibles</p>
          ) : (
            fixture.odds.map((odd, i) => (
              <MarketRow
                key={i}
                market={{
                  market: odd.market,
                  estimatedProbability: odd.impliedProbability,
                  confidence:
                    odd.impliedProbability >= 60
                      ? 'high'
                      : odd.impliedProbability >= 40
                      ? 'medium'
                      : 'low',
                  risk:
                    odd.impliedProbability < 30
                      ? 'high'
                      : odd.impliedProbability < 50
                      ? 'medium'
                      : 'low',
                  reasoning: `Prob. implícita: ${odd.impliedProbability}% · Cuota: ${odd.decimal.toFixed(2)}`,
                  selection: odd.selection,
                  odds: odd.decimal,
                }}
                fixtureId={fixture.id}
                matchName={matchName}
                league={fixture.league.name}
              />
            ))
          )}
        </div>
        <Link
          href="/parley"
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-semibold hover:bg-violet-500/15 transition-all"
        >
          <Layers className="w-4 h-4" /> Ver Constructor de Parley
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          6. FOOTER DISCLAIMER
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300/70 leading-relaxed">
          Juega responsablemente. Este análisis es solo orientativo y no
          constituye un consejo de apuesta. La probabilidad estadística no
          garantiza ningún resultado. Si el juego te genera problemas, busca
          ayuda.
        </p>
      </div>
    </div>
  );
}
