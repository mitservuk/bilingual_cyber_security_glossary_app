# Glosario

Cloud and cyber security terms in English, with how each one is actually said
by professionals in Spain. Runs in the browser, installs to an iPhone home
screen, and works offline.

"Glosario" is a working title.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

`npm run build` writes the finished site to `dist/`. Pushing to `main` builds
and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

## Where things are

- `content/terms/` holds the entries as YAML, and `content/taxonomy.yaml` the
  category names. The format and the meaning of draft, sourced and verified
  are in `content/README.md`.
- `scripts/build-content.mjs` validates the content and compiles it for the
  app. A broken entry fails the build.
- `src/` is the app: `screens/` for the four screens, `search.ts` for search,
  `store.ts` for what is kept on the device (saved terms, recent terms, the
  definition language).

## Adding terms

Add entries to a YAML file under `content/terms/`, then run `npm test`. Every
Spanish form should cite where it was seen; an entry stays `draft` until all
of it rests on a source that was read.
