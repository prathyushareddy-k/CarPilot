/**
 * Downloads car images from Wikipedia article thumbnails.
 * Uses the Wikipedia REST API (no browser, no auth needed).
 * Saves to public/cars/<id>.jpg
 *
 * Run: npx tsx scripts/fetch-car-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const CARS: { id: string; article: string }[] = [
  { id: 'crv22',     article: 'Honda CR-V (sixth generation)' },
  { id: 'rav4xle',   article: 'Toyota RAV4 (fifth generation)' },
  { id: 'cx522',     article: 'Mazda CX-5' },
  { id: 'niroev23',  article: 'Kia Niro (second generation)' },
  { id: 'escape22h', article: 'Ford Escape (fourth generation)' },
  { id: 'tucson23h', article: 'Hyundai Tucson (fourth generation)' },
  { id: 'outback22', article: 'Subaru Outback (sixth generation)' },
  { id: 'camry22',   article: 'Toyota Camry (ninth generation)' },
  { id: 'civic21',   article: 'Honda Civic (eleventh generation)' },
  { id: 'forester22',article: 'Subaru Forester (fifth generation)' },
  { id: 'equinox22', article: 'Chevrolet Equinox (third generation)' },
  { id: 'rogue20',   article: 'Nissan Rogue (third generation)' },
];

// Fallback article titles if the generation-specific one has no image
const FALLBACKS: Record<string, string> = {
  crv22:      'Honda CR-V',
  rav4xle:    'Toyota RAV4',
  cx522:      'Mazda CX-5',
  niroev23:   'Kia Niro EV',
  escape22h:  'Ford Escape',
  tucson23h:  'Hyundai Tucson',
  outback22:  'Subaru Outback',
  camry22:    'Toyota Camry',
  civic21:    'Honda Civic',
  forester22: 'Subaru Forester',
  equinox22:  'Chevrolet Equinox',
  rogue20:    'Nissan Rogue',
};

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'cars');
const WIDTH = 800;

function get(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'LotAgent/1.0 (educational prototype; contact: dev@lotagent.app)',
        'Accept': '*/*',
      },
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(get(res.headers.location!));
      }
      if (!res.statusCode || res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

async function getWikiImage(article: string): Promise<string | null> {
  const apiUrl =
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`;
  try {
    const buf = await get(apiUrl);
    const data = JSON.parse(buf.toString()) as {
      originalimage?: { source: string; width: number };
      thumbnail?: { source: string };
    };
    // Prefer originalimage when it's a direct (non-thumb) URL; otherwise scale thumbnail up
    const orig = data.originalimage?.source;
    const thumb = data.thumbnail?.source;
    if (!orig && !thumb) return null;

    // Use thumbnail URL as-is (Wikimedia returns a usable size by default)
    if (thumb) return thumb;
    return orig ?? null;
  } catch {
    return null;
  }
}

async function fetchCar(id: string, article: string): Promise<void> {
  const dest = path.join(OUTPUT_DIR, `${id}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 15_000) {
    console.log(`  ↩  ${id} — already downloaded`);
    return;
  }

  const articles = [article, FALLBACKS[id]].filter(Boolean);
  for (const title of articles) {
    console.log(`  ↓  ${id} — trying: "${title}"`);
    const imgUrl = await getWikiImage(title);
    if (!imgUrl) { console.log(`       no image in summary`); continue; }

    try {
      const buf = await get(imgUrl);
      if (buf.length < 15_000) { console.log(`       image too small`); continue; }
      fs.writeFileSync(dest, buf);
      console.log(`  ✓  ${id} — saved (${Math.round(buf.length / 1024)}KB)`);
      return;
    } catch (e) {
      console.log(`       download failed: ${e}`);
    }
  }
  console.warn(`  ✗  ${id} — not found`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\nDownloading ${CARS.length} car images from Wikipedia → ${OUTPUT_DIR}\n`);
  for (const { id, article } of CARS) {
    await fetchCar(id, article);
  }
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
