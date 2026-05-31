import { FootballProvider } from './footballProvider';
import { MockFootballProvider } from './mockFootballProvider';
import { ApiFootballProvider } from './apiFootballProvider';

let _provider: FootballProvider | null = null;

export function getFootballProvider(): FootballProvider {
  if (_provider) return _provider;

  const hasApiKey = Boolean(process.env.FOOTBALL_API_KEY);
  _provider = hasApiKey ? new ApiFootballProvider() : new MockFootballProvider();
  return _provider;
}

export { MockFootballProvider, ApiFootballProvider };
export type { FootballProvider };
