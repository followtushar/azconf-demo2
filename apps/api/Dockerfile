# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY apps/api ./apps/api
COPY packages/types ./packages/types

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S timecap -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=timecap:nodejs /app/apps/api/dist ./
COPY --from=builder --chown=timecap:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=timecap:nodejs /app/apps/api/prisma ./prisma
COPY --from=builder --chown=timecap:nodejs /app/apps/api/package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Switch to non-root user
USER timecap

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]