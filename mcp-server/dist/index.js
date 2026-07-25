#!/usr/bin/env node
/**
 * MCP Server for Lot Agent — Car Shortlisting
 *
 * Exposes three tools:
 *   car_list_all      List every car in the database with optional filters.
 *   car_shortlist     Score and rank cars against user preferences.
 *   car_get_detail    Return full details for a single car by ID.
 *
 * Run via stdio (Claude Desktop / Claude Code MCP config):
 *   node dist/index.js
 *
 * Requires DATABASE_URL in the environment.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Parse a dollar string like "$26,860" or "$430" into a number. */
function parseDollar(s) {
    return parseInt(s.replace(/[$,]/g, ""), 10) || 0;
}
/** Detect presence of a feature keyword in any text fields of a car. */
function hasFeature(car, ...keywords) {
    const haystack = [
        car.name,
        ...car.pros,
        car.why,
    ].join(" ").toLowerCase();
    return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}
// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
const DEAL_BONUS = {
    Good: 10,
    Fair: 0,
    Over: -15,
};
/**
 * Compute a composite score for shortlisting.
 * Base = car.fit (0–100), adjusted by deal quality.
 */
function scorecar(car) {
    return car.fit + (DEAL_BONUS[car.deal] ?? 0);
}
// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------
function carToMarkdown(car, rank) {
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
// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new McpServer({
    name: "car-shortlist-mcp-server",
    version: "1.0.0",
});
// ---------------------------------------------------------------------------
// Tool: car_list_all
// ---------------------------------------------------------------------------
const ListAllInput = z.object({
    deal_filter: z
        .enum(["Good", "Fair", "Over", "any"])
        .default("any")
        .describe("Filter by deal quality. 'any' returns all."),
    condition_filter: z
        .enum(["New", "Certified pre-owned", "Used", "any"])
        .default("any")
        .describe("Filter by condition. 'any' returns all."),
    fuel_filter: z
        .enum(["Gas", "Hybrid", "Electric", "any"])
        .default("any")
        .describe("Filter by fuel type. 'any' returns all."),
    sort_by: z
        .enum(["fit", "tco", "otd"])
        .default("fit")
        .describe("Sort results by fit score, monthly TCO, or OTD price."),
    response_format: z
        .enum(["markdown", "json"])
        .default("markdown")
        .describe("'markdown' for human-readable output, 'json' for structured data."),
});
server.registerTool("car_list_all", {
    title: "List All Cars",
    description: `List every car in the Lot Agent database with optional filters.

Args:
  - deal_filter ('Good' | 'Fair' | 'Over' | 'any'): Filter by deal quality vs. market comparables. Default: 'any'.
  - condition_filter ('New' | 'Certified pre-owned' | 'Used' | 'any'): Filter by car condition. Default: 'any'.
  - fuel_filter ('Gas' | 'Hybrid' | 'Electric' | 'any'): Filter by fuel/powertrain type. Default: 'any'.
  - sort_by ('fit' | 'tco' | 'otd'): Sort by fit score (desc), monthly TCO (asc), or OTD price (asc). Default: 'fit'.
  - response_format ('markdown' | 'json'): Output format. Default: 'markdown'.

Returns:
  All matching cars with name, fit score, deal rating, TCO, OTD price, condition, fuel type, pros, and cons.

Examples:
  - "Show me all Good-deal cars" → deal_filter='Good'
  - "List all hybrid or electric cars" → fuel_filter varies
  - "All CPO cars sorted by price" → condition_filter='Certified pre-owned', sort_by='otd'`,
    inputSchema: ListAllInput,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const where = {};
        if (params.deal_filter !== "any")
            where.deal = params.deal_filter;
        if (params.condition_filter !== "any")
            where.condition = params.condition_filter;
        if (params.fuel_filter !== "any")
            where.fuelType = params.fuel_filter;
        const cars = await prisma.car.findMany({ where });
        // Sort
        if (params.sort_by === "tco") {
            cars.sort((a, b) => parseDollar(a.tco) - parseDollar(b.tco));
        }
        else if (params.sort_by === "otd") {
            cars.sort((a, b) => parseDollar(a.otd) - parseDollar(b.otd));
        }
        else {
            cars.sort((a, b) => b.fit - a.fit);
        }
        if (params.response_format === "json") {
            return {
                content: [{ type: "text", text: JSON.stringify({ count: cars.length, cars }, null, 2) }],
                structuredContent: { count: cars.length, cars },
            };
        }
        const lines = [`# All Cars (${cars.length} found)\n`];
        cars.forEach((car, i) => lines.push(carToMarkdown(car, i + 1)));
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }] };
    }
});
// ---------------------------------------------------------------------------
// Tool: car_shortlist
// ---------------------------------------------------------------------------
const ShortlistInput = z.object({
    max_otd_price: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum out-the-door price in dollars (e.g. 30000). Omit for no limit."),
    max_monthly_tco: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum monthly total cost of ownership in dollars (e.g. 450). Omit for no limit."),
    fuel_preference: z
        .enum(["Gas", "Hybrid", "Electric", "any"])
        .default("any")
        .describe("Preferred fuel/powertrain type. 'any' includes all types."),
    condition_preference: z
        .enum(["New", "Certified pre-owned", "Used", "any"])
        .default("any")
        .describe("Preferred condition. 'any' includes all conditions."),
    deal_quality: z
        .enum(["Good only", "Good or Fair", "any"])
        .default("Good or Fair")
        .describe("Minimum deal quality to include. Defaults to 'Good or Fair' (excludes overpriced)."),
    must_have_awd: z
        .boolean()
        .default(false)
        .describe("If true, only return cars with AWD/4WD. Detected from listing text."),
    must_have_carplay: z
        .boolean()
        .default(false)
        .describe("If true, only return cars with Apple CarPlay support. Detected from listing text."),
    must_have_backup_camera: z
        .boolean()
        .default(false)
        .describe("If true, only return cars with a backup/rear camera. Detected from listing text."),
    must_have_good_mpg: z
        .boolean()
        .default(false)
        .describe("If true, only return Hybrid or Electric vehicles (best fuel efficiency)."),
    top_n: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5)
        .describe("Number of top matches to return. Default: 5."),
    response_format: z
        .enum(["markdown", "json"])
        .default("markdown")
        .describe("'markdown' for human-readable output, 'json' for structured data."),
});
server.registerTool("car_shortlist", {
    title: "Shortlist Best Cars",
    description: `Score and rank cars from the database against user preferences to produce a personalised shortlist.

This is the primary tool for recommending cars. It filters by hard constraints (budget, fuel, condition, must-haves) then ranks remaining cars using each car's fit score adjusted for deal quality.

Args:
  - max_otd_price (number, optional): Max out-the-door price in dollars (e.g. 30000).
  - max_monthly_tco (number, optional): Max monthly total cost of ownership (e.g. 450).
  - fuel_preference ('Gas' | 'Hybrid' | 'Electric' | 'any'): Preferred fuel type. Default: 'any'.
  - condition_preference ('New' | 'Certified pre-owned' | 'Used' | 'any'): Preferred condition. Default: 'any'.
  - deal_quality ('Good only' | 'Good or Fair' | 'any'): Minimum deal quality. Default: 'Good or Fair'.
  - must_have_awd (boolean): Require AWD. Default: false.
  - must_have_carplay (boolean): Require Apple CarPlay. Default: false.
  - must_have_backup_camera (boolean): Require backup camera. Default: false.
  - must_have_good_mpg (boolean): Require Hybrid or Electric. Default: false.
  - top_n (number): How many cars to return (1–20). Default: 5.
  - response_format ('markdown' | 'json'): Output format. Default: 'markdown'.

Returns:
  Ranked shortlist with composite score, fit score, deal rating, TCO, OTD, pros/cons, and agent explanation.

Scoring:
  - Base = car's existing fit score (0–100).
  - Deal bonus: Good deal +10 pts, Fair +0, Over −15.
  - Hard filters remove ineligible cars entirely.

Examples:
  - "Best cars under $28k, must have AWD" → max_otd_price=28000, must_have_awd=true
  - "Top 3 hybrid or electric picks" → fuel_preference='Electric' or 'Hybrid', top_n=3
  - "Cheapest Good-deal cars under $450/mo" → deal_quality='Good only', max_monthly_tco=450`,
    inputSchema: ShortlistInput,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        // Fetch all cars — filtering by DB fields we can rely on
        const dbWhere = {};
        if (params.fuel_preference !== "any")
            dbWhere.fuelType = params.fuel_preference;
        if (params.condition_preference !== "any")
            dbWhere.condition = params.condition_preference;
        let cars = await prisma.car.findMany({ where: dbWhere });
        // --- Hard filters ---
        // Budget: OTD price
        if (params.max_otd_price != null) {
            cars = cars.filter((c) => parseDollar(c.otd) <= params.max_otd_price);
        }
        // Budget: Monthly TCO
        if (params.max_monthly_tco != null) {
            cars = cars.filter((c) => parseDollar(c.tco) <= params.max_monthly_tco);
        }
        // Deal quality
        if (params.deal_quality === "Good only") {
            cars = cars.filter((c) => c.deal === "Good");
        }
        else if (params.deal_quality === "Good or Fair") {
            cars = cars.filter((c) => c.deal === "Good" || c.deal === "Fair");
        }
        // Must-have: AWD — look for AWD/4WD keywords in name/pros/why
        if (params.must_have_awd) {
            cars = cars.filter((c) => hasFeature(c, "AWD", "4WD", "all-wheel", "all wheel"));
        }
        // Must-have: CarPlay — look for CarPlay keyword
        if (params.must_have_carplay) {
            cars = cars.filter((c) => hasFeature(c, "CarPlay", "Apple CarPlay"));
        }
        // Must-have: Backup camera — look for backup / rear camera keywords
        if (params.must_have_backup_camera) {
            cars = cars.filter((c) => hasFeature(c, "backup", "rear camera", "reverse camera", "rearview"));
        }
        // Must-have: good MPG — require Hybrid or Electric
        if (params.must_have_good_mpg) {
            cars = cars.filter((c) => c.fuelType === "Hybrid" || c.fuelType === "Electric");
        }
        if (cars.length === 0) {
            return {
                content: [{
                        type: "text",
                        text: "No cars match the given criteria. Try relaxing one or more filters (e.g. increase budget, remove must-haves, or change deal quality to 'any').",
                    }],
            };
        }
        // --- Score and rank ---
        const scored = cars
            .map((c) => ({ ...c, score: scorecar(c) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, params.top_n);
        if (params.response_format === "json") {
            const output = {
                total_matching: cars.length,
                returned: scored.length,
                shortlist: scored,
            };
            return {
                content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        const lines = [
            `# Car Shortlist — Top ${scored.length} of ${cars.length} matching\n`,
        ];
        scored.forEach((car, i) => {
            lines.push(`${carToMarkdown(car, i + 1)}**Score:** ${car.score} (fit ${car.fit} + deal ${DEAL_BONUS[car.deal] ?? 0})\n`);
        });
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }] };
    }
});
// ---------------------------------------------------------------------------
// Tool: car_get_detail
// ---------------------------------------------------------------------------
const GetDetailInput = z.object({
    car_id: z
        .string()
        .min(1)
        .describe("The car's ID slug (e.g. 'crv', 'rav4', 'cx5'). Use car_list_all to find available IDs."),
    response_format: z
        .enum(["markdown", "json"])
        .default("markdown")
        .describe("'markdown' for human-readable output, 'json' for structured data."),
});
server.registerTool("car_get_detail", {
    title: "Get Car Detail",
    description: `Return full details for a single car from the database by its ID.

Args:
  - car_id (string): The car's slug ID (e.g. 'crv', 'rav4', 'cx5'). Use car_list_all to discover IDs.
  - response_format ('markdown' | 'json'): Output format. Default: 'markdown'.

Returns:
  Complete car record including fit score, deal rating, TCO, OTD price, condition, fuel type,
  miles, distance, dealer, pros, cons, and the agent's 'why' explanation.

Error Handling:
  - Returns "Car not found" if no car matches the given ID.`,
    inputSchema: GetDetailInput,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const car = await prisma.car.findUnique({ where: { id: params.car_id } });
        if (!car) {
            return {
                content: [{
                        type: "text",
                        text: `Car not found: '${params.car_id}'. Use car_list_all to see available car IDs.`,
                    }],
            };
        }
        if (params.response_format === "json") {
            return {
                content: [{ type: "text", text: JSON.stringify(car, null, 2) }],
                structuredContent: car,
            };
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
    }
    catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }] };
    }
});
// ---------------------------------------------------------------------------
// Entry point — stdio transport
// ---------------------------------------------------------------------------
async function main() {
    if (!process.env.DATABASE_URL) {
        process.stderr.write("ERROR: DATABASE_URL environment variable is required\n");
        process.exit(1);
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write("Lot Agent car-shortlist-mcp-server running via stdio\n");
}
main().catch((err) => {
    process.stderr.write(`Server error: ${err}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map