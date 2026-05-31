'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { Fixture } from '@/types/football';
import { formatTime, isLive, isFinished, cn } from '@/lib/utils';

interface Props {
  fixture: Fixture;
  index?: number;
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  return (
    <span
      className={cn(
        'w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center leading-none shrink-0',
        result === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
        result === 'D' ? 'bg-amber-500/20 text-amber-400' :
        'bg-rose-500/20 text-rose-400'
      )}
    >
      {result}
    </span>
  );
}

function FormRow({ form }: { form: Fixture['homeForm'] }) {
  if (!form?.length) return <span className="text-[10px] text-slate-700">Sin datos</span>;
  return (
    <div className="flex gap-0.5 items-center">
      {form.slice(0, 5).map((f, i) => <FormDot key={i} result={f.result} />)}
    </div>
  );
}

function TeamLogo({ src, name }: { src: string; name: string }) {
  return (
    <div className="relative w-8 h-8 shrink-0">
      <Image
        src={src} alt={name} fill
        className="object-contain drop-shadow-sm"
        onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
      />
    </div>
  );
}

export default function MatchCard({ fixture, index = 0 }: Props) {
  const live = isLive(fixture.status);
  const finished = isFinished(fixture.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99, transition: { duration: 0.1 } }}
    >
      <Link href={`/partidos/${fixture.id}`} className="block">
        <div className={cn(
          'glass-card rounded-2xl overflow-hidden transition-colors duration-200 hover:border-cyan-500/20',
          live ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' : ''
        )}>
          {/* Live pulse bar */}
          {live && (
            <div className="h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 animate-pulse" />
          )}

          {/* League row */}
          <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative w-3.5 h-3.5 shrink-0">
                <Image
                  src={fixture.league.logo} alt={fixture.league.name} fill
                  className="object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {fixture.league.country} · <span className="text-slate-400">{fixture.league.name}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {live && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {fixture.elapsed ? `${fixture.elapsed}'` : 'VIVO'}
                </span>
              )}
              {!live && !finished && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {formatTime(fixture.date)}
                </span>
              )}
              {finished && <span className="text-[11px] text-slate-500 font-medium">Final</span>}
              {fixture.isPopular && !live && (
                <Zap className="w-3 h-3 text-amber-400" fill="currentColor" />
              )}
            </div>
          </div>

          {/* Teams + Score */}
          <div className="px-3 sm:px-4 pb-3">
            <div className="flex items-center gap-2">
              {/* Home */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TeamLogo src={fixture.homeTeam.logo} name={fixture.homeTeam.name} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{fixture.homeTeam.name}</p>
                  {fixture.homeStanding && (
                    <p className="text-[10px] text-slate-600">#{fixture.homeStanding}</p>
                  )}
                </div>
              </div>

              {/* Score / VS */}
              <div className="shrink-0 px-1 text-center min-w-[54px]">
                {(live || finished) && fixture.homeGoals !== undefined ? (
                  <div className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-display font-bold text-xl text-white',
                    live
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-white/[0.06] border border-white/[0.08]'
                  )}>
                    <span className="tabular-nums">{fixture.homeGoals}</span>
                    <span className="text-slate-600 text-sm font-normal">-</span>
                    <span className="tabular-nums">{fixture.awayGoals}</span>
                  </div>
                ) : (
                  <span className="text-slate-700 font-bold text-sm">VS</span>
                )}
              </div>

              {/* Away */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <div className="min-w-0 text-right">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{fixture.awayTeam.name}</p>
                  {fixture.awayStanding && (
                    <p className="text-[10px] text-slate-600">#{fixture.awayStanding}</p>
                  )}
                </div>
                <TeamLogo src={fixture.awayTeam.logo} name={fixture.awayTeam.name} />
              </div>
            </div>
          </div>

          {/* Form row */}
          {(fixture.homeForm || fixture.awayForm) && (
            <div className="flex items-center justify-between px-3 sm:px-4 pb-3 gap-2">
              <FormRow form={fixture.homeForm} />
              <div className="flex items-center gap-2 shrink-0">
                {fixture.homeStats?.home?.over25Percentage !== undefined && (
                  <span className="text-[10px] text-slate-600">
                    +2.5: <span className="text-slate-500">{fixture.homeStats.home.over25Percentage}%</span>
                  </span>
                )}
              </div>
              <FormRow form={fixture.awayForm} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
