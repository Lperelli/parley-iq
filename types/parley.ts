import { RiskLevel, ConfidenceLevel } from './analysis';

export interface ParleyPick {
  id: string;
  fixtureId: string;
  matchName: string;
  league: string;
  market: string;
  selection: string;
  odds: number;
  estimatedProbability: number;
  confidence: ConfidenceLevel;
  risk: RiskLevel;
  aiReasoning: string;
  addedAt: string;
}

export interface ParleyCalculation {
  picks: ParleyPick[];
  legs: number;
  combinedOdds: number;
  combinedProbability: number;
  potentialReturn: number;
  stake: number;
  totalRiskScore: number;
  riskLevel: RiskLevel;
  warnings: ParleyWarning[];
}

export interface ParleyWarning {
  type: 'too_many_legs' | 'correlation' | 'low_probability' | 'weak_data' | 'high_risk';
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface ParleyAIAnalysis {
  parleySummary: string;
  combinedRisk: RiskLevel;
  combinedProbabilityComment: string;
  strongestLegs: string[];
  weakestLegs: string[];
  correlationWarnings: string[];
  riskReductionSuggestions: string[];
  responsibleConclusion: string;
}

export interface SavedParley {
  id: string;
  picks: ParleyPick[];
  combinedOdds: number;
  combinedProbability: number;
  risk: RiskLevel;
  stake: number;
  potentialReturn: number;
  aiAnalysis?: ParleyAIAnalysis;
  createdAt: string;
  name?: string;
}

export interface SavedAnalysis {
  id: string;
  fixtureId: string;
  matchName: string;
  league: string;
  analysis: import('./analysis').MatchAnalysis;
  createdAt: string;
}
