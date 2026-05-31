import { NextRequest, NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';
import { cache, TTL } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const leagueId = searchParams.get('league') ?? '39';
  const season = parseInt(searchParams.get('season') ?? '2024');

  const cacheKey = `standings:${leagueId}:${season}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const provider = getFootballProvider();
    const standings = await provider.getStandings(leagueId, season);
    cache.set(cacheKey, standings, TTL.STANDINGS ?? 3600);
    return NextResponse.json(standings);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
