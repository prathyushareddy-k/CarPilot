/**
 * Daily inventory-growth agent.
 *
 * Asks Claude for a fresh batch of realistic Bay Area used-car listings not
 * already in app/_lib/carData.ts, fetches a matching photo for each from
 * Wikipedia, and appends them before the array's closing `];`. Existing
 * entries and images are never modified or removed — the dataset only
 * grows. Run by .github/workflows/rotate-cars.yml on a daily cron (and via
 * `npm run rotate-cars` for a manual/local run).
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = process.cwd();
const CAR_DATA_PATH = path.join(ROOT, 'app', '_lib', 'carData.ts');
const IMAGES_DIR = path.join(ROOT, 'public', 'cars');
// How many *new* cars to add today. Kept modest by default since this
// accumulates forever — override with CAR_COUNT if you want a bigger batch.
const NEW_CARS_PER_DAY = Number(process.env.CAR_COUNT ?? 10);
// Ask for a few extra so cars whose image lookup fails can be dropped
// without falling short of NEW_CARS_PER_DAY.
const REQUEST_COUNT = NEW_CARS_PER_DAY + 5;
const ARRAY_CLOSE_RE = /\n\];\s*$/;

const MUST_HAVE_KEYS = ['awd', 'carplay', 'backup', 'mpg', 'thirdrow', 'manual'] as const;

interface GeneratedCar {
  id: string;
  name: string;
  miles: string;
  distance: string;
  fit: number;
  deal: 'Good' | 'Fair' | 'Over';
  tco: string;
  otd: string;
  condition: 'New' | 'Certified pre-owned' | 'Used';
  fuelType: 'Gas' | 'Hybrid' | 'Electric';
  dealer: string;
  pros: string[];
  cons: string[];
  why: string;
  dealDelta: string;
  dealComps: string;
  mustHaveKeys: string[];
  tradeoff?: string;
  make: string;
  model: string;
  year: number;
  wikiArticle: string;
}

const TOOL_SCHEMA = {
  name: 'emit_car_listings',
  description: 'Return a batch of realistic used-car listings.',
  input_schema: {
    type: 'object' as const,
    properties: {
      cars: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            id: { type: 'string', description: 'lowercase alphanumeric slug, e.g. accord23, unique within the batch' },
            name: { type: 'string', description: "e.g. '2023 Honda Accord Sport'" },
            miles: { type: 'string', description: "e.g. '26k mi'" },
            distance: { type: 'string', description: "e.g. '21 mi away'" },
            fit: { type: 'integer', minimum: 55, maximum: 96 },
            deal: { type: 'string', enum: ['Good', 'Fair', 'Over'] },
            tco: { type: 'string', description: "estimated monthly total cost of ownership, e.g. '$410'" },
            otd: { type: 'string', description: "out-the-door price, e.g. '$26,400'" },
            condition: { type: 'string', enum: ['New', 'Certified pre-owned', 'Used'] },
            fuelType: { type: 'string', enum: ['Gas', 'Hybrid', 'Electric'] },
            dealer: { type: 'string', description: 'realistic Bay Area dealer or private-seller name' },
            pros: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 3 },
            cons: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
            why: { type: 'string', description: '2-3 sentence honest buyer-agent rationale, may include a real tradeoff' },
            dealDelta: { type: 'string', description: "price vs. comps, e.g. '−$500' or '+$200'" },
            dealComps: { type: 'string', description: "e.g. '14 comps'" },
            mustHaveKeys: { type: 'array', items: { type: 'string', enum: MUST_HAVE_KEYS as unknown as string[] } },
            tradeoff: { type: 'string', description: 'optional one-line tradeoff vs. the top pick' },
            make: { type: 'string', description: "lowercase, e.g. 'honda', for image lookup" },
            model: { type: 'string', description: "lowercase, e.g. 'accord', for image lookup" },
            year: { type: 'integer' },
            wikiArticle: { type: 'string', description: "best-guess Wikipedia article title for this car, e.g. 'Honda Accord (tenth generation)'" },
          },
          required: ['id', 'name', 'miles', 'distance', 'fit', 'deal', 'tco', 'otd', 'condition', 'fuelType', 'dealer', 'pros', 'cons', 'why', 'dealDelta', 'dealComps', 'mustHaveKeys', 'make', 'model', 'year', 'wikiArticle'],
        },
      },
    },
    required: ['cars'],
  },
};

function readExistingIds(): string[] {
  if (!fs.existsSync(CAR_DATA_PATH)) return [];
  const content = fs.readFileSync(CAR_DATA_PATH, 'utf8');
  const ids: string[] = [];
  const re = /^\s*id:\s*'([^']+)'/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) ids.push(m[1]);
  return ids;
}

async function generateCars(existingIds: string[]): Promise<GeneratedCar[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 16000,
    tools: [TOOL_SCHEMA],
    tool_choice: { type: 'tool', name: 'emit_car_listings' },
    messages: [
      {
        role: 'user',
        content:
          `Generate ${REQUEST_COUNT} realistic used/CPO/new car listings for a Bay Area car-buying agent app. ` +
          `Cover a genuine mix of body styles (sedans, compact/midsize/3-row SUVs, trucks, minivans, EVs, hybrids, ` +
          `a couple of luxury options), price points ($16k-$42k), and brands — no more than 2 listings sharing ` +
          `the same make+model within this batch. Use real, currently-common used-car makes/models/trims and ` +
          `honest, specific pros/cons/reliability notes (not generic filler). Each id must be a unique ` +
          `lowercase-alphanumeric slug, and must NOT be any of these ids already in the dataset: ` +
          `${existingIds.length ? existingIds.join(', ') : '(none yet)'}. ` +
          `wikiArticle should be your best guess at the exact Wikipedia article title for that car/generation.`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
  );
  if (!toolUse) throw new Error('Model did not return a tool_use block');

  const cars = (toolUse.input as { cars: GeneratedCar[] }).cars;

  // De-dupe against both the batch itself and the existing dataset,
  // defensively, in case the model slips.
  const existing = new Set(existingIds);
  const seen = new Set<string>();
  const unique = cars.filter((c) => {
    if (!/^[a-z0-9]+$/.test(c.id) || seen.has(c.id) || existing.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  return unique;
}

function get(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'LotAgent/1.0 (educational prototype; contact: dev@lotagent.app)', Accept: '*/*' } },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) return resolve(get(res.headers.location!));
        if (!res.statusCode || res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      },
    );
    req.on('error', reject);
  });
}

async function getWikiImage(article: string): Promise<string | null> {
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`;
  try {
    const buf = await get(apiUrl);
    const data = JSON.parse(buf.toString()) as {
      originalimage?: { source: string };
      thumbnail?: { source: string };
    };
    return data.thumbnail?.source ?? data.originalimage?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchCarImage(car: GeneratedCar): Promise<boolean> {
  const dest = path.join(IMAGES_DIR, `${car.id}.jpg`);
  const articles = [car.wikiArticle, `${car.make} ${car.model}`].filter(Boolean);
  for (const title of articles) {
    const imgUrl = await getWikiImage(title);
    if (!imgUrl) continue;
    try {
      const buf = await get(imgUrl);
      if (buf.length < 15_000) continue;
      fs.writeFileSync(dest, buf);
      return true;
    } catch {
      // try next candidate title
    }
  }
  return false;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
function strlit(s: string): string {
  return `'${esc(s)}'`;
}
function arrlit(items: string[]): string {
  return `[${items.map(strlit).join(', ')}]`;
}

function serializeCar(c: GeneratedCar): string {
  const lines = [
    '  {',
    `    id: ${strlit(c.id)},`,
    `    name: ${strlit(c.name)},`,
    `    miles: ${strlit(c.miles)},`,
    `    distance: ${strlit(c.distance)},`,
    `    fit: ${c.fit},`,
    `    deal: ${strlit(c.deal)},`,
    `    tco: ${strlit(c.tco)},`,
    `    otd: ${strlit(c.otd)},`,
    `    condition: ${strlit(c.condition)},`,
    `    fuelType: ${strlit(c.fuelType)},`,
    `    dealer: ${strlit(c.dealer)},`,
    `    pros: ${arrlit(c.pros)},`,
    `    cons: ${arrlit(c.cons)},`,
    `    why: ${strlit(c.why)},`,
    `    dealDelta: ${strlit(c.dealDelta)},`,
    `    dealComps: ${strlit(c.dealComps)},`,
    `    mustHaveKeys: ${arrlit(c.mustHaveKeys)},`,
  ];
  if (c.tradeoff) lines.push(`    tradeoff: ${strlit(c.tradeoff)},`);
  lines.push(`    imageUrl: IMAGIN(${strlit(c.make)}, ${strlit(c.model)}, ${c.year}),`);
  lines.push('  },');
  return lines.join('\n');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set.');
    process.exit(1);
  }

  const existingIds = readExistingIds();
  console.log(`${existingIds.length} cars already in carData.ts. Requesting ${REQUEST_COUNT} new candidates...`);
  const candidates = await generateCars(existingIds);
  console.log(`Got ${candidates.length} unique new candidates. Fetching photos...`);

  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const kept: GeneratedCar[] = [];
  for (const car of candidates) {
    if (kept.length >= NEW_CARS_PER_DAY) break;
    const ok = await fetchCarImage(car);
    console.log(`  ${ok ? '✓' : '✗'}  ${car.id} (${car.name})`);
    if (ok) kept.push(car);
    await sleep(400);
  }

  if (kept.length === 0) {
    console.error('Found photos for 0 new cars — nothing to add today.');
    process.exit(1);
  }

  const content = fs.readFileSync(CAR_DATA_PATH, 'utf8');
  if (!ARRAY_CLOSE_RE.test(content)) {
    throw new Error(`Could not find the carListings array's closing "];" at the end of ${CAR_DATA_PATH}`);
  }
  const newBlock = kept.map(serializeCar).join('\n');
  const updated = content.replace(ARRAY_CLOSE_RE, `\n${newBlock}\n];\n`);
  fs.writeFileSync(CAR_DATA_PATH, updated);

  console.log(`Appended ${kept.length} new cars to ${path.relative(ROOT, CAR_DATA_PATH)} (${existingIds.length + kept.length} total).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
