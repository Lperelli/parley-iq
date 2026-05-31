import { NextRequest, NextResponse } from 'next/server';
import { analyzeParley } from '@/services/ai/groqService';
import { ParleyPick } from '@/types/parley';

export async function POST(req: NextRequest) {
  let picks: ParleyPick[];
  try {
    const body = await req.json();
    picks = body.picks;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  if (!picks?.length) {
    return NextResponse.json({ error: 'Se requiere al menos una selección' }, { status: 400 });
  }

  try {
    const analysis = await analyzeParley(picks);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al analizar el parley';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
