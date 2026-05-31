'use client';

import { useState, useEffect, use } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, BarChart2, GitCompare,
  Brain, Layers, DollarSign, Plus, Check, TrendingUp,
  Target, Shield, Activity,
} from 'lucide-react';
import { Fixture } from '@/types/football';
import { MarketAnalysis } from '@/types/analysis';
import { ParleyPick } from '@/types/parley';
import { MatchCardSkeleton } from '@/components/ui/LoadingSkeleton';
import AIAnalysisCard from '@/components/analysis/AIAnalysisCard';
import StatCard from '@/components/analysis/StatCard';
import LeagueBadge from '@/components/match/LeagueBadge';
import RiskBadge from '@/components/ui/RiskBadge';
import { useParleyStore } from '@/store/parleyStore';
import { formatDateTime, getStatusLabel, isLive, isFinished, cn, generateId } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const TABS = ['visión', 'stats', 'forma', 'h2h', 'cuotas', 'análisis ia', 'parley'] as const;
type Tab = typeof TABS[number];

const tabIcons: Record<Tab, React.ElementType> = {
  'visión': Activity,
  'stats': BarChart2,
  'forma': TrendingUp,
  'h2h': GitCompare,
  'cuotas': DollarSign,
  'análisis ia': Brain,
  'parley': Layers,
};

function Pill({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass-card rounded-xl px-3 py-2.5 space-y-0.5">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-base font-bold tabular-nums ${accent ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function StatBar({ label, homeVal, awayVal, suffix = '' }: { label: string; homeVal: number; awayVal: number; suffix?: string }) {
  const total = homeVal + awayVal;
  const homePct = total > 0 ? (homeVal / total) * 100 : 50;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white font-semibold tabular-nums">{homeVal}{suffix}</span>
        <span className="text-slate-500 text-[10px] text-center px-2">{label}</span>
        <span className="text-white font-semibold tabular-nums">{awayVal}{suffix}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div className="rounded-l-full bg-cyan-500/60 transition-all duration-700" style={{ width: `${homePct}%` }} />
        <div className="flex-1 rounded-r-full bg-slate-600/40" />
      </div>
    </div>
  );
}

function MarketRow({ market, fixtureId, matchName, league }: {
  market: MarketAnalysis & { selection?: string; odds?: number };
  fixtureId: string; matchName: string; league: string;
}) {
  const { picks, addPick } = useParleyStore();
  const { toast } = useToast();
  const added = picks.some(p => p.fixtureId === fixtureId && p.market === market.market);

  function handleAdd() {
    const pick: Omit<ParleyPick, 'id' | 'addedAt'> = {
      fixtureId, matchName, league,
      market: market.market,
      selection: market.market,
      odds: market.odds ?? parseFloat((1 / (market.estimatedProbability / 100)).toFixed(2)),
      estimatedProbability: market.estimatedProbability,
      confidence: market.confidence,
      risk: market.risk,
      aiReasoning: market.reasoning,
    };
    addPick(pick);
    toast('Selección agregada al parley', 'success');
  }

  return (
    <div className="glass-card rounded-xl p-3 border border-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-white text-sm font-medium truncate">{market.market}</p>
            <RiskBadge risk={market.risk} />
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${market.estimatedProbability}%` }} />
            </div>
            <span className="text-xs text-cyan-400 font-bold tabular-nums shrink-0">{market.estimatedProbability.toFixed(0)}%</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">{market.reasoning}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            added
              ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
              : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 active:scale-95'
          }`}
        >
          {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('visión');

  useEffect(() => {
    fetch(`/api/fixture/${id}`)
      .then(r => r.json())
      .then(data => { data.error ? setError(data.error) : setFixture(data); setLoading(false); })
      .catch(() => { setError('Error al cargar el partido'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="max-w-xl mx-auto px-4 py-5 space-y-3">{[1,2,3].map(i => <MatchCardSkeleton key={i} />)}</div>;
  if (error || !fixture) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <p className="text-rose-400 mb-4">{error ?? 'Partido no encontrado'}</p>
      <Link href="/partidos" className="inline-flex items-center gap-2 text-cyan-400 text-sm hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
    </div>
  );

  const live = isLive(fixture.status);
  const finished = isFinished(fixture.status);
  const matchName = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
  const hs = fixture.homeStats;
  const as_ = fixture.awayStats;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
      {/* Back */}
      <Link href="/partidos" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Partidos
      </Link>

      {/* Match Header Card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <LeagueBadge league={fixture.league} />
            <div>
              {live && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EN VIVO {fixture.elapsed && `${fixture.elapsed}'`}
                </span>
              )}
              {!live && !finished && <span className="text-xs text-slate-500">{formatDateTime(fixture.date)}</span>}
              {finished && <span className="text-xs text-slate-500 font-medium">Partido Finalizado</span>}
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                <Image src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} fill className="object-contain" onError={e => { (e.target as HTMLImageElement).style.opacity='0'; }} />
              </div>
              <div className="text-center w-full px-1">
                <p className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2">{fixture.homeTeam.name}</p>
                {fixture.homeStanding && <p className="text-[10px] text-slate-600 mt-0.5">#{fixture.homeStanding} en liga</p>}
              </div>
            </div>

            {/* Score */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              {(live || finished) && fixture.homeGoals !== undefined ? (
                <div className={cn(
                  'px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl',
                  live ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.05] border border-white/[0.08]'
                )}>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                    {fixture.homeGoals} – {fixture.awayGoals}
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <span className="font-display text-xl sm:text-2xl font-bold text-slate-700">VS</span>
                </div>
              )}
              <p className="text-[10px] text-slate-600">{getStatusLabel(fixture.status, fixture.elapsed)}</p>
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                <Image src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} fill className="object-contain" onError={e => { (e.target as HTMLImageElement).style.opacity='0'; }} />
              </div>
              <div className="text-center w-full px-1">
                <p className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2">{fixture.awayTeam.name}</p>
                {fixture.awayStanding && <p className="text-[10px] text-slate-600 mt-0.5">#{fixture.awayStanding} en liga</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.04]">
          {fixture.venue && (
            <span className="flex items-center gap-1.5 text-[11px] text-slate-600 min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{fixture.venue}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 shrink-0">
            <Calendar className="w-3 h-3 shrink-0" />
            {formatDateTime(fixture.date)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-scroll-fade -mx-4 px-4">
        {TABS.map(tab => {
          const Icon = tabIcons[tab];
          return (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap',
                activeTab === tab
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-300 glass-card border border-white/[0.05]'
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {tab}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          {/* VISIÓN */}
          {activeTab === 'visión' && (
            <>
              {/* Key numbers grid */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Resumen del partido
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Pill label="Pos. Local" value={fixture.homeStanding ? `#${fixture.homeStanding}` : 'N/D'} />
                  <Pill label="Pos. Visitante" value={fixture.awayStanding ? `#${fixture.awayStanding}` : 'N/D'} />
                  <Pill label="Prom. goles (local)" value={hs?.home.avgGoalsScored.toFixed(1) ?? 'N/D'} accent />
                  <Pill label="Prom. goles (visit.)" value={as_?.away.avgGoalsScored.toFixed(1) ?? 'N/D'} accent />
                </div>
              </div>

              {/* Head to head preview */}
              {fixture.headToHead?.length ? (
                <div className="glass-card rounded-2xl p-4 space-y-2">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-violet-400" /> Últimos enfrentamientos
                  </h3>
                  {fixture.headToHead.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-[10px] text-slate-600 shrink-0 w-16">{h.date.slice(0, 7)}</span>
                      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                        <span className={cn('text-[11px] font-medium truncate', h.winner === 'home' ? 'text-emerald-400' : 'text-slate-400')}>{h.homeTeam}</span>
                        <span className="text-white text-xs font-bold tabular-nums shrink-0">{h.homeGoals}–{h.awayGoals}</span>
                        <span className={cn('text-[11px] font-medium truncate text-right', h.winner === 'away' ? 'text-emerald-400' : 'text-slate-400')}>{h.awayTeam}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Trend indicators */}
              {hs && as_ && (
                <div className="glass-card rounded-2xl p-4 space-y-3">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" /> Indicadores clave
                  </h3>
                  <div className="space-y-3">
                    <StatBar label="BTTS %" homeVal={hs.home.bttsPercentage} awayVal={as_.away.bttsPercentage} suffix="%" />
                    <StatBar label="+2.5 goles %" homeVal={hs.home.over25Percentage} awayVal={as_.away.over25Percentage} suffix="%" />
                    <StatBar label="Valla invicta %" homeVal={hs.home.cleanSheetPercentage} awayVal={as_.away.cleanSheetPercentage} suffix="%" />
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/70 leading-relaxed">
                  Solo análisis estadístico. No es un consejo de apuesta. La probabilidad no garantiza ningún resultado.
                </p>
              </div>
            </>
          )}

          {/* STATS */}
          {activeTab === 'stats' && hs && as_ && (
            <div className="glass-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-cyan-400 font-semibold">{fixture.homeTeam.name}</span>
                <span className="text-slate-500">Estadísticas</span>
                <span className="text-white font-semibold">{fixture.awayTeam.name}</span>
              </div>
              <StatCard label="Goles marcados" homeValue={hs.home.goalsScored} awayValue={as_.away.goalsScored} />
              <StatCard label="Goles recibidos" homeValue={hs.home.goalsConceded} awayValue={as_.away.goalsConceded} />
              <StatCard label="Prom. goles marcados" homeValue={hs.home.avgGoalsScored.toFixed(1)} awayValue={as_.away.avgGoalsScored.toFixed(1)} />
              <StatCard label="Prom. goles recibidos" homeValue={hs.home.avgGoalsConceded.toFixed(1)} awayValue={as_.away.avgGoalsConceded.toFixed(1)} />
              <StatCard label="Valla invicta %" homeValue={`${hs.home.cleanSheetPercentage}%`} awayValue={`${as_.away.cleanSheetPercentage}%`} />
              <StatCard label="BTTS %" homeValue={`${hs.home.bttsPercentage}%`} awayValue={`${as_.away.bttsPercentage}%`} />
              <StatCard label="+2.5 goles %" homeValue={`${hs.home.over25Percentage}%`} awayValue={`${as_.away.over25Percentage}%`} />
              <StatCard label="+1.5 goles %" homeValue={`${hs.home.over15Percentage}%`} awayValue={`${as_.away.over15Percentage}%`} />
              {hs.overall.xgFor && as_.overall.xgFor && (
                <StatCard label="xG (season)" homeValue={hs.overall.xgFor?.toFixed(2) ?? 'N/D'} awayValue={as_.overall.xgFor?.toFixed(2) ?? 'N/D'} />
              )}
            </div>
          )}

          {/* FORMA */}
          {activeTab === 'forma' && (
            <div className="space-y-3">
              {[
                { team: fixture.homeTeam, form: fixture.homeForm, context: 'Local' },
                { team: fixture.awayTeam, form: fixture.awayForm, context: 'Visitante' },
              ].map(({ team, form, context }) => (
                <div key={team.id} className="glass-card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6"><Image src={team.logo} alt={team.name} fill className="object-contain" /></div>
                      <span className="text-white font-semibold text-sm">{team.name}</span>
                      <span className="text-[10px] text-slate-600">({context})</span>
                    </div>
                    <div className="flex gap-0.5">
                      {form?.slice(0, 5).map((f, i) => (
                        <span key={i} className={cn('w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center', f.result === 'W' ? 'bg-emerald-500/20 text-emerald-400' : f.result === 'D' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400')}>{f.result}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {form?.map((match, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.03] last:border-0">
                        <span className={cn('w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0', match.result === 'W' ? 'bg-emerald-500/20 text-emerald-400' : match.result === 'D' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400')}>{match.result}</span>
                        <span className="text-slate-400 flex-1 truncate">{match.isHome ? 'vs' : 'en'} {match.opponent}</span>
                        <span className="text-white font-semibold tabular-nums shrink-0">{match.goalsScored}–{match.goalsConceded}</span>
                        <span className="text-slate-600 shrink-0 hidden xs:inline">{match.competition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* H2H */}
          {activeTab === 'h2h' && (
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-violet-400" /> Historial de enfrentamientos
              </h3>
              {!fixture.headToHead?.length ? (
                <p className="text-slate-500 text-sm py-4 text-center">Sin datos de enfrentamientos directos</p>
              ) : (
                <div className="space-y-1.5">
                  {fixture.headToHead.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-600 shrink-0 w-14">{h.date.slice(0, 7)}</span>
                      <div className="flex-1 flex items-center justify-between gap-1.5 min-w-0">
                        <span className={cn('text-xs font-medium flex-1 truncate', h.winner === 'home' ? 'text-emerald-400' : 'text-slate-400')}>{h.homeTeam}</span>
                        <span className="text-white text-sm font-bold tabular-nums shrink-0 px-2">{h.homeGoals}–{h.awayGoals}</span>
                        <span className={cn('text-xs font-medium flex-1 truncate text-right', h.winner === 'away' ? 'text-emerald-400' : 'text-slate-400')}>{h.awayTeam}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUOTAS */}
          {activeTab === 'cuotas' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
                <DollarSign className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-300/70 leading-relaxed">Cuotas referenciales únicamente. No promovemos ninguna casa de apuestas.</p>
              </div>
              <div className="glass-card rounded-2xl p-4 space-y-2">
                {!fixture.odds?.length ? (
                  <p className="text-slate-500 text-sm">Sin cuotas disponibles</p>
                ) : (
                  fixture.odds.map((odd, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-wide">{odd.market}</p>
                        <p className="text-white text-sm font-medium mt-0.5">{odd.selection}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg tabular-nums">{odd.decimal.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-500">{odd.impliedProbability}% implícita</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* AI ANALYSIS */}
          {activeTab === 'análisis ia' && (
            <AIAnalysisCard fixtureId={fixture.id} matchName={matchName} />
          )}

          {/* PARLEY */}
          {activeTab === 'parley' && (
            <div className="space-y-3">
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" /> Agregar al Parley
                </h3>
                <p className="text-xs text-slate-500">Selecciona mercados de las cuotas disponibles para agregar a tu parley.</p>
                {fixture.odds?.length ? (
                  <div className="space-y-2">
                    {fixture.odds.slice(0, 8).map((odd, i) => (
                      <MarketRow
                        key={i}
                        market={{
                          market: `${odd.market}: ${odd.selection}`,
                          estimatedProbability: odd.impliedProbability,
                          confidence: odd.impliedProbability >= 60 ? 'high' : odd.impliedProbability >= 40 ? 'medium' : 'low',
                          risk: odd.impliedProbability < 30 ? 'high' : odd.impliedProbability < 50 ? 'medium' : 'low',
                          reasoning: `Prob. implícita: ${odd.impliedProbability}% · Cuota: ${odd.decimal.toFixed(2)}`,
                          selection: odd.selection,
                          odds: odd.decimal,
                        }}
                        fixtureId={fixture.id}
                        matchName={matchName}
                        league={fixture.league.name}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Sin cuotas disponibles para este partido.</p>
                )}
              </div>
              <Link href="/parley" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-semibold hover:bg-violet-500/15 transition-all">
                <Layers className="w-4 h-4" /> Ver Constructor de Parley
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
