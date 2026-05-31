'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Layers, Calendar, Zap, TrendingUp, Shield, ArrowRight, Activity } from 'lucide-react';
import { Fixture } from '@/types/football';
import MatchCard from '@/components/match/MatchCard';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';

const TABS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'manana', label: 'Mañana' },
  { id: 'finde', label: 'Fin de Semana' },
  { id: 'vivo', label: '🔴 En Vivo' },
  { id: 'populares', label: '⚡ Populares' },
];

function getDateForTab(tab: string): string {
  const d = new Date();
  if (tab === 'manana') d.setDate(d.getDate() + 1);
  else if (tab === 'finde') {
    const day = d.getDay();
    d.setDate(d.getDate() + ((6 - day + 7) % 7 || 7));
  }
  return d.toISOString().split('T')[0];
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.38, ease: 'easeOut' as const, delay: i * 0.07 },
  }),
};

// Desktop right-panel quick-facts
const facts = [
  { icon: Activity, label: 'Análisis IA', desc: 'Modelos entrenados con datos reales de ligas top', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: TrendingUp, label: 'Forma reciente', desc: 'Últimos 5 partidos de cada equipo', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Shield, label: 'Nivel de riesgo', desc: 'Clasificación por cuota implícita y datos H2H', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Layers, label: 'Constructor Parley', desc: 'Combina selecciones y calcula riesgo acumulado', color: 'text-violet-400', bg: 'bg-violet-500/10' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('hoy');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ tab: activeTab });
    if (!['hoy', 'vivo', 'populares'].includes(activeTab)) {
      params.set('date', getDateForTab(activeTab));
    }
    fetch(`/api/fixtures?${params}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setFixtures(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    /* Desktop: 2-column layout. Mobile: single column */
    <div className="md:grid md:grid-cols-[1fr_300px] md:gap-6 md:items-start md:px-6 md:py-6 md:max-w-6xl md:mx-auto px-4 py-5 space-y-5 md:space-y-0">

      {/* ── LEFT / MAIN COLUMN ─────────────────────────────── */}
      <div className="space-y-5 min-w-0">

        {/* Hero */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="space-y-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
            Analiza <span className="text-cyan-400">más inteligente</span>,<br />
            no más arriesgado.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Estadísticas avanzadas + IA para entender probabilidades, tendencias y riesgo antes del partido.
          </p>
        </motion.div>

        {/* CTA Cards */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
          <Link href="/partidos">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="glass-card rounded-2xl p-4 h-full cursor-pointer hover:border-cyan-500/20 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center mb-3 group-hover:bg-cyan-500/15 transition-colors">
                <Brain className="w-[18px] h-[18px] text-cyan-400" />
              </div>
              <p className="text-white font-semibold text-sm leading-tight">Analizar Partido</p>
              <p className="text-slate-500 text-xs mt-1">IA con datos reales</p>
              <div className="flex items-center gap-1 mt-3 text-cyan-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver partidos <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          </Link>
          <Link href="/parley">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="glass-card rounded-2xl p-4 h-full cursor-pointer hover:border-violet-500/20 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mb-3 group-hover:bg-violet-500/15 transition-colors">
                <Layers className="w-[18px] h-[18px] text-violet-400" />
              </div>
              <p className="text-white font-semibold text-sm leading-tight">Construir Parley</p>
              <p className="text-slate-500 text-xs mt-1">Calcula riesgo combinado</p>
              <div className="flex items-center gap-1 mt-3 text-violet-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ir al constructor <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Feature pills — solo mobile */}
        <motion.div
          custom={2} variants={fadeUp} initial="hidden" animate="show"
          className="flex gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 scrollbar-hide md:hidden"
        >
          {[
            { icon: TrendingUp, label: 'Forma reciente', color: 'text-emerald-400' },
            { icon: Shield, label: 'Nivel de riesgo', color: 'text-amber-400' },
            { icon: Zap, label: 'H2H histórico', color: 'text-cyan-400' },
            { icon: Brain, label: 'Análisis IA', color: 'text-violet-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full glass-card text-xs text-slate-400 whitespace-nowrap">
              <Icon className={`w-3 h-3 ${color} shrink-0`} />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Tabs + Fixtures */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Partidos destacados</h2>
            <Link href="/partidos" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Tab bar */}
          <div className="tabs-scroll-fade -mx-4 px-4 md:mx-0 md:px-0">
            {TABS.map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-slate-500 hover:text-slate-300 glass-card border border-white/[0.05]'
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : fixtures.length > 0 ? (
            <div className="space-y-3">
              {fixtures.map((f, i) => <MatchCard key={f.id} fixture={f} index={i} />)}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-14">
              <Calendar className="w-10 h-10 text-slate-800 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Sin partidos disponibles</p>
              <p className="text-slate-700 text-xs mt-1">Prueba con otra fecha</p>
            </motion.div>
          )}
        </motion.div>

        {/* Footer disclaimer */}
        <div className="text-center py-2 border-t border-white/[0.04] space-y-1">
          <p className="text-[11px] text-slate-700">Parley IQ · Análisis estadístico únicamente · No es asesoría de apuestas</p>
          <p className="text-[11px] text-slate-800">La probabilidad no es certeza. Juega siempre responsablemente.</p>
        </div>
      </div>

      {/* ── RIGHT COLUMN (desktop only) ───────────────────── */}
      <div className="hidden md:flex flex-col gap-4 sticky top-6">

        {/* Features card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
          className="glass-card rounded-2xl p-4 space-y-3"
        >
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Qué incluye Parley IQ
          </h3>
          <div className="space-y-2.5">
            {facts.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick access */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
          className="glass-card rounded-2xl p-4 space-y-2"
        >
          <h3 className="text-white font-semibold text-sm mb-3">Acceso rápido</h3>
          <Link href="/partidos" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Todos los partidos</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </Link>
          <Link href="/parley" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Constructor de Parley</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 transition-colors" />
          </Link>
          <Link href="/guardados" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Mis análisis guardados</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
          className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300/70 leading-relaxed">
            <span className="font-semibold text-amber-300/90">Solo análisis estadístico.</span>{' '}
            No es un consejo de apuesta. La probabilidad no es certeza.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
