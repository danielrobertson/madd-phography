// Renders public/og.jpg (1200x630) — the social share card.
// Uses a real browser so the card can use the site's own fonts and tokens.
// Run: node scripts/generate-og.mjs
import playwright from "../scrape/node_modules/playwright-core/index.js";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const asDataUri = async (path, mime) =>
	`data:${mime};base64,${(await readFile(new URL(path, root))).toString("base64")}`;

const photo = await asDataUri("src/assets/photos/home-wide.jpg", "image/jpeg");
const kage = await asDataUri("public/fonts/Kage-Medium.woff2", "font/woff2");
const mono = await asDataUri("public/fonts/SpaceMono-400.woff2", "font/woff2");

// star lifted from src/components/Doodle.astro
const STAR =
	"M24 4c1.2 7.4 2.9 11.7 5.8 14.6C32.7 21.5 37 23 44 24c-7 1.3-11.3 2.9-14.2 5.8C26.9 32.7 25.2 37 24 44c-1.2-7-2.9-11.3-5.8-14.2C15.3 26.9 11 25.3 4 24c7-1 11.3-2.6 14.2-5.5C21.1 15.6 22.8 11.4 24 4Z";

const html = `<!doctype html>
<meta charset="utf-8" />
<style>
  @font-face { font-family: "Kage"; src: url(${kage}) format("woff2"); font-weight: 500; }
  @font-face { font-family: "Space Mono"; src: url(${mono}) format("woff2"); font-weight: 400; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; display: flex; flex-direction: column; background: #faf6ed; }
  .photo { flex: 1; position: relative; overflow: hidden; }
  .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; }
  .band {
    height: 168px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 64px; border-top: 2px solid #2c2318; background: #faf6ed;
  }
  h1 {
    font-family: "Kage", serif; font-weight: 500; font-size: 68px; line-height: 1;
    color: #2c2318; letter-spacing: -0.01em;
  }
  p {
    font-family: "Space Mono", monospace; font-size: 19px; letter-spacing: 0.18em;
    text-transform: uppercase; color: #2c2318; opacity: 0.62; margin-top: 14px;
  }
  svg { flex: none; color: #bc5433; }
</style>
<div class="photo"><img src="${photo}" alt="" /></div>
<div class="band">
  <div>
    <h1>Madd Photography</h1>
    <p>Weddings &amp; Lifestyle &middot; DFW</p>
  </div>
  <svg width="96" height="96" viewBox="0 0 48 48" fill="none" stroke="currentColor"
       stroke-width="2.2" stroke-linejoin="round"><path d="${STAR}" /></svg>
</div>`;

// system Chrome — playwright's bundled browsers aren't installed in this repo
const browser = await playwright.chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: "png" });
await browser.close();

const out = fileURLToPath(new URL("public/og.jpg", root));
await writeFile(
	out,
	await sharp(shot).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toBuffer(),
);
console.log(`wrote ${out}`);
