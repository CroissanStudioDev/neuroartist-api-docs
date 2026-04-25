# syntax=docker/dockerfile:1.7
# ----------------------------------------------------------------------------
# Neuroartist API Gateway — Docs (Nextra 4 + Next.js 16, standalone output)
#
# Multi-stage build:
#   1) deps    — установка зависимостей (cache-friendly слой)
#   2) builder — `next build` + автоматический `postbuild` (pagefind index)
#   3) runner  — минимальный alpine с только standalone-runtime
#
# Pagefind генерирует search-индекс в `public/_pagefind` через `postbuild`,
# поэтому копируем `public/` целиком — индекс должен попасть в финальный образ.
# ----------------------------------------------------------------------------

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# ---- 1) deps: install full deps for build ----------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- 2) builder: next build + pagefind index -------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `pnpm build` запускает next build → затем postbuild (pagefind) → public/_pagefind
RUN pnpm build

# ---- 3) runner: standalone runtime -----------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# wget нужен для HEALTHCHECK; alpine-node не включает его по умолчанию.
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# next.config.mjs has `output: "standalone"` so .next/standalone is self-contained
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
