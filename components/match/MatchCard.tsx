'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Fixture } from '@/types/football';
import { formatTime, isLive, isFinished } from '@/lib/utils';

interface Props {
  fixture: Fixture;
  index?: number;
}

function FormPip({ result }: { result: 'W' | 'D' | 'L' }) {
  const color = result === 'W' ? '#2dd47e' : result === 'D' ? '#f0a93b' : '#f55066';
  return <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: color, opacity: 0.85 }} title={result} />;
}

function FormRow({ form }: { form: Fixture['homeForm'] }) {
  if (!form?.length) return null;
  return (
    <div className="flex gap-[3px] items-center">
      {form.slice(0, 5).map((f, i) => <FormPip key={i} result={f.result} />)}
    </div>
  );
}

function TeamLogo({ src, name, size = 34 }: { src: string; name: string; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src={src} alt={name} fill className="object-contain drop-shadow-sm"
        onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
      />
    </div>
  );
}

export default function MatchCard({ fixture, index = 0 }: Props) {
  const live     = isLive(fixture.status);
  const finished = isFinished(fixture.status);
  const hasScore = (live || finished) && fixture.homeGoals !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut', delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -1.5, transition: { duration: 0.15, ease: 'easeOut' } }}
      whileTap={{ scale: 0.995, transition: { duration: 0.08 } }}
    >
      <Link href={`/partidos/${fixture.id}`} className="block">
        <div
          className="rounded-2xl overflow-hidden transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.024)',
            border: live ? '1px solid rgba(45,212,126,0.20)' : '1px solid var(--line)',
          }}
          onMouseEnter={e => { if (!live) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line-2)'; }}
          onMouseLeave={e => { if (!live) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)'; }}
        >
          {live && <div className="live-bar" />}

          {/* ── Top: league + status (DM Mono tags) ── */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative w-3.5 h-3.5 shrink-0 opacity-70">
                <Image src={fixture.league.logo} alt={fixture.league.name} fill className="object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              </div>
              <span className="font-mono text-[10px] tracking-[0.06em] uppercase truncate" style={{ color: 'var(--text-2)' }}>
                {fixture.league.country} · {fixture.league.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {live && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[9.5px] tracking-[0.08em]"
                  style={{ background: 'var(--live-dim)', color: 'var(--live)', border: '1px solid rgba(45,212,126,0.22)' }}>
                  <span className="live-dot" />
                  {fixture.elapsed ? `${fixture.elapsed}'` : 'LIVE'}
                </span>
              )}
              {!live && !finished && (
                <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--text-2)' }}>
                  <Clock className="w-3 h-3" />
                  {formatTime(fixture.date)}
                </span>
              )}
              {finished && (
                <span className="font-mono text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--text-3)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
                  Final
                </span>
              )}
            </div>
          </div>

          {/* ── Teams + Score ── */}
          <div className="flex items-center gap-3 px-4 pb-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <TeamLogo src={fixture.homeTeam.logo} name={fixture.homeTeam.name} />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-white truncate leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fixture.homeTeam.name}
                </p>
                {fixture.homeStanding && (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>#{fixture.homeStanding}</p>
                )}
              </div>
            </div>

            <div className="shrink-0 text-center px-1" style={{ minWidth: 58 }}>
              {hasScore ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: live ? 'rgba(45,212,126,0.08)' : 'rgba(255,255,255,0.05)',
                    border: live ? '1px solid rgba(45,212,126,0.2)' : '1px solid var(--line-2)',
                  }}>
                  <span className="font-mono text-[19px] tabular-nums" style={{ color: live ? 'var(--live)' : 'var(--text-1)', lineHeight: 1 }}>
                    {fixture.homeGoals}
                  </span>
                  <span className="font-mono text-[12px]" style={{ color: 'var(--text-3)' }}>:</span>
                  <span className="font-mono text-[19px] tabular-nums" style={{ color: live ? 'var(--live)' : 'var(--text-1)', lineHeight: 1 }}>
                    {fixture.awayGoals}
                  </span>
                </div>
              ) : (
                <span className="font-mono text-[10px] tracking-[0.1em]" style={{ color: 'var(--text-3)' }}>VS</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-[14px] font-semibold text-white truncate leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fixture.awayTeam.name}
                </p>
                {fixture.awayStanding && (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>#{fixture.awayStanding}</p>
                )}
              </div>
              <TeamLogo src={fixture.awayTeam.logo} name={fixture.awayTeam.name} />
            </div>
          </div>

          {/* ── Form pips ── */}
          {(fixture.homeForm?.length || fixture.awayForm?.length) ? (
            <div className="flex items-center justify-between px-4 pb-3" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-3)' }}>L5</span>
                <FormRow form={fixture.homeForm} />
              </div>
              <div className="flex items-center gap-2">
                <FormRow form={fixture.awayForm} />
                <span className="font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-3)' }}>L5</span>
              </div>
            </div>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
