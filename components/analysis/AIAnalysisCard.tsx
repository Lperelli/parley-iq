'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
import { MatchAnalysis } from '@/types/analysis';
import RiskBadge from '@/components/ui/RiskBadge';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import DataQualityBadge from '@/components/ui/DataQualityBadge';
import ProbabilityBar from '@/components/ui/ProbabilityBar';
import DisclaimerBanner from '@/components/ui/DisclaimerBanner';
import { cn } from '@/lib/utils';

interface Props {
  fixtureId: string;
  matchName: string;
  initialAnalysis?: MatchAnalysis;
}

const impactColors = { low: '#64748b', medium: '#f59e0b', high: '#22d3ee' };

export default function AIAnalysisCard({ fixtureId, matchName, initialAnalysis }: Props) {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(initialAnalysis ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'mercados' | 'escenarios'>('resumen');

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
          <h3 className="text-white font-semibold mb-1">Análisis IA Disponible</h3>
          <p className="text-slate-400 text-sm">
            Genera un análisis estadístico profundo con IA para <strong className="text-white">{matchName}</strong>
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
          Ejecutar Análisis IA
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
          <p className="text-slate-400 text-sm mt-1">La IA está procesando los datos del partido</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const tabs = ['resumen', 'mercados', 'escenarios'] as const;
  const tabLabels = { resumen: 'Resumen', mercados: 'Mercados', escenarios: 'Escenarios' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Análisis IA</h3>
              <p className="text-slate-500 text-xs">{new Date(analysis.analyzedAt).toLocaleString('es-MX')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            <DataQualityBadge score={analysis.dataQualityScore} />
            <ConfidenceBadge confidence={analysis.overallConfidence} />
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{analysis.matchSummary}</p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeTab === tab
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'resumen' && (
          <motion.div
            key="resumen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
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
                        className="w-1 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: impactColors[factor.impact], height: 'auto', minHeight: '32px' }}
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

            {/* Responsible Conclusion */}
            <DisclaimerBanner variant="inline" />
            <div className="glass-card rounded-2xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs leading-relaxed italic">{analysis.responsibleConclusion}</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'mercados' && (
          <motion.div
            key="mercados"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Markets to Consider */}
            {analysis.marketsToConsider.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Mercados a Considerar
                </h4>
                <div className="space-y-4">
                  {analysis.marketsToConsider.map((market, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white text-sm font-medium">{market.market}</p>
                        <div className="flex gap-1 shrink-0">
                          <RiskBadge risk={market.risk} />
                          <ConfidenceBadge confidence={market.confidence} />
                        </div>
                      </div>
                      <ProbabilityBar
                        label=""
                        probability={market.estimatedProbability}
                        color="#22d3ee"
                        showValue
                      />
                      <p className="text-slate-400 text-xs">{market.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Markets to Avoid */}
            {analysis.marketsToAvoid.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  Mercados a Evitar
                </h4>
                {analysis.marketsToAvoid.map((market, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-rose-500/8 border border-rose-500/15">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-rose-300 text-sm font-medium">{market.market}</p>
                        <RiskBadge risk={market.risk} />
                      </div>
                      <p className="text-rose-200/60 text-xs mt-0.5">{market.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'escenarios' && (
          <motion.div
            key="escenarios"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="glass-card rounded-2xl p-4 space-y-4">
              <h4 className="text-white font-semibold text-sm">Escenarios Probables</h4>
              {analysis.probableScenarios.map((scenario, i) => (
                <div key={i} className="space-y-2 pb-4 border-b border-white/[0.05] last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium">{scenario.scenario}</p>
                    <div className="flex gap-1 shrink-0">
                      <RiskBadge risk={scenario.risk} />
                    </div>
                  </div>
                  <ProbabilityBar
                    label=""
                    probability={scenario.estimatedProbability}
                    color={i === 0 ? '#22d3ee' : i === 1 ? '#a78bfa' : '#f59e0b'}
                  />
                  <p className="text-slate-400 text-xs">{scenario.reasoning}</p>
                </div>
              ))}
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
