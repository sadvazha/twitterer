# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./services/libs /libs
RUN ls /
RUN ls /libs
COPY ./services/api/package*.json ./
RUN npm install

# Copy source code
COPY ./services/api/tsconfig.json ./
COPY ./services/api/src ./src

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY ./services/api/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
