import { useSyncExternalStore } from 'react';

// Hash routes work from any folder on a static host and need no server rules.

const read = () => window.location.hash.replace(/^#/, '') || '/';

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export const useRoute = () => useSyncExternalStore(subscribe, read);

export const href = (path: string) => `#${path}`;

export function goBack() {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = '/';
}
