const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = '/Users/daniel/code/madd/scrape';

const PAGES = [
  { slug: 'home', url: 'https://maddphotography.mypixieset.com/' },
  { slug: 'services', url: 'https://maddphotography.mypixieset.com/pricing-packages-1/' },
  { slug: 'galleries', url: 'https://maddphotography.mypixieset.com/clients/' },
  { slug: 'reviews', url: 'https://maddphotography.mypixieset.com/review/' },
  { slug: 'about', url: 'https://maddphotography.mypixieset.com/about-me/' },
];

async function passChallenge(page) {
  for (let i = 0; i < 40; i++) {
    const title = await page.title().catch(() => '');
    if (!/just a moment/i.test(title) && title.trim() !== '') return;
    await page.waitForTimeout(1500);
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + 2000) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await passChallenge(page);
  await page.waitForTimeout(1500);
  await autoScroll(page);

  return await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };

    // images: src + all srcset candidates + data-src variants
    const imgs = new Set();
    document.querySelectorAll('img').forEach(img => {
      if (img.src) imgs.add(img.src);
      ['data-src', 'data-lazy-src', 'data-original', 'data-image'].forEach(a => {
        const v = img.getAttribute(a); if (v) imgs.add(abs(v));
      });
      const ss = img.getAttribute('srcset');
      if (ss) ss.split(',').forEach(part => { const u = part.trim().split(/\s+/)[0]; if (u) imgs.add(abs(u)); });
    });
    // background images
    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        const m = [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)];
        m.forEach(x => { if (x[1] && !x[1].startsWith('data:')) imgs.add(abs(x[1])); });
      }
    });
    // any data attributes holding image-ish urls
    document.querySelectorAll('[data-src],[data-bg],[style*="background"]').forEach(el => {
      const s = el.getAttribute('style') || '';
      const m = [...s.matchAll(/url\(["']?(.*?)["']?\)/g)];
      m.forEach(x => { if (x[1] && !x[1].startsWith('data:')) imgs.add(abs(x[1])); });
    });

    const links = [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href))]
      .filter(h => h.includes('mypixieset.com'));

    return {
      title: document.title,
      text: document.body.innerText,
      images: [...imgs].filter(Boolean),
      links,
    };
  });
}

(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(OUT, 'chrome-profile'), {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  const manifest = {};
  for (const p of PAGES) {
    process.stderr.write(`Scraping ${p.slug} ... `);
    try {
      manifest[p.slug] = { url: p.url, ...(await scrapePage(page, p.url)) };
      process.stderr.write(`ok (${manifest[p.slug].images.length} imgs, ${manifest[p.slug].links.length} links)\n`);
    } catch (e) {
      process.stderr.write(`FAIL ${e.message}\n`);
      manifest[p.slug] = { url: p.url, error: e.message };
    }
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  process.stderr.write('\nWrote manifest.json\n');
  await ctx.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
