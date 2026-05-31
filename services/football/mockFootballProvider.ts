import { FootballProvider, getDataQuality } from './footballProvider';
import { Fixture, League, SearchResult, DataQuality, Standing } from '@/types/football';
import { MOCK_FIXTURES, MOCK_LEAGUES } from './mockData';

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export class MockFootballProvider implements FootballProvider {
  private delay(ms = 400): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTodayFixtures(): Promise<Fixture[]> {
    await this.delay();
    return MOCK_FIXTURES.filter(f => f.date.startsWith(getTodayStr()));
  }

  async getUpcomingFixtures(date: string): Promise<Fixture[]> {
    await this.delay();
    return MOCK_FIXTURES.filter(f => f.date.startsWith(date));
  }

  async getLiveFixtures(): Promise<Fixture[]> {
    await this.delay(200);
    return MOCK_FIXTURES.filter(f => ['1H', '2H', 'HT', 'ET', 'LIVE'].includes(f.status));
  }

  async getPopularFixtures(): Promise<Fixture[]> {
    await this.delay(300);
    return MOCK_FIXTURES.filter(f => f.isPopular);
  }

  async searchFixtures(query: string): Promise<SearchResult> {
    await this.delay(300);
    const q = query.toLowerCase();
    const fixtures = MOCK_FIXTURES.filter(f =>
      f.homeTeam.name.toLowerCase().includes(q) ||
      f.awayTeam.name.toLowerCase().includes(q) ||
      f.league.name.toLowerCase().includes(q)
    );
    return {
      fixtures,
      teams: [],
      leagues: MOCK_LEAGUES.filter(l => l.name.toLowerCase().includes(q)),
    };
  }

  async getFixtureById(fixtureId: string): Promise<Fixture | null> {
    await this.delay(300);
    return MOCK_FIXTURES.find(f => f.id === fixtureId) ?? null;
  }

  async getLeagues(): Promise<League[]> {
    await this.delay(200);
    return MOCK_LEAGUES;
  }

  async getStandings(_leagueId: string, _season: number): Promise<Standing[]> {
    return [];
  }

  getDataQuality(fixture: Fixture): DataQuality {
    return getDataQuality(fixture);
  }
}
