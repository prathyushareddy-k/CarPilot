import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { CarListing } from '../../_lib/carData';

const prisma = new PrismaClient();

type DbCar = {
  id: string;
  name: string;
  miles: string;
  distance: string;
  fit: number;
  deal: string;
  tco: string;
  otd: string;
  condition: string;
  fuelType: string;
  dealer: string;
  pros: string[];
  cons: string[];
  why: string;
};

type Weights = { reliability: number; resale: number; running: number; performance: number };

type IntakeValues = {
  budgetMode: 'cash' | 'monthly';
  monthly: number;
  cashTotal: number;
  radius: number;
  usage: string[];
  weights: Weights;
};

function parseDollar(s: string): number {
  return parseInt(s.replace(/[$,]/g, ''), 10) || 0;
}

function parseDistance(s: string): number {
  const m = s.match(/(\d+)\s*mi/);
  return m ? parseInt(m[1], 10) : 999;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hasFeature(car: DbCar, ...keywords: string[]): boolean {
  const haystack = [car.name, ...car.pros, car.why].join(' ').toLowerCase();
  return keywords.some(kw => haystack.includes(kw.toLowerCase()));
}

const MUST_HAVE_CHECKS: Record<string, (car: DbCar) => boolean> = {
  awd:      c => hasFeature(c, 'AWD', '4WD', 'all-wheel', 'all wheel'),
  carplay:  c => hasFeature(c, 'CarPlay', 'Apple CarPlay', 'Android Auto'),
  backup:   c => hasFeature(c, 'backup', 'rear camera', 'reverse camera', 'rearview'),
  mpg:      c => c.fuelType === 'Hybrid' || c.fuelType === 'Electric',
  thirdrow: c => hasFeature(c, 'third row', '3rd row', '7-seat', '8-seat'),
  manual:   c => hasFeature(c, 'manual transmission', '6-speed manual'),
};

const FUEL_MAP: Record<string, string> = { ev: 'Electric', hybrid: 'Hybrid', gas: 'Gas' };
const CONDITION_MAP: Record<string, string> = { new: 'New', cpo: 'Certified pre-owned', used: 'Used' };

const DEAL_BONUS: Record<string, number> = { Good: 10, Fair: 0, Over: -15 };

// Usage type → keywords that signal a car is a good fit
const USAGE_KEYWORDS: Record<string, string[]> = {
  commute:  ['reliability', 'reliable', 'recalls', 'warranty', 'bulletproof', 'track record', 'proven', 'miles', 'ownership'],
  family:   ['cargo', 'third row', 'family', 'spacious', 'rear seat', 'safety', 'safe', 'room', 'seating', 'rows', 'liftgate', 'seats'],
  weekend:  ['performance', 'off-road', 'sporty', 'fun', 'handling', 'dynamics', 'acceleration', 'power', 'turbo', 'v6', 'v8', 'capable'],
  first:    ['warranty', 'certified', 'safe', 'safety', 'reliable', 'reliability', 'maintenance', 'coverage'],
};

function computeFit(car: DbCar, intake: IntakeValues): number {
  const haystack = [car.name, ...car.pros, ...car.cons, car.why].join(' ').toLowerCase();
  let score = car.fit; // start from expert quality baseline

  // Budget headroom: deeper under budget = higher score, capped at +10
  const budget = intake.budgetMode === 'monthly' ? intake.monthly : intake.cashTotal;
  const price  = intake.budgetMode === 'monthly' ? parseDollar(car.tco) : parseDollar(car.otd);
  if (budget > 0) {
    const margin = (budget - price) / budget; // positive = under budget
    score += clamp(Math.round(margin * 40), 0, 10);
  }

  // Distance: linear penalty — closer cars score higher, capped at -8
  const distMi = parseDistance(car.distance);
  if (intake.radius > 0) {
    const penalty = Math.round((distMi / intake.radius) * 8);
    score -= clamp(penalty, 0, 8);
  }

  // Deal quality adjustment
  score += DEAL_BONUS[car.deal] ?? 0;

  // Fuel type vs running-cost weight: EV/hybrid score better for run-focused users
  const isEv = car.fuelType === 'Electric';
  const isHybrid = car.fuelType === 'Hybrid';
  const runW = intake.weights.running;
  score += Math.round(isEv ? runW * 0.10 : isHybrid ? runW * 0.05 : -Math.max(0, runW - 50) * 0.08);

  // Usage keyword match: each usage type adds up to +8 for strong keyword hits
  const usageList = intake.usage.filter(u => u in USAGE_KEYWORDS);
  if (usageList.length > 0) {
    let totalBonus = 0;
    for (const u of usageList) {
      const kws = USAGE_KEYWORDS[u];
      const hits = kws.filter(kw => haystack.includes(kw)).length;
      totalBonus += clamp(hits * 1.5, 0, 8);
    }
    score += Math.round(totalBonus / usageList.length);
    // CPO bonus when reliability/safety matters (commute or first)
    if ((intake.usage.includes('commute') || intake.usage.includes('first')) && car.condition === 'Certified pre-owned') {
      score += 2;
    }
  }

  // Reliability weight: bonus for cars whose text emphasizes reliability
  const relW = intake.weights.reliability;
  if (relW >= 60) {
    const relHits = ['reliability', 'reliable', 'bulletproof', 'recalls', 'track record', 'warranty', 'proven']
      .filter(kw => haystack.includes(kw)).length;
    score += clamp(Math.round(relHits * (relW / 100) * 1.5), 0, 6);
  }

  // Resale weight: bonus for cars that explicitly hold value well
  const resW = intake.weights.resale;
  if (resW >= 60) {
    const resHits = ['resale', 'holds value', 'retain', 'depreciation']
      .filter(kw => haystack.includes(kw)).length;
    score += clamp(Math.round(resHits * (resW / 100) * 2), 0, 4);
  }

  return clamp(Math.round(score), 0, 100);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      budgetMode, monthly, cashTotal, fuel, condition, mustHaves = {},
      radius = 60, usage = [], weights = { reliability: 50, resale: 50, running: 50, performance: 50 },
    } = body;

    // DB-level hard filters
    const where: Record<string, string> = {};
    if (FUEL_MAP[fuel]) where.fuelType = FUEL_MAP[fuel];
    if (CONDITION_MAP[condition]) where.condition = CONDITION_MAP[condition];

    let cars: DbCar[] = await prisma.car.findMany({ where });

    // Budget hard filter
    if (budgetMode === 'cash' && cashTotal) {
      cars = cars.filter(c => parseDollar(c.otd) <= cashTotal);
    } else if (budgetMode === 'monthly' && monthly) {
      cars = cars.filter(c => parseDollar(c.tco) <= monthly);
    }

    // Must-have hard filters
    for (const [key, check] of Object.entries(MUST_HAVE_CHECKS)) {
      if (mustHaves[key]) cars = cars.filter(check);
    }

    // Radius hard filter (parse "18 mi away" → 18)
    if (radius > 0) {
      cars = cars.filter(c => parseDistance(c.distance) <= radius);
    }

    // Score, rank, and take top 12 by fit
    const intake: IntakeValues = { budgetMode, monthly, cashTotal, radius, usage, weights };
    const ranked = cars
      .map(c => ({ ...c, fit: computeFit(c, intake) }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, 12);

    const listings: CarListing[] = ranked.map(c => ({
      id: c.id,
      name: c.name,
      miles: c.miles,
      distance: c.distance,
      fit: c.fit,
      deal: c.deal as 'Good' | 'Fair' | 'Over',
      tco: c.tco,
      otd: c.otd,
      condition: c.condition as 'New' | 'Certified pre-owned' | 'Used',
      fuelType: c.fuelType as 'Gas' | 'Hybrid' | 'Electric',
      dealer: c.dealer,
      pros: c.pros,
      cons: c.cons,
      why: c.why,
      dealDelta: '',
      dealComps: '',
      mustHaveKeys: Object.keys(MUST_HAVE_CHECKS).filter(k => MUST_HAVE_CHECKS[k](c)),
      tradeoff: undefined,
      imageUrl: '',
    }));

    return NextResponse.json({ cars: listings });
  } catch (err) {
    console.error('[shortlist]', err);
    return NextResponse.json({ error: 'Failed to fetch shortlist' }, { status: 500 });
  }
}
