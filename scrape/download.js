const fs = require('fs');
const path = require('path');

const OUT = '/Users/daniel/code/madd/scrape';
const IMG_DIR = path.join(OUT, 'images');
const manifest = require(path.join(OUT, 'manifest.json'));

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  'Referer': 'https://maddphotography.mypixieset.com/',
  'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

// Pick largest-resolution variant per photo for elementfield images.
// URL: .../elementfield/<gid>/<name>-<hash>-<size>.<ext>
function bestVariants(urls) {
  const groups = new Map(); // key -> {url, size}
  const passthrough = [];
  for (const u of urls) {
    const m = u.match(/\/elementfield\/([^/]+)\/(.+?)-([0-9a-f]+)-(\d+)\.(\w+)(?:\?.*)?$/i);
    if (m) {
      const [, gid, name, , sizeStr, ext] = m;
      const size = parseInt(sizeStr, 10);
      const key = `${gid}/${name}.${ext}`;
      const cur = groups.get(key);
      if (!cur || size > cur.size) groups.set(key, { url: u, size, name: `${name}-${size}.${ext}` });
    } else {
      passthrough.push(u);
    }
  }
  return { grouped: [...groups.values()], passthrough };
}

function filenameFor(u) {
  try {
    const url = new URL(u);
    let base = path.basename(url.pathname);
    if (!base || !base.includes('.')) base = base + '.jpg';
    return base;
  } catch { return null; }
}

async function download(url, dest) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return { url, ok: false, status: res.status };
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return { url, ok: true, bytes: buf.length, dest };
  } catch (e) {
    return { url, ok: false, error: e.message };
  }
}

(async () => {
  const report = {};
  const globalSeen = new Set(); // avoid re-downloading same file across pages

  for (const [slug, page] of Object.entries(manifest)) {
    const imgs = page.images || [];
    const dir = path.join(IMG_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });

    const { grouped, passthrough } = bestVariants(imgs);
    const toGet = [];

    for (const g of grouped) toGet.push({ url: g.url, name: g.name });
    for (const u of passthrough) {
      // skip tiny theme icons/svgs but keep photos, covers, logo, instagram
      if (/assets-pw\.pixieset\.com/.test(u) && /\.(svg|css|js)(\?|$)/i.test(u)) continue;
      const name = filenameFor(u);
      if (name) toGet.push({ url: u, name });
    }

    report[slug] = [];
    for (const item of toGet) {
      const globalKey = item.url;
      if (globalSeen.has(globalKey)) continue;
      globalSeen.add(globalKey);
      let dest = path.join(dir, item.name);
      // avoid collisions
      let n = 1;
      while (fs.existsSync(dest)) { dest = path.join(dir, item.name.replace(/(\.\w+)$/, `_${n}$1`)); n++; }
      const r = await download(item.url, dest);
      report[slug].push(r);
      process.stderr.write(r.ok ? '.' : `x[${r.status || r.error}]`);
    }
    process.stderr.write(`\n[${slug}] ${report[slug].filter(r => r.ok).length}/${report[slug].length} downloaded\n`);
  }

  fs.writeFileSync(path.join(OUT, 'download-report.json'), JSON.stringify(report, null, 2));

  // Summary
  let ok = 0, fail = 0, bytes = 0;
  for (const rs of Object.values(report)) for (const r of rs) { if (r.ok) { ok++; bytes += r.bytes; } else fail++; }
  console.log(`\nDONE: ${ok} downloaded, ${fail} failed, ${(bytes/1e6).toFixed(1)} MB total`);
})();
