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
];

export default function PartidosPage() {
  const [activeTab, setActiveTab] = useState('hoy');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ tab: activeTab });
    if (activeTab === 'manana') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      params.set('date', d.toISOString().split('T')[0]);
    }
    fetch(`/api/fixtures?${params}`)
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
  }, [activeTab]);

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
