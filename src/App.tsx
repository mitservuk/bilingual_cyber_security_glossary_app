import { useEffect, useRef } from 'react';
import { BookmarkIcon, GearIcon, HomeIcon, ListIcon } from './components/Icons';
import type { Axis } from './data';
import { href, useRoute } from './router';
import { Category, Saved, TermsList } from './screens/Browse';
import { Entry } from './screens/Entry';
import { Home } from './screens/Home';
import { Settings } from './screens/Settings';
import { Terms } from './screens/Terms';

type Tab = 'home' | 'terms' | 'saved' | 'settings';

const TABS: { id: Tab; label: string; path: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', path: '/', icon: HomeIcon },
  { id: 'terms', label: 'Terms', path: '/terms', icon: ListIcon },
  { id: 'saved', label: 'Saved', path: '/saved', icon: BookmarkIcon },
  { id: 'settings', label: 'Settings', path: '/settings', icon: GearIcon },
];

const AXES: Axis[] = ['cert', 'framework', 'tech', 'topic'];

/** Addresses from before Terms had its own tab. */
const isAllTerms = (segments: string[]) =>
  segments[0] === 'terms' ||
  (segments[0] === 'list' && segments[1] === 'all') ||
  (segments[0] === 'browse' && !AXES.includes(segments[1] as Axis));

function tabFor(segments: string[]): Tab | null {
  if (segments.length === 0) return 'home';
  if (isAllTerms(segments)) return 'terms';
  if (segments[0] === 'saved') return 'saved';
  if (segments[0] === 'settings') return 'settings';
  // The categories and their lists are reached from the tiles on Home.
  if (segments[0] === 'browse' || segments[0] === 'list') return 'home';
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
  else if (isAllTerms(segments)) screen = <Terms />;
  else if (segments[0] === 'browse') screen = <Category axis={segments[1] as Axis} />;
  else if (segments[0] === 'saved') screen = <Saved />;
  else if (segments[0] === 'settings') screen = <Settings />;
  else if (segments[0] === 'list' && segments[2]) {
    // /list/<category>/<id>, with a domain number after a certification
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
