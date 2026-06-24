# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install system dependencies for Prisma and build
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Set NODE_ENV to development to install devDependencies
ENV NODE_ENV=development

# Install dependencies
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

# Install dumb-init for proper signal handling and system dependencies for Prisma
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init openssl ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -ms /bin/bash -u 1001 -g nodejs nodejs

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create logs and uploads directories with proper permissions
RUN mkdir -p /app/logs /app/uploads && chown -R nodejs:nodejs /app/logs /app/uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
