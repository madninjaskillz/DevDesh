import type { TrendDataPoint } from '../types/github';
import { todayString } from './dates';

const STORAGE_KEY = 'devdesh-trends';

export function loadTrendHistory(): TrendDataPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TrendDataPoint[];
  } catch {
    return [];
  }
}

export function saveDailySnapshot(data: Omit<TrendDataPoint, 'date'>): TrendDataPoint[] {
  const history = loadTrendHistory();
  const today = todayString();

  const existingIndex = history.findIndex((p) => p.date === today);
  const point: TrendDataPoint = { date: today, ...data };

  if (existingIndex >= 0) {
    history[existingIndex] = point;
  } else {
    history.push(point);
  }

  // Keep last 365 days
  const trimmed = history.slice(-365);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}
