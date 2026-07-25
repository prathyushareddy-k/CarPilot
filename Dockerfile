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

# Prisma: schema + migrations + generated client + CLI for `migrate deploy` at startup
COPY --from=build /src/prisma ./prisma
COPY --from=build /src/node_modules/prisma ./node_modules/prisma
COPY --from=build /src/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /src/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /src/node_modules/.bin/prisma ./node_modules/.bin/prisma

EXPOSE 3000
# Run migrations before starting the server. If DATABASE_URL is not set or the
# DB is unreachable, log the error but still start the server so the web UI
# (which uses static data) stays available.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy || echo '[startup] Prisma migration skipped — check DATABASE_URL'; exec node server.js"]
