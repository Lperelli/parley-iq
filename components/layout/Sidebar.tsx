'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Calendar, Layers, Bookmark, Settings, Zap, Shield, TrendingUp } from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/partidos', label: 'Partidos', icon: Calendar },
  { href: '/parley', label: 'Constructor Parley', icon: Layers },
  { href: '/guardados', label: 'Guardados', icon: Bookmark },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

const quickStats = [
  { label: 'Ligas cubiertas', value: '6' },
  { label: 'Mercados analizados', value: '12+' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const picks = useParleyStore(s => s.picks);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/[0.06] bg-[#050b14]/80 sticky top-0 h-screen z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
            <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-tight text-white block leading-none">
              Parley <span className="text-cyan-400">IQ</span>
            </span>
            <span className="text-[10px] text-slate-600 font-medium tracking-wide">Análisis Deportivo</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const isParley = href === '/parley';

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group ${
                active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                  : 'text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1 truncate">{label}</span>
              {isParley && picks.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {picks.length}
                </motion.span>
              )}
              {active && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-cyan-400"
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick stats widget */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Cobertura</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickStats.map(s => (
            <div key={s.label}>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-[10px] text-slate-600 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="px-4 py-3.5 border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Shield className="w-3 h-3 text-slate-600 shrink-0" />
          <p className="text-[10px] text-slate-600 font-medium">Juego Responsable</p>
        </div>
        <p className="text-[10px] text-slate-700 leading-relaxed">
          Solo análisis estadístico. No es asesoría de apuestas.
        </p>
      </div>
    </aside>
  );
}
