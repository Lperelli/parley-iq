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
  const color =
    result === 'W' ? '#22c55e' :
    result === 'D' ? '#f59e0b' : '#ef4444';
  return (
    <span
      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
      style={{ background: color, opacity: 0.8 }}
      title={result}
    />
  );
}

function FormRow({ form }: { form: Fixture['homeForm'] }) {
  if (!form?.length) return null;
  return (
    <div className="flex gap-[3px] items-center">
      {form.slice(0, 5).map((f, i) => <FormPip key={i} result={f.result} />)}
    </div>
  );
}

function TeamLogo({ src, name, size = 32 }: { src: string; name: string; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src={src} alt={name} fill
        className="object-contain drop-shadow-sm"
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
      transition={{ duration: 0.32, ease: 'easeOut', delay: index * 0.045 }}
      whileHover={{ y: -1.5, transition: { duration: 0.15, ease: 'easeOut' } }}
      whileTap={{ scale: 0.995, transition: { duration: 0.08 } }}
    >
      <Link href={`/partidos/${fixture.id}`} className="block">
        <div
          className="rounded-2xl overflow-hidden transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: live
              ? '1px solid rgba(34,197,94,0.18)'
              : '1px solid rgba(255,255,255,0.06)',
          }}
          onMouseEnter={e => {
            if (!live) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.10)';
          }}
          onMouseLeave={e => {
            if (!live) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          {/* Live accent line */}
          {live && <div className="live-bar" />}

          {/* ── Top row: league + time ─────────────── */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative w-3.5 h-3.5 shrink-0 opacity-70">
                <Image
                  src={fixture.league.logo} alt={fixture.league.name} fill
                  className="object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
              </div>
              <span
                className="text-[11px] font-medium truncate"
                style={{ color: 'var(--text-2)', fontFamily: 'Outfit, sans-serif' }}
              >
                {fixture.league.country} · {fixture.league.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {live && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'var(--live-dim)', color: 'var(--live)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span className="live-dot" />
                  {fixture.elapsed ? `${fixture.elapsed}'` : 'EN VIVO'}
                </span>
              )}
              {!live && !finished && (
                <span className="flex items-center gap-1 text-[11px] font-data"
                  style={{ color: 'var(--text-2)' }}>
                  <Clock className="w-3 h-3" />
                  {formatTime(fixture.date)}
                </span>
              )}
              {finished && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--text-3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Final
                </span>
              )}
            </div>
          </div>

          {/* ── Main: Teams + Score ────────────────── */}
          <div className="flex items-center gap-3 px-4 pb-3">

            {/* Home team */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <TeamLogo src={fixture.homeTeam.logo} name={fixture.homeTeam.name} size={34} />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-white truncate leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fixture.homeTeam.name}
                </p>
                {fixture.homeStanding && (
                  <p className="text-[10px] font-data" style={{ color: 'var(--text-3)' }}>
                    #{fixture.homeStanding}
                  </p>
                )}
              </div>
            </div>

            {/* Score / VS */}
            <div className="shrink-0 text-center px-1" style={{ minWidth: 56 }}>
              {hasScore ? (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: live ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)',
                    border: live ? '1px solid rgba(34,197,94,0.18)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    className="font-data font-semibold text-[20px] tabular-nums"
                    style={{ color: live ? 'var(--live)' : 'var(--text-1)', lineHeight: 1 }}
                  >
                    {fixture.homeGoals}
                  </span>
                  <span className="font-data text-[13px]" style={{ color: 'var(--text-3)' }}>:</span>
                  <span
                    className="font-data font-semibold text-[20px] tabular-nums"
                    style={{ color: live ? 'var(--live)' : 'var(--text-1)', lineHeight: 1 }}
                  >
                    {fixture.awayGoals}
                  </span>
                </div>
              ) : (
                <span className="font-data text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>VS</span>
              )}
            </div>

            {/* Away team */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-[14px] font-semibold text-white truncate leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fixture.awayTeam.name}
                </p>
                {fixture.awayStanding && (
                  <p className="text-[10px] font-data" style={{ color: 'var(--text-3)' }}>
                    #{fixture.awayStanding}
                  </p>
                )}
              </div>
              <TeamLogo src={fixture.awayTeam.logo} name={fixture.awayTeam.name} size={34} />
            </div>
          </div>

          {/* ── Form pips ─────────────────────────── */}
          {(fixture.homeForm?.length || fixture.awayForm?.length) && (
            <div className="flex items-center justify-between px-4 pb-3">
              <FormRow form={fixture.homeForm} />
              <div className="flex-1" />
              <FormRow form={fixture.awayForm} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
