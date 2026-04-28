import { useEffect, useState, useCallback, useRef } from 'react';
import {
  loadFileHandle,
  ensureReadPermission,
  readMeetingsFile,
  type OutlookMeeting,
} from '../utils/outlook';
import { useSettings } from './useSettings';

export interface OutlookMeetingsState {
  configured: boolean;
  meetings: OutlookMeeting[];
  generatedAt: string | null;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
}

const POLL_MS = 60_000;

export function useOutlookMeetings(): OutlookMeetingsState {
  const { settings } = useSettings();
  const enabled = settings.outlookEnabled;
  const [meetings, setMeetings] = useState<OutlookMeeting[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const handleRef = useRef<FileSystemFileHandle | null>(null);

  const load = useCallback(async () => {
    try {
      let handle = handleRef.current;
      if (!handle) {
        handle = await loadFileHandle();
        handleRef.current = handle;
      }
      if (!handle) {
        setConfigured(false);
        setMeetings([]);
        setGeneratedAt(null);
        return;
      }
      setConfigured(true);

      const ok = await ensureReadPermission(handle);
      if (!ok) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);

      const data = await readMeetingsFile(handle);
      setMeetings(data.meetings);
      setGeneratedAt(data.generatedAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setMeetings([]);
      setGeneratedAt(null);
      setConfigured(false);
      setError(null);
      handleRef.current = null;
      return;
    }
    void load();
    const id = setInterval(() => { void load(); }, POLL_MS);
    return () => clearInterval(id);
  }, [enabled, load]);

  return {
    configured,
    meetings,
    generatedAt,
    error,
    permissionDenied,
    refresh: load,
  };
}
