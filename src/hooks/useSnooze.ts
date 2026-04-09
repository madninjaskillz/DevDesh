import { useState, useCallback } from 'react';

const STORAGE_KEY = 'devdash-snoozed-actions';

interface SnoozedEntry {
  id: string;
  expiresAt: string;
}

export interface UseSnoozeReturn {
  isSnoozed: (id: string) => boolean;
  snooze: (id: string, days: number) => void;
  unsnooze: (id: string) => void;
  unsnoozeAll: () => void;
  snoozedCount: number;
}

function loadSnoozed(): SnoozedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: SnoozedEntry[] = JSON.parse(raw);
    const now = new Date().toISOString();
    return entries.filter((e) => e.expiresAt > now);
  } catch {
    return [];
  }
}

function saveSnoozed(entries: SnoozedEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useSnooze(): UseSnoozeReturn {
  const [entries, setEntries] = useState<SnoozedEntry[]>(loadSnoozed);

  const isSnoozed = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      return entries.some((e) => e.id === id && e.expiresAt > now);
    },
    [entries],
  );

  const snooze = useCallback((id: string, days: number) => {
    setEntries((prev) => {
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
      const next = [...prev.filter((e) => e.id !== id), { id, expiresAt }];
      saveSnoozed(next);
      return next;
    });
  }, []);

  const unsnooze = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveSnoozed(next);
      return next;
    });
  }, []);

  const unsnoozeAll = useCallback(() => {
    setEntries([]);
    saveSnoozed([]);
  }, []);

  const now = new Date().toISOString();
  const snoozedCount = entries.filter((e) => e.expiresAt > now).length;

  return { isSnoozed, snooze, unsnooze, unsnoozeAll, snoozedCount };
}
