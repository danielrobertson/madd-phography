# MADD Photography — content archive from maddphotography.mypixieset.com

Scraped 2026-07-10 for reference/inspiration ahead of the redesign. The live site is
behind a Cloudflare managed challenge, so this was captured with a real Chrome browser
(Playwright) rather than plain HTTP.

## What's here

```
scrape/
├── content/          # Cleaned text copy, one markdown file per page
│   ├── home.md
│   ├── services.md   (pricing / packages)
│   ├── about.md      (Get To Know Me)
│   ├── reviews.md    (testimonials)
│   └── galleries.md  (client gallery collection)
├── images/           # 56 images, ~36 MB, highest resolution available
│   ├── home/         # portfolio @ 2500px + theme heroes @ ~3000px + logo
│   ├── services/
│   ├── about/
│   ├── reviews/
│   └── galleries/    # 13 client-gallery cover photos @ 3600×2400
├── manifest.json         # raw crawl output (text + every image URL per page)
├── download-report.json  # per-file download results
└── *.js                  # crawl/download scripts (reusable)
```

## Site map (original)

| Page | URL | Notes |
|------|-----|-------|
| Home | `/` | hero carousel, intro blurb, contact form, feature tiles |
| Services | `/pricing-packages-1/` | 4 packages (Portraits, Couples & Families, Weddings, Mini Sessions) |
| Galleries | `/clients/` | client galleries, filter tags `?tag=graduation`, `?tag=wedding` |
| Reviews | `/review/` | 4 testimonials |
| About | `/about-me/` | photographer bio (Madeleine) |

Instagram: [@maddphotography__](https://www.instagram.com/maddphotography__)

## Brand / copy highlights (useful for redesign)

- **Positioning:** "Wedding & Elopement Photography With An Editorial Feel"
- **Voice:** candid, in-the-moment, un-posed; "I try to guide you, but not pose you."
- **Value props:** unlimited edited photos, private online gallery, comfortable/fun experience.
- **Photographer:** Madeleine — Psychology major (minor in business) at Abilene Christian
  University; from El Paso, TX, based in DFW.
- **Note:** the About & Reviews pages still show placeholder eyebrow text
  ("LOREM IPSUM DOLOR SIT AMET") — replace in the redesign.

## Not captured

- 6 Instagram feed thumbnails on the home page — signed CDN URLs already expired (2023),
  can't be retrieved. They're a live IG widget, not owned site content.
- Individual client gallery *contents* (private Pixieset galleries behind the covers).

## Re-running

```
cd scrape
node crawl.js      # rebuild manifest.json (opens Chrome, passes Cloudflare)
node download.js   # download images from manifest at max resolution
```
Uses a persistent Chrome profile in `scrape/chrome-profile/` to keep the Cloudflare
clearance cookie between runs.
