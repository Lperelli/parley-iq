'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, DollarSign,
  Plus, Check, Shield, Layers, X, User,
} from 'lucide-react';
import { Fixture, Squad, Player } from '@/types/football';
import { MatchAnalysis, MarketAnalysis } from '@/types/analysis';
import { ParleyPick } from '@/types/parley';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';
import LeagueBadge from '@/components/match/LeagueBadge';
import RiskBadge from '@/components/ui/RiskBadge';
import { useParleyStore } from '@/store/parleyStore';
import { formatDateTime, getStatusLabel, isLive, isFinished, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RESULT_COLORS = {
  W: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
  D: 'bg-amber-500/20 text-amber-400 border border-amber-500/20',
  L: 'bg-rose-500/20 text-rose-400 border border-rose-500/20',
};

const CONFIDENCE_BAR = {
  high: 'bg-emerald-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-500',
};

const CONFIDENCE_ACCENT = {
  high: 'border-l-emerald-400',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-500',
};

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

// ─── PickCard ─────────────────────────────────────────────────────────────────
function PickCard({
  market, index, fixtureId, matchName, league,
}: {
  market: MarketAnalysis & { selection?: string; odds?: number };
  index: number;
  fixtureId: string;
  matchName: string;
  league: string;
}) {
  const { picks, addPick } = useParleyStore();
  const { toast } = useToast();
  const added = picks.some(p => p.fixtureId === fixtureId && p.market === market.market);

  function handleAdd() {
    const pick: Omit<ParleyPick, 'id' | 'addedAt'> = {
      fixtureId, matchName, league,
      market: market.market,
      selection: market.selection ?? market.market,
      odds: market.odds ?? parseFloat((100 / market.estimatedProbability).toFixed(2)),
      estimatedProbability: market.estimatedProbability,
      confidence: market.confidence,
      risk: market.risk,
      aiReasoning: market.reasoning,
    };
    addPick(pick);
    toast('Pick agregado al parley ✓', 'success');
  }

  const bar = CONFIDENCE_BAR[market.confidence];
  const accent = CONFIDENCE_ACCENT[market.confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const, delay: index * 0.08 }}
      className="group/tooltip relative"
    >
      {/* Hover tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-20 w-60 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 scale-95 group-hover/tooltip:scale-100 origin-bottom">
        <div className="bg-[#0d1829] border border-white/[0.10] rounded-xl p-3.5 shadow-2xl">
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{market.reasoning}</p>
          <div className="flex items-center gap-2">
            <RiskBadge risk={market.risk} />
            <span className="text-[10px] text-slate-500">
              Confianza: <span className="text-white font-medium capitalize">{market.confidence}</span>
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d1829] border-r border-b border-white/[0.10] rotate-45" />
        </div>
      </div>

      {/* Card */}
      <div className={`h-full glass-card rounded-2xl border border-l-[3px] border-white/[0.06] ${accent} overflow-hidden flex flex-col`}>
        {/* Top: dot indicator */}
        <div className="flex items-start justify-between p-3 pb-0">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Pick #{index + 1}</span>
          <span className={`w-2 h-2 rounded-full ${bar} mt-0.5`} />
        </div>

        <div className="flex-1 px-3 pb-3 pt-2 flex flex-col gap-2.5">
          {/* Market name */}
          <p className="text-white text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem]">
            {market.market}
          </p>

          {/* Probability bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Probabilidad</span>
              <span className={`text-xs font-extrabold tabular-nums ${
                market.confidence === 'high' ? 'text-emerald-400'
                  : market.confidence === 'medium' ? 'text-amber-400'
                  : 'text-slate-400'
              }`}>{market.estimatedProbability}%</span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${market.estimatedProbability}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' as const, delay: index * 0.08 + 0.2 }}
              />
            </div>
          </div>

          {/* Reasoning truncated */}
          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 flex-1">
            {market.reasoning}
          </p>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={added}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              added
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            {added ? <><Check className="w-3 h-3" /> Agregado</> : <><Plus className="w-3 h-3" /> Al Parley</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PickSkeleton ─────────────────────────────────────────────────────────────
function PickSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.05] p-3 space-y-2.5 animate-pulse">
      <div className="h-2.5 bg-white/[0.05] rounded w-16" />
      <div className="h-4 bg-white/[0.06] rounded w-4/5" />
      <div className="h-3 bg-white/[0.05] rounded w-full" />
      <div className="h-1 bg-white/[0.04] rounded-full" />
      <div className="h-3 bg-white/[0.04] rounded w-3/4" />
      <div className="h-8 bg-white/[0.04] rounded-xl" />
    </div>
  );
}

// ─── PlayerPopup ──────────────────────────────────────────────────────────────
function PlayerPopup({ player, teamName, teamLogo, onClose }: {
  player: Player; teamName: string; teamLogo: string; onClose: () => void;
}) {
  const posColor = {
    Goalkeeper: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Defender: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Midfielder: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Attacker: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  } as Record<string, string>;

  const col = posColor[player.position] ?? 'text-slate-400 bg-white/[0.05] border-white/[0.08]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeOut' as const }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#0a1628] border border-white/[0.10] rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header gradient */}
        <div className="relative h-28 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1628]" />
          {/* Team logo watermark */}
          {teamLogo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
              <div className="relative w-32 h-32">
                <Image src={teamLogo} alt={teamName} fill className="object-contain" />
              </div>
            </div>
          )}
          {/* Player photo */}
          <div className="relative z-10 w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/[0.05]">
            {player.photo ? (
              <Image
                src={player.photo}
                alt={player.name}
                fill
                className="object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-slate-600" />
              </div>
            )}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 -mt-2">
          <div className="text-center mb-4">
            <h3 className="text-white font-bold text-lg leading-tight">{player.name}</h3>
            <p className="text-slate-500 text-sm mt-0.5">{teamName}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {player.number !== undefined && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-white tabular-nums">#{player.number}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Dorsal</p>
              </div>
            )}
            {player.age && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-white tabular-nums">{player.age}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Años</p>
              </div>
            )}
            <div className={`${player.number === undefined && !player.age ? 'col-span-3' : ''} bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center`}>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${col}`}>
                {player.position === 'Goalkeeper' ? 'Portero'
                  : player.position === 'Defender' ? 'Defensa'
                  : player.position === 'Midfielder' ? 'Medio'
                  : player.position === 'Attacker' ? 'Delantero'
                  : player.position}
              </span>
              <p className="text-[10px] text-slate-600 mt-1">Posición</p>
            </div>
          </div>

          {player.nationality && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <span className="text-slate-500 text-xs">Nacionalidad</span>
              <span className="text-white text-xs font-medium ml-auto">{player.nationality}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PlayersGrid ──────────────────────────────────────────────────────────────
function PlayersGrid({ homeTeamId, awayTeamId, homeTeamName, awayTeamName, homeTeamLogo, awayTeamLogo }: {
  homeTeamId: string; awayTeamId: string;
  homeTeamName: string; awayTeamName: string;
  homeTeamLogo: string; awayTeamLogo: string;
}) {
  const [homeSquad, setHomeSquad] = useState<Squad | null>(null);
  const [awaySquad, setAwaySquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<{ player: Player; teamName: string; teamLogo: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/squads/${homeTeamId}`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/squads/${awayTeamId}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([home, away]) => {
      setHomeSquad(home);
      setAwaySquad(away);
      setLoading(false);
    });
  }, [homeTeamId, awayTeamId]);

  const sortByPosition = (players: Player[]) =>
    [...players].sort((a, b) =>
      POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position)
    );

  const positionDot = {
    Goalkeeper: 'bg-amber-400',
    Defender: 'bg-cyan-400',
    Midfielder: 'bg-emerald-400',
    Attacker: 'bg-rose-400',
  } as Record<string, string>;

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="h-4 bg-white/[0.05] rounded w-48 animate-pulse mx-auto" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map(side => (
            <div key={side} className="space-y-3">
              <div className="h-3 bg-white/[0.04] rounded w-24 animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/[0.05] animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!homeSquad && !awaySquad) return null;

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.05]">
        <div className="px-5 pt-5 pb-3 text-center border-b border-white/[0.05]">
          <h2 className="text-white font-bold text-sm tracking-widest uppercase">Jugadores de ambos equipos</h2>
          <p className="text-[11px] text-slate-600 mt-1">Toca un jugador para ver su información</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
          {/* Home */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5 shrink-0">
                <Image src={homeTeamLogo} alt={homeTeamName} fill className="object-contain" />
              </div>
              <span className="text-cyan-400 text-xs font-bold truncate">{homeTeamName}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {homeSquad && sortByPosition(homeSquad.players).map((player, i) => (
                <motion.button
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.025, ease: 'easeOut' as const }}
                  onClick={() => setSelectedPlayer({ player, teamName: homeTeamName, teamLogo: homeTeamLogo })}
                  className="group relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/[0.08] hover:border-cyan-400/50 hover:scale-110 transition-all duration-200 bg-white/[0.04] active:scale-95"
                  title={player.name}
                >
                  {player.photo ? (
                    <Image
                      src={player.photo}
                      alt={player.name}
                      fill
                      className="object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                  {/* Position dot */}
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#050b14] ${positionDot[player.position] ?? 'bg-slate-500'}`} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Away */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-slate-300 text-xs font-bold truncate">{awayTeamName}</span>
              <div className="relative w-5 h-5 shrink-0">
                <Image src={awayTeamLogo} alt={awayTeamName} fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {awaySquad && sortByPosition(awaySquad.players).map((player, i) => (
                <motion.button
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.025, ease: 'easeOut' as const }}
                  onClick={() => setSelectedPlayer({ player, teamName: awayTeamName, teamLogo: awayTeamLogo })}
                  className="group relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/[0.08] hover:border-violet-400/50 hover:scale-110 transition-all duration-200 bg-white/[0.04] active:scale-95"
                  title={player.name}
                >
                  {player.photo ? (
                    <Image
                      src={player.photo}
                      alt={player.name}
                      fill
                      className="object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#050b14] ${positionDot[player.position] ?? 'bg-slate-500'}`} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-white/[0.04] flex items-center flex-wrap gap-x-4 gap-y-1.5 justify-center">
          {[
            { label: 'Portero', dot: 'bg-amber-400' },
            { label: 'Defensa', dot: 'bg-cyan-400' },
            { label: 'Medio', dot: 'bg-emerald-400' },
            { label: 'Delantero', dot: 'bg-rose-400' },
          ].map(({ label, dot }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[10px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Player popup modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerPopup
            player={selectedPlayer.player}
            teamName={selectedPlayer.teamName}
            teamLogo={selectedPlayer.teamLogo}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<MatchAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [compareMode, setCompareMode] = useState<'temporada' | 'h2h'>('temporada');

  useEffect(() => {
    fetch(`/api/fixture/${id}`)
      .then(r => r.json())
      .then(data => { data.error ? setError(data.error) : setFixture(data); setLoading(false); })
      .catch(() => { setError('Error al cargar el partido'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!fixture) return;
    setAiLoading(true);
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: fixture.id }),
    })
      .then(r => r.json())
      .then(data => { if (!data.error) setAiAnalysis(data); })
      .catch(() => null)
      .finally(() => setAiLoading(false));
  }, [fixture]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
      {[1, 2, 3].map(i => <MatchCardSkeleton key={i} />)}
    </div>
  );

  if (error || !fixture) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-rose-400 mb-4">{error ?? 'Partido no encontrado'}</p>
      <Link href="/partidos" className="inline-flex items-center gap-2 text-cyan-400 text-sm hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
    </div>
  );

  const live = isLive(fixture.status);
  const finished = isFinished(fixture.status);
  const matchName = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
  const hs = fixture.homeStats;
  const as_ = fixture.awayStats;
  const h2h = fixture.headToHead ?? [];
  const h2hHomeWins = h2h.filter(m => m.winner === 'home').length;
  const h2hDraws = h2h.filter(m => m.winner === 'draw').length;
  const h2hAwayWins = h2h.filter(m => m.winner === 'away').length;
  const h2hAvgGoals = h2h.length > 0
    ? (h2h.reduce((a, m) => a + m.homeGoals + m.awayGoals, 0) / h2h.length).toFixed(1)
    : '—';
  const aiPicks = aiAnalysis?.marketsToConsider?.slice(0, 3) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-28 md:pb-10">
      {/* Back */}
      <Link href="/partidos" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Partidos
      </Link>

      {/* ══════════════════════════════════════════════════════════
          1. HERO — Marcador + logos + últimos 5 de ambos
      ══════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]">
        {/* Ambient glow */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-cyan-500/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-violet-500/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative px-4 sm:px-6 pt-5">
          {/* League + date */}
          <div className="flex items-start justify-between mb-6">
            <LeagueBadge league={fixture.league} />
            <div className="text-right space-y-1">
              {live && (
                <span className="flex items-center gap-1.5 justify-end px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EN VIVO {fixture.elapsed && `${fixture.elapsed}'`}
                </span>
              )}
              <div className="flex items-center gap-1 justify-end text-[11px] text-slate-500">
                <Calendar className="w-3 h-3" />{formatDateTime(fixture.date)}
              </div>
              {fixture.venue && (
                <div className="flex items-center gap-1 justify-end text-[11px] text-slate-600">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[130px]">{fixture.venue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Teams + Marcador */}
          <div className="flex items-center gap-2 sm:gap-4 mb-6">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2.5 min-w-0">
              <div className="relative">
                <motion.div
                  className="absolute -inset-3 rounded-full bg-cyan-500/10 blur-xl"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const }}
                />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <Image src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} fill className="object-contain drop-shadow-lg"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                </div>
              </div>
              <div className="text-center w-full px-1">
                <p className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-2">{fixture.homeTeam.name}</p>
                {fixture.homeStanding && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-bold">
                    #{fixture.homeStanding}
                  </span>
                )}
              </div>
            </div>

            {/* Score / VS */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              {(live || finished) && fixture.homeGoals !== undefined ? (
                <div className={cn(
                  'px-4 sm:px-5 py-2.5 rounded-2xl',
                  live ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.05] border border-white/[0.10]'
                )}>
                  <span className="font-display text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    {fixture.homeGoals} – {fixture.awayGoals}
                  </span>
                </div>
              ) : (
                <div className="px-4 py-2">
                  <span className="font-display text-3xl sm:text-4xl font-black text-slate-700 tracking-tight">VS</span>
                </div>
              )}
              <p className="text-[10px] text-slate-600 font-medium">{getStatusLabel(fixture.status, fixture.elapsed)}</p>
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-2.5 min-w-0">
              <div className="relative">
                <motion.div
                  className="absolute -inset-3 rounded-full bg-violet-500/10 blur-xl"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const, delay: 1.75 }}
                />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <Image src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} fill className="object-contain drop-shadow-lg"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                </div>
              </div>
              <div className="text-center w-full px-1">
                <p className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-2">{fixture.awayTeam.name}</p>
                {fixture.awayStanding && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[10px] text-slate-400 font-bold">
                    #{fixture.awayStanding}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── Últimos 5 partidos de ambos (dentro del hero) ─── */}
          <div className="border-t border-white/[0.06] px-0 py-4">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium text-center mb-3">
              Últimos 5 partidos de ambos
            </p>
            <div className="flex items-center justify-center gap-3">
              {/* Home form */}
              <div className="flex gap-1">
                {fixture.homeForm?.slice(0, 5).map((m, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.2, ease: 'easeOut' as const }}
                    className={`w-7 h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center ${RESULT_COLORS[m.result]}`}
                    title={`${m.result} vs ${m.opponent} (${m.goalsScored}-${m.goalsConceded})`}
                  >
                    {m.result}
                  </motion.span>
                )) ?? <span className="text-slate-700 text-xs">—</span>}
              </div>

              {/* Divider */}
              <div className="w-px h-7 bg-white/[0.10]" />

              {/* Away form */}
              <div className="flex gap-1">
                {fixture.awayForm?.slice(0, 5).map((m, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 + 0.25, duration: 0.2, ease: 'easeOut' as const }}
                    className={`w-7 h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center ${RESULT_COLORS[m.result]}`}
                    title={`${m.result} vs ${m.opponent} (${m.goalsScored}-${m.goalsConceded})`}
                  >
                    {m.result}
                  </motion.span>
                )) ?? <span className="text-slate-700 text-xs">—</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. 3 PICKS IA
      ══════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <span className="text-violet-400 text-[10px] font-black">IA</span>
          </span>
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">Picks del partido</h2>
          {aiLoading && <span className="text-[10px] text-slate-600 animate-pulse ml-1">Analizando…</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aiLoading ? (
            <><PickSkeleton /><PickSkeleton /><PickSkeleton /></>
          ) : aiPicks.length > 0 ? (
            aiPicks.map((pick, i) => (
              <PickCard key={i} index={i} market={pick} fixtureId={fixture.id} matchName={matchName} league={fixture.league.name} />
            ))
          ) : (
            <div className="col-span-3 glass-card rounded-2xl p-5 text-center">
              <p className="text-slate-500 text-sm">Sin análisis disponible para este partido</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. TOGGLE + COMPARATIVA
      ══════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        {/* Full-width toggle bar */}
        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 gap-1">
          <button
            onClick={() => setCompareMode('temporada')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all',
              compareMode === 'temporada'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            Estadísticas de los últimos partidos
          </button>
          <button
            onClick={() => setCompareMode('h2h')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all',
              compareMode === 'h2h'
                ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            Estadística de enfrentamientos
          </button>
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
              /* ── Dos columnas con divisor ── */
              <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_1fr] border-b border-white/[0.06]">
                  <div className="px-4 py-3 flex items-center gap-2">
                    <div className="relative w-5 h-5 shrink-0">
                      <Image src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} fill className="object-contain" />
                    </div>
                    <span className="text-cyan-400 text-xs font-bold truncate">{fixture.homeTeam.name}</span>
                  </div>
                  <div className="w-px bg-white/[0.06]" />
                  <div className="px-4 py-3 flex items-center gap-2 justify-end">
                    <span className="text-slate-300 text-xs font-bold truncate">{fixture.awayTeam.name}</span>
                    <div className="relative w-5 h-5 shrink-0">
                      <Image src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} fill className="object-contain" />
                    </div>
                  </div>
                </div>

                {/* Stats rows */}
                {hs && as_ ? (
                  [
                    { label: 'Prom. goles marcados', h: hs.home.avgGoalsScored.toFixed(1), a: as_.away.avgGoalsScored.toFixed(1), hN: hs.home.avgGoalsScored, aN: as_.away.avgGoalsScored },
                    { label: 'Prom. goles recibidos', h: hs.home.avgGoalsConceded.toFixed(1), a: as_.away.avgGoalsConceded.toFixed(1), hN: hs.home.avgGoalsConceded, aN: as_.away.avgGoalsConceded },
                    { label: 'Partidos jugados', h: String(hs.home.played), a: String(as_.away.played), hN: hs.home.played, aN: as_.away.played },
                    { label: 'Victorias', h: String(hs.home.wins), a: String(as_.away.wins), hN: hs.home.wins, aN: as_.away.wins },
                    { label: '% Valla invicta', h: `${hs.home.cleanSheetPercentage}%`, a: `${as_.away.cleanSheetPercentage}%`, hN: hs.home.cleanSheetPercentage, aN: as_.away.cleanSheetPercentage },
                    { label: '% Ambos anotan', h: `${hs.home.bttsPercentage}%`, a: `${as_.away.bttsPercentage}%`, hN: hs.home.bttsPercentage, aN: as_.away.bttsPercentage },
                    { label: '% +2.5 goles', h: `${hs.home.over25Percentage}%`, a: `${as_.away.over25Percentage}%`, hN: hs.home.over25Percentage, aN: as_.away.over25Percentage },
                  ].map(({ label, h, a, hN, aN }, i) => {
                    const total = hN + aN;
                    const homePct = total > 0 ? (hN / total) * 100 : 50;
                    return (
                      <div key={i} className="border-b border-white/[0.04] last:border-0">
                        <div className="grid grid-cols-[1fr_auto_1fr] px-4 py-2.5 items-center gap-2">
                          <span className="text-white font-bold text-sm tabular-nums">{h}</span>
                          <span className="text-[10px] text-slate-600 text-center w-28 leading-tight">{label}</span>
                          <span className="text-white font-bold text-sm tabular-nums text-right">{a}</span>
                        </div>
                        {/* Dual bar */}
                        <div className="flex h-0.5 mx-4 mb-2 rounded-full overflow-hidden gap-0.5">
                          <div className="rounded-l-full bg-cyan-500/50 transition-all duration-700" style={{ width: `${homePct}%` }} />
                          <div className="flex-1 rounded-r-full bg-slate-600/30" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-5 text-center">
                    <p className="text-slate-500 text-sm">Sin estadísticas de temporada disponibles</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── H2H ── */
              <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
                {/* Summary */}
                {h2h.length > 0 && (
                  <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                    {[
                      { label: fixture.homeTeam.name, value: String(h2hHomeWins), color: 'text-cyan-400' },
                      { label: 'Empates', value: String(h2hDraws), color: 'text-slate-400' },
                      { label: fixture.awayTeam.name, value: String(h2hAwayWins), color: 'text-violet-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="py-4 text-center">
                        <p className={`font-display text-3xl font-black tabular-nums ${color}`}>{value}</p>
                        <p className="text-[10px] text-slate-600 mt-1 truncate px-2">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {h2h.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-slate-500 text-sm">Sin historial de enfrentamientos</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-white/[0.04]">
                      {h2h.slice(0, 8).map((match, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-[10px] text-slate-700 w-12 shrink-0">{match.date.slice(0, 7)}</span>
                          <span className={cn('text-xs flex-1 truncate font-medium', match.winner === 'home' ? 'text-emerald-400' : 'text-slate-400')}>
                            {match.homeTeam}
                          </span>
                          <span className="text-white text-sm font-black tabular-nums shrink-0 px-2">
                            {match.homeGoals}–{match.awayGoals}
                          </span>
                          <span className={cn('text-xs flex-1 truncate font-medium text-right', match.winner === 'away' ? 'text-emerald-400' : 'text-slate-400')}>
                            {match.awayTeam}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-center gap-1">
                      <span className="text-slate-600 text-[11px]">Promedio de goles por partido:</span>
                      <span className="text-white font-bold text-[11px] tabular-nums">{h2hAvgGoals}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. JUGADORES DE AMBOS EQUIPOS
      ══════════════════════════════════════════════════════════ */}
      <PlayersGrid
        homeTeamId={fixture.homeTeam.id}
        awayTeamId={fixture.awayTeam.id}
        homeTeamName={fixture.homeTeam.name}
        awayTeamName={fixture.awayTeam.name}
        homeTeamLogo={fixture.homeTeam.logo}
        awayTeamLogo={fixture.awayTeam.logo}
      />

      {/* ══════════════════════════════════════════════════════════
          5. CUOTAS
      ══════════════════════════════════════════════════════════ */}
      {fixture.odds && fixture.odds.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" /> Cuotas
          </h2>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/[0.05] border border-blue-500/10">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cuotas referenciales únicamente. No promovemos ninguna casa de apuestas.
            </p>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            {fixture.odds.map((odd, i) => {
              const prob = odd.impliedProbability;
              const confidence = prob >= 60 ? 'high' : prob >= 40 ? 'medium' : 'low' as const;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wide">{odd.market}</p>
                    <p className="text-white text-sm font-semibold mt-0.5 truncate">{odd.selection}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-black text-lg tabular-nums">{odd.decimal.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-600">{odd.impliedProbability}% impl.</p>
                  </div>
                  <AddToParleyBtn
                    fixtureId={fixture.id}
                    matchName={matchName}
                    league={fixture.league.name}
                    market={{ market: odd.market, estimatedProbability: prob, confidence, risk: prob < 40 ? 'high' : prob < 60 ? 'medium' : 'low', reasoning: `Cuota: ${odd.decimal.toFixed(2)} · Prob. impl.: ${prob}%`, selection: odd.selection, odds: odd.decimal }}
                  />
                </div>
              );
            })}
          </div>
          <Link href="/parley" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold hover:bg-violet-500/15 transition-all">
            <Layers className="w-4 h-4" /> Ver Constructor de Parley
          </Link>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          6. DISCLAIMER
      ══════════════════════════════════════════════════════════ */}
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/10">
        <Shield className="w-4 h-4 text-amber-500/60 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Juega responsablemente. Este análisis es orientativo y no constituye un consejo de apuesta.
          La probabilidad estadística no garantiza ningún resultado.
        </p>
      </div>
    </div>
  );
}

// ─── Small add-to-parley button ───────────────────────────────────────────────
function AddToParleyBtn({ fixtureId, matchName, league, market }: {
  fixtureId: string; matchName: string; league: string;
  market: MarketAnalysis & { selection?: string; odds?: number };
}) {
  const { picks, addPick } = useParleyStore();
  const { toast } = useToast();
  const added = picks.some(p => p.fixtureId === fixtureId && p.market === market.market);

  function handleAdd() {
    addPick({ fixtureId, matchName, league, market: market.market, selection: market.selection ?? market.market, odds: market.odds ?? parseFloat((100 / market.estimatedProbability).toFixed(2)), estimatedProbability: market.estimatedProbability, confidence: market.confidence, risk: market.risk, aiReasoning: market.reasoning });
    toast('Selección agregada al parley', 'success');
  }

  return (
    <button onClick={handleAdd} disabled={added}
      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 ${added ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'}`}>
      {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
    </button>
  );
}
