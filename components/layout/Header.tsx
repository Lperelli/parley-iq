'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, X, Layers, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParleyStore } from '@/store/parleyStore';
import { Fixture } from '@/types/football';
import { formatTime } from '@/lib/utils';
import Image from 'next/image';

export default function Header() {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<Fixture[]>([]);
  const [searching, setSearching] = useState(false);
  const [open,      setOpen]      = useState(false);
  const ref   = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const picks = useParleyStore(s => s.picks);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setSearching(true); setOpen(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.fixtures ?? []);
    } finally { setSearching(false); }
  }

  return (
    <header className="sticky top-0 z-40"
      style={{
        background: 'rgba(7,10,16,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
      <div className="flex items-center gap-3 px-4 md:px-5 h-[54px]">

        {/* Mobile logo */}
        <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
          <div className="relative w-7 h-7 shrink-0">
            <div className="absolute inset-0 rounded-md" style={{ background: '#a3fb5a' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9.5 5.5H12L8.5 8.5L10 13L7 10.5L4 13L5.5 8.5L2 5.5H4.5L7 1Z"
                  fill="#06090e" />
              </svg>
            </div>
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight text-white">
            Parley<span style={{ color: '#a3fb5a' }}>IQ</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 relative max-w-lg md:mx-auto" ref={ref}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
            style={{
              background: open ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${open ? 'rgba(163,251,90,0.25)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-2)' }} />
            <input
              ref={input}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              placeholder="Buscar partido, equipo o liga..."
              className="flex-1 bg-transparent text-[13px] outline-none min-w-0"
              style={{ color: 'var(--text-1)', fontFamily: 'Outfit, sans-serif' }}
            />
            <AnimatePresence>
              {query ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                  className="transition-colors"
                  style={{ color: 'var(--text-2)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              ) : (
                <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ color: 'var(--text-3)', border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'Outfit, sans-serif' }}>
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              )}
            </AnimatePresence>
          </div>

          {/* Results dropdown */}
          <AnimatePresence>
            {open && (results.length > 0 || searching) && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden z-50"
                style={{
                  background: '#0d1117',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              >
                {searching && !results.length && (
                  <div className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-2)' }}>
                    Buscando...
                  </div>
                )}
                {results.map((f, i) => (
                  <Link
                    key={f.id}
                    href={`/partidos/${f.id}`}
                    onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{ borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.035)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <div className="relative w-5 h-5 shrink-0">
                      <Image src={f.homeTeam.logo} alt={f.homeTeam.name} fill className="object-contain" />
                    </div>
                    <span className="text-[13px] text-white flex-1 truncate">
                      {f.homeTeam.name} <span style={{ color: 'var(--text-2)' }}>vs</span> {f.awayTeam.name}
                    </span>
                    <span className="text-[11px] font-data shrink-0" style={{ color: 'var(--text-2)' }}>
                      {formatTime(f.date)}
                    </span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/parley"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
            style={picks.length > 0 ? {
              background: 'rgba(163,251,90,0.1)',
              border: '1px solid rgba(163,251,90,0.2)',
              color: '#a3fb5a',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'var(--text-2)',
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mi Parley</span>
            <AnimatePresence>
              {picks.length > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center leading-none"
                  style={{ background: '#a3fb5a', color: '#06090e' }}
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
