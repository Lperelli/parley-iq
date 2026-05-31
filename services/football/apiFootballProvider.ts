import { FootballProvider, getDataQuality } from './footballProvider';
import { Fixture, League, Team, SearchResult, DataQuality, FormMatch, TeamStats, Standing, Squad, Player } from '@/types/football';

const BASE_URL = process.env.FOOTBALL_API_BASE_URL ?? 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY ?? '';

// ─── Ligas importantes + Mundial 2026 ────────────────────────────────────────
// Formato: { id, name, season }
const IMPORTANT_LEAGUES: { id: string; season: number }[] = [
  { id: '39',  season: 2024 }, // Premier League
  { id: '140', season: 2024 }, // La Liga
  { id: '135', season: 2024 }, // Serie A
  { id: '78',  season: 2024 }, // Bundesliga
  { id: '61',  season: 2024 }, // Ligue 1
  { id: '2',   season: 2024 }, // UEFA Champions League
  { id: '3',   season: 2024 }, // UEFA Europa League
  { id: '848', season: 2024 }, // UEFA Conference League
  { id: '262', season: 2024 }, // Liga MX
  { id: '253', season: 2024 }, // MLS
  { id: '11',  season: 2026 }, // Mundial 2026
  { id: '1',   season: 2025 }, // World Cup Qualifying (global)
  { id: '32',  season: 2024 }, // CONMEBOL Libertadores
  { id: '13',  season: 2024 }, // CONMEBOL Sudamericana
];

const IMPORTANT_LEAGUE_IDS = new Set(IMPORTANT_LEAGUES.map(l => l.id));

const CURRENT_SEASON = 2024;

// ─── HTTP helper ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetch<T = any>(endpoint: string): Promise<T> {
  if (!API_KEY) throw new Error('FOOTBALL_API_KEY no configurado');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'x-apisports-key': API_KEY },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`API Football ${res.status}: ${await res.text()}`);

  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    const msg = Object.values(json.errors).join(', ');
    throw new Error(`API Football: ${msg}`);
  }
  return json.response as T;
}

// safe version — returns [] on error
async function safeApiFetch<T = unknown[]>(endpoint: string): Promise<T> {
  try {
    return await apiFetch<T>(endpoint);
  } catch {
    return [] as T;
  }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeam(t: any): Team {
  return {
    id: String(t.team?.id ?? t.id),
    name: t.team?.name ?? t.name,
    shortName: t.team?.code ?? (t.team?.name ?? t.name ?? '').slice(0, 3).toUpperCase(),
    logo: t.team?.logo ?? t.logo ?? '',
    country: t.team?.country ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFixtureBase(raw: any): Fixture {
  return {
    id: String(raw.fixture.id),
    leagueId: String(raw.league.id),
    league: {
      id: String(raw.league.id),
      name: raw.league.name,
      country: raw.league.country,
      logo: raw.league.logo,
      flag: raw.league.flag ?? '',
      season: raw.league.season,
    },
    season: raw.league.season,
    date: raw.fixture.date,
    status: raw.fixture.status.short,
    venue: raw.fixture.venue?.name ?? 'Estadio desconocido',
    homeTeam: {
      id: String(raw.teams.home.id),
      name: raw.teams.home.name,
      shortName: raw.teams.home.code ?? raw.teams.home.name.slice(0, 3).toUpperCase(),
      logo: raw.teams.home.logo,
      country: raw.league.country,
    },
    awayTeam: {
      id: String(raw.teams.away.id),
      name: raw.teams.away.name,
      shortName: raw.teams.away.code ?? raw.teams.away.name.slice(0, 3).toUpperCase(),
      logo: raw.teams.away.logo,
      country: raw.league.country,
    },
    homeGoals: raw.goals?.home ?? undefined,
    awayGoals: raw.goals?.away ?? undefined,
    elapsed: raw.fixture.status?.elapsed ?? undefined,
    isPopular: IMPORTANT_LEAGUE_IDS.has(String(raw.league.id)),
    hasAiAnalysis: false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapForm(fixtures: any[], teamId: string): FormMatch[] {
  return fixtures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((f: any) => ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((f: any) => {
      const isHome = String(f.teams.home.id) === teamId;
      const gs = isHome ? (f.goals.home ?? 0) : (f.goals.away ?? 0);
      const gc = isHome ? (f.goals.away ?? 0) : (f.goals.home ?? 0);
      const homeWon = f.teams.home.winner;
      const awayWon = f.teams.away.winner;
      let result: 'W' | 'D' | 'L';
      if (isHome) result = homeWon ? 'W' : awayWon ? 'L' : 'D';
      else result = awayWon ? 'W' : homeWon ? 'L' : 'D';
      return {
        result,
        goalsScored: gs,
        goalsConceded: gc,
        opponent: isHome ? f.teams.away.name : f.teams.home.name,
        isHome,
        date: f.fixture.date,
        competition: f.league?.name ?? '',
      };
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeamStats(raw: any, venue: 'home' | 'away' | 'overall'): TeamStats {
  // The API Football /teams/statistics uses 'total' for the overall key
  const apiKey = venue === 'overall' ? 'total' : venue;
  const played = raw?.fixtures?.played?.[apiKey] ?? 0;
  const wins = raw?.fixtures?.wins?.[apiKey] ?? 0;
  const draws = raw?.fixtures?.draws?.[apiKey] ?? 0;
  const losses = raw?.fixtures?.loses?.[apiKey] ?? 0;
  const goalsFor = raw?.goals?.for?.total?.[apiKey] ?? 0;
  const goalsAgainst = raw?.goals?.against?.total?.[apiKey] ?? 0;
  const cleanSheets = raw?.clean_sheet?.[apiKey] ?? 0;

  // over 1.5 / 2.5 / btts not split by home/away in this endpoint — use total
  const over15Count = raw?.goals?.for?.minute?.['0-15'] !== undefined
    ? 0 : 0; // not available by venue; default 0
  const over25Count = 0;
  const bttsCount = raw?.failed_to_score
    ? Math.max(0, played - (raw?.failed_to_score?.[apiKey] ?? 0) - cleanSheets)
    : 0;

  return {
    played,
    wins,
    draws,
    losses,
    goalsScored: goalsFor,
    goalsConceded: goalsAgainst,
    cleanSheets,
    bttsCount,
    over15Count,
    over25Count,
    avgGoalsScored: played > 0 ? parseFloat((goalsFor / played).toFixed(2)) : 0,
    avgGoalsConceded: played > 0 ? parseFloat((goalsAgainst / played).toFixed(2)) : 0,
    cleanSheetPercentage: played > 0 ? Math.round((cleanSheets / played) * 100) : 0,
    bttsPercentage: played > 0 ? Math.round((bttsCount / played) * 100) : 0,
    over15Percentage: 0,
    over25Percentage: 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOdds(oddsData: any[]): Fixture['odds'] {
  if (!oddsData?.length) return [];
  const bookmaker = oddsData[0]?.bookmakers?.[0];
  if (!bookmaker) return [];

  const result: NonNullable<Fixture['odds']> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const bet of (bookmaker.bets ?? []).slice(0, 10)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const val of (bet.values ?? [])) {
      const decimal = parseFloat(val.odd ?? '2');
      result.push({
        market: bet.name,
        selection: val.value,
        decimal,
        impliedProbability: decimal > 0 ? Math.round((1 / decimal) * 100) : 0,
      });
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapH2H(data: any[]): Fixture['headToHead'] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.slice(0, 10).map((f: any) => ({
    date: f.fixture.date,
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    homeGoals: f.goals.home ?? 0,
    awayGoals: f.goals.away ?? 0,
    winner: f.teams.home.winner ? 'home' : f.teams.away.winner ? 'away' : 'draw',
    competition: f.league.name,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStanding(standings: any[], teamId: string): number | undefined {
  for (const group of standings) {
    for (const entry of group) {
      if (String(entry.team.id) === teamId) return entry.rank;
    }
  }
  return undefined;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export class ApiFootballProvider implements FootballProvider {

  async getTodayFixtures(): Promise<Fixture[]> {
    const today = new Date().toISOString().split('T')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await safeApiFetch<any[]>(`/fixtures?date=${today}&timezone=America/Mexico_City`);
    return raw
      .map(mapFixtureBase)
      .filter(f => IMPORTANT_LEAGUE_IDS.has(f.leagueId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getUpcomingFixtures(date: string): Promise<Fixture[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await safeApiFetch<any[]>(`/fixtures?date=${date}&timezone=America/Mexico_City`);
    return raw
      .map(mapFixtureBase)
      .filter(f => IMPORTANT_LEAGUE_IDS.has(f.leagueId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getLiveFixtures(): Promise<Fixture[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await safeApiFetch<any[]>('/fixtures?live=all');
    return raw
      .map(mapFixtureBase)
      .filter(f => IMPORTANT_LEAGUE_IDS.has(f.leagueId));
  }

  async getPopularFixtures(): Promise<Fixture[]> {
    // Return today's important-league matches sorted by league priority
    const today = new Date().toISOString().split('T')[0];
    const topLeagues = ['2', '39', '140', '135', '78', '61', '262', '253', '11', '32'];
    const requests = topLeagues.map(id =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      safeApiFetch<any[]>(`/fixtures?league=${id}&date=${today}`).then(r =>
        r.map(f => ({ ...mapFixtureBase(f), isPopular: true }))
      )
    );
    const results = await Promise.all(requests);
    return results.flat();
  }

  async searchFixtures(query: string): Promise<SearchResult> {
    const q = encodeURIComponent(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teamsData, leaguesData] = await Promise.all([
      safeApiFetch<any[]>(`/teams?search=${q}`),
      safeApiFetch<any[]>(`/leagues?search=${q}&current=true`),
    ]);

    return {
      fixtures: [],
      teams: teamsData.slice(0, 8).map(mapTeam),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      leagues: leaguesData.slice(0, 5).map((l: any) => ({
        id: String(l.league.id),
        name: l.league.name,
        country: l.country.name,
        logo: l.league.logo,
        flag: l.country.flag ?? '',
        season: l.seasons?.[0]?.year ?? CURRENT_SEASON,
      })),
    };
  }

  async getFixtureById(fixtureId: string): Promise<Fixture | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await safeApiFetch<any[]>(`/fixtures?id=${fixtureId}`);
    if (!raw.length) return null;

    const fixture = mapFixtureBase(raw[0]);
    const homeId = fixture.homeTeam.id;
    const awayId = fixture.awayTeam.id;
    const leagueId = fixture.leagueId;
    const season = fixture.season ?? CURRENT_SEASON;

    // Fetch enrichment data in parallel (all safe — won't crash if one fails)
    const [
      homeFormRaw,
      awayFormRaw,
      homeStatsRaw,
      awayStatsRaw,
      h2hRaw,
      oddsRaw,
      standingsRaw,
    ] = await Promise.all([
      safeApiFetch<unknown[]>(`/fixtures?team=${homeId}&last=6&timezone=America/Mexico_City`),
      safeApiFetch<unknown[]>(`/fixtures?team=${awayId}&last=6&timezone=America/Mexico_City`),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      safeApiFetch<any>(`/teams/statistics?team=${homeId}&league=${leagueId}&season=${season}`),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      safeApiFetch<any>(`/teams/statistics?team=${awayId}&league=${leagueId}&season=${season}`),
      safeApiFetch<unknown[]>(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=8`),
      safeApiFetch<unknown[]>(`/odds?fixture=${fixtureId}&bookmaker=8`), // bet365
      safeApiFetch<unknown[]>(`/standings?league=${leagueId}&season=${season}`),
    ]);

    // Form
    fixture.homeForm = mapForm(homeFormRaw as never[], homeId);
    fixture.awayForm = mapForm(awayFormRaw as never[], awayId);

    // Team stats
    if (homeStatsRaw && !Array.isArray(homeStatsRaw)) {
      fixture.homeStats = {
        home: mapTeamStats(homeStatsRaw, 'home'),
        overall: mapTeamStats(homeStatsRaw, 'overall'),
      };
    }
    if (awayStatsRaw && !Array.isArray(awayStatsRaw)) {
      fixture.awayStats = {
        away: mapTeamStats(awayStatsRaw, 'away'),
        overall: mapTeamStats(awayStatsRaw, 'overall'),
      };
    }

    // H2H
    fixture.headToHead = mapH2H(h2hRaw as never[]);

    // Odds
    fixture.odds = mapOdds(oddsRaw as never[]);

    // Standings — find rank of each team
    if (Array.isArray(standingsRaw) && standingsRaw.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groups = (standingsRaw as any[])[0]?.league?.standings ?? [];
      fixture.homeStanding = mapStanding(groups, homeId);
      fixture.awayStanding = mapStanding(groups, awayId);
    }

    return fixture;
  }

  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    const raw = await safeApiFetch<any[]>(`/standings?league=${leagueId}&season=${season}`);
    if (!raw?.length) return [];
    const standings = (raw[0] as any)?.league?.standings?.[0] ?? [];
    return standings.map((s: any): Standing => ({
      rank: s.rank,
      teamId: String(s.team.id),
      teamName: s.team.name,
      teamLogo: s.team.logo,
      played: s.all.played,
      wins: s.all.win,
      draws: s.all.draw,
      losses: s.all.lose,
      goalsFor: s.all.goals.for,
      goalsAgainst: s.all.goals.against,
      goalsDiff: s.goalsDiff,
      points: s.points,
      form: s.form ?? '',
      description: s.description ?? '',
    }));
  }

  async getLeagues(): Promise<League[]> {
    // Return our curated important leagues
    const requests = IMPORTANT_LEAGUES.slice(0, 8).map(({ id, season }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      safeApiFetch<any[]>(`/leagues?id=${id}&season=${season}`).then(r =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        r.map((l: any): League => ({
          id: String(l.league.id),
          name: l.league.name,
          country: l.country.name,
          logo: l.league.logo,
          flag: l.country.flag ?? '',
          season: l.seasons?.find((s: { year: number; current: boolean }) => s.current)?.year ?? season,
        }))
      )
    );
    const results = await Promise.all(requests);
    return results.flat();
  }

  async getSquad(teamId: string): Promise<Squad | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await safeApiFetch<any[]>(`/players/squads?team=${teamId}`);
    if (!raw?.length) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = raw[0] as any;
    return {
      teamId,
      teamName: entry.team?.name ?? '',
      teamLogo: entry.team?.logo ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      players: (entry.players ?? []).map((p: any): Player => ({
        id: p.id,
        name: p.name,
        number: p.number ?? undefined,
        position: p.position ?? 'Unknown',
        photo: p.photo ?? '',
        age: p.age ?? undefined,
        nationality: p.nationality ?? undefined,
      })),
    };
  }

  getDataQuality(fixture: Fixture): DataQuality {
    return getDataQuality(fixture);
  }
}
