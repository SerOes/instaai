FROM node:20-alpine AS base

# Clone stage - clone the repo with token
FROM base AS cloner
RUN apk add --no-cache git
WORKDIR /app

ARG GIT_TOKEN
ARG GIT_REPO=SerOes/instaai
ARG GIT_BRANCH=main

# Clone the repository using the token
RUN git clone --depth 1 --branch ${GIT_BRANCH} https://${GIT_TOKEN}@github.com/${GIT_REPO}.git .

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files from cloned repo
COPY --from=cloner /app/package.json /app/package-lock.json* ./
# Install ALL dependencies including devDependencies for build
RUN npm ci --include=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=cloner /app .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy node_modules for Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
