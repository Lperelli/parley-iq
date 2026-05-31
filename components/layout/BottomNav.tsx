'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Layers, Target, Settings } from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/partidos', label: 'Partidos', icon: Calendar },
  { href: '/picks', label: 'Picks', icon: Target },
  { href: '/parley', label: 'Parley', icon: Layers },
  { href: '/configuracion', label: 'Config', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const picks = useParleyStore(s => s.picks);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-nav border-t border-white/[0.06]">
      <div className="flex items-center justify-around px-1 pt-2 pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const isParley = href === '/parley';
          const isPicks = href === '/picks';

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative min-w-[52px]"
            >
              {/* Active indicator */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-5 h-0.5 rounded-full bg-cyan-400"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: 0.82 }}
                transition={{ duration: 0.1 }}
                className="relative"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active
                      ? isPicks ? 'text-amber-400' : 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {isParley && picks.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-500 text-white text-[8px] font-bold flex items-center justify-center leading-none"
                  >
                    {picks.length}
                  </motion.span>
                )}
              </motion.div>

              <span className={`text-[9px] font-medium leading-none transition-colors duration-200 ${
                active
                  ? isPicks ? 'text-amber-400' : 'text-cyan-400'
                  : 'text-slate-600'
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
