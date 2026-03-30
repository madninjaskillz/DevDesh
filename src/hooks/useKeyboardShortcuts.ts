import { useEffect, useRef } from 'react';

export interface ShortcutConfig {
  key: string;
  description: string;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      for (const shortcut of shortcutsRef.current) {
        if (e.key === shortcut.key) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return shortcutsRef.current;
}
