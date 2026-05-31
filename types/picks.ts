import { RiskLevel, ConfidenceLevel } from './analysis';

export interface DailyPick {
  id: string;
  fixtureId: string;
  matchName: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueLogo: string;
  matchDate: string;

  // The pick itself
  market: string;        // e.g. "Más de 2.5 goles"
  selection: string;     // e.g. "Sí"
  reasoning: string;     // AI explanation
  probability: number;   // 0-100
  impliedOdds: number;   // calculated from probability
  confidence: ConfidenceLevel;
  risk: RiskLevel;

  // Scoring
  valueScore: number;    // 0-100, how good the bet is (probability vs market odds)
}

export interface DailyPicksResult {
  generatedAt: string;
  date: string;
  totalMatchesAnalyzed: number;
  picks: DailyPick[];
  disclaimer: string;
}
