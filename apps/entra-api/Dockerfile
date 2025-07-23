# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/entra-api/package*.json ./apps/entra-api/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY apps/entra-api ./apps/entra-api
COPY packages/types ./packages/types

# Generate Prisma client
WORKDIR /app/apps/entra-api
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/entra-api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/entra-api/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/entra-api/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]