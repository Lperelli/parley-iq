import { MatchAnalysis, MatchAnalysisInput } from '@/types/analysis';
import { ParleyPick, ParleyAIAnalysis } from '@/types/parley';
import { Fixture } from '@/types/football';
import { DataQuality } from '@/types/football';
import { DailyPick, DailyPicksResult } from '@/types/picks';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const SYSTEM_PROMPT = `Eres un analista profesional de datos de fútbol/soccer. Tu trabajo es analizar partidos usando SOLO los datos estructurados proporcionados. NO debes inventar lesiones, estadísticas, cuotas, tendencias, alineaciones ni hechos. Si faltan datos, responde "datos insuficientes". NO debes proporcionar consejos de apuestas garantizados. NO uses frases como "apuesta segura", "sure bet", "lock", "garantizado", "debes apostar" o "100% ganador". Tu análisis debe ser responsable, estadístico y consciente del riesgo. Explica siempre la incertidumbre. Incluye siempre una nota de juego responsable. Devuelve SOLO JSON válido.`;

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no configurado. Por favor agrega tu clave en .env.local');
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function analyzeMatch(fixture: Fixture, dataQuality: DataQuality): Promise<MatchAnalysis> {
  const input: MatchAnalysisInput = {
    match: {
      fixtureId: fixture.id,
      league: fixture.league.name,
      season: String(fixture.season),
      date: fixture.date,
      status: fixture.status,
      venue: fixture.venue,
      homeTeam: {
        id: fixture.homeTeam.id,
        name: fixture.homeTeam.name,
        logo: fixture.homeTeam.logo,
        standingPosition: String(fixture.homeStanding ?? 'desconocido'),
        recentForm: fixture.homeForm?.map(f => `${f.result} ${f.goalsScored}-${f.goalsConceded} vs ${f.opponent}`) ?? [],
        homeStats: (fixture.homeStats?.home ?? {}) as Record<string, unknown>,
        overallStats: (fixture.homeStats?.overall ?? {}) as Record<string, unknown>,
      },
      awayTeam: {
        id: fixture.awayTeam.id,
        name: fixture.awayTeam.name,
        logo: fixture.awayTeam.logo,
        standingPosition: String(fixture.awayStanding ?? 'desconocido'),
        recentForm: fixture.awayForm?.map(f => `${f.result} ${f.goalsScored}-${f.goalsConceded} vs ${f.opponent}`) ?? [],
        awayStats: (fixture.awayStats?.away ?? {}) as Record<string, unknown>,
        overallStats: (fixture.awayStats?.overall ?? {}) as Record<string, unknown>,
      },
    },
    statistics: {
      headToHead: fixture.headToHead ?? [],
      goals: {},
      cleanSheets: {},
      btts: {},
      overUnder: {},
      xg: {},
      injuries: fixture.injuries ?? [],
      lineups: [],
      odds: fixture.odds ?? [],
    },
    marketsToAnalyze: [
      'victoria_local', 'empate', 'victoria_visitante',
      'doble_chance_1X', 'doble_chance_X2',
      'mas_1_5_goles', 'mas_2_5_goles',
      'ambos_anotan_si', 'ambos_anotan_no',
    ],
    dataQuality: {
      hasRecentForm: dataQuality.hasRecentForm,
      hasH2H: dataQuality.hasH2H,
      hasOdds: dataQuality.hasOdds,
      hasInjuries: dataQuality.hasInjuries,
      hasLineups: dataQuality.hasLineups,
    },
  };

  const userPrompt = `Analiza este partido de fútbol y devuelve un JSON con este esquema exacto:
{
  "match_summary": "string (2-3 oraciones en español)",
  "data_quality_score": number (0-100),
  "overall_confidence": "low|medium|high",
  "key_factors": [{"title":"string","description":"string","impact":"low|medium|high"}],
  "probable_scenarios": [{"scenario":"string","estimated_probability":number,"confidence":"low|medium|high","risk":"low|medium|high","reasoning":"string"}],
  "markets_to_consider": [{"market":"string","estimated_probability":number,"confidence":"low|medium|high","risk":"low|medium|high","reasoning":"string"}],
  "markets_to_avoid": [{"market":"string","risk":"low|medium|high","reasoning":"string"}],
  "danger_zones": [{"title":"string","description":"string"}],
  "data_limitations": ["string"],
  "responsible_conclusion": "string (nota de juego responsable en español)"
}

Datos del partido:
${JSON.stringify(input, null, 2)}`;

  const content = await callGroq([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('La IA devolvió una respuesta inválida. Por favor intenta de nuevo.');
  }

  return {
    fixtureId: fixture.id,
    matchName: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
    analyzedAt: new Date().toISOString(),
    matchSummary: String(parsed.match_summary ?? ''),
    dataQualityScore: Number(parsed.data_quality_score ?? 0),
    overallConfidence: (parsed.overall_confidence as 'low' | 'medium' | 'high') ?? 'low',
    keyFactors: (parsed.key_factors as MatchAnalysis['keyFactors']) ?? [],
    probableScenarios: (parsed.probable_scenarios as MatchAnalysis['probableScenarios']) ?? [],
    marketsToConsider: (parsed.markets_to_consider as MatchAnalysis['marketsToConsider']) ?? [],
    marketsToAvoid: (parsed.markets_to_avoid as MatchAnalysis['marketsToAvoid']) ?? [],
    dangerZones: (parsed.danger_zones as MatchAnalysis['dangerZones']) ?? [],
    dataLimitations: (parsed.data_limitations as string[]) ?? [],
    responsibleConclusion: String(parsed.responsible_conclusion ?? ''),
  };
}

export async function analyzeParley(picks: ParleyPick[]): Promise<ParleyAIAnalysis> {
  const userPrompt = `Analiza este parley de fútbol y devuelve un JSON con este esquema exacto:
{
  "parley_summary": "string (resumen en español)",
  "combined_risk": "low|medium|high|extreme",
  "combined_probability_comment": "string",
  "strongest_legs": ["string"],
  "weakest_legs": ["string"],
  "correlation_warnings": ["string"],
  "risk_reduction_suggestions": ["string"],
  "responsible_conclusion": "string"
}

Picks del parley:
${JSON.stringify(picks.map(p => ({
  partido: p.matchName,
  mercado: p.market,
  seleccion: p.selection,
  cuota: p.odds,
  probabilidad_estimada: p.estimatedProbability,
  confianza: p.confidence,
  riesgo: p.risk,
  razonamiento_ia: p.aiReasoning,
})), null, 2)}`;

  const content = await callGroq([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('La IA devolvió una respuesta inválida para el parley.');
  }

  return {
    parleySummary: String(parsed.parley_summary ?? ''),
    combinedRisk: (parsed.combined_risk as ParleyAIAnalysis['combinedRisk']) ?? 'high',
    combinedProbabilityComment: String(parsed.combined_probability_comment ?? ''),
    strongestLegs: (parsed.strongest_legs as string[]) ?? [],
    weakestLegs: (parsed.weakest_legs as string[]) ?? [],
    correlationWarnings: (parsed.correlation_warnings as string[]) ?? [],
    riskReductionSuggestions: (parsed.risk_reduction_suggestions as string[]) ?? [],
    responsibleConclusion: String(parsed.responsible_conclusion ?? ''),
  };
}

export async function generateDailyPicks(fixtures: Fixture[]): Promise<DailyPicksResult> {
  const fixturesSummary = fixtures.slice(0, 10).map(f => ({
    id: f.id,
    partido: `${f.homeTeam.name} vs ${f.awayTeam.name}`,
    liga: f.league.name,
    fecha: f.date,
    local: {
      nombre: f.homeTeam.name,
      posicion: f.homeStanding ?? null,
      forma: f.homeForm?.slice(0, 5).map(x => x.result).join('') ?? 'N/D',
      goles_marcados_local: f.homeStats?.home?.goalsScored ?? null,
      goles_recibidos_local: f.homeStats?.home?.goalsConceded ?? null,
      over25_pct: f.homeStats?.home?.over25Percentage ?? null,
      btts_pct: f.homeStats?.home?.bttsPercentage ?? null,
      clean_sheet_pct: f.homeStats?.home?.cleanSheetPercentage ?? null,
      avg_goles: f.homeStats?.home?.avgGoalsScored ?? null,
    },
    visitante: {
      nombre: f.awayTeam.name,
      posicion: f.awayStanding ?? null,
      forma: f.awayForm?.slice(0, 5).map(x => x.result).join('') ?? 'N/D',
      goles_marcados_visit: f.awayStats?.away?.goalsScored ?? null,
      goles_recibidos_visit: f.awayStats?.away?.goalsConceded ?? null,
      over25_pct: f.awayStats?.away?.over25Percentage ?? null,
      btts_pct: f.awayStats?.away?.bttsPercentage ?? null,
      clean_sheet_pct: f.awayStats?.away?.cleanSheetPercentage ?? null,
      avg_goles: f.awayStats?.away?.avgGoalsScored ?? null,
    },
    h2h_reciente: f.headToHead?.slice(0, 3).map(h => `${h.homeTeam} ${h.homeGoals}-${h.awayGoals} ${h.awayTeam}`) ?? [],
    cuotas_disponibles: f.odds?.slice(0, 6).map(o => ({ mercado: o.market, seleccion: o.selection, decimal: o.decimal, prob: o.impliedProbability })) ?? [],
  }));

  const userPrompt = `Eres un analista de datos de fútbol. Analiza TODOS estos partidos del día usando los datos estadísticos provistos y selecciona los mejores picks.

IMPORTANTE: 
- Basate SOLO en los datos provistos. No inventes nada.
- Selecciona entre 5 y 8 picks en total entre todos los partidos.
- Prioriza picks con alta probabilidad estadística (>55%) y buena justificación.
- Mezcla mercados: victoria local/visitante, doble oportunidad, over/under goles, ambos anotan.
- NO uses frases como "apuesta segura", "seguro", "garantizado".

Devuelve SOLO este JSON:
{
  "picks": [
    {
      "fixture_id": "string",
      "partido": "string",
      "mercado": "string (ej: Más de 2.5 goles, Victoria local, Ambos anotan - Sí, Doble oportunidad 1X)",
      "seleccion": "string (ej: Sí, Local, Más de 2.5)",
      "razonamiento": "string (2 oraciones máximo explicando el pick con datos)",
      "probabilidad": number (0-100, basado en estadísticas),
      "confianza": "low|medium|high",
      "riesgo": "low|medium|high",
      "valor_score": number (0-100, qué tan valioso es el pick)
    }
  ],
  "resumen_general": "string (1 oración sobre la jornada)"
}

Partidos a analizar:
${JSON.stringify(fixturesSummary, null, 2)}`;

  const content = await callGroq([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('La IA devolvió una respuesta inválida para los picks del día.');
  }

  const rawPicks = (parsed.picks as Record<string, unknown>[]) ?? [];

  const picks: DailyPick[] = rawPicks.map((p, i) => {
    const fixtureId = String(p.fixture_id ?? '');
    const fixture = fixtures.find(f => f.id === fixtureId) ?? fixtures[0];
    const probability = Number(p.probabilidad ?? 50);
    const impliedOdds = probability > 0 ? parseFloat((100 / probability).toFixed(2)) : 2.0;

    return {
      id: `dp-${Date.now()}-${i}`,
      fixtureId,
      matchName: String(p.partido ?? ''),
      homeTeam: fixture?.homeTeam?.name ?? '',
      awayTeam: fixture?.awayTeam?.name ?? '',
      league: fixture?.league?.name ?? '',
      leagueLogo: fixture?.league?.logo ?? '',
      matchDate: fixture?.date ?? '',
      market: String(p.mercado ?? ''),
      selection: String(p.seleccion ?? ''),
      reasoning: String(p.razonamiento ?? ''),
      probability,
      impliedOdds,
      confidence: (p.confianza as 'low' | 'medium' | 'high') ?? 'medium',
      risk: (p.riesgo as 'low' | 'medium' | 'high') ?? 'medium',
      valueScore: Number(p.valor_score ?? 50),
    };
  });

  // Sort by valueScore desc
  picks.sort((a, b) => b.valueScore - a.valueScore);

  return {
    generatedAt: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }),
    totalMatchesAnalyzed: fixtures.length,
    picks,
    disclaimer: 'Estos picks son análisis estadísticos. No son consejos de apuesta. La probabilidad no garantiza resultados. Juega responsablemente.',
  };
}
