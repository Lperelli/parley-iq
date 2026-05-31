import { NextRequest, NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';
import { cache, TTL } from '@/lib/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const cacheKey = `squad:${teamId}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const provider = getFootballProvider();
    const squad = await provider.getSquad(teamId);
    if (!squad) return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    cache.set(cacheKey, squad, TTL.STANDINGS); // 1h cache
    return NextResponse.json(squad);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
