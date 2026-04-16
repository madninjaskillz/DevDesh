import type { TrendDataPoint } from '../types/github';
import { format, subDays, differenceInDays } from 'date-fns';

interface HistoricalItem {
  created_at: string;
  closed_at: string | null;
  merged_at?: string | null;
}

/** Pre-parsed item with Date objects cached for reuse across 91 loop iterations. */
interface ParsedItem {
  created: Date;
  closed: Date | null;
  merged: Date | null;
  createdMs: number;
}

function parseItems(items: HistoricalItem[]): ParsedItem[] {
  return items.map((item) => {
    const created = new Date(item.created_at);
    const closed = item.closed_at ? new Date(item.closed_at) : null;
    const merged = item.merged_at ? new Date(item.merged_at) : null;
    return { created, closed, merged, createdMs: created.getTime() };
  });
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

  // Pre-parse all dates once instead of inside the O(days × items) loop
  const parsedIssues = parseItems(issues);
  const parsedPRs = parseItems(prs);

  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const endOfDayMs = endOfDay.getTime();

    const openIssues = parsedIssues.filter((item) => isOpenOnDate(item, endOfDayMs));
    const openPRs = parsedPRs.filter((item) => isOpenOnDate(item, endOfDayMs));

    const issueAges = openIssues.map((item) => Math.max(0, differenceInDays(endOfDay, item.created)));
    const prAges = openPRs.map((item) => Math.max(0, differenceInDays(endOfDay, item.created)));

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
    const startOfDayMs = startOfDay.getTime();
    const closedIssuesToday = parsedIssues.filter((item) => wasClosedBetween(item, startOfDayMs, endOfDayMs)).length;
    const closedPRsToday = parsedPRs.filter((item) => wasClosedBetween(item, startOfDayMs, endOfDayMs)).length;

    const rolling30Start = subDays(endOfDay, 30);
    const rolling30StartMs = rolling30Start.getTime();
    const closedIssues30d = parsedIssues.filter((item) => wasClosedBetween(item, rolling30StartMs, endOfDayMs)).length;
    const closedPRs30d = parsedPRs.filter((item) => wasClosedBetween(item, rolling30StartMs, endOfDayMs)).length;

    // PR cycle time: average days from created to merged for PRs merged in rolling 30d window
    const mergedInWindow = parsedPRs.filter((item) => {
      if (!item.merged) return false;
      const mergedMs = item.merged.getTime();
      return mergedMs >= rolling30StartMs && mergedMs <= endOfDayMs;
    });
    const avgCycleTimeDays = mergedInWindow.length > 0
      ? Math.round(mergedInWindow.reduce((sum, item) => sum + Math.max(0, differenceInDays(item.merged!, item.created)), 0) / mergedInWindow.length)
      : 0;

    // Aging buckets
    const bucket = (ages: number[]) => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
      for (const age of ages) {
        if (age < 3) b0++;
        else if (age < 7) b1++;
        else if (age < 14) b2++;
        else b3++;
      }
      return [b0, b1, b2, b3] as const;
    };
    const [issuesAge0to3, issuesAge3to7, issuesAge7to14, issuesAge14plus] = bucket(issueAges);
    const [prsAge0to3, prsAge3to7, prsAge7to14, prsAge14plus] = bucket(prAges);

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
      avgCycleTimeDays,
      issuesAge0to3,
      issuesAge3to7,
      issuesAge7to14,
      issuesAge14plus,
      prsAge0to3,
      prsAge3to7,
      prsAge7to14,
      prsAge14plus,
    });
  }

  return points;
}

function isOpenOnDate(item: ParsedItem, endOfDayMs: number): boolean {
  if (item.createdMs > endOfDayMs) return false;
  if (item.closed === null) return true;
  return item.closed.getTime() > endOfDayMs;
}

function wasClosedBetween(item: ParsedItem, startMs: number, endMs: number): boolean {
  if (item.closed === null) return false;
  const closedMs = item.closed.getTime();
  return closedMs >= startMs && closedMs <= endMs;
}
