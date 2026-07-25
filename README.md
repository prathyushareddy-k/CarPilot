# CarPilot

An AI car-buying agent. The user answers a short, plain-language intake, then the agent continuously scans dealer, private-party, and CPO listings, ranks cars against the user's actual priorities, judges whether a deal is good against real comps, and produces a ready-to-use negotiation packet — instead of making the buyer research and compare cars themselves.

> **Status:** Interactive front-end prototype only. No backend, no live data, no persistence — all car/comp/scan data in the prototype is hardcoded for demonstration.

## What's in this repo

| File | Purpose |
|---|---|
| `app/` | The Next.js app (App Router + TypeScript) — the live, editable version of the prototype |
| `Prototype.html` | The original single-file bundled prototype, kept for reference/comparison. No longer the live entry point. |
| `doc/01_assumption_map.md` | Riskiest assumptions and how to test them |
| `doc/02_personas.md` | Target user personas, derived from the intake options |
| `doc/03_product_brief.md` | One-page problem/solution/why-now summary |
| `doc/04_prd.md` | Full functional spec, screen by screen |
| `doc/05_project_note.md` | Current status + immediate next steps |

## Running the prototype

```
npm install
npm run dev
# open http://localhost:3000
```

> **Migration note:** the app was migrated from a single bundled HTML file (`Prototype.html`) into this Next.js app. It's a faithful, screen-for-screen port — same interactions, same hardcoded data — re-platformed so it can be iterated on and eventually wired to real data.

## Database (PostgreSQL)

A Postgres schema (via Prisma) now exists for the app's domain — users, intake profiles, cars/listings, saved & compare selections, deal packets, and alerts — modeled on the data already hardcoded in `app/_lib/useAppView.ts`. **The UI is not wired to it yet**: the app still runs entirely on in-memory React state, exactly as before. The database is scaffolded and seeded so the next phase of work (persisting intake answers, saved cars, etc.) can build on it directly.

```
npm run db:up        # start local Postgres via Docker
cp .env.example .env # first time only
npm run db:migrate   # create the schema (prompts for a migration name on schema changes)
npm run db:seed      # populate with the same data the UI currently hardcodes
npm run db:studio    # optional: browse the data at http://localhost:5555
```

| File | Purpose |
|---|---|
| `docker-compose.yml` | Local Postgres 16 container |
| `prisma/schema.prisma` | Schema: `User`, `IntakeProfile`, `Car`, `CarSelection`, `DealPacket`, `Alert` |
| `prisma/seed.ts` | Seeds the DB with the same cars/packets/alerts the prototype hardcodes |
| `lib/prisma.ts` | Shared Prisma Client singleton for use in API routes / server components |

`npm run db:down` stops the container (data persists in a Docker volume; add `-v` manually if you want a clean slate).

## Product flow covered in the prototype

Landing → Intake (multi-step) → Scanning → Shortlist → Compare → Listing Detail (Deal Judge) → Deal Packet, plus a proactive "Re-plan" notification pattern, a mobile layout, and a reusable-components reference screen.

Full screen-by-screen requirements are in `doc/04_prd.md`.

## Known open questions

- Real data source for listings, dealer inventory, and comp sales — coverage and refresh latency unconfirmed
- How "negotiation headroom" and out-the-door totals should actually be computed
- Auth/account model, and what happens after "Send to seller"

Full list in `doc/04_prd.md` (Section 6) and `doc/05_project_note.md`.

## Suggested reading order

1. `doc/03_product_brief.md` — the why, in five minutes
2. `doc/02_personas.md` — who this is for
3. `doc/01_assumption_map.md` — what we don't know yet
4. `doc/04_prd.md` — the detailed spec

## License / Ownership

_Add license and internal ownership/contact info here._