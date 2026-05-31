export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high';

export interface KeyFactor {
  title: string;
  description: string;
  impact: ImpactLevel;
}

export interface ProbableScenario {
  scenario: string;
  estimatedProbability: number;
  confidence: ConfidenceLevel;
  risk: RiskLevel;
  reasoning: string;
}

export interface MarketAnalysis {
  market: string;
  estimatedProbability: number;
  confidence: ConfidenceLevel;
  risk: RiskLevel;
  reasoning: string;
}

export interface MarketToAvoid {
  market: string;
  risk: RiskLevel;
  reasoning: string;
}

export interface DangerZone {
  title: string;
  description: string;
}

export interface MatchAnalysis {
  fixtureId: string;
  matchName: string;
  analyzedAt: string;
  matchSummary: string;
  dataQualityScore: number;
  overallConfidence: ConfidenceLevel;
  keyFactors: KeyFactor[];
  probableScenarios: ProbableScenario[];
  marketsToConsider: MarketAnalysis[];
  marketsToAvoid: MarketToAvoid[];
  dangerZones: DangerZone[];
  dataLimitations: string[];
  responsibleConclusion: string;
}

export interface MatchAnalysisInput {
  match: {
    fixtureId: string;
    league: string;
    season: string;
    date: string;
    status: string;
    venue: string;
    homeTeam: {
      id: string;
      name: string;
      logo: string;
      standingPosition: string;
      recentForm: string[];
      homeStats: Record<string, unknown>;
      overallStats: Record<string, unknown>;
    };
    awayTeam: {
      id: string;
      name: string;
      logo: string;
      standingPosition: string;
      recentForm: string[];
      awayStats: Record<string, unknown>;
      overallStats: Record<string, unknown>;
    };
  };
  statistics: {
    headToHead: unknown[];
    goals: Record<string, unknown>;
    cleanSheets: Record<string, unknown>;
    btts: Record<string, unknown>;
    overUnder: Record<string, unknown>;
    xg: Record<string, unknown>;
    injuries: unknown[];
    lineups: unknown[];
    odds: unknown[];
  };
  marketsToAnalyze: string[];
  dataQuality: {
    hasRecentForm: boolean;
    hasH2H: boolean;
    hasOdds: boolean;
    hasInjuries: boolean;
    hasLineups: boolean;
  };
}
