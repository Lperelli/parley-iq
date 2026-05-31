'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Trash2, Brain, AlertTriangle, Info, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';
import { calculateParley } from '@/services/parley/parleyCalculator';
import { ParleyAIAnalysis } from '@/types/parley';
import ParleyPickCard from './ParleyPickCard';
import RiskBadge from '@/components/ui/RiskBadge';
import DisclaimerBanner from '@/components/ui/DisclaimerBanner';
import { cn } from '@/lib/utils';

const warningStyles = {
  info: 'bg-blue-500/8 border-blue-500/20 text-blue-300',
  warning: 'bg-amber-500/8 border-amber-500/20 text-amber-300',
  danger: 'bg-rose-500/8 border-rose-500/20 text-rose-300',
};

export default function ParleyBuilder() {
  const { picks, stake, setStake, clearPicks, saveParley } = useParleyStore();
  const [aiAnalysis, setAiAnalysis] = useState<ParleyAIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [saved, setSaved] = useState(false);

  const calc = calculateParley(picks, stake);

  async function runAIAnalysis() {
    setAnalyzing(true);
    setAiError(null);
    try {
      const res = await fetch('/api/parley-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al analizar');
      setAiAnalysis(data);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSave() {
    saveParley({
      picks,
      combinedOdds: calc.combinedOdds,
      combinedProbability: calc.combinedProbability,
      risk: calc.riskLevel,
      stake,
      potentialReturn: calc.potentialReturn,
      aiAnalysis: aiAnalysis ?? undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!picks.length) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6 text-slate-500" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Constructor de Parley</h3>
          <p className="text-slate-400 text-sm mt-1">
            Agrega selecciones desde el análisis de partidos para construir tu parley.
          </p>
        </div>
        <DisclaimerBanner variant="inline" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">Mi Parley</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold">
              {picks.length} selección{picks.length !== 1 ? 'es' : ''}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2.5">
                {picks.map(pick => (
                  <ParleyPickCard key={pick.id} pick={pick} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warnings */}
      {calc.warnings.length > 0 && (
        <div className="space-y-2">
          {calc.warnings.map((w, i) => (
            <div key={i} className={cn('flex gap-2.5 p-3 rounded-xl border text-xs', warningStyles[w.severity])}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calculator */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        <h4 className="text-white font-semibold text-sm">Calculadora</h4>

        {/* Stake input */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Monto a jugar</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-cyan-500/40">
            <span className="text-slate-400 text-sm">$</span>
            <input
              type="number"
              min="1"
              value={stake}
              onChange={e => setStake(Math.max(1, Number(e.target.value)))}
              className="flex-1 bg-transparent text-white text-sm outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-xs text-slate-500 mb-1">Cuota Total</div>
            <div className="text-xl font-bold tabular-nums text-white">{calc.combinedOdds.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-xs text-slate-500 mb-1">Prob. Combinada</div>
            <div className="text-xl font-bold tabular-nums text-cyan-400">{calc.combinedProbability.toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-xs text-slate-500 mb-1">Retorno Potencial</div>
            <div className="text-xl font-bold tabular-nums text-emerald-400">${calc.potentialReturn.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-xs text-slate-500 mb-1">Nivel de Riesgo</div>
            <div className="mt-1">
              <RiskBadge risk={calc.riskLevel} size="md" />
            </div>
          </div>
        </div>

        {/* Risk bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Puntuación de Riesgo</span>
            <span className="text-white font-semibold">{calc.totalRiskScore}/100</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${calc.totalRiskScore}%`,
                backgroundColor: calc.totalRiskScore >= 80 ? '#dc2626' : calc.totalRiskScore >= 60 ? '#ef4444' : calc.totalRiskScore >= 35 ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-300/80">
            Más piernas = más riesgo acumulado. La probabilidad combinada es {calc.combinedProbability.toFixed(1)}% según los estimados de la IA.
          </p>
        </div>
      </div>

      {/* AI Parley Analysis */}
      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h4 className="text-white font-semibold text-sm">Análisis IA del Parley</h4>
            <RiskBadge risk={aiAnalysis.combinedRisk} />
          </div>
          <p className="text-slate-300 text-sm">{aiAnalysis.parleySummary}</p>
          <p className="text-slate-400 text-xs">{aiAnalysis.combinedProbabilityComment}</p>

          {aiAnalysis.weakestLegs.length > 0 && (
            <div>
              <p className="text-xs text-amber-400 font-semibold mb-1">Piernas más débiles</p>
              <ul className="space-y-0.5">
                {aiAnalysis.weakestLegs.map((l, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">·</span>{l}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.riskReductionSuggestions.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400 font-semibold mb-1">Sugerencias</p>
              <ul className="space-y-0.5">
                {aiAnalysis.riskReductionSuggestions.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-slate-500 text-xs italic">{aiAnalysis.responsibleConclusion}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={runAIAnalysis}
          disabled={analyzing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 font-semibold hover:from-cyan-500/30 hover:to-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {analyzing ? 'Analizando...' : 'Analizar Parley con IA'}
        </button>
        {aiError && <p className="text-xs text-rose-400 text-center">{aiError}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/15 transition-all"
          >
            {saved ? '¡Guardado!' : 'Guardar Parley'}
          </button>
          <button
            onClick={clearPicks}
            className="px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DisclaimerBanner variant="inline" />
    </div>
  );
}
