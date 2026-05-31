'use client';

import { X } from 'lucide-react';
import { ParleyPick } from '@/types/parley';
import RiskBadge from '@/components/ui/RiskBadge';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { useParleyStore } from '@/store/parleyStore';

interface Props {
  pick: ParleyPick;
}

export default function ParleyPickCard({ pick }: Props) {
  const removePick = useParleyStore(s => s.removePick);

  return (
    <div className="glass-card rounded-xl p-3 border border-white/[0.06] group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-slate-500 truncate">{pick.league}</span>
          </div>
          <p className="text-white text-sm font-medium truncate">{pick.matchName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-cyan-400 font-semibold">{pick.market}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{pick.selection}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <RiskBadge risk={pick.risk} />
            <ConfidenceBadge confidence={pick.confidence} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => removePick(pick.id)}
            className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums text-white">{pick.odds.toFixed(2)}</div>
            <div className="text-[10px] text-slate-500">{pick.estimatedProbability.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
