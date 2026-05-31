'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Info, Loader2, Plus, ChevronDown, ChevronUp, Target
} from 'lucide-react';
import { MatchAnalysis, MarketAnalysis } from '@/types/analysis';
import RiskBadge from '@/components/ui/RiskBadge';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import DataQualityBadge from '@/components/ui/DataQualityBadge';
import DisclaimerBanner from '@/components/ui/DisclaimerBanner';
import { cn } from '@/lib/utils';
import { useParleyStore } from '@/store/parleyStore';
import { useToast } from '@/components/ui/Toast';

interface Props {
  fixtureId: string;
  matchName: string;
  initialAnalysis?: MatchAnalysis;
}

const impactColors = { low: '#64748b', medium: '#f59e0b', high: '#22d3ee' };

const confidenceAccent = {
  high: 'from-emerald-500/20 border-emerald-500/25 text-emerald-400',
  medium: 'from-amber-500/20 border-amber-500/25 text-amber-400',
  low: 'from-slate-500/10 border-slate-500/20 text-slate-400',
};
const confidenceBar = { high: 'bg-emerald-400', medium: 'bg-amber-400', low: 'bg-slate-500' };

function PickCard({
  market,
  fixtureId,
  matchName,
  index,
}: {
  market: MarketAnalysis;
  fixtureId: string;
  matchName: string;
  index: number;
}) {
  const addPick = useParleyStore(s => s.addPick);
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addPick({
      fixtureId,
      matchName,
      league: '',
      market: market.market,
      selection: market.market,
      odds: market.estimatedProbability > 0 ? parseFloat((100 / market.estimatedProbability).toFixed(2)) : 2.0,
      estimatedProbability: market.estimatedProbability,
      confidence: market.confidence,
      risk: market.risk,
      aiReasoning: market.reasoning,
    });
    setAdded(true);
    toast('Pick agregado al parley ✓', 'success');
    setTimeout(() => setAdded(false), 3000);
  }

  const accent = confidenceAccent[market.confidence];
  const bar = confidenceBar[market.confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.07 }}
      className={`relative glass-card rounded-2xl p-4 border bg-gradient-to-br ${accent} to-transparent overflow-hidden`}
    >
      {/* confidence glow strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full ${bar}`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Pick Recomendado</span>
          </div>
          <p className="text-white font-semibold text-sm leading-tight">{market.market}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <ConfidenceBadge confidence={market.confidence} />
          <RiskBadge risk={market.risk} />
        </div>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500">Probabilidad estimada</span>
          <span className={`text-xs font-bold ${bar === 'bg-emerald-400' ? 'text-emerald-400' : bar === 'bg-amber-400' ? 'text-amber-400' : 'text-slate-400'}`}>
            {market.estimatedProbability}%
          </span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${market.estimatedProbability}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.07 + 0.2 }}
            className={`h-full rounded-full ${bar}`}
          />
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed mb-3">{market.reasoning}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600">
          Cuota impl.: {market.estimatedProbability > 0 ? (100 / market.estimatedProbability).toFixed(2) : '—'}
        </span>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            added
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
          }`}
        >
          <Plus className="w-3 h-3" />
          {added ? 'Agregado' : 'Al Parley'}
        </button>
      </div>
    </motion.div>
  );
}

export default function AIAnalysisCard({ fixtureId, matchName, initialAnalysis }: Props) {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(initialAnalysis ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al analizar');
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  if (!analysis && !loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
          <Brain className="w-7 h-7 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">Picks IA del Partido</h3>
          <p className="text-slate-400 text-sm">
            Analiza estadísticamente <strong className="text-white">{matchName}</strong> y obtén los mejores picks con probabilidades estimadas.
          </p>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}
        <DisclaimerBanner variant="inline" />
        <button
          onClick={runAnalysis}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 font-semibold hover:from-cyan-500/30 hover:to-blue-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Analizar y Obtener Picks
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <div>
          <p className="text-white font-semibold">Analizando partido...</p>
          <p className="text-slate-400 text-sm mt-1">Procesando estadísticas y generando picks</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Picks del Partido</h3>
              <p className="text-slate-500 text-xs">{new Date(analysis.analyzedAt).toLocaleString('es-MX')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            <DataQualityBadge score={analysis.dataQualityScore} />
            <ConfidenceBadge confidence={analysis.overallConfidence} />
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{analysis.matchSummary}</p>
      </div>

      {/* ★ Picks prominentes */}
      {analysis.marketsToConsider.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h4 className="text-white font-semibold text-sm">Picks Recomendados</h4>
            <span className="text-[10px] text-slate-600 ml-auto">Toca para agregar al parley</span>
          </div>
          {analysis.marketsToConsider.map((market, i) => (
            <PickCard key={i} market={market} fixtureId={fixtureId} matchName={matchName} index={i} />
          ))}
        </div>
      )}

      {/* Markets to Avoid — compact */}
      {analysis.marketsToAvoid.length > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <h4 className="text-white font-semibold text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            Mercados a Evitar
          </h4>
          {analysis.marketsToAvoid.map((market, i) => (
            <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-rose-500/8 border border-rose-500/15">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-rose-300 text-xs font-medium">{market.market}</p>
                  <RiskBadge risk={market.risk} />
                </div>
                <p className="text-rose-200/50 text-[10px] mt-0.5">{market.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible deeper analysis */}
      <button
        onClick={() => setShowDetails(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-xs hover:text-slate-300 transition-all"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          {showDetails ? 'Ocultar análisis detallado' : 'Ver análisis detallado'}
        </span>
        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden space-y-3"
          >
            {/* Key Factors */}
            {analysis.keyFactors.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Factores Clave
                </h4>
                <div className="space-y-3">
                  {analysis.keyFactors.map((factor, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-1 rounded-full shrink-0"
                        style={{ backgroundColor: impactColors[factor.impact], minHeight: '32px' }}
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{factor.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Probable Scenarios */}
            {analysis.probableScenarios.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-4">
                <h4 className="text-white font-semibold text-sm">Escenarios Probables</h4>
                {analysis.probableScenarios.map((scenario, i) => (
                  <div key={i} className="space-y-2 pb-4 border-b border-white/[0.05] last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-medium">{scenario.scenario}</p>
                      <RiskBadge risk={scenario.risk} />
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scenario.estimatedProbability}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-violet-400' : 'bg-amber-400'}`}
                      />
                    </div>
                    <p className="text-slate-400 text-xs">{scenario.reasoning}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Danger Zones */}
            {analysis.dangerZones.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Zonas de Peligro
                </h4>
                {analysis.dangerZones.map((zone, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-300 text-sm font-medium">{zone.title}</p>
                      <p className="text-amber-200/60 text-xs mt-0.5">{zone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Data Limitations */}
            {analysis.dataLimitations.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  Limitaciones de Datos
                </h4>
                <ul className="space-y-1">
                  {analysis.dataLimitations.map((lim, i) => (
                    <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 mt-1.5" />
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DisclaimerBanner variant="inline" />
            <div className="glass-card rounded-2xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs leading-relaxed italic">{analysis.responsibleConclusion}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={runAnalysis}
        className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-500 text-xs hover:text-slate-300 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
      >
        <Brain className="w-3.5 h-3.5" />
        Re-analizar
      </button>
    </motion.div>
  );
}
