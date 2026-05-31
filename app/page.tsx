'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, TrendingUp, Layers, Shield } from 'lucide-react';
import { Fixture } from '@/types/football';
import MatchCard from '@/components/match/MatchCard';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';

/* ─── Tabs ────────────────────────────────────────────── */
const TABS = [
  { id: 'hoy',      label: 'Hoy'         },
  { id: 'manana',   label: 'Mañana'      },
  { id: 'finde',    label: 'Fin de sem.' },
  { id: 'vivo',     label: '● En Vivo'   },
  { id: 'populares',label: '⚡ Populares' },
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

/* ─── Stagger variants ────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
};

/* ─── Right panel features ────────────────────────────── */
const features = [
  { icon: Brain,      label: 'Análisis IA',         desc: 'LLM entrenado con datos estadísticos reales',  color: '#a3fb5a'  },
  { icon: TrendingUp, label: 'Forma reciente',       desc: 'Últimos 5 partidos con tendencia de goles',    color: '#22d3ee'  },
  { icon: Zap,        label: 'H2H histórico',        desc: 'Enfrentamientos directos y patrones de resultado', color: '#f59e0b' },
  { icon: Layers,     label: 'Constructor Parley',   desc: 'Combina picks y calcula riesgo acumulado',     color: '#a78bfa'  },
];

/* ─── Component ───────────────────────────────────────── */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState('hoy');
  const [fixtures,  setFixtures]  = useState<Fixture[]>([]);
  const [loading,   setLoading]   = useState(true);

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
    <div className="md:grid md:grid-cols-[1fr_280px] md:gap-8 md:px-7 md:py-7 px-4 py-6 md:max-w-[1100px] md:mx-auto">

      {/* ══ MAIN COLUMN ═══════════════════════════════════ */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-7 min-w-0">

        {/* ── Hero headline ──────────────────────────────── */}
        <motion.div variants={item} className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a3fb5a' }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: '#a3fb5a', fontFamily: 'Outfit, sans-serif' }}>
              Análisis con IA
            </span>
          </div>
          <h1 className="font-display font-bold leading-[0.95] tracking-tight text-white"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}>
            Analiza más<br />
            <span style={{
              background: 'linear-gradient(135deg, #a3fb5a 0%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>inteligente.</span>
          </h1>
          <p className="text-[15px] leading-relaxed max-w-sm" style={{ color: 'var(--text-2)', fontFamily: 'Outfit, sans-serif' }}>
            Estadísticas avanzadas + modelos de IA para entender probabilidades
            y tendencias antes del partido.
          </p>
        </motion.div>

        {/* ── Quick action buttons ────────────────────────── */}
        <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
          <Link href="/partidos">
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
              style={{
                background: '#a3fb5a',
                color: '#06090e',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Ver partidos
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>
          </Link>
          <Link href="/parley">
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-1)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              <Layers className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              Constructor Parley
            </motion.div>
          </Link>
        </motion.div>

        {/* ── Fixture section ─────────────────────────────── */}
        <motion.div variants={item} className="space-y-4">

          {/* Section header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: 'var(--text-2)', fontFamily: 'Outfit, sans-serif' }}>
              Partidos destacados
            </h2>
            <Link href="/partidos"
              className="flex items-center gap-1 text-[12px] font-medium transition-colors hover:text-white"
              style={{ color: 'var(--text-2)' }}>
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Tab bar */}
          <div className="tabs-scroll-fade -mx-4 px-4 md:mx-0 md:px-0">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.93 }}
                  className="shrink-0 px-4 py-1.5 rounded-lg text-[12.5px] font-medium transition-all whitespace-nowrap"
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    background: active ? '#a3fb5a' : 'rgba(255,255,255,0.04)',
                    color: active ? '#06090e' : 'var(--text-2)',
                    border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.07)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* Fixture list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : fixtures.length > 0 ? (
            <div className="space-y-2.5">
              {fixtures.map((f, i) => <MatchCard key={f.id} fixture={f} index={i} />)}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Zap className="w-5 h-5" style={{ color: 'var(--text-3)' }} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-medium" style={{ color: 'var(--text-2)' }}>Sin partidos disponibles</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Prueba con otra fecha o categoría</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={item}>
          <p className="text-center text-[11px]" style={{ color: 'var(--text-3)' }}>
            Parley IQ · Solo análisis estadístico · La probabilidad no es certeza
          </p>
        </motion.div>
      </motion.div>

      {/* ══ RIGHT COLUMN (desktop only) ═══════════════════ */}
      <div className="hidden md:flex flex-col gap-4 sticky top-[78px] self-start">

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'var(--text-2)', fontFamily: 'Outfit, sans-serif' }}>
            Qué incluye
          </h3>
          <div className="space-y-3.5">
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}14`, border: `1px solid ${color}22` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white leading-none mb-0.5">{label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--text-2)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { href: '/picks',    label: 'Picks del Día',   sub: 'Selecciones destacadas de hoy', color: '#f59e0b' },
            { href: '/tablas',   label: 'Tablas',           sub: 'Clasificaciones de las ligas',  color: '#a3fb5a' },
            { href: '/guardados',label: 'Mis guardados',    sub: 'Análisis que marcaste',         color: '#22d3ee' },
          ].map(({ href, label, sub, color }, i, arr) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3.5 transition-colors group"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            >
              <div>
                <p className="text-[13px] font-semibold text-white">{label}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>{sub}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transition-colors"
                style={{ color: 'var(--text-3)' }}
              />
            </Link>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.3 }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
        >
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(245,158,11,0.75)' }}>
            <span className="font-semibold" style={{ color: '#f59e0b' }}>Solo análisis estadístico. </span>
            No es un consejo de apuesta. Juega responsablemente.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
