'use client';

import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ParleyBuilder from '@/components/parley/ParleyBuilder';
import { useParleyStore } from '@/store/parleyStore';

export default function ParleyPage() {
  const picks = useParleyStore(s => s.picks);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-400" />
          Constructor de Parley
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Analiza el riesgo combinado de tus selecciones con IA.
        </p>
      </motion.div>

      {!picks.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 border border-white/[0.06]"
        >
          <h2 className="text-white font-semibold mb-2">¿Cómo usar el constructor?</h2>
          <ol className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
              Ve a un partido y selecciona la pestaña &quot;Análisis IA&quot;
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
              Ejecuta el análisis para ver mercados recomendados
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
              Agrega selecciones al parley desde la pestaña &quot;Parley&quot;
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">4</span>
              Vuelve aquí para analizar el riesgo combinado con IA
            </li>
          </ol>
          <Link
            href="/partidos"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/15 transition-all"
          >
            Explorar Partidos <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      <ParleyBuilder />
    </div>
  );
}
