'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, X, Zap, Layers, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParleyStore } from '@/store/parleyStore';
import { Fixture } from '@/types/football';
import { formatTime } from '@/lib/utils';
import Image from 'next/image';

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fixture[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const picks = useParleyStore(s => s.picks);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setSearching(true); setOpen(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.fixtures ?? []);
    } finally { setSearching(false); }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050b14]/95 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        {/* Logo – solo mobile */}
        <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            Parley <span className="text-cyan-400">IQ</span>
          </span>
        </Link>

        {/* Desktop left: breadcrumb / title area */}
        <div className="hidden md:block shrink-0">
          <p className="text-xs text-slate-600 font-medium">Parley IQ</p>
        </div>

        {/* Buscador */}
        <div className="flex-1 relative max-w-xl mx-auto md:mx-0" ref={ref}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] focus-within:border-cyan-500/40 focus-within:bg-white/[0.07] transition-all">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              placeholder="Buscar equipo, liga o partido..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none min-w-0"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                >
                  <X className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {open && (results.length > 0 || searching) && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1.5 left-0 right-0 glass-card rounded-2xl border border-white/[0.08] overflow-hidden z-50 shadow-2xl shadow-black/60"
              >
                {searching && !results.length && (
                  <div className="px-4 py-3 text-sm text-slate-500">Buscando...</div>
                )}
                {results.map(f => (
                  <Link
                    key={f.id}
                    href={`/partidos/${f.id}`}
                    onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0"
                  >
                    <div className="relative w-5 h-5 shrink-0">
                      <Image src={f.homeTeam.logo} alt={f.homeTeam.name} fill className="object-contain" />
                    </div>
                    <span className="text-sm text-white flex-1 truncate">{f.homeTeam.name} vs {f.awayTeam.name}</span>
                    <span className="text-xs text-slate-500 shrink-0">{formatTime(f.date)}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Notificación bell */}
          <button className="w-9 h-9 rounded-xl glass-card border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          {/* Parley badge */}
          <Link
            href="/parley"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/15 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mi Parley</span>
            <AnimatePresence>
              {picks.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {picks.length}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </header>
  );
}
