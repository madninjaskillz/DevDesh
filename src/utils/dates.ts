import { differenceInDays, differenceInHours, format, parseISO } from 'date-fns';

export function daysAgo(dateString: string): number {
  return differenceInDays(new Date(), parseISO(dateString));
}

export function hoursAgo(dateString: string): number {
  return differenceInHours(new Date(), parseISO(dateString));
}

export function formatAge(days: number): string {
  if (days === 0) return '<1d';
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  const remaining = days % 7;
  if (days < 30) {
    return remaining > 0 ? `${weeks}w ${remaining}d` : `${weeks}w`;
  }
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  return remainingDays > 0 ? `${months}mo ${remainingDays}d` : `${months}mo`;
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy');
}

export function getAgeColor(days: number): 'success' | 'warning' | 'error' {
  if (days < 7) return 'success';
  if (days < 14) return 'warning';
  return 'error';
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
