import { NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';
import { generateDailyPicks } from '@/services/ai/groqService';

// Cache: 30 minutes for daily picks (expensive call)
const cache = new Map<string, { data: unknown; expiry: number }>();

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `picks-del-dia-${today}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const provider = getFootballProvider();

    // Fetch today's fixtures + popular ones
    const [todayFixtures, popularFixtures] = await Promise.all([
      provider.getTodayFixtures(),
      provider.getPopularFixtures(),
    ]);

    // Merge and deduplicate
    const seen = new Set<string>();
    const fixtures = [...todayFixtures, ...popularFixtures].filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    }).slice(0, 10);

    if (fixtures.length === 0) {
      return NextResponse.json({ error: 'No hay partidos disponibles hoy' }, { status: 404 });
    }

    const result = await generateDailyPicks(fixtures);

    // Cache 30 min
    cache.set(cacheKey, { data: result, expiry: Date.now() + 30 * 60 * 1000 });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error generando picks del día';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
