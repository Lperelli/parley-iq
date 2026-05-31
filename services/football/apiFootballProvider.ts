import { FootballProvider, getDataQuality } from './footballProvider';
import { Fixture, League, Team, SearchResult, DataQuality } from '@/types/football';

const BASE_URL = process.env.FOOTBALL_API_BASE_URL ?? 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY ?? '';

async function apiFetch<T>(endpoint: string): Promise<T> {
  if (!API_KEY) throw new Error('FOOTBALL_API_KEY no configurado');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'x-apisports-key': API_KEY,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`API Football error: ${res.status}`);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API Football: ${JSON.stringify(json.errors)}`);
  }
  return json.response as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFixture(raw: any): Fixture {
  return {
    id: String(raw.fixture.id),
    leagueId: String(raw.league.id),
    league: {
      id: String(raw.league.id),
      name: raw.league.name,
      country: raw.league.country,
      logo: raw.league.logo,
      flag: raw.league.flag,
      season: raw.league.season,
    },
    season: raw.league.season,
    date: raw.fixture.date,
    status: raw.fixture.status.short,
    venue: raw.fixture.venue?.name ?? 'Desconocido',
    homeTeam: {
      id: String(raw.teams.home.id),
      name: raw.teams.home.name,
      shortName: raw.teams.home.name.slice(0, 3).toUpperCase(),
      logo: raw.teams.home.logo,
      country: raw.league.country,
    },
    awayTeam: {
      id: String(raw.teams.away.id),
      name: raw.teams.away.name,
      shortName: raw.teams.away.name.slice(0, 3).toUpperCase(),
      logo: raw.teams.away.logo,
      country: raw.league.country,
    },
    homeGoals: raw.goals?.home ?? undefined,
    awayGoals: raw.goals?.away ?? undefined,
    elapsed: raw.fixture.status?.elapsed ?? undefined,
    isPopular: false,
    hasAiAnalysis: false,
  };
}

export class ApiFootballProvider implements FootballProvider {
  async getTodayFixtures(): Promise<Fixture[]> {
    const today = new Date().toISOString().split('T')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>(`/fixtures?date=${today}`);
    return raw.map(mapFixture);
  }

  async getUpcomingFixtures(date: string): Promise<Fixture[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>(`/fixtures?date=${date}`);
    return raw.map(mapFixture);
  }

  async getLiveFixtures(): Promise<Fixture[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>('/fixtures?live=all');
    return raw.map(mapFixture);
  }

  async getPopularFixtures(): Promise<Fixture[]> {
    // Popular leagues: La Liga, PL, Serie A, Bundesliga, CL
    const leagues = ['140', '39', '135', '78', '2'];
    const today = new Date().toISOString().split('T')[0];
    const promises = leagues.map(l =>
      apiFetch<unknown[]>(`/fixtures?league=${l}&date=${today}`).catch(() => [] as unknown[])
    );
    const results = await Promise.all(promises);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.flat().map((r: any) => ({ ...mapFixture(r), isPopular: true }));
  }

  async searchFixtures(query: string): Promise<SearchResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teams = await apiFetch<any[]>(`/teams?search=${encodeURIComponent(query)}`);
    return {
      fixtures: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      teams: teams.map((t: any) => ({
        id: String(t.team.id),
        name: t.team.name,
        shortName: t.team.code ?? t.team.name.slice(0, 3),
        logo: t.team.logo,
        country: t.team.country,
      })),
      leagues: [],
    };
  }

  async getFixtureById(fixtureId: string): Promise<Fixture | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>(`/fixtures?id=${fixtureId}`);
    if (!raw.length) return null;
    const fixture = mapFixture(raw[0]);

    // Fetch additional data in parallel
    const [statsRes, oddsRes] = await Promise.allSettled([
      apiFetch<unknown[]>(`/fixtures/statistics?fixture=${fixtureId}`),
      apiFetch<unknown[]>(`/odds?fixture=${fixtureId}`),
    ]);

    if (oddsRes.status === 'fulfilled') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oddsData = oddsRes.value as any[];
      if (oddsData.length) {
        fixture.odds = [];
        // Basic extraction
      }
    }

    void statsRes;
    return fixture;
  }

  async getLeagues(): Promise<League[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>('/leagues?current=true&type=League');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.slice(0, 50).map((l: any) => ({
      id: String(l.league.id),
      name: l.league.name,
      country: l.country.name,
      logo: l.league.logo,
      flag: l.country.flag,
      season: l.seasons?.[0]?.year ?? new Date().getFullYear(),
    }));
  }

  getDataQuality(fixture: Fixture): DataQuality {
    return getDataQuality(fixture);
  }
}
