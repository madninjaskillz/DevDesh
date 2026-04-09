import { createContext, useContext, useState, useMemo } from 'react';

interface HighlightContextValue {
  highlightedKey: string | null;
  setHighlightedKey: (key: string | null) => void;
}

export const HighlightContext = createContext<HighlightContextValue>({
  highlightedKey: null,
  setHighlightedKey: () => {},
});

export function useHighlight() {
  return useContext(HighlightContext);
}

export function useHighlightState() {
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const value = useMemo(() => ({ highlightedKey, setHighlightedKey }), [highlightedKey]);
  return value;
}

/** Scroll the highlighted row into view when a key is set. */
export function scrollToHighlighted(key: string) {
  const el = document.querySelector(`[data-item-key="${CSS.escape(key)}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
