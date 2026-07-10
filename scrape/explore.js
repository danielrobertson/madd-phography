const { chromium } = require('playwright-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const START = 'https://maddphotography.mypixieset.com/';

(async () => {
  const ctx = await chromium.launchPersistentContext('/Users/daniel/code/madd/scrape/chrome-profile', {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto(START, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait until we're past the Cloudflare "Just a moment" interstitial
  for (let i = 0; i < 40; i++) {
    const title = await page.title().catch(() => '');
    if (!/just a moment/i.test(title) && title.trim() !== '') break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);

  const title = await page.title();
  const url = page.url();

  const data = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href]')].map(a => ({
      text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 60),
      href: a.href,
    }));
    const nav = [...document.querySelectorAll('nav a, header a, [class*=menu] a, [class*=nav] a')]
      .map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.href }));
    return { links, nav, bodyText: document.body.innerText.slice(0, 2000) };
  });

  console.log('TITLE:', title);
  console.log('URL:', url);
  console.log('\n=== NAV LINKS ===');
  console.log(JSON.stringify(data.nav, null, 2));
  console.log('\n=== ALL INTERNAL LINKS ===');
  const internal = [...new Set(data.links.filter(l => l.href.includes('mypixieset.com')).map(l => l.href))];
  console.log(JSON.stringify(internal, null, 2));
  console.log('\n=== BODY TEXT (first 2000) ===');
  console.log(data.bodyText);

  await ctx.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
