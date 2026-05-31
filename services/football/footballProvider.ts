import { Fixture, League, Team, SearchResult, DataQuality } from '@/types/football';

export interface FootballProvider {
  getTodayFixtures(): Promise<Fixture[]>;
  getUpcomingFixtures(date: string): Promise<Fixture[]>;
  getLiveFixtures(): Promise<Fixture[]>;
  getPopularFixtures(): Promise<Fixture[]>;
  searchFixtures(query: string): Promise<SearchResult>;
  getFixtureById(fixtureId: string): Promise<Fixture | null>;
  getLeagues(): Promise<League[]>;
  getDataQuality(fixture: Fixture): DataQuality;
}

export function getDataQuality(fixture: Fixture): DataQuality {
  return {
    hasRecentForm: Boolean(fixture.homeForm?.length && fixture.awayForm?.length),
    hasH2H: Boolean(fixture.headToHead?.length),
    hasOdds: Boolean(fixture.odds?.length),
    hasInjuries: Boolean(fixture.injuries?.length),
    hasLineups: false,
    hasXG: Boolean(fixture.homeStats?.overall.xgFor),
    hasStandings: Boolean(fixture.homeStanding && fixture.awayStanding),
  };
}
