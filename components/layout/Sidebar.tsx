'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Calendar, Layers, Bookmark, Settings,
  Target, Trophy, Shield,
} from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';

const navItems = [
  { href: '/',             label: 'Inicio',             icon: Home    },
  { href: '/partidos',     label: 'Partidos',            icon: Calendar },
  { href: '/tablas',       label: 'Tablas',              icon: Trophy  },
  { href: '/picks',        label: 'Picks del Día',       icon: Target  },
  { href: '/parley',       label: 'Constructor Parley',  icon: Layers  },
  { href: '/guardados',    label: 'Guardados',           icon: Bookmark },
  { href: '/configuracion',label: 'Configuración',       icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const picks    = useParleyStore(s => s.picks);

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 sticky top-0 h-screen z-30"
      style={{ borderRight: '1px solid rgba(255,255,255,0.055)', background: 'rgba(7,10,16,0.98)' }}>

      {/* ── Logo ─────────────────────────────────── */}
      <Link href="/"
        className="flex items-center gap-3 px-5 py-5 group"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Icon mark */}
        <div className="relative w-8 h-8 shrink-0">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #a3fb5a22, #22d3ee11)', border: '1px solid rgba(163,251,90,0.2)' }} />
          {/* Inner icon */}
          <div className="absolute inset-[3px] rounded-md flex items-center justify-center"
            style={{ background: '#a3fb5a' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L9.5 5.5H12L8.5 8.5L10 13L7 10.5L4 13L5.5 8.5L2 5.5H4.5L7 1Z"
                fill="#06090e" strokeWidth="0" />
            </svg>
          </div>
        </div>

        <div className="leading-none">
          <p className="font-display font-bold text-[15px] tracking-tight text-white leading-none mb-0.5">
            Parley<span style={{ color: '#a3fb5a' }}>IQ</span>
          </p>
          <p className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: 'var(--text-3)' }}>Análisis Deportivo</p>
        </div>
      </Link>

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active   = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const isParley = href === '/parley';
          const isPicks  = href === '/picks';

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-150 group ${
                active ? '' : 'hover:bg-white/[0.03]'
              }`}
              style={active ? {
                color: isPicks ? '#f59e0b' : '#a3fb5a',
                background: isPicks ? 'rgba(245,158,11,0.07)' : 'rgba(163,251,90,0.07)',
              } : { color: 'var(--text-2)' }}
            >
              {/* Active left bar */}
              {active && (
                <motion.span
                  layoutId="sidebarBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[18px] rounded-r-full"
                  style={{ background: isPicks ? '#f59e0b' : '#a3fb5a' }}
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              )}

              <Icon
                className="w-4 h-4 shrink-0 transition-colors"
                style={{ color: active ? (isPicks ? '#f59e0b' : '#a3fb5a') : undefined }}
                strokeWidth={active ? 2.2 : 1.8}
              />

              <span className={`flex-1 truncate transition-colors ${!active ? 'group-hover:text-white' : ''}`}>
                {label}
              </span>

              {/* Parley pick count */}
              {isParley && picks.length > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center leading-none"
                  style={{ background: '#a3fb5a', color: '#06090e' }}
                >
                  {picks.length}
                </motion.span>
              )}

              {/* Picks fire badge */}
              {isPicks && !active && (
                <span className="text-[10px] leading-none">🔥</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────── */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <Shield className="w-3 h-3 shrink-0" style={{ color: 'var(--text-3)' }} />
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
            Juego Responsable
          </p>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          Solo análisis estadístico. No es asesoría de apuestas.
        </p>
      </div>
    </aside>
  );
}
