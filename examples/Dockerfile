FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the entire monorepo-like structure
COPY . .

# Install dependencies at root
RUN npm install

# Build orbcafe-ui if needed
RUN npm run build || true

# Install dependencies in examples
WORKDIR /app/examples
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./

WORKDIR /app/examples
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8777

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app /app

USER nextjs

EXPOSE 8777

WORKDIR /app/examples

CMD ["npm", "run", "start"]
