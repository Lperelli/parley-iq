import { NextRequest, NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';
import { cache, TTL } from '@/lib/cache';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cacheKey = `fixture:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const provider = getFootballProvider();
    const fixture = await provider.getFixtureById(id);
    if (!fixture) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });

    cache.set(cacheKey, fixture, TTL.FIXTURES);
    return NextResponse.json(fixture);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
