'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Target, Sparkles, Plus, Check, ChevronRight,
  TrendingUp, AlertTriangle, Shield, RefreshCw, ArrowRight
} from 'lucide-react';
import { DailyPicksResult, DailyPick } from '@/types/picks';
import { useParleyStore } from '@/store/parleyStore';
import { useToast } from '@/components/ui/Toast';
import RiskBadge from '@/components/ui/RiskBadge';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { cn } from '@/lib/utils';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const, delay: i * 0.06 } },
});

function PickCard({ pick, index }: { pick: DailyPick; index: number }) {
  const { picks, addPick } = useParleyStore();
  const { toast } = useToast();
  const added = picks.some(p => p.fixtureId === pick.fixtureId && p.market === pick.market);

  function handleAdd() {
    addPick({
      fixtureId: pick.fixtureId,
      matchName: pick.matchName,
      league: pick.league,
      market: pick.market,
      selection: pick.selection,
      odds: pick.impliedOdds,
      estimatedProbability: pick.probability,
      confidence: pick.confidence,
      risk: pick.risk,
      aiReasoning: pick.reasoning,
    });
    toast('Pick agregado al parley ✓', 'success');
  }

  const isHighConf = pick.confidence === 'high';
  const isMedConf = pick.confidence === 'medium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.06 }}
      className={cn(
        'glass-card rounded-2xl overflow-hidden border transition-colors',
        isHighConf ? 'border-emerald-500/20 hover:border-emerald-500/35' :
        isMedConf ? 'border-amber-500/15 hover:border-amber-500/30' :
        'border-white/[0.06] hover:border-white/[0.12]'
      )}
    >
      {/* Top accent bar */}
      <div className={cn(
        'h-0.5',
        isHighConf ? 'bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0' :
        isMedConf ? 'bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0' :
        'bg-gradient-to-r from-slate-500/0 via-slate-500 to-slate-500/0'
      )} />

      <div className="p-4">
        {/* Match info */}
        <Link href={`/partidos/${pick.fixtureId}`} className="flex items-center gap-2 mb-3 group">
          {pick.leagueLogo && (
            <div className="relative w-4 h-4 shrink-0">
              <Image src={pick.leagueLogo} alt={pick.league} fill className="object-contain" onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            </div>
          )}
          <span className="text-[11px] text-slate-500 font-medium truncate">{pick.league}</span>
          <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-cyan-400 transition-colors ml-auto shrink-0" />
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Teams */}
            <p className="text-white font-semibold text-sm truncate mb-0.5">{pick.matchName}</p>

            {/* The Pick */}
            <div className="flex items-center gap-2 mt-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-xs font-semibold">
                {pick.market}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-md text-xs font-bold',
                isHighConf ? 'bg-emerald-500/15 text-emerald-400' :
                isMedConf ? 'bg-amber-500/15 text-amber-400' :
                'bg-slate-500/15 text-slate-400'
              )}>
                {pick.selection}
              </span>
            </div>

            {/* Probability bar */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pick.probability}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + index * 0.05 }}
                  className={cn(
                    'h-full rounded-full',
                    isHighConf ? 'bg-emerald-400' : isMedConf ? 'bg-amber-400' : 'bg-slate-400'
                  )}
                />
              </div>
              <span className={cn(
                'text-xs font-bold tabular-nums shrink-0',
                isHighConf ? 'text-emerald-400' : isMedConf ? 'text-amber-400' : 'text-slate-400'
              )}>
                {pick.probability.toFixed(0)}%
              </span>
            </div>

            {/* Reasoning */}
            <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{pick.reasoning}</p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2.5">
              <ConfidenceBadge confidence={pick.confidence} />
              <RiskBadge risk={pick.risk} />
              <span className="text-[10px] text-slate-600 ml-auto">
                Cuota ref: <span className="text-slate-500 font-mono">{pick.impliedOdds.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleAdd}
            disabled={added}
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all mt-1',
              added
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
            )}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PicksDelDiaPage() {
  const [result, setResult] = useState<DailyPicksResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const picks = useParleyStore(s => s.picks);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/picks-del-dia');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar picks');
    } finally {
      setLoading(false);
    }
  }

  const highPicks = result?.picks.filter(p => p.confidence === 'high') ?? [];
  const medPicks = result?.picks.filter(p => p.confidence === 'medium') ?? [];
  const lowPicks = result?.picks.filter(p => p.confidence === 'low') ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 md:max-w-3xl md:px-6">

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Target className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Picks del Día</h1>
            <p className="text-slate-400 text-xs">Análisis IA de todos los partidos de hoy</p>
          </div>
        </div>
      </motion.div>

      {/* Estado: sin análisis */}
      {!result && !loading && (
        <motion.div {...fadeUp(1)} className="space-y-4">
          {/* Hero CTA */}
          <div className="glass-card rounded-2xl p-6 text-center space-y-4 border border-amber-500/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Análisis de la jornada</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                La IA analiza todos los partidos de hoy en un solo proceso y selecciona los picks con mayor respaldo estadístico.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: TrendingUp, label: 'Forma reciente', color: 'text-cyan-400' },
                { icon: Target, label: 'H2H histórico', color: 'text-emerald-400' },
                { icon: Shield, label: 'Nivel de riesgo', color: 'text-amber-400' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={runAnalysis}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Generar Picks del Día
            </motion.button>

            <p className="text-[11px] text-slate-700">
              Solo análisis estadístico · No son consejos de apuesta
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-10 text-center space-y-4 border border-amber-500/10"
          >
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="text-white font-semibold">Analizando partidos...</p>
              <p className="text-slate-500 text-sm mt-1">La IA está procesando todos los partidos de hoy</p>
            </div>
            {['Leyendo estadísticas de forma reciente...', 'Analizando H2H histórico...', 'Evaluando mercados disponibles...', 'Seleccionando los mejores picks...'].map((step, i) => (
              <motion.p
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 1.2 }}
                className="text-xs text-slate-600"
              >
                {step}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div {...fadeUp(0)} className="glass-card rounded-2xl p-5 border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <p className="text-rose-400 font-medium text-sm">Error al generar picks</p>
          </div>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={runAnalysis} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
          </button>
        </motion.div>
      )}

      {/* Results */}
      {result && !loading && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Summary bar */}
            <motion.div {...fadeUp(0)} className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white text-sm font-medium">
                  {result.picks.length} picks · {result.totalMatchesAnalyzed} partidos analizados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{result.date}</span>
                <button
                  onClick={runAnalysis}
                  className="p-1.5 rounded-lg glass-card border border-white/[0.06] text-slate-500 hover:text-white transition-colors"
                  title="Regenerar picks"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Parley shortcut */}
            {picks.length > 0 && (
              <motion.div {...fadeUp(1)}>
                <Link href="/parley" className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15 transition-colors group">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-semibold">{picks.length} pick{picks.length !== 1 ? 's' : ''} en tu parley</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400 text-xs">
                    Ver parley <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Alta confianza */}
            {highPicks.length > 0 && (
              <motion.section {...fadeUp(2)} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-white font-semibold text-sm">Alta confianza</h2>
                  <span className="text-xs text-slate-600">({highPicks.length})</span>
                </div>
                {highPicks.map((pick, i) => <PickCard key={pick.id} pick={pick} index={i} />)}
              </motion.section>
            )}

            {/* Confianza media */}
            {medPicks.length > 0 && (
              <motion.section {...fadeUp(3)} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h2 className="text-white font-semibold text-sm">Confianza media</h2>
                  <span className="text-xs text-slate-600">({medPicks.length})</span>
                </div>
                {medPicks.map((pick, i) => <PickCard key={pick.id} pick={pick} index={i} />)}
              </motion.section>
            )}

            {/* Menor confianza */}
            {lowPicks.length > 0 && (
              <motion.section {...fadeUp(4)} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <h2 className="text-white font-semibold text-sm">Menor confianza</h2>
                  <span className="text-xs text-slate-600">({lowPicks.length})</span>
                </div>
                {lowPicks.map((pick, i) => <PickCard key={pick.id} pick={pick} index={i} />)}
              </motion.section>
            )}

            {/* Disclaimer */}
            <motion.div {...fadeUp(5)} className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300/70 leading-relaxed">{result.disclaimer}</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
