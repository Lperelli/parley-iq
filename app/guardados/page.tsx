'use client';

import { motion } from 'framer-motion';
import { Bookmark, Brain, Layers, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParleyStore } from '@/store/parleyStore';
import RiskBadge from '@/components/ui/RiskBadge';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';

export default function GuardadosPage() {
  const { savedAnalyses, savedParleys, removeAnalysis, removeParley } = useParleyStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-400" /> Guardados
        </h1>
        <p className="text-slate-400 text-sm mt-1">Tus análisis y parleys guardados.</p>
      </motion.div>

      {/* Saved Analyses */}
      <section className="space-y-3">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" /> Análisis Guardados
          <span className="text-xs text-slate-600 font-normal">({savedAnalyses.length})</span>
        </h2>
        {!savedAnalyses.length ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <Brain className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No tienes análisis guardados</p>
            <Link href="/partidos" className="mt-3 inline-flex items-center gap-1.5 text-cyan-400 text-sm hover:underline">
              Analizar un partido <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedAnalyses.map(sa => (
              <motion.div
                key={sa.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-4 border border-white/[0.06] group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{sa.matchName}</p>
                    <p className="text-slate-500 text-xs">{sa.league}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ConfidenceBadge confidence={sa.analysis.overallConfidence} />
                      <span className="text-xs text-slate-600">{new Date(sa.createdAt).toLocaleDateString('es-MX')}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">{sa.analysis.matchSummary}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/partidos/${sa.fixtureId}`}
                      className="p-1.5 rounded-lg glass-card border border-white/[0.06] text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => removeAnalysis(sa.id)}
                      className="p-1.5 rounded-lg glass-card border border-white/[0.06] text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Parleys */}
      <section className="space-y-3">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" /> Parleys Guardados
          <span className="text-xs text-slate-600 font-normal">({savedParleys.length})</span>
        </h2>
        {!savedParleys.length ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No tienes parleys guardados</p>
            <Link href="/parley" className="mt-3 inline-flex items-center gap-1.5 text-violet-400 text-sm hover:underline">
              Construir un parley <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedParleys.map(sp => (
              <motion.div
                key={sp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-4 border border-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-semibold text-sm">{sp.picks.length} Selecciones</span>
                      <RiskBadge risk={sp.risk} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-slate-500">Cuota</div>
                        <div className="text-white font-bold">{sp.combinedOdds.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Prob.</div>
                        <div className="text-cyan-400 font-bold">{sp.combinedProbability.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Retorno</div>
                        <div className="text-emerald-400 font-bold">${sp.potentialReturn.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      {sp.picks.slice(0, 3).map(p => (
                        <p key={p.id} className="text-xs text-slate-500 truncate">· {p.matchName} — {p.market}</p>
                      ))}
                      {sp.picks.length > 3 && <p className="text-xs text-slate-600">+{sp.picks.length - 3} más</p>}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{new Date(sp.createdAt).toLocaleDateString('es-MX')}</p>
                  </div>
                  <button
                    onClick={() => removeParley(sp.id)}
                    className="p-1.5 rounded-lg glass-card border border-white/[0.06] text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
