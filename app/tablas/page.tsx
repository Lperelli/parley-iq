'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Standing } from '@/types/football';
import { RefreshCw } from 'lucide-react';

const LEAGUES = [
  { id: '39',  label: 'Premier League', season: 2024 },
  { id: '140', label: 'La Liga',         season: 2024 },
  { id: '135', label: 'Serie A',         season: 2024 },
  { id: '78',  label: 'Bundesliga',      season: 2024 },
  { id: '61',  label: 'Ligue 1',         season: 2024 },
  { id: '2',   label: 'Champions',       season: 2024 },
  { id: '262', label: 'Liga MX',         season: 2024 },
  { id: '253', label: 'MLS',             season: 2024 },
  { id: '11',  label: 'Mundial 2026',    season: 2026 },
  { id: '32',  label: 'Libertadores',    season: 2024 },
];

function FormSquare({ char }: { char: string }) {
  const color =
    char === 'W' ? 'bg-emerald-500/80 text-white' :
    char === 'D' ? 'bg-amber-500/80 text-white' :
    char === 'L' ? 'bg-rose-500/80 text-white' :
    'bg-white/10 text-slate-500';
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm text-[9px] font-bold ${color}`}>
      {char}
    </span>
  );
}

function RankBadge({ rank, total }: { rank: number; total: number }) {
  const uclZone = rank <= 4;
  const uelZone = rank === 5 || rank === 6;
  const relZone = rank > total - 3;
  const cls = uclZone
    ? 'bg-cyan-500/15 text-cyan-400'
    : uelZone
    ? 'bg-amber-500/15 text-amber-400'
    : relZone
    ? 'bg-rose-500/15 text-rose-400'
    : 'bg-white/5 text-slate-500';
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0 ${cls}`}>
      {rank}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.04]">
      <div className="w-6 h-6 rounded-md bg-white/5 animate-pulse shrink-0" />
      <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1 h-4 rounded bg-white/5 animate-pulse" />
      <div className="w-8 h-4 rounded bg-white/5 animate-pulse hidden sm:block" />
      <div className="w-8 h-4 rounded bg-white/5 animate-pulse" />
      <div className="w-8 h-4 rounded bg-white/5 animate-pulse" />
    </div>
  );
}

export default function TablasPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/standings?league=${activeLeague.id}&season=${activeLeague.season}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setStandings([]);
        } else {
          setStandings(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Error al cargar la tabla');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [activeLeague, retryCount]);

  const total = standings.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-xl font-bold text-white">Tablas</h1>
        <p className="text-xs text-slate-500 mt-0.5">Temporada 2024/25</p>
      </motion.div>

      {/* League selector */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="tabs-scroll-fade -mx-4 px-4"
      >
        {LEAGUES.map(league => (
          <button
            key={league.id}
            onClick={() => setActiveLeague(league)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeLeague.id === league.id
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                : 'text-slate-500 hover:text-slate-300 glass-card border border-white/[0.06]'
            }`}
          >
            {league.label}
          </button>
        ))}
      </motion.div>

      {/* Standings card */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Column headers skeleton */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-white/[0.06] text-[10px] text-slate-600 font-semibold uppercase tracking-wide">
              <span className="w-6 text-center">#</span>
              <span className="w-6" />
              <span className="flex-1">Equipo</span>
              <span className="w-8 text-center hidden sm:block">PJ</span>
              <span className="w-8 text-center hidden sm:block">G</span>
              <span className="w-8 text-center hidden sm:block">E</span>
              <span className="w-8 text-center hidden sm:block">P</span>
              <span className="w-8 text-center hidden md:block">GF</span>
              <span className="w-8 text-center hidden md:block">GC</span>
              <span className="w-8 text-center hidden md:block">DG</span>
              <span className="w-8 text-center font-bold text-slate-400">Pts</span>
              <span className="hidden sm:flex gap-0.5">Forma</span>
            </div>
            {Array.from({ length: 20 }).map((_, i) => <SkeletonRow key={i} />)}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-10 text-center space-y-3"
          >
            <p className="text-rose-400 text-sm">{error}</p>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </motion.div>
        ) : standings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-10 text-center"
          >
            <p className="text-slate-500 text-sm">No hay datos disponibles para esta competición.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeLeague.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Column headers */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-white/[0.06] text-[10px] text-slate-600 font-semibold uppercase tracking-wide">
              <span className="w-6 text-center">#</span>
              <span className="w-6" />
              <span className="flex-1">Equipo</span>
              <span className="w-8 text-center hidden sm:block">PJ</span>
              <span className="w-8 text-center hidden sm:block">G</span>
              <span className="w-8 text-center hidden sm:block">E</span>
              <span className="w-8 text-center hidden sm:block">P</span>
              <span className="w-8 text-center hidden md:block">GF</span>
              <span className="w-8 text-center hidden md:block">GC</span>
              <span className="w-8 text-center hidden md:block">DG</span>
              <span className="w-8 text-center font-bold text-slate-400">Pts</span>
              <span className="hidden sm:flex gap-0.5 w-[88px]">Forma</span>
            </div>

            {/* Rows */}
            {standings.map((s, i) => {
              const uclZone = s.rank <= 4;
              const relZone = s.rank > total - 3 && total >= 6;
              const rowBg = uclZone
                ? 'bg-cyan-500/[0.03]'
                : relZone
                ? 'bg-rose-500/[0.03]'
                : '';
              const form = (s.form ?? '').slice(0, 5).split('');

              return (
                <motion.div
                  key={s.teamId}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02, ease: 'easeOut' as const }}
                  className={`flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.04] last:border-0 ${rowBg}`}
                >
                  <RankBadge rank={s.rank} total={total} />

                  {/* Logo */}
                  <div className="w-6 h-6 shrink-0 relative">
                    {s.teamLogo ? (
                      <Image
                        src={s.teamLogo}
                        alt={s.teamName}
                        width={24}
                        height={24}
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10" />
                    )}
                  </div>

                  {/* Name */}
                  <span className="flex-1 text-sm text-white font-medium truncate">{s.teamName}</span>

                  {/* Stats */}
                  <span className="w-8 text-center text-xs text-slate-400 hidden sm:block">{s.played}</span>
                  <span className="w-8 text-center text-xs text-slate-400 hidden sm:block">{s.wins}</span>
                  <span className="w-8 text-center text-xs text-slate-400 hidden sm:block">{s.draws}</span>
                  <span className="w-8 text-center text-xs text-slate-400 hidden sm:block">{s.losses}</span>
                  <span className="w-8 text-center text-xs text-slate-500 hidden md:block">{s.goalsFor}</span>
                  <span className="w-8 text-center text-xs text-slate-500 hidden md:block">{s.goalsAgainst}</span>
                  <span className={`w-8 text-center text-xs hidden md:block ${s.goalsDiff > 0 ? 'text-emerald-400' : s.goalsDiff < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}
                  </span>
                  <span className="w-8 text-center text-sm font-bold text-white">{s.points}</span>

                  {/* Form */}
                  <div className="hidden sm:flex gap-0.5 w-[88px]">
                    {form.map((char, fi) => (
                      <FormSquare key={fi} char={char} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
