import type { TrendDataPoint } from '../types/github';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

interface HistoricalItem {
  created_at: string;
  closed_at: string | null;
}

/**
 * Given a list of items (open + recently closed), reconstruct daily snapshots
 * for the last `days` days. An item is "open on date D" if it was created on
 * or before D and either still open (closed_at is null) or closed after D.
 */
export function computeTrendData(
  issues: HistoricalItem[],
  prs: HistoricalItem[],
  days: number = 30,
): TrendDataPoint[] {
  const today = new Date();
  const points: TrendDataPoint[] = [];

  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const openIssues = issues.filter((item) => isOpenOnDate(item, endOfDay));
    const openPRs = prs.filter((item) => isOpenOnDate(item, endOfDay));

    const avgIssueAgeDays = openIssues.length > 0
      ? Math.round(openIssues.reduce((sum, item) => sum + Math.max(0, differenceInDays(endOfDay, parseISO(item.created_at))), 0) / openIssues.length)
      : 0;

    const avgPRAgeDays = openPRs.length > 0
      ? Math.round(openPRs.reduce((sum, item) => sum + Math.max(0, differenceInDays(endOfDay, parseISO(item.created_at))), 0) / openPRs.length)
      : 0;

    points.push({
      date: dateStr,
      openIssues: openIssues.length,
      openPRs: openPRs.length,
      avgIssueAgeDays,
      avgPRAgeDays,
    });
  }

  return points;
}

function isOpenOnDate(item: HistoricalItem, date: Date): boolean {
  const created = parseISO(item.created_at);
  if (created > date) return false;
  if (item.closed_at === null) return true;
  const closed = parseISO(item.closed_at);
  return closed > date;
}
