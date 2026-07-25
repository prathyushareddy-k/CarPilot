import { createMcpHandler } from "mcp-handler";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

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

type ScoredCar = DbCar & { score: number };

const DEAL_BONUS: Record<string, number> = { Good: 10, Fair: 0, Over: -15 };

function parseDollar(s: string): number {
  return parseInt(s.replace(/[$,]/g, ""), 10) || 0;
}

function hasFeature(car: DbCar, ...keywords: string[]): boolean {
  const haystack = [car.name, ...car.pros, car.why].join(" ").toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

function scorecar(car: DbCar): number {
  return car.fit + (DEAL_BONUS[car.deal] ?? 0);
}

function carToMarkdown(car: DbCar, rank?: number): string {
  const prefix = rank != null ? `### ${rank}. ` : "### ";
  return [
    `${prefix}${car.name} \`${car.id}\``,
    `**Fit:** ${car.fit}/100 · **Deal:** ${car.deal} · **TCO:** ${car.tco}/mo · **OTD:** ${car.otd}`,
    `**Condition:** ${car.condition} · **Fuel:** ${car.fuelType} · **Miles:** ${car.miles} · **Distance:** ${car.distance}`,
    `**Dealer:** ${car.dealer}`,
    `**Pros:** ${car.pros.join("; ")}`,
    `**Cons:** ${car.cons.join("; ")}`,
    `> ${car.why}`,
    "",
  ].join("\n");
}

const handler = createMcpHandler(
  (server) => {
    // ── car_list_all ────────────────────────────────────────────────────────
    server.registerTool(
      "car_list_all",
      {
        title: "List All Cars",
        description: "List every car in the CarPilot database with optional filters.",
        inputSchema: {
          deal_filter: z.enum(["Good", "Fair", "Over", "any"]).default("any"),
          condition_filter: z.enum(["New", "Certified pre-owned", "Used", "any"]).default("any"),
          fuel_filter: z.enum(["Gas", "Hybrid", "Electric", "any"]).default("any"),
          sort_by: z.enum(["fit", "tco", "otd"]).default("fit"),
          response_format: z.enum(["markdown", "json"]).default("markdown"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      },
      async ({ deal_filter, condition_filter, fuel_filter, sort_by, response_format }) => {
        try {
          const where: Record<string, string> = {};
          if (deal_filter !== "any") where.deal = deal_filter;
          if (condition_filter !== "any") where.condition = condition_filter;
          if (fuel_filter !== "any") where.fuelType = fuel_filter;

          const cars = await prisma.car.findMany({ where });

          if (sort_by === "tco") cars.sort((a, b) => parseDollar(a.tco) - parseDollar(b.tco));
          else if (sort_by === "otd") cars.sort((a, b) => parseDollar(a.otd) - parseDollar(b.otd));
          else cars.sort((a, b) => b.fit - a.fit);

          if (response_format === "json") {
            return { content: [{ type: "text", text: JSON.stringify({ count: cars.length, cars }, null, 2) }] };
          }

          const lines = [`# All Cars (${cars.length} found)\n`];
          cars.forEach((car, i) => lines.push(carToMarkdown(car as DbCar, i + 1)));
          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch (err) {
          return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }] };
        }
      }
    );

    // ── car_shortlist ───────────────────────────────────────────────────────
    server.registerTool(
      "car_shortlist",
      {
        title: "Shortlist Best Cars",
        description: "Score and rank cars against user preferences to produce a personalised shortlist.",
        inputSchema: {
          max_otd_price: z.number().int().positive().optional(),
          max_monthly_tco: z.number().int().positive().optional(),
          fuel_preference: z.enum(["Gas", "Hybrid", "Electric", "any"]).default("any"),
          condition_preference: z.enum(["New", "Certified pre-owned", "Used", "any"]).default("any"),
          deal_quality: z.enum(["Good only", "Good or Fair", "any"]).default("Good or Fair"),
          must_have_awd: z.boolean().default(false),
          must_have_carplay: z.boolean().default(false),
          must_have_backup_camera: z.boolean().default(false),
          must_have_good_mpg: z.boolean().default(false),
          top_n: z.number().int().min(1).max(20).default(5),
          response_format: z.enum(["markdown", "json"]).default("markdown"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      },
      async (params) => {
        try {
          const dbWhere: Record<string, unknown> = {};
          if (params.fuel_preference !== "any") dbWhere.fuelType = params.fuel_preference;
          if (params.condition_preference !== "any") dbWhere.condition = params.condition_preference;

          let cars: DbCar[] = await prisma.car.findMany({ where: dbWhere });

          if (params.max_otd_price != null) cars = cars.filter((c) => parseDollar(c.otd) <= params.max_otd_price!);
          if (params.max_monthly_tco != null) cars = cars.filter((c) => parseDollar(c.tco) <= params.max_monthly_tco!);
          if (params.deal_quality === "Good only") cars = cars.filter((c) => c.deal === "Good");
          else if (params.deal_quality === "Good or Fair") cars = cars.filter((c) => c.deal === "Good" || c.deal === "Fair");
          if (params.must_have_awd) cars = cars.filter((c) => hasFeature(c, "AWD", "4WD", "all-wheel", "all wheel"));
          if (params.must_have_carplay) cars = cars.filter((c) => hasFeature(c, "CarPlay", "Apple CarPlay"));
          if (params.must_have_backup_camera) cars = cars.filter((c) => hasFeature(c, "backup", "rear camera", "reverse camera", "rearview"));
          if (params.must_have_good_mpg) cars = cars.filter((c) => c.fuelType === "Hybrid" || c.fuelType === "Electric");

          if (cars.length === 0) {
            return { content: [{ type: "text", text: "No cars match the given criteria. Try relaxing one or more filters." }] };
          }

          const scored: ScoredCar[] = cars
            .map((c) => ({ ...c, score: scorecar(c) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, params.top_n);

          if (params.response_format === "json") {
            const output = { total_matching: cars.length, returned: scored.length, shortlist: scored };
            return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
          }

          const lines = [`# Car Shortlist — Top ${scored.length} of ${cars.length} matching\n`];
          scored.forEach((car, i) => {
            lines.push(`${carToMarkdown(car, i + 1)}**Score:** ${car.score} (fit ${car.fit} + deal ${DEAL_BONUS[car.deal] ?? 0})\n`);
          });
          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch (err) {
          return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }] };
        }
      }
    );

    // ── car_get_detail ──────────────────────────────────────────────────────
    server.registerTool(
      "car_get_detail",
      {
        title: "Get Car Detail",
        description: "Return full details for a single car by its ID.",
        inputSchema: {
          car_id: z.string().min(1),
          response_format: z.enum(["markdown", "json"]).default("markdown"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      },
      async ({ car_id, response_format }) => {
        try {
          const car = await prisma.car.findUnique({ where: { id: car_id } });

          if (!car) {
            return { content: [{ type: "text", text: `Car not found: '${car_id}'. Use car_list_all to see available IDs.` }] };
          }

          if (response_format === "json") {
            return { content: [{ type: "text", text: JSON.stringify(car, null, 2) }] };
          }

          const text = [
            `# ${car.name}`,
            "",
            `| Field | Value |`,
            `|-------|-------|`,
            `| ID | \`${car.id}\` |`,
            `| Fit Score | ${car.fit}/100 |`,
            `| Deal | ${car.deal} |`,
            `| Monthly TCO | ${car.tco} |`,
            `| Out-the-Door | ${car.otd} |`,
            `| Condition | ${car.condition} |`,
            `| Fuel Type | ${car.fuelType} |`,
            `| Mileage | ${car.miles} |`,
            `| Distance | ${car.distance} |`,
            `| Dealer | ${car.dealer} |`,
            "",
            "## Pros",
            ...car.pros.map((p) => `- ${p}`),
            "",
            "## Cons",
            ...car.cons.map((c) => `- ${c}`),
            "",
            "## Why This Car",
            car.why,
          ].join("\n");

          return { content: [{ type: "text", text }] };
        } catch (err) {
          return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }] };
        }
      }
    );
  },
  {},
  {
    basePath: "/api",
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST };
