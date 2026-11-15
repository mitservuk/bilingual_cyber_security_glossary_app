import { useSyncExternalStore } from 'react';
import type { Lang, Region } from './data';

// Everything personal stays on the device. Storage can be unavailable (private
// browsing, blocked site data), so every access is guarded and the app works
// without it.

export type Theme = 'system' | 'light' | 'dark';

interface State {
  saved: string[];
  recent: string[];
  lang: Lang;
  /** Regions ticked in the Frameworks filter. None ticked means all are shown. */
  regions: Region[];
  /** Light or dark, or whatever the device is set to. */
  theme: Theme;
}

const KEY = 'bilingual-cyber.v1';
const RECENT_MAX = 8;

function load(): State {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      lang: parsed.lang === 'es' ? 'es' : 'en',
      regions: Array.isArray(parsed.regions) ? parsed.regions : [],
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : 'system',
    };
  } catch {
    return { saved: [], recent: [], lang: 'en', regions: [], theme: 'system' };
  }
}

let state = load();

/** The browser's own bars are tinted to match, using the page background of each theme. */
const BACKGROUND = { light: '#f2f2f7', dark: '#000000' };

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const own = meta.media.includes('dark') ? 'dark' : 'light';
    meta.content = BACKGROUND[theme === 'system' ? own : theme];
  });
}

applyTheme(state.theme);
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Kept in memory for this visit only.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useStore = () => useSyncExternalStore(subscribe, () => state);

export const toggleSaved = (id: string) =>
  set({ saved: state.saved.includes(id) ? state.saved.filter((s) => s !== id) : [id, ...state.saved] });

export const addRecent = (id: string) => {
  if (state.recent[0] === id) return;
  set({ recent: [id, ...state.recent.filter((r) => r !== id)].slice(0, RECENT_MAX) });
};

export const setLang = (lang: Lang) => set({ lang });

export const setTheme = (theme: Theme) => {
  set({ theme });
  applyTheme(theme);
};

export const toggleRegion = (region: Region) =>
  set({
    regions: state.regions.includes(region) ? state.regions.filter((r) => r !== region) : [...state.regions, region],
  });
