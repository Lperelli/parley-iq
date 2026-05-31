'use client';

import { Settings, Database, Bot, Shield, Trash2, Info, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const leagues = [
  { name: 'La Liga', country: 'España' },
  { name: 'Premier League', country: 'Inglaterra' },
  { name: 'Serie A', country: 'Italia' },
  { name: 'Bundesliga', country: 'Alemania' },
  { name: 'Ligue 1', country: 'Francia' },
  { name: 'Champions League', country: 'Europa' },
];

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <Icon className="w-4 h-4 text-cyan-400" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, action }: { label: string; value?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.03] last:border-0">
      <div>
        <p className="text-sm text-white">{label}</p>
        {value && <p className="text-xs text-slate-500 mt-0.5">{value}</p>}
      </div>
      {action ?? <ChevronRight className="w-4 h-4 text-slate-600" />}
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" /> Configuración
        </h1>
      </motion.div>

      <Section title="Proveedor de Datos" icon={Database}>
        <Row label="Fuente de datos actual" value="Mock (sin API key)" />
        <Row
          label="FOOTBALL_API_KEY"
          value="Agrega tu clave en .env.local para datos reales"
        />
        <Row
          label="Modelo de IA"
          value="llama-3.3-70b-versatile (Groq)"
        />
        <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/10">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/70 leading-relaxed">
              Para usar datos reales, agrega <code className="font-mono-custom text-amber-300">FOOTBALL_API_KEY</code> y{' '}
              <code className="font-mono-custom text-amber-300">GROQ_API_KEY</code> en tu archivo <code className="font-mono-custom text-amber-300">.env.local</code>
            </p>
          </div>
        </div>
      </Section>

      <Section title="IA y Análisis" icon={Bot}>
        <Row
          label="GROQ_API_KEY"
          value="Configura en .env.local para activar el análisis IA"
        />
        <Row label="Caché de análisis IA" value="2 horas" />
        <Row label="Caché de fixtures" value="10 minutos" />
        <Row
          label="Modo de datos"
          value="Mock activado (datos de ejemplo)"
        />
      </Section>

      <Section title="Ligas Populares" icon={Settings}>
        <div className="divide-y divide-white/[0.03]">
          {leagues.map(l => (
            <div key={l.name} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-sm text-white">{l.name}</p>
                <p className="text-xs text-slate-500">{l.country}</p>
              </div>
              <div className="w-8 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-end pr-0.5">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Almacenamiento" icon={Trash2}>
        <Row
          label="Limpiar análisis guardados"
          action={
            <button className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/15 transition-all">
              Limpiar
            </button>
          }
        />
        <Row
          label="Limpiar parleys guardados"
          action={
            <button className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/15 transition-all">
              Limpiar
            </button>
          }
        />
        <Row label="Almacenamiento usado" value="Local Storage (navegador)" />
      </Section>

      <Section title="Juego Responsable" icon={Shield}>
        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-white font-medium">Parley IQ no es una plataforma de apuestas</p>
          <div className="space-y-2">
            {[
              'Parley IQ proporciona análisis estadístico únicamente.',
              'Ninguna predicción es garantizada. Los resultados deportivos son inciertos.',
              'No uses esta información como asesoría financiera o de apuestas.',
              'Solo arriesga dinero que puedas permitirte perder.',
              'Si crees que tienes un problema con el juego, busca ayuda profesional.',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 mt-1.5" />
                <p className="text-xs text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="text-center py-4">
        <p className="text-slate-600 text-xs">Parley IQ v0.1.0 · MVP</p>
        <p className="text-slate-700 text-xs">Construido con Next.js, TypeScript, Groq AI</p>
      </div>
    </div>
  );
}
