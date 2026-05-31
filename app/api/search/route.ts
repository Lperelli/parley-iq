import { NextRequest, NextResponse } from 'next/server';
import { getFootballProvider } from '@/services/football';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (q.length < 2) return NextResponse.json({ fixtures: [], teams: [], leagues: [] });

  try {
    const provider = getFootballProvider();
    const results = await provider.searchFixtures(q);
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error en búsqueda';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
