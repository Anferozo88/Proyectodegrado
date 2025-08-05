# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install bun
RUN npm install -g bun

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .
COPY .env .
# Build the Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV UI_PORT=3000

CMD ["bun", "run", "start"]
