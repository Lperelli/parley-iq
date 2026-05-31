export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  flag?: string;
  season: number;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  bttsCount: number;
  over15Count: number;
  over25Count: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  bttsPercentage: number;
  over15Percentage: number;
  over25Percentage: number;
  cleanSheetPercentage: number;
  xgFor?: number;
  xgAgainst?: number;
  attackRating?: number;
  defenseRating?: number;
}

export interface FormMatch {
  opponent: string;
  result: 'W' | 'D' | 'L';
  goalsScored: number;
  goalsConceded: number;
  isHome: boolean;
  date: string;
  competition: string;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  winner: 'home' | 'away' | 'draw';
  competition: string;
}

export interface Odds {
  market: string;
  selection: string;
  decimal: number;
  impliedProbability: number;
}

export interface Injury {
  player: string;
  status: 'Doubtful' | 'Out' | 'Suspended';
  reason: string;
  team: string;
}

export interface Fixture {
  id: string;
  leagueId: string;
  league: League;
  season: number;
  date: string;
  status: FixtureStatus;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals?: number;
  awayGoals?: number;
  elapsed?: number;
  round?: string;
  homeStanding?: number;
  awayStanding?: number;
  homeForm?: FormMatch[];
  awayForm?: FormMatch[];
  homeStats?: {
    home: TeamStats;
    overall: TeamStats;
  };
  awayStats?: {
    away: TeamStats;
    overall: TeamStats;
  };
  headToHead?: HeadToHeadMatch[];
  odds?: Odds[];
  injuries?: Injury[];
  isPopular?: boolean;
  hasAiAnalysis?: boolean;
}

export type FixtureStatus =
  | 'NS'
  | '1H'
  | 'HT'
  | '2H'
  | 'ET'
  | 'P'
  | 'FT'
  | 'AET'
  | 'PEN'
  | 'BT'
  | 'SUSP'
  | 'INT'
  | 'PST'
  | 'CANC'
  | 'ABD'
  | 'AWD'
  | 'WO'
  | 'LIVE';

export interface SearchResult {
  fixtures: Fixture[];
  teams: Team[];
  leagues: League[];
}

export interface DataQuality {
  hasRecentForm: boolean;
  hasH2H: boolean;
  hasOdds: boolean;
  hasInjuries: boolean;
  hasLineups: boolean;
  hasXG: boolean;
  hasStandings: boolean;
}
