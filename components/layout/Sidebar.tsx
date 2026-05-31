'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Calendar, Layers, Bookmark, Settings,
  Target, Trophy, Shield,
} from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';

const ACCENT = '#c6f24e';
const AMBER  = '#f0a93b';

const navSections = [
  {
    label: 'Explorar',
    items: [
      { href: '/',        label: 'Inicio',   icon: Home,     code: '01' },
      { href: '/partidos',label: 'Partidos', icon: Calendar, code: '02' },
      { href: '/tablas',  label: 'Tablas',   icon: Trophy,   code: '03' },
    ],
  },
  {
    label: 'Inteligencia',
    items: [
      { href: '/picks',  label: 'Picks del Día',      icon: Target, code: '04', hot: true },
      { href: '/parley', label: 'Constructor Parley', icon: Layers, code: '05' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/guardados',     label: 'Guardados',     icon: Bookmark, code: '06' },
      { href: '/configuracion', label: 'Configuración', icon: Settings, code: '07' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const picks    = useParleyStore(s => s.picks);

  return (
    <aside
      className="hidden md:flex flex-col w-[228px] shrink-0 sticky top-0 h-screen z-30"
      style={{ borderRight: '1px solid var(--line)', background: 'rgba(8,9,13,0.98)' }}
    >
      {/* ── Logo ─────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-3 px-5 h-[54px] shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="relative w-8 h-8 shrink-0">
          <div className="absolute inset-0 rounded-lg"
            style={{ background: 'linear-gradient(135deg, rgba(198,242,78,0.18), rgba(56,217,230,0.08))', border: '1px solid rgba(198,242,78,0.22)' }} />
          <div className="absolute inset-[3px] rounded-md flex items-center justify-center" style={{ background: ACCENT }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L9.5 5.5H12L8.5 8.5L10 13L7 10.5L4 13L5.5 8.5L2 5.5H4.5L7 1Z" fill="#0a0c08" />
            </svg>
          </div>
        </div>
        <div className="leading-none">
          <p className="font-display font-bold text-[15px] tracking-tight text-white leading-none mb-1">
            Parley<span style={{ color: ACCENT }}>IQ</span>
          </p>
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'var(--text-3)' }}>
            Sports Intel
          </p>
        </div>
      </Link>

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.label} className="space-y-1">
            <p className="font-mono text-[9px] tracking-[0.16em] uppercase px-3 mb-2" style={{ color: 'var(--text-3)' }}>
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon, code, hot }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              const isParley = href === '/parley';
              const isPicks  = href === '/picks';
              const c = isPicks ? AMBER : ACCENT;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 group ${active ? '' : 'hover:bg-white/[0.03]'}`}
                  style={active
                    ? { color: c, background: isPicks ? 'rgba(240,169,59,0.07)' : 'rgba(198,242,78,0.07)' }
                    : { color: 'var(--text-2)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebarBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[18px] rounded-r-full"
                      style={{ background: c }}
                      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0 transition-colors"
                    style={{ color: active ? c : undefined }} strokeWidth={active ? 2.2 : 1.8} />
                  <span className={`flex-1 truncate transition-colors ${!active ? 'group-hover:text-white' : ''}`}>
                    {label}
                  </span>

                  {isParley && picks.length > 0 ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="font-mono min-w-[18px] h-[18px] px-1 rounded-md text-[10px] font-medium flex items-center justify-center leading-none"
                      style={{ background: ACCENT, color: '#0a0c08' }}>
                      {picks.length}
                    </motion.span>
                  ) : hot && !active ? (
                    <span className="font-mono text-[9px] tracking-wider" style={{ color: AMBER }}>HOT</span>
                  ) : (
                    <span className="font-mono text-[9px] transition-colors"
                      style={{ color: active ? c : 'var(--text-3)' }}>{code}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────── */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Shield className="w-3 h-3 shrink-0" style={{ color: 'var(--text-3)' }} />
          <p className="font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: 'var(--text-3)' }}>
            Juego Responsable
          </p>
        </div>
        <p className="text-[10.5px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          Solo análisis estadístico. No es asesoría de apuestas.
        </p>
      </div>
    </aside>
  );
}
