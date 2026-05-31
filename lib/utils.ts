import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FixtureStatus } from '@/types/football';
import { RiskLevel, ConfidenceLevel } from '@/types/analysis';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} · ${formatTime(dateStr)}`;
}

export function getStatusLabel(status: FixtureStatus, elapsed?: number): string {
  const map: Record<string, string> = {
    NS: 'Por jugar',
    '1H': elapsed ? `${elapsed}'` : 'En vivo',
    HT: 'Medio tiempo',
    '2H': elapsed ? `${elapsed}'` : 'En vivo',
    ET: 'Prórroga',
    P: 'Penales',
    FT: 'Final',
    AET: 'Final (Prórroga)',
    PEN: 'Final (Penales)',
    PST: 'Aplazado',
    CANC: 'Cancelado',
    SUSP: 'Suspendido',
    LIVE: 'En vivo',
  };
  return map[status] ?? status;
}

export function isLive(status: FixtureStatus): boolean {
  return ['1H', '2H', 'ET', 'P', 'HT', 'LIVE'].includes(status);
}

export function isFinished(status: FixtureStatus): boolean {
  return ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status);
}

export function getRiskColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    extreme: '#dc2626',
  };
  return map[risk];
}

export function getRiskLabel(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    extreme: 'Extremo',
  };
  return map[risk];
}

export function getConfidenceLabel(confidence: ConfidenceLevel): string {
  const map: Record<ConfidenceLevel, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };
  return map[confidence];
}

export function getFormColor(result: 'W' | 'D' | 'L'): string {
  return result === 'W' ? '#22c55e' : result === 'D' ? '#f59e0b' : '#ef4444';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function formatOdds(decimal: number): string {
  return decimal.toFixed(2);
}

export function calculateImpliedProbability(decimal: number): number {
  return parseFloat(((1 / decimal) * 100).toFixed(1));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
