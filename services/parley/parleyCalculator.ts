import { ParleyPick, ParleyCalculation, ParleyWarning } from '@/types/parley';
import { RiskLevel } from '@/types/analysis';

export function calculateParley(picks: ParleyPick[], stake: number): ParleyCalculation {
  if (!picks.length) {
    return {
      picks: [],
      legs: 0,
      combinedOdds: 1,
      combinedProbability: 100,
      potentialReturn: stake,
      stake,
      totalRiskScore: 0,
      riskLevel: 'low',
      warnings: [],
    };
  }

  const combinedOdds = picks.reduce((acc, p) => acc * p.odds, 1);
  const combinedProbability = picks.reduce((acc, p) => acc * (p.estimatedProbability / 100), 1) * 100;
  const potentialReturn = parseFloat((stake * combinedOdds).toFixed(2));

  const warnings: ParleyWarning[] = [];

  if (picks.length >= 6) {
    warnings.push({
      type: 'too_many_legs',
      message: `${picks.length} selecciones en el parley. Más piernas = más riesgo acumulado.`,
      severity: 'danger',
    });
  } else if (picks.length >= 4) {
    warnings.push({
      type: 'too_many_legs',
      message: `${picks.length} selecciones detectadas. La probabilidad combinada disminuye significativamente.`,
      severity: 'warning',
    });
  }

  if (combinedProbability < 10) {
    warnings.push({
      type: 'low_probability',
      message: `Probabilidad combinada muy baja (~${combinedProbability.toFixed(1)}%). Este parley es estadísticamente muy difícil.`,
      severity: 'danger',
    });
  } else if (combinedProbability < 25) {
    warnings.push({
      type: 'low_probability',
      message: `Probabilidad combinada baja (~${combinedProbability.toFixed(1)}%). Considera reducir las selecciones.`,
      severity: 'warning',
    });
  }

  const highRiskPicks = picks.filter(p => p.risk === 'high' || p.risk === 'extreme');
  if (highRiskPicks.length >= 2) {
    warnings.push({
      type: 'high_risk',
      message: `${highRiskPicks.length} selecciones con riesgo alto/extremo. El parley es muy agresivo.`,
      severity: 'danger',
    });
  }

  const lowConfPicks = picks.filter(p => p.confidence === 'low');
  if (lowConfPicks.length >= 2) {
    warnings.push({
      type: 'weak_data',
      message: `${lowConfPicks.length} selecciones con confianza baja en los datos. El análisis puede ser limitado.`,
      severity: 'warning',
    });
  }

  // Correlation check: same league picks
  const leagues = picks.map(p => p.league);
  const leagueCounts = leagues.reduce<Record<string, number>>((acc, l) => {
    acc[l] = (acc[l] ?? 0) + 1;
    return acc;
  }, {});
  const correlated = Object.entries(leagueCounts).filter(([, count]) => count >= 3);
  if (correlated.length) {
    warnings.push({
      type: 'correlation',
      message: `Múltiples partidos de la misma liga detectados. Las selecciones pueden estar correlacionadas.`,
      severity: 'warning',
    });
  }

  // Risk score calculation (0-100)
  const avgRisk = picks.reduce((acc, p) => {
    const map: Record<RiskLevel, number> = { low: 25, medium: 50, high: 75, extreme: 100 };
    return acc + map[p.risk];
  }, 0) / picks.length;

  const legsMultiplier = Math.min(picks.length / 3, 2);
  const probPenalty = combinedProbability < 20 ? 20 : 0;
  const totalRiskScore = Math.min(100, Math.round(avgRisk * legsMultiplier + probPenalty));

  let riskLevel: RiskLevel;
  if (totalRiskScore >= 80) riskLevel = 'extreme';
  else if (totalRiskScore >= 60) riskLevel = 'high';
  else if (totalRiskScore >= 35) riskLevel = 'medium';
  else riskLevel = 'low';

  return {
    picks,
    legs: picks.length,
    combinedOdds: parseFloat(combinedOdds.toFixed(2)),
    combinedProbability: parseFloat(combinedProbability.toFixed(2)),
    potentialReturn,
    stake,
    totalRiskScore,
    riskLevel,
    warnings,
  };
}
