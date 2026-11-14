import { useSyncExternalStore } from 'react';
import type { Lang } from './data';

// Everything personal stays on the device. Storage can be unavailable (private
// browsing, blocked site data), so every access is guarded and the app works
// without it.

interface State {
  saved: string[];
  recent: string[];
  lang: Lang;
}

const KEY = 'glosario.v1';
const RECENT_MAX = 8;

function load(): State {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      lang: parsed.lang === 'es' ? 'es' : 'en',
    };
  } catch {
    return { saved: [], recent: [], lang: 'en' };
  }
}

let state = load();
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
