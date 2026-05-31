'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fixture } from '@/types/football';
import MatchCard from '@/components/match/MatchCard';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Calendar } from 'lucide-react';

const ACCENT = '#c6f24e';

const TABS = [
  { id: 'hoy',      label: 'Hoy'      },
  { id: 'manana',   label: 'Mañana'   },
  { id: 'populares',label: 'Top'      },
  { id: 'vivo',     label: 'Live'     },
  { id: 'proximos', label: 'Próximos' },
];

function getDateOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDateLabel(dateStr: string): string {
  const today = getDateOffset(0);
  const tomorrow = getDateOffset(1);
  if (dateStr === today) return 'Hoy';
  if (dateStr === tomorrow) return 'Mañana';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
}

export default function PartidosPage() {
  const [activeTab, setActiveTab]       = useState('hoy');
  const [fixtures, setFixtures]         = useState<Fixture[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getDateOffset(1));

  const dateStripDays = Array.from({ length: 7 }, (_, i) => getDateOffset(i - 1));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let url = '';
    if (activeTab === 'proximos') {
      url = `/api/fixtures?date=${selectedDate}`;
    } else {
      const params = new URLSearchParams({ tab: activeTab });
      if (activeTab === 'manana') params.set('date', getDateOffset(1));
      url = `/api/fixtures?${params}`;
    }

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          if (data.error) setError(data.error);
          else setFixtures(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) { setError('Error al cargar partidos'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [activeTab, selectedDate]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-2">
        <span className="eyebrow">Calendario</span>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Partidos</h1>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="tabs-scroll-fade -mx-4 px-4">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileTap={{ scale: 0.95 }}
              className="shrink-0 px-4 py-1.5 rounded-lg whitespace-nowrap transition-all"
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
      </motion.div>

      {/* Date strip */}
      {activeTab === 'proximos' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: 'easeOut' as const }}
          className="tabs-scroll-fade -mx-4 px-4">
          {dateStripDays.map(dateStr => {
            const isSelected = selectedDate === dateStr;
            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                className="shrink-0 px-3 py-1.5 rounded-lg transition-all flex flex-col items-center gap-1 min-w-[58px]"
                style={{
                  background: isSelected ? ACCENT : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#0a0c08' : 'var(--text-2)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--line)',
                }}>
                <span className="font-mono text-[11px] tracking-wide uppercase">{formatDateLabel(dateStr)}</span>
                <span className="font-mono text-[9px]" style={{ color: isSelected ? 'rgba(10,12,8,0.6)' : 'var(--text-3)' }}>
                  {dateStr.slice(5)}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-2.5">{[1,2,3,4].map(i => <MatchCardSkeleton key={i} />)}</div>
      ) : error ? (
        <div className="flex flex-col items-center py-14 gap-2">
          <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--rose)' }}>Error</span>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{error}</p>
        </div>
      ) : fixtures.length > 0 ? (
        <div className="space-y-2.5">{fixtures.map((f, i) => <MatchCard key={f.id} fixture={f} index={i} />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
            <Calendar className="w-5 h-5" style={{ color: 'var(--text-3)' }} />
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>Sin partidos en esta categoría</p>
        </motion.div>
      )}
    </div>
  );
}
