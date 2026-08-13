import { carListings, type CarListing } from './carData';

// Shared read-only queries over the same carListings the UI renders from
// (app/_lib/carData.ts) — used by the chat assistant (app/api/chat) so its
// answers always match what's actually visible on the site. Deliberately
// separate from app/api/[transport]/route.ts's MCP tools, which query the
// Postgres Car table — a much smaller, disconnected seed dataset.

const DEAL_BONUS: Record<string, number> = { Good: 10, Fair: 0, Over: -15 };

export function parseDollar(s: string): number {
  return parseInt(s.replace(/[$,]/g, ''), 10) || 0;
}

export function scoreCar(car: CarListing): number {
  return car.fit + (DEAL_BONUS[car.deal] ?? 0);
}

export interface ListFilters {
  deal?: 'Good' | 'Fair' | 'Over';
  condition?: 'New' | 'Certified pre-owned' | 'Used';
  fuelType?: 'Gas' | 'Hybrid' | 'Electric';
  sortBy?: 'fit' | 'tco' | 'otd';
}

export function listCars(filters: ListFilters = {}): CarListing[] {
  let cars = carListings.slice();
  if (filters.deal) cars = cars.filter((c) => c.deal === filters.deal);
  if (filters.condition) cars = cars.filter((c) => c.condition === filters.condition);
  if (filters.fuelType) cars = cars.filter((c) => c.fuelType === filters.fuelType);

  if (filters.sortBy === 'tco') cars.sort((a, b) => parseDollar(a.tco) - parseDollar(b.tco));
  else if (filters.sortBy === 'otd') cars.sort((a, b) => parseDollar(a.otd) - parseDollar(b.otd));
  else cars.sort((a, b) => b.fit - a.fit);

  return cars;
}

export interface ShortlistParams {
  maxOtdPrice?: number;
  maxMonthlyTco?: number;
  fuelPreference?: 'Gas' | 'Hybrid' | 'Electric';
  conditionPreference?: 'New' | 'Certified pre-owned' | 'Used';
  dealQuality?: 'Good only' | 'Good or Fair' | 'any';
  mustHaveKeys?: string[];
  topN?: number;
}

export function shortlistCars(params: ShortlistParams): { totalMatching: number; shortlist: (CarListing & { score: number })[] } {
  let cars = carListings.slice();

  if (params.fuelPreference) cars = cars.filter((c) => c.fuelType === params.fuelPreference);
  if (params.conditionPreference) cars = cars.filter((c) => c.condition === params.conditionPreference);
  if (params.maxOtdPrice != null) cars = cars.filter((c) => parseDollar(c.otd) <= params.maxOtdPrice!);
  if (params.maxMonthlyTco != null) cars = cars.filter((c) => parseDollar(c.tco) <= params.maxMonthlyTco!);
  if (params.dealQuality === 'Good only') cars = cars.filter((c) => c.deal === 'Good');
  else if (params.dealQuality === 'Good or Fair') cars = cars.filter((c) => c.deal === 'Good' || c.deal === 'Fair');
  if (params.mustHaveKeys?.length) {
    cars = cars.filter((c) => params.mustHaveKeys!.every((k) => c.mustHaveKeys.includes(k)));
  }

  const topN = params.topN ?? 5;
  const scored = cars
    .map((c) => ({ ...c, score: scoreCar(c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return { totalMatching: cars.length, shortlist: scored };
}

export function getCarDetail(id: string): CarListing | undefined {
  return carListings.find((c) => c.id === id);
}
