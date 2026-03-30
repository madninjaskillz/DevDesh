import { useCallback, useState } from 'react';

const STORAGE_KEY = 'devdash-notes';

type NotesMap = Record<string, string>;

function loadNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: NotesMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/** Key format: "owner/repo#number" */
function makeKey(repoFullName: string, number: number): string {
  return `${repoFullName}#${number}`;
}

export function useNotes() {
  const [notes, setNotes] = useState<NotesMap>(loadNotes);

  const getNote = useCallback(
    (repoFullName: string, number: number): string => {
      return notes[makeKey(repoFullName, number)] ?? '';
    },
    [notes],
  );

  const setNote = useCallback(
    (repoFullName: string, number: number, text: string) => {
      setNotes((prev) => {
        const key = makeKey(repoFullName, number);
        const next = { ...prev };
        if (text.trim()) {
          next[key] = text.trim();
        } else {
          delete next[key];
        }
        saveNotes(next);
        return next;
      });
    },
    [],
  );

  return { getNote, setNote };
}
