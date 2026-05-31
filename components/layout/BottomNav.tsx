'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Layers, Target, Settings } from 'lucide-react';
import { useParleyStore } from '@/store/parleyStore';

const navItems = [
  { href: '/',             label: 'Inicio',   icon: Home     },
  { href: '/partidos',     label: 'Partidos', icon: Calendar },
  { href: '/picks',        label: 'Picks',    icon: Target   },
  { href: '/parley',       label: 'Parley',   icon: Layers   },
  { href: '/configuracion',label: 'Config',   icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const picks    = useParleyStore(s => s.picks);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(7,10,16,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active   = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const isParley = href === '/parley';
          const isPicks  = href === '/picks';
          const accentColor = isPicks ? '#f59e0b' : '#a3fb5a';

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl min-w-[52px]"
            >
              {/* Active top dot */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="bottomDot"
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-4 h-[2px] rounded-full"
                    style={{ background: accentColor }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="relative"
              >
                <Icon
                  className="w-[19px] h-[19px] transition-colors duration-200"
                  style={{ color: active ? accentColor : 'var(--text-2)' }}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {isParley && picks.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center leading-none"
                    style={{ background: '#a3fb5a', color: '#06090e' }}
                  >
                    {picks.length}
                  </motion.span>
                )}
              </motion.div>

              <span
                className="text-[9px] font-medium leading-none transition-colors duration-200"
                style={{ color: active ? accentColor : 'var(--text-3)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
