import { Segmented } from '../components/Common';
import { type Lang, terms } from '../data';
import { type Theme, setLang, setTheme, useStore } from '../store';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
];

const builtAt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
}).format(new Date(__BUILD_TIME__));

const sourced = terms.filter((t) => t.status !== 'draft').length;

export function Settings() {
  const { theme, lang } = useStore();

  return (
    <main className="screen settings">
      <header className="title-block">
        <h1>Settings</h1>
      </header>

      <section>
        <h2>Appearance</h2>
        <div className="card setting">
          <Segmented label="Appearance" options={THEMES} value={theme} onChange={setTheme} />
          <p className="secondary small">System follows your device’s light or dark mode.</p>
        </div>
      </section>

      <section>
        <h2>Definitions</h2>
        <div className="card setting">
          <Segmented label="Definition language" options={LANGS} value={lang} onChange={setLang} />
          <p className="secondary small">The language definitions open in. You can still switch on any term.</p>
        </div>
      </section>

      <section>
        <h2>About</h2>
        <div className="card setting">
          <p className="note">
            {terms.length} terms, showing how each is said by professionals in Spain. {sourced} have their main Spanish
            form confirmed in a source that was read, such as INCIBE’s glossary, Spanish and EU law, or a cloud
            provider’s documentation for Spain. The rest are marked Draft.
          </p>
          <p className="secondary small">Saved terms and these settings stay on this device.</p>
        </div>
      </section>

      <section>
        <h2>Version</h2>
        <div className="card list">
          <div className="row">
            <span className="row-text">
              <span className="row-title regular">Built</span>
            </span>
            <span className="row-meta">{builtAt} UTC</span>
          </div>
          <div className="row">
            <span className="row-text">
              <span className="row-title regular">Build</span>
            </span>
            <span className="row-meta build-id">{__BUILD_COMMIT__}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
