'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParleyPick, SavedParley, SavedAnalysis } from '@/types/parley';
import { MatchAnalysis } from '@/types/analysis';
import { generateId } from '@/lib/utils';

interface ParleyStore {
  picks: ParleyPick[];
  stake: number;
  savedParleys: SavedParley[];
  savedAnalyses: SavedAnalysis[];

  addPick: (pick: Omit<ParleyPick, 'id' | 'addedAt'>) => void;
  removePick: (id: string) => void;
  clearPicks: () => void;
  setStake: (stake: number) => void;

  saveParley: (parley: Omit<SavedParley, 'id' | 'createdAt'>) => string;
  removeParley: (id: string) => void;

  saveAnalysis: (analysis: MatchAnalysis, matchName: string, league: string) => void;
  removeAnalysis: (id: string) => void;
}

export const useParleyStore = create<ParleyStore>()(
  persist(
    (set, get) => ({
      picks: [],
      stake: 10,
      savedParleys: [],
      savedAnalyses: [],

      addPick: (pick) => {
        const existing = get().picks.find(
          p => p.fixtureId === pick.fixtureId && p.market === pick.market
        );
        if (existing) return;
        set(state => ({
          picks: [...state.picks, { ...pick, id: generateId(), addedAt: new Date().toISOString() }],
        }));
      },

      removePick: (id) =>
        set(state => ({ picks: state.picks.filter(p => p.id !== id) })),

      clearPicks: () => set({ picks: [] }),

      setStake: (stake) => set({ stake }),

      saveParley: (parley) => {
        const id = generateId();
        set(state => ({
          savedParleys: [
            { ...parley, id, createdAt: new Date().toISOString() },
            ...state.savedParleys,
          ],
        }));
        return id;
      },

      removeParley: (id) =>
        set(state => ({ savedParleys: state.savedParleys.filter(p => p.id !== id) })),

      saveAnalysis: (analysis, matchName, league) => {
        set(state => ({
          savedAnalyses: [
            {
              id: generateId(),
              fixtureId: analysis.fixtureId,
              matchName,
              league,
              analysis,
              createdAt: new Date().toISOString(),
            },
            ...state.savedAnalyses.filter(a => a.fixtureId !== analysis.fixtureId),
          ],
        }));
      },

      removeAnalysis: (id) =>
        set(state => ({ savedAnalyses: state.savedAnalyses.filter(a => a.id !== id) })),
    }),
    {
      name: 'parley-iq-store',
    }
  )
);
