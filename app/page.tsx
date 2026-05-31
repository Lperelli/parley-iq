'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, TrendingUp, Layers, Shield } from 'lucide-react';
import { Fixture } from '@/types/football';
import MatchCard from '@/components/match/MatchCard';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';

const ACCENT = '#c6f24e';

const TABS = [
  { id: 'hoy',      label: 'Hoy'        },
  { id: 'manana',   label: 'Mañana'     },
  { id: 'finde',    label: 'Finde'      },
  { id: 'vivo',     label: 'Live'       },
  { id: 'populares',label: 'Top'        },
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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const features = [
  { icon: Brain,      label: 'Análisis IA',       desc: 'Modelo entrenado con datos estadísticos reales',     tag: 'AI',   color: '#c6f24e' },
  { icon: TrendingUp, label: 'Forma reciente',     desc: 'Últimos 5 partidos y tendencia de goles',            tag: 'FORM', color: '#38d9e6' },
  { icon: Zap,        label: 'H2H histórico',      desc: 'Enfrentamientos directos y patrones de resultado',   tag: 'H2H',  color: '#f0a93b' },
  { icon: Layers,     label: 'Constructor Parley', desc: 'Combina picks y calcula riesgo acumulado',           tag: 'BUILD',color: '#a78bfa' },
];

const heroStats = [
  { value: '6+',  label: 'Ligas Top' },
  { value: '12',  label: 'Mercados' },
  { value: '24/7',label: 'Live Data' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('hoy');
  const [fixtures,  setFixtures]  = useState<Fixture[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ tab: activeTab });
    if (!['hoy', 'vivo', 'populares'].includes(activeTab)) params.set('date', getDateForTab(activeTab));
    fetch(`/api/fixtures?${params}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setFixtures(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <div className="md:grid md:grid-cols-[1fr_290px] md:gap-9 md:px-7 md:py-7 px-4 py-6 md:max-w-[1120px] md:mx-auto">

      {/* ══ MAIN ═══════════════════════════════════════ */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 min-w-0">

        {/* ── Hero ── */}
        <motion.div variants={item} className="frame rounded-2xl p-6 md:p-7"
          style={{ background: 'linear-gradient(160deg, rgba(198,242,78,0.05), rgba(255,255,255,0.012) 55%)', border: '1px solid var(--line)' }}>
          <span className="eyebrow mb-4">Análisis con IA · 2026</span>
          <h1 className="font-display font-bold leading-[0.92] tracking-tight text-white"
            style={{ fontSize: 'clamp(34px, 5vw, 54px)' }}>
            Analiza más<br />
            <span style={{
              background: 'linear-gradient(110deg, #c6f24e 0%, #38d9e6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>inteligente.</span>
          </h1>
          <p className="text-[15px] leading-relaxed max-w-sm mt-4" style={{ color: 'var(--text-2)' }}>
            Estadísticas avanzadas y modelos de IA para entender probabilidades
            y tendencias antes del pitido inicial.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap mt-6">
            <Link href="/partidos">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
                style={{ background: ACCENT, color: '#0a0c08' }}>
                Explorar partidos <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
            <Link href="/parley">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-2)', color: 'var(--text-1)' }}>
                <Layers className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} /> Constructor Parley
              </motion.div>
            </Link>
          </div>

          {/* Stat ribbon */}
          <div className="flex items-center gap-7 mt-7 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            {heroStats.map(s => (
              <div key={s.label}>
                <p className="font-mono text-[22px] leading-none text-white mb-1.5">{s.value}</p>
                <p className="font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: 'var(--text-3)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Fixtures ── */}
        <motion.div variants={item} className="space-y-4">
          <div className="rule">
            <span className="tag">Partidos destacados</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="tabs-scroll-fade -mx-1 px-1 flex-1">
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileTap={{ scale: 0.93 }}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all"
                    style={{
                      fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                      color: active ? '#0a0c08' : 'var(--text-2)',
                      border: active ? '1px solid transparent' : '1px solid var(--line)',
                    }}>
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
            <Link href="/partidos" className="hidden md:flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase shrink-0 transition-colors hover:text-white"
              style={{ color: 'var(--text-2)' }}>
              Todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2.5">{[1,2,3,4].map(i => <MatchCardSkeleton key={i} />)}</div>
          ) : fixtures.length > 0 ? (
            <div className="space-y-2.5">{fixtures.map((f, i) => <MatchCard key={f.id} fixture={f} index={i} />)}</div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
                <Zap className="w-5 h-5" style={{ color: 'var(--text-3)' }} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-medium" style={{ color: 'var(--text-2)' }}>Sin partidos disponibles</p>
                <p className="font-mono text-[10px] tracking-wider uppercase mt-1.5" style={{ color: 'var(--text-3)' }}>Prueba otra categoría</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={item}>
          <p className="font-mono text-center text-[9.5px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
            Parley IQ · Solo análisis estadístico · La probabilidad no es certeza
          </p>
        </motion.div>
      </motion.div>

      {/* ══ ASIDE (desktop) ════════════════════════════ */}
      <div className="hidden md:flex flex-col gap-4 sticky top-[78px] self-start">
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
          className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid var(--line)' }}>
          <span className="tag">Qué incluye</span>
          <div className="space-y-3.5">
            {features.map(({ icon: Icon, label, desc, tag, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}14`, border: `1px solid ${color}24` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-semibold text-white leading-none">{label}</p>
                    <span className="font-mono text-[8.5px] tracking-wider px-1 py-0.5 rounded" style={{ color, background: `${color}12` }}>{tag}</span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--text-2)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
          className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
          {[
            { href: '/picks',    label: 'Picks del Día', sub: 'Selecciones de hoy',        color: '#f0a93b' },
            { href: '/tablas',   label: 'Tablas',         sub: 'Clasificaciones de ligas',  color: '#c6f24e' },
            { href: '/guardados',label: 'Guardados',      sub: 'Análisis marcados',         color: '#38d9e6' },
          ].map(({ href, label, sub, color }, i, arr) => (
            <Link key={href} href={href} className="flex items-center justify-between px-4 py-3.5 transition-colors group"
              style={{ background: 'rgba(255,255,255,0.018)', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.018)')}>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <div>
                  <p className="text-[13px] font-semibold text-white leading-none mb-0.5">{label}</p>
                  <p className="font-mono text-[9.5px] tracking-wide uppercase" style={{ color: 'var(--text-3)' }}>{sub}</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
            </Link>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.3 }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: 'rgba(240,169,59,0.06)', border: '1px solid rgba(240,169,59,0.14)' }}>
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#f0a93b' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(240,169,59,0.78)' }}>
            <span className="font-semibold" style={{ color: '#f0a93b' }}>Solo análisis estadístico. </span>
            No es un consejo de apuesta. Juega responsablemente.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
