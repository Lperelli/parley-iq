import { NextRequest, NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';
import { cache, TTL } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tab = searchParams.get('tab') ?? 'hoy';
  const date = searchParams.get('date') ?? '';

  const cacheKey = `fixtures:${tab}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const provider = getFootballProvider();
    let fixtures;

    if (tab === 'vivo') {
      fixtures = await provider.getLiveFixtures();
    } else if (tab === 'populares') {
      fixtures = await provider.getPopularFixtures();
    } else if (date) {
      fixtures = await provider.getUpcomingFixtures(date);
    } else {
      fixtures = await provider.getTodayFixtures();
    }

    const ttl = tab === 'vivo' ? TTL.LIVE_FIXTURES : TTL.FIXTURES;
    cache.set(cacheKey, fixtures, ttl);

    return NextResponse.json(fixtures);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
