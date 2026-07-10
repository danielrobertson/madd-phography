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
