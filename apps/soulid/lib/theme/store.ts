'use client';

import { create } from 'zustand';
import { syncStatusBar } from '@/lib/native/status-bar';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'soulprofile.theme';
const DEFAULT_THEME: Theme = 'dark';

function readStored(): Theme {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' ? v : DEFAULT_THEME;
}

type State = {
  theme: Theme;
  resolved: Theme;
  setTheme: (t: Theme) => void;
};

export const useThemeStore = create<State>((set) => ({
  theme: DEFAULT_THEME,
  resolved: DEFAULT_THEME,
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, theme);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
    syncStatusBar(theme);
    set({ theme, resolved: theme });
  },
}));

export function initTheme() {
  const stored = readStored();
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = stored;
    document.documentElement.style.colorScheme = stored;
  }
  useThemeStore.setState({ theme: stored, resolved: stored });
  syncStatusBar(stored);
}
