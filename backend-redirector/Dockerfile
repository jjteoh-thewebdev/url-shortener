# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/mikro-orm.config.ts ./mikro-orm.config.ts
# COPY --from=builder /app/src/modules/url/url.entity.ts ./src/modules/url/url.entity.ts

# Expose the port
EXPOSE 3002

# Set the command to run the application
CMD ["node", "dist/server.js"] 