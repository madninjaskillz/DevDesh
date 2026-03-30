import { createContext, useContext, useCallback, useState } from 'react';

const STORAGE_KEY = 'devdash-settings';

export interface AppSettings {
  staleIssueDays: number;
  staleCommentDays: number;
  stalePRApprovedDays: number;
  staleReviewRequestDays: number;
  focusMode: boolean;
  quietMode: boolean;
  autoCollapseEmpty: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  staleIssueDays: 7,
  staleCommentDays: 2,
  stalePRApprovedDays: 1,
  staleReviewRequestDays: 3,
  focusMode: false,
  quietMode: false,
  autoCollapseEmpty: true,
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettingsProvider(): SettingsContextValue {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
