'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fixture } from '@/types/football';
import MatchCard from '@/components/match/MatchCard';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Calendar } from 'lucide-react';

const TABS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'manana', label: 'Mañana' },
  { id: 'populares', label: '⚡ Populares' },
  { id: 'vivo', label: '🔴 En Vivo' },
  { id: 'proximos', label: '📅 Próximos' },
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
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function PartidosPage() {
  const [activeTab, setActiveTab] = useState('hoy');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getDateOffset(1));

  // Build 7-day strip: yesterday through +6
  const dateStrip = Array.from({ length: 7 }, (_, i) => getDateOffset(i - 1 + 1)); // tomorrow..+7
  // Actually: yesterday(−1), today(0), tomorrow(+1), +2..+5 — 7 days total starting yesterday
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
      if (activeTab === 'manana') {
        params.set('date', getDateOffset(1));
      }
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
      .catch(() => {
        if (!cancelled) {
          setError('Error al cargar partidos');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [activeTab, selectedDate]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-display text-xl font-bold text-white"
      >
        Partidos
      </motion.h1>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="tabs-scroll-fade -mx-4 px-4"
      >
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.95 }}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                : 'text-slate-500 hover:text-slate-300 glass-card border border-white/[0.06]'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Date strip — only when "Próximos" tab is active */}
      {activeTab === 'proximos' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' as const }}
          className="tabs-scroll-fade -mx-4 px-4"
        >
          {dateStripDays.map(dateStr => {
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-slate-500 hover:text-slate-300 glass-card border border-white/[0.06]'
                }`}
              >
                <span>{formatDateLabel(dateStr)}</span>
                <span className={`text-[10px] ${isSelected ? 'text-cyan-500/70' : 'text-slate-600'}`}>
                  {dateStr.slice(5)}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <MatchCardSkeleton key={i} />)}</div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      ) : fixtures.length > 0 ? (
        <div className="space-y-3">{fixtures.map((f, i) => <MatchCard key={f.id} fixture={f} index={i} />)}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Sin partidos en esta categoría</p>
        </motion.div>
      )}
    </div>
  );
}
