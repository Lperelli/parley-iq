import { Fixture, League, Team, TeamStats, FormMatch, HeadToHeadMatch, Odds } from '@/types/football';

const today = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (h: number, m = 0, offsetDays = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}:00`;
};

export const MOCK_LEAGUES: League[] = [
  { id: '140', name: 'La Liga', country: 'España', logo: 'https://media.api-sports.io/football/leagues/140.png', season: 2024 },
  { id: '39', name: 'Premier League', country: 'Inglaterra', logo: 'https://media.api-sports.io/football/leagues/39.png', season: 2024 },
  { id: '135', name: 'Serie A', country: 'Italia', logo: 'https://media.api-sports.io/football/leagues/135.png', season: 2024 },
  { id: '78', name: 'Bundesliga', country: 'Alemania', logo: 'https://media.api-sports.io/football/leagues/78.png', season: 2024 },
  { id: '61', name: 'Ligue 1', country: 'Francia', logo: 'https://media.api-sports.io/football/leagues/61.png', season: 2024 },
  { id: '2', name: 'Champions League', country: 'Europa', logo: 'https://media.api-sports.io/football/leagues/2.png', season: 2024 },
];

const makeStats = (partial: Partial<TeamStats>): TeamStats => ({
  played: 20, wins: 10, draws: 5, losses: 5,
  goalsScored: 35, goalsConceded: 20,
  cleanSheets: 7, bttsCount: 10, over15Count: 16, over25Count: 12,
  avgGoalsScored: 1.75, avgGoalsConceded: 1.0,
  bttsPercentage: 50, over15Percentage: 80, over25Percentage: 60,
  cleanSheetPercentage: 35,
  xgFor: 1.8, xgAgainst: 0.95,
  attackRating: 72, defenseRating: 68,
  ...partial,
});

const makeForm = (results: ('W' | 'D' | 'L')[]): FormMatch[] =>
  results.map((result, i) => ({
    opponent: ['Athletic Club', 'Getafe', 'Sevilla', 'Valencia', 'Osasuna'][i % 5],
    result,
    goalsScored: result === 'W' ? 2 : result === 'D' ? 1 : 0,
    goalsConceded: result === 'L' ? 2 : result === 'D' ? 1 : 0,
    isHome: i % 2 === 0,
    date: dateStr(20, 0, -(i + 1) * 7),
    competition: 'La Liga',
  }));

const makeH2H = (): HeadToHeadMatch[] => [
  { date: '2024-03-10T21:00:00', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', homeGoals: 3, awayGoals: 2, winner: 'home', competition: 'La Liga' },
  { date: '2023-10-28T17:00:00', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeGoals: 2, awayGoals: 1, winner: 'home', competition: 'La Liga' },
  { date: '2023-04-05T21:00:00', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', homeGoals: 2, awayGoals: 4, winner: 'away', competition: 'Copa del Rey' },
  { date: '2022-10-16T21:00:00', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeGoals: 3, awayGoals: 1, winner: 'home', competition: 'La Liga' },
  { date: '2022-03-20T17:00:00', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', homeGoals: 0, awayGoals: 4, winner: 'away', competition: 'La Liga' },
];

const makeOdds = (h: number, d: number, a: number): Odds[] => [
  { market: '1X2', selection: 'Local', decimal: h, impliedProbability: parseFloat(((1 / h) * 100).toFixed(1)) },
  { market: '1X2', selection: 'Empate', decimal: d, impliedProbability: parseFloat(((1 / d) * 100).toFixed(1)) },
  { market: '1X2', selection: 'Visitante', decimal: a, impliedProbability: parseFloat(((1 / a) * 100).toFixed(1)) },
  { market: 'Más/Menos 2.5', selection: 'Más de 2.5', decimal: 1.72, impliedProbability: 58.1 },
  { market: 'Más/Menos 2.5', selection: 'Menos de 2.5', decimal: 2.10, impliedProbability: 47.6 },
  { market: 'Ambos Anotan', selection: 'Sí', decimal: 1.65, impliedProbability: 60.6 },
  { market: 'Ambos Anotan', selection: 'No', decimal: 2.20, impliedProbability: 45.5 },
  { market: 'Más/Menos 1.5', selection: 'Más de 1.5', decimal: 1.25, impliedProbability: 80.0 },
  { market: 'Doble Chance', selection: '1X', decimal: 1.28, impliedProbability: 78.1 },
  { market: 'Doble Chance', selection: 'X2', decimal: 2.05, impliedProbability: 48.8 },
];

export const MOCK_FIXTURES: Fixture[] = [
  {
    id: 'f1',
    leagueId: '140',
    league: MOCK_LEAGUES[0],
    season: 2024,
    date: dateStr(21, 0),
    status: 'NS',
    venue: 'Estadio Olímpico Lluís Companys',
    homeTeam: {
      id: 't1', name: 'Barcelona', shortName: 'BAR',
      logo: 'https://media.api-sports.io/football/teams/529.png',
      country: 'España',
    },
    awayTeam: {
      id: 't2', name: 'Real Madrid', shortName: 'RMA',
      logo: 'https://media.api-sports.io/football/teams/541.png',
      country: 'España',
    },
    homeStanding: 1,
    awayStanding: 2,
    homeForm: makeForm(['W', 'W', 'D', 'W', 'L']),
    awayForm: makeForm(['W', 'W', 'W', 'D', 'W']),
    homeStats: {
      home: makeStats({ played: 12, wins: 8, draws: 2, losses: 2, goalsScored: 28, goalsConceded: 10, avgGoalsScored: 2.33, avgGoalsConceded: 0.83, bttsPercentage: 42, over25Percentage: 67 }),
      overall: makeStats({ played: 22, wins: 15, draws: 4, losses: 3, goalsScored: 48, goalsConceded: 22, avgGoalsScored: 2.18, avgGoalsConceded: 1.0 }),
    },
    awayStats: {
      away: makeStats({ played: 10, wins: 6, draws: 2, losses: 2, goalsScored: 20, goalsConceded: 12, avgGoalsScored: 2.0, avgGoalsConceded: 1.2, bttsPercentage: 60, over25Percentage: 55 }),
      overall: makeStats({ played: 22, wins: 14, draws: 5, losses: 3, goalsScored: 44, goalsConceded: 24, avgGoalsScored: 2.0, avgGoalsConceded: 1.09 }),
    },
    headToHead: makeH2H(),
    odds: makeOdds(1.95, 3.40, 3.90),
    injuries: [],
    isPopular: true,
    hasAiAnalysis: false,
  },
  {
    id: 'f2',
    leagueId: '39',
    league: MOCK_LEAGUES[1],
    season: 2024,
    date: dateStr(16, 30),
    status: 'NS',
    venue: 'Anfield',
    homeTeam: {
      id: 't3', name: 'Liverpool', shortName: 'LIV',
      logo: 'https://media.api-sports.io/football/teams/40.png',
      country: 'Inglaterra',
    },
    awayTeam: {
      id: 't4', name: 'Manchester City', shortName: 'MCI',
      logo: 'https://media.api-sports.io/football/teams/50.png',
      country: 'Inglaterra',
    },
    homeStanding: 2,
    awayStanding: 3,
    homeForm: makeForm(['W', 'W', 'W', 'D', 'W']),
    awayForm: makeForm(['W', 'D', 'W', 'L', 'W']),
    homeStats: {
      home: makeStats({ played: 12, wins: 9, draws: 2, losses: 1, goalsScored: 30, goalsConceded: 12, avgGoalsScored: 2.5, bttsPercentage: 50, over25Percentage: 70 }),
      overall: makeStats({ played: 22, wins: 15, draws: 4, losses: 3, goalsScored: 50, goalsConceded: 28 }),
    },
    awayStats: {
      away: makeStats({ played: 10, wins: 5, draws: 3, losses: 2, goalsScored: 18, goalsConceded: 15, avgGoalsScored: 1.8, bttsPercentage: 65, over25Percentage: 50 }),
      overall: makeStats({ played: 22, wins: 13, draws: 5, losses: 4, goalsScored: 42, goalsConceded: 30 }),
    },
    headToHead: [
      { date: '2024-02-10T17:30:00', homeTeam: 'Manchester City', awayTeam: 'Liverpool', homeGoals: 1, awayGoals: 1, winner: 'draw', competition: 'Premier League' },
      { date: '2023-11-25T12:30:00', homeTeam: 'Liverpool', awayTeam: 'Manchester City', homeGoals: 1, awayGoals: 0, winner: 'home', competition: 'Premier League' },
      { date: '2023-04-01T14:30:00', homeTeam: 'Manchester City', awayTeam: 'Liverpool', homeGoals: 4, awayGoals: 1, winner: 'home', competition: 'Premier League' },
    ],
    odds: makeOdds(2.10, 3.50, 3.40),
    isPopular: true,
    hasAiAnalysis: false,
  },
  {
    id: 'f3',
    leagueId: '135',
    league: MOCK_LEAGUES[2],
    season: 2024,
    date: dateStr(20, 45),
    status: 'NS',
    venue: 'Giuseppe Meazza',
    homeTeam: {
      id: 't5', name: 'Inter Milan', shortName: 'INT',
      logo: 'https://media.api-sports.io/football/teams/505.png',
      country: 'Italia',
    },
    awayTeam: {
      id: 't6', name: 'Juventus', shortName: 'JUV',
      logo: 'https://media.api-sports.io/football/teams/496.png',
      country: 'Italia',
    },
    homeStanding: 1,
    awayStanding: 4,
    homeForm: makeForm(['W', 'W', 'D', 'W', 'W']),
    awayForm: makeForm(['W', 'D', 'L', 'W', 'D']),
    homeStats: {
      home: makeStats({ played: 11, wins: 8, draws: 2, losses: 1, goalsScored: 26, goalsConceded: 8, avgGoalsScored: 2.36, bttsPercentage: 36, over25Percentage: 64, cleanSheetPercentage: 45 }),
      overall: makeStats({ played: 21, wins: 15, draws: 3, losses: 3, goalsScored: 44, goalsConceded: 18 }),
    },
    awayStats: {
      away: makeStats({ played: 10, wins: 4, draws: 4, losses: 2, goalsScored: 14, goalsConceded: 12, avgGoalsScored: 1.4, bttsPercentage: 50, over25Percentage: 40 }),
      overall: makeStats({ played: 21, wins: 11, draws: 7, losses: 3, goalsScored: 38, goalsConceded: 22 }),
    },
    headToHead: [
      { date: '2024-02-04T20:45:00', homeTeam: 'Juventus', awayTeam: 'Inter Milan', homeGoals: 2, awayGoals: 2, winner: 'draw', competition: 'Serie A' },
      { date: '2023-11-26T20:45:00', homeTeam: 'Inter Milan', awayTeam: 'Juventus', homeGoals: 1, awayGoals: 0, winner: 'home', competition: 'Serie A' },
    ],
    odds: makeOdds(1.72, 3.60, 4.80),
    isPopular: true,
    hasAiAnalysis: false,
  },
  {
    id: 'f4',
    leagueId: '2',
    league: MOCK_LEAGUES[5],
    season: 2024,
    date: dateStr(21, 0, 1),
    status: 'NS',
    venue: 'Allianz Arena',
    homeTeam: {
      id: 't7', name: 'Bayern Munich', shortName: 'BAY',
      logo: 'https://media.api-sports.io/football/teams/157.png',
      country: 'Alemania',
    },
    awayTeam: {
      id: 't8', name: 'Paris SG', shortName: 'PSG',
      logo: 'https://media.api-sports.io/football/teams/85.png',
      country: 'Francia',
    },
    homeStanding: 1,
    awayStanding: 1,
    homeForm: makeForm(['W', 'W', 'W', 'W', 'D']),
    awayForm: makeForm(['W', 'W', 'D', 'W', 'W']),
    homeStats: {
      home: makeStats({ played: 10, wins: 8, draws: 1, losses: 1, goalsScored: 30, goalsConceded: 10, avgGoalsScored: 3.0, bttsPercentage: 40, over25Percentage: 80 }),
      overall: makeStats({ played: 20, wins: 15, draws: 2, losses: 3, goalsScored: 52, goalsConceded: 22 }),
    },
    awayStats: {
      away: makeStats({ played: 9, wins: 6, draws: 2, losses: 1, goalsScored: 22, goalsConceded: 12, avgGoalsScored: 2.44, bttsPercentage: 55, over25Percentage: 66 }),
      overall: makeStats({ played: 20, wins: 14, draws: 3, losses: 3, goalsScored: 48, goalsConceded: 26 }),
    },
    headToHead: [
      { date: '2024-03-08T21:00:00', homeTeam: 'Paris SG', awayTeam: 'Bayern Munich', homeGoals: 2, awayGoals: 2, winner: 'draw', competition: 'Champions League' },
      { date: '2023-03-01T21:00:00', homeTeam: 'Bayern Munich', awayTeam: 'Paris SG', homeGoals: 2, awayGoals: 0, winner: 'home', competition: 'Champions League' },
    ],
    odds: makeOdds(2.05, 3.50, 3.55),
    isPopular: true,
    hasAiAnalysis: false,
  },
  {
    id: 'f5',
    leagueId: '140',
    league: MOCK_LEAGUES[0],
    season: 2024,
    date: dateStr(19, 0),
    status: 'NS',
    venue: 'Estadio Benito Villamarín',
    homeTeam: {
      id: 't9', name: 'Real Betis', shortName: 'BET',
      logo: 'https://media.api-sports.io/football/teams/543.png',
      country: 'España',
    },
    awayTeam: {
      id: 't10', name: 'Sevilla FC', shortName: 'SEV',
      logo: 'https://media.api-sports.io/football/teams/536.png',
      country: 'España',
    },
    homeStanding: 6,
    awayStanding: 12,
    homeForm: makeForm(['W', 'D', 'W', 'L', 'D']),
    awayForm: makeForm(['L', 'W', 'D', 'D', 'L']),
    homeStats: {
      home: makeStats({ played: 11, wins: 5, draws: 4, losses: 2, goalsScored: 18, goalsConceded: 14, avgGoalsScored: 1.64, bttsPercentage: 55, over25Percentage: 45 }),
      overall: makeStats({ played: 21, wins: 8, draws: 8, losses: 5, goalsScored: 32, goalsConceded: 28 }),
    },
    awayStats: {
      away: makeStats({ played: 10, wins: 2, draws: 4, losses: 4, goalsScored: 12, goalsConceded: 18, avgGoalsScored: 1.2, bttsPercentage: 50, over25Percentage: 40 }),
      overall: makeStats({ played: 21, wins: 6, draws: 7, losses: 8, goalsScored: 26, goalsConceded: 32 }),
    },
    headToHead: [
      { date: '2024-01-20T17:00:00', homeTeam: 'Sevilla', awayTeam: 'Real Betis', homeGoals: 1, awayGoals: 1, winner: 'draw', competition: 'La Liga' },
      { date: '2023-08-27T21:00:00', homeTeam: 'Real Betis', awayTeam: 'Sevilla', homeGoals: 1, awayGoals: 0, winner: 'home', competition: 'La Liga' },
    ],
    odds: makeOdds(2.50, 3.10, 2.75),
    isPopular: false,
    hasAiAnalysis: false,
  },
  {
    id: 'f6',
    leagueId: '39',
    league: MOCK_LEAGUES[1],
    season: 2024,
    date: dateStr(14, 0),
    status: 'FT',
    venue: 'Old Trafford',
    homeTeam: {
      id: 't11', name: 'Manchester Utd', shortName: 'MUN',
      logo: 'https://media.api-sports.io/football/teams/33.png',
      country: 'Inglaterra',
    },
    awayTeam: {
      id: 't12', name: 'Arsenal', shortName: 'ARS',
      logo: 'https://media.api-sports.io/football/teams/42.png',
      country: 'Inglaterra',
    },
    homeGoals: 1,
    awayGoals: 2,
    homeStanding: 14,
    awayStanding: 1,
    homeForm: makeForm(['L', 'D', 'L', 'W', 'L']),
    awayForm: makeForm(['W', 'W', 'W', 'D', 'W']),
    homeStats: {
      home: makeStats({ played: 11, wins: 4, draws: 2, losses: 5, goalsScored: 15, goalsConceded: 20, avgGoalsScored: 1.36 }),
      overall: makeStats({ played: 21, wins: 7, draws: 5, losses: 9, goalsScored: 28, goalsConceded: 36 }),
    },
    awayStats: {
      away: makeStats({ played: 10, wins: 7, draws: 2, losses: 1, goalsScored: 24, goalsConceded: 10, avgGoalsScored: 2.4 }),
      overall: makeStats({ played: 21, wins: 15, draws: 3, losses: 3, goalsScored: 48, goalsConceded: 20 }),
    },
    headToHead: [],
    odds: makeOdds(3.20, 3.40, 2.10),
    isPopular: true,
    hasAiAnalysis: false,
  },
  {
    id: 'f7',
    leagueId: '78',
    league: MOCK_LEAGUES[3],
    season: 2024,
    date: dateStr(18, 30, 2),
    status: 'NS',
    venue: 'Signal Iduna Park',
    homeTeam: {
      id: 't13', name: 'Borussia Dortmund', shortName: 'BVB',
      logo: 'https://media.api-sports.io/football/teams/165.png',
      country: 'Alemania',
    },
    awayTeam: {
      id: 't14', name: 'Bayer Leverkusen', shortName: 'B04',
      logo: 'https://media.api-sports.io/football/teams/168.png',
      country: 'Alemania',
    },
    homeStanding: 4,
    awayStanding: 1,
    homeForm: makeForm(['D', 'W', 'L', 'D', 'W']),
    awayForm: makeForm(['W', 'W', 'W', 'W', 'D']),
    homeStats: {
      home: makeStats({ played: 10, wins: 5, draws: 3, losses: 2, goalsScored: 22, goalsConceded: 16, avgGoalsScored: 2.2, bttsPercentage: 60, over25Percentage: 60 }),
      overall: makeStats({ played: 20, wins: 10, draws: 6, losses: 4, goalsScored: 38, goalsConceded: 28 }),
    },
    awayStats: {
      away: makeStats({ played: 10, wins: 7, draws: 2, losses: 1, goalsScored: 28, goalsConceded: 14, avgGoalsScored: 2.8, bttsPercentage: 55, over25Percentage: 70 }),
      overall: makeStats({ played: 20, wins: 16, draws: 3, losses: 1, goalsScored: 55, goalsConceded: 22 }),
    },
    headToHead: [],
    odds: makeOdds(2.75, 3.30, 2.55),
    isPopular: false,
    hasAiAnalysis: false,
  },
];
