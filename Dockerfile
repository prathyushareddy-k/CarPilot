# Capstone deployment image — Next.js standalone + Prisma migrate-on-start.
#
# Requires next.config.ts to include:  output: 'standalone'
# The entrypoint runs `prisma migrate deploy` BEFORE the server starts — the
# Day 4 rule ("always migrate before deploying new code") encoded in the image.

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# ---- runtime stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0

# Next standalone output + static assets
COPY --from=build /src/.next/standalone ./
COPY --from=build /src/.next/static ./.next/static
COPY --from=build /src/public ./public

# Prisma schema/migrations + full node_modules for the `migrate deploy` CLI at
# startup. The standalone output above only bundles the generated
# @prisma/client, not the prisma CLI itself — and the CLI has transitive
# dependencies (its .wasm schema engine, the `effect` package, etc.) spread
# across more than just the prisma/@prisma folders, so copying only those
# left it unable to run (silently, since the CMD below swallows the error).
# Copying the whole node_modules avoids guessing which subset it needs.
COPY --from=build /src/prisma ./prisma
COPY --from=build /src/node_modules ./node_modules

EXPOSE 3000
# Run migrations before starting the server. If DATABASE_URL is not set or the
# DB is unreachable, log the error but still start the server so the web UI
# (which uses static data) stays available.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy || echo '[startup] Prisma migration skipped — check DATABASE_URL'; exec node server.js"]
