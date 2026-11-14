import { useEffect, useRef } from 'react';
import { BookmarkIcon, GridIcon, HomeIcon } from './components/Icons';
import type { Axis } from './data';
import { href, useRoute } from './router';
import { Browse, Saved, TermsList } from './screens/Browse';
import { Entry } from './screens/Entry';
import { Home } from './screens/Home';

type Tab = 'home' | 'browse' | 'saved';

const TABS: { id: Tab; label: string; path: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', path: '/', icon: HomeIcon },
  { id: 'browse', label: 'Browse', path: '/browse', icon: GridIcon },
  { id: 'saved', label: 'Saved', path: '/saved', icon: BookmarkIcon },
];

function tabFor(segments: string[]): Tab | null {
  if (segments.length === 0) return 'home';
  if (segments[0] === 'browse') return 'browse';
  if (segments[0] === 'saved') return 'saved';
  if (segments[0] === 'list') return segments[1] === 'all' ? 'home' : 'browse';
  return null;
}

export function App() {
  const route = useRoute();
  const segments = route.split('/').filter(Boolean).map(decodeURIComponent);

  // An entry can be opened from any tab, so it keeps whichever tab was last active.
  const lastTab = useRef<Tab>('home');
  const tab = tabFor(segments) ?? lastTab.current;
  lastTab.current = tab;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  let screen;
  if (segments[0] === 'term' && segments[1]) screen = <Entry key={segments[1]} id={segments[1]} />;
  else if (segments[0] === 'browse') screen = <Browse axis={segments[1]} />;
  else if (segments[0] === 'saved') screen = <Saved />;
  else if (segments[0] === 'list' && segments[1] === 'all') screen = <TermsList />;
  else if (segments[0] === 'list' && segments[2]) {
    screen = (
      <TermsList
        axis={segments[1] as Axis}
        value={segments[2]}
        domain={segments[3] ? Number(segments[3]) : undefined}
      />
    );
  } else screen = <Home />;

  return (
    <>
      {screen}
      <div className="tab-fade" aria-hidden="true" />
      <nav className="tab-bar" aria-label="Main">
        {TABS.map(({ id, label, path, icon: TabIcon }) => (
          <a key={id} href={href(path)} aria-current={tab === id ? 'page' : undefined}>
            <TabIcon size={22} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
