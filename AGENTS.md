## Project

This is a redesign of the MADD Photography site (photographer: Madeleine). The original
site lived at `maddphotography.mypixieset.com`; we're rebuilding it in Astro with a new
design but reusing the existing content and imagery.

### Source content archive (`scrape/`)

The full original site was scraped into `scrape/` for reference — see `scrape/README.md`.

- `scrape/content/*.md` — cleaned copy for every page (home, services/pricing, about,
  reviews, galleries).
- `scrape/images/<page>/` — 56 images at highest available resolution (portfolio @ 2500px,
  gallery covers @ 3600×2400).
- `scrape/manifest.json` — raw crawl output (text + all image URLs per page).
- `scrape/crawl.js` / `scrape/download.js` — reusable Playwright scrapers (the live site is
  behind a Cloudflare challenge, so a real Chrome browser is required, not plain HTTP).

Original site map: Home `/`, Services `/pricing-packages-1/`, Galleries `/clients/`,
Reviews `/review/`, About `/about-me/`. Instagram: @maddphotography__.

Note: the original About/Reviews pages still had "LOREM IPSUM…" placeholder eyebrow text —
do not carry that over.

## Design system

Light, cream, airy, editorial — with funky hand-drawn accents (inspired by
laurennoelle.com + Madd's annotated Instagram posts). Defined in `src/styles/global.css`
via Tailwind v4 `@theme` tokens:

- **Colors:** `paper` #faf6ed (bg), `cream` / `sand` (bands, card shells), `ink` #2c2318
  (warm espresso text), `ink-soft`, `clay` #bc5433 (accent), `butter` #dfa63c, `line`.
- **Type:** `font-display` = Kage (headers, self-hosted in `public/fonts/` — **demo-sourced;
  buy a license before production**), `font-sans` = General Sans variable (body),
  `font-mono` = Space Mono (eyebrows/nav/labels, uppercase + tracked), `font-hand` = Caveat
  (handwritten doodle notes).
- **Funky layer:** `Doodle.astro` (hand-drawn SVG stars/arrows/crowns…), `Scribble.astro`
  (ring/underline around words), `.sticker` chips (offset hard shadow, slight rotation),
  `.photo-mat` (print-style cream mat + soft shadow, often rotated 1.5–2deg).
- **Motion:** `.reveal` fade-up via IntersectionObserver in `Layout.astro` (stagger with
  `--reveal-delay`), `ease-fluid` / `ease-bounce` custom beziers, `animate-marquee` bands.
  Respect `prefers-reduced-motion` (already handled in global.css).

Gotchas learned the hard way:

- Astro collapses whitespace around component tags on their own lines — keep text +
  inline components (`<Scribble>`, `<Doodle>`) on ONE line or words fuse together.
- Custom classes in global.css live in `@layer components` so Tailwind utilities can
  override them (e.g. `aria-pressed:bg-ink` on `.sticker`).
- `imageService: 'compile'` breaks `astro dev` (sharp can't run in workerd), so
  astro.config only enables it for builds. After config changes, stale vite caches can
  500 every page — fix with `rm -rf node_modules/.vite` and restart. Those 500s appear
  as a misleading "process is not defined" logger crash.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
