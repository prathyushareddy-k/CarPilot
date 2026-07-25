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
  { id: 'accord22', article: 'Honda Accord (tenth generation)' },
  { id: 'corolla21', article: 'Toyota Corolla (twelfth generation)' },
  { id: 'altima20', article: 'Nissan Altima' },
  { id: 'mazda320', article: 'Mazda3' },
  { id: 'impreza21', article: 'Subaru Impreza' },
  { id: 'elantra22', article: 'Hyundai Elantra' },
  { id: 'forte21', article: 'Kia Forte' },
  { id: 'jetta21', article: 'Volkswagen Jetta' },
  { id: 'accordh23', article: 'Honda Accord (tenth generation)' },
  { id: 'prius21', article: 'Toyota Prius' },
  { id: 'passport21', article: 'Honda Passport' },
  { id: 'highlander21', article: 'Toyota Highlander' },
  { id: '4runner19', article: 'Toyota 4Runner' },
  { id: 'sportage22', article: 'Kia Sportage' },
  { id: 'telluride22', article: 'Kia Telluride' },
  { id: 'santafe21', article: 'Hyundai Santa Fe' },
  { id: 'palisade22', article: 'Hyundai Palisade' },
  { id: 'cx921', article: 'Mazda CX-9' },
  { id: 'ascent21', article: 'Subaru Ascent' },
  { id: 'crosstrek22', article: 'Subaru Crosstrek' },
  { id: 'traverse21', article: 'Chevrolet Traverse' },
  { id: 'terrain21', article: 'GMC Terrain' },
  { id: 'edge21', article: 'Ford Edge' },
  { id: 'explorer20', article: 'Ford Explorer' },
  { id: 'cherokee21', article: 'Jeep Grand Cherokee' },
  { id: 'wrangler20', article: 'Jeep Wrangler (JL)' },
  { id: 'tiguan21', article: 'Volkswagen Tiguan' },
  { id: 'atlas21', article: 'Volkswagen Atlas' },
  { id: 'xc6020', article: 'Volvo XC60' },
  { id: 'rx35021', article: 'Lexus RX' },
  { id: 'nx21', article: 'Lexus NX' },
  { id: 'rdx21', article: 'Acura RDX' },
  { id: 'murano20', article: 'Nissan Murano' },
  { id: 'outlander22', article: 'Mitsubishi Outlander' },
  { id: 'tacoma20', article: 'Toyota Tacoma' },
  { id: 'tundra19', article: 'Toyota Tundra' },
  { id: 'f15020', article: 'Ford F-150' },
  { id: 'silverado20', article: 'Chevrolet Silverado' },
  { id: 'ridgeline21', article: 'Honda Ridgeline' },
  { id: 'odyssey21', article: 'Honda Odyssey' },
  { id: 'sienna21', article: 'Toyota Sienna' },
  { id: 'pacifica21', article: 'Chrysler Pacifica' },
  { id: 'model322', article: 'Tesla Model 3' },
  { id: 'modely22', article: 'Tesla Model Y' },
  { id: 'bolt22', article: 'Chevrolet Bolt EV' },
  { id: 'ioniq523', article: 'Hyundai Ioniq 5' },
  { id: 'ev623', article: 'Kia EV6' },
  { id: 'leaf20', article: 'Nissan Leaf' },
  { id: 'machE22', article: 'Ford Mustang Mach-E' },
  { id: 'id421', article: 'Volkswagen ID.4' },
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
  accord22:   'Honda Accord',
  accordh23:  'Honda Accord',
  corolla21:  'Toyota Corolla',
  '4runner19': 'Toyota 4Runner',
  wrangler20: 'Jeep Wrangler',
  cherokee21: 'Jeep Grand Cherokee (WL)',
  model322:   'Tesla Model 3',
  modely22:   'Tesla Model Y',
  machE22:    'Ford Mustang Mach-E',
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\nDownloading ${CARS.length} car images from Wikipedia → ${OUTPUT_DIR}\n`);
  for (const { id, article } of CARS) {
    await fetchCar(id, article);
    await sleep(1500);
  }
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
