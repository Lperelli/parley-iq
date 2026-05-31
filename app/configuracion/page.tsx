'use client';

import { Bell, Shield, Trash2, ChevronRight, Globe, Star, BookOpen, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParleyStore } from '@/store/parleyStore';

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const, delay: i * 0.06 } },
});

const leagues = [
  { name: 'La Liga', country: 'España', active: true },
  { name: 'Premier League', country: 'Inglaterra', active: true },
  { name: 'Serie A', country: 'Italia', active: true },
  { name: 'Bundesliga', country: 'Alemania', active: true },
  { name: 'Ligue 1', country: 'Francia', active: true },
  { name: 'Champions League', country: 'Europa', active: true },
];

function Section({ title, icon: Icon, color = 'text-cyan-400', children }: {
  title: string; icon: React.ElementType; color?: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <Icon className={`w-4 h-4 ${color}`} />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, sublabel, action }: { label: string; sublabel?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.03] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{label}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
      <div className="shrink-0 ml-3">
        {action ?? <ChevronRight className="w-4 h-4 text-slate-700" />}
      </div>
    </div>
  );
}

function Toggle({ active = true }: { active?: boolean }) {
  return (
    <div className={`w-9 h-5 rounded-full flex items-center transition-colors ${active ? 'bg-cyan-500' : 'bg-slate-700'} px-0.5`}>
      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  );
}

export default function ConfiguracionPage() {
  const { savedAnalyses, savedParleys, clearPicks } = useParleyStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 md:max-w-3xl">
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400 text-sm mt-0.5">Personaliza tu experiencia en Parley IQ</p>
      </motion.div>

      {/* Notificaciones */}
      <motion.div {...fadeUp(1)}>
        <Section title="Notificaciones" icon={Bell} color="text-amber-400">
          <Row label="Partidos en vivo" sublabel="Alertas cuando empieza un partido popular" action={<Toggle active={true} />} />
          <Row label="Nuevos análisis" sublabel="Cuando se actualicen las estadísticas" action={<Toggle active={false} />} />
          <Row label="Resumen diario" sublabel="Mejores partidos del día cada mañana" action={<Toggle active={true} />} />
        </Section>
      </motion.div>

      {/* Ligas favoritas */}
      <motion.div {...fadeUp(2)}>
        <Section title="Ligas disponibles" icon={Globe} color="text-violet-400">
          <div className="divide-y divide-white/[0.03]">
            {leagues.map(l => (
              <div key={l.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-white">{l.name}</p>
                  <p className="text-xs text-slate-500">{l.country}</p>
                </div>
                <Toggle active={l.active} />
              </div>
            ))}
          </div>
        </Section>
      </motion.div>

      {/* Cuenta / Premium placeholder */}
      <motion.div {...fadeUp(3)}>
        <Section title="Plan actual" icon={Star} color="text-amber-400">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Parley IQ Free</p>
                <p className="text-slate-500 text-xs">Análisis ilimitados con datos de ejemplo</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">FREE</span>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] transition-all">
              Próximamente: Plan Pro con datos en vivo
            </button>
          </div>
        </Section>
      </motion.div>

      {/* Almacenamiento */}
      <motion.div {...fadeUp(4)}>
        <Section title="Mis datos" icon={Trash2} color="text-rose-400">
          <Row
            label="Análisis guardados"
            sublabel={`${savedAnalyses.length} guardado${savedAnalyses.length !== 1 ? 's' : ''}`}
            action={
              <button
                onClick={() => {}}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/15 transition-all"
              >
                Limpiar
              </button>
            }
          />
          <Row
            label="Parleys guardados"
            sublabel={`${savedParleys.length} guardado${savedParleys.length !== 1 ? 's' : ''}`}
            action={
              <button
                onClick={clearPicks}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/15 transition-all"
              >
                Limpiar
              </button>
            }
          />
        </Section>
      </motion.div>

      {/* Juego Responsable */}
      <motion.div {...fadeUp(5)}>
        <Section title="Juego Responsable" icon={Shield} color="text-emerald-400">
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm text-white font-medium">Parley IQ no es una plataforma de apuestas</p>
            <div className="space-y-2">
              {[
                'Parley IQ proporciona análisis estadístico únicamente.',
                'Ninguna predicción es garantizada. Los resultados son inciertos.',
                'No uses esta información como asesoría financiera.',
                'Solo arriesga dinero que puedas permitirte perder.',
                'Si crees que tienes un problema con el juego, busca ayuda.',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500/40 shrink-0 mt-1.5" />
                  <p className="text-xs text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Links */}
      <motion.div {...fadeUp(6)}>
        <Section title="Soporte" icon={MessageCircle} color="text-slate-400">
          <Row label="Centro de ayuda" action={<ChevronRight className="w-4 h-4 text-slate-600" />} />
          <Row label="Términos y condiciones" action={<ChevronRight className="w-4 h-4 text-slate-600" />} />
          <Row label="Política de privacidad" action={<ChevronRight className="w-4 h-4 text-slate-600" />} />
        </Section>
      </motion.div>

      <motion.div {...fadeUp(7)} className="text-center py-3 space-y-1">
        <p className="text-slate-700 text-xs">Parley IQ v1.0</p>
        <p className="text-slate-800 text-xs">© 2025 Parley IQ. Todos los derechos reservados.</p>
      </motion.div>
    </div>
  );
}
