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

    const issueAges = openIssues.map((item) => Math.max(0, differenceInDays(endOfDay, parseISO(item.created_at))));
    const prAges = openPRs.map((item) => Math.max(0, differenceInDays(endOfDay, parseISO(item.created_at))));

    const avgIssueAgeDays = issueAges.length > 0
      ? Math.round(issueAges.reduce((sum, age) => sum + age, 0) / issueAges.length)
      : 0;
    const avgPRAgeDays = prAges.length > 0
      ? Math.round(prAges.reduce((sum, age) => sum + age, 0) / prAges.length)
      : 0;
    const maxIssueAgeDays = issueAges.length > 0 ? Math.max(...issueAges) : 0;
    const maxPRAgeDays = prAges.length > 0 ? Math.max(...prAges) : 0;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const closedIssuesToday = issues.filter((item) => wasClosedBetween(item, startOfDay, endOfDay)).length;
    const closedPRsToday = prs.filter((item) => wasClosedBetween(item, startOfDay, endOfDay)).length;

    const rolling30Start = subDays(endOfDay, 30);
    const closedIssues30d = issues.filter((item) => wasClosedBetween(item, rolling30Start, endOfDay)).length;
    const closedPRs30d = prs.filter((item) => wasClosedBetween(item, rolling30Start, endOfDay)).length;

    points.push({
      date: dateStr,
      openIssues: openIssues.length,
      openPRs: openPRs.length,
      avgIssueAgeDays,
      avgPRAgeDays,
      maxIssueAgeDays,
      maxPRAgeDays,
      closedIssuesToday,
      closedPRsToday,
      closedIssues30d,
      closedPRs30d,
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

function wasClosedBetween(item: HistoricalItem, start: Date, end: Date): boolean {
  if (item.closed_at === null) return false;
  const closed = parseISO(item.closed_at);
  return closed >= start && closed <= end;
}
