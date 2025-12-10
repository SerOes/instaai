FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install ALL dependencies including devDependencies for build
RUN npm ci --include=dev
# Rebuild native modules for current platform
RUN npm rebuild lightningcss

# Rebuild the source code only when needed
FROM base AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install Linux-specific native binaries for Tailwind v4 and sharp
RUN npm install lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu sharp --os=linux --cpu=x64

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

# Copy Prisma files and client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/prisma ./prisma

# Install OpenSSL for Prisma (before user switch)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create uploads directory with proper permissions (will be mounted as volume)
RUN mkdir -p /app/public/uploads/thumbnails && chown -R nextjs:nodejs /app/public/uploads

# Create and configure entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "🔄 Syncing database schema..."' >> /app/entrypoint.sh && \
    echo 'cd /app && node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss || echo "DB sync failed, continuing..."' >> /app/entrypoint.sh && \
    echo 'echo "👤 Creating admin user..."' >> /app/entrypoint.sh && \
    echo 'cd /app && node prisma/seed-admin.js || echo "Admin user creation failed, continuing..."' >> /app/entrypoint.sh && \
    echo 'echo "🎨 Seeding AI presets..."' >> /app/entrypoint.sh && \
    echo 'cd /app && node prisma/seed-presets.js || echo "Preset seeding failed, continuing..."' >> /app/entrypoint.sh && \
    echo 'echo "🚀 Starting server..."' >> /app/entrypoint.sh && \
    echo 'exec node server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    chown nextjs:nodejs /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use entrypoint to sync DB then start server
CMD ["/app/entrypoint.sh"]
