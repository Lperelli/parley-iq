'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Layers, Bookmark, Settings, Zap, Shield } from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/partidos', label: 'Partidos', icon: Calendar },
  { href: '/parley', label: 'Constructor Parley', icon: Layers },
  { href: '/guardados', label: 'Guardados', icon: Bookmark },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const picks = useParleyStore(s => s.picks);

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-white/[0.06] bg-[#050b14] sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-white">
            Parley <span className="text-cyan-400">IQ</span>
          </span>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                  : 'text-slate-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1 truncate">{label}</span>
              {isParley && picks.length > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {picks.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.05] space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-slate-600" />
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Solo análisis estadístico
          </p>
        </div>
        <p className="text-[10px] text-slate-700 leading-relaxed">
          No es asesoría de apuestas
        </p>
      </div>
    </aside>
  );
}
