import { NextRequest, NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';
import { analyzeMatch } from '@/services/ai/groqService';
import { cache, TTL } from '@/lib/cache';

export async function POST(req: NextRequest) {
  let fixtureId: string;
  try {
    const body = await req.json();
    fixtureId = body.fixtureId;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  if (!fixtureId) {
    return NextResponse.json({ error: 'fixtureId requerido' }, { status: 400 });
  }

  const cacheKey = `analysis:${fixtureId}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const provider = getFootballProvider();
    const fixture = await provider.getFixtureById(fixtureId);
    if (!fixture) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });

    const dataQuality = provider.getDataQuality(fixture);
    const analysis = await analyzeMatch(fixture, dataQuality);

    cache.set(cacheKey, analysis, TTL.AI_ANALYSIS);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al analizar el partido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
