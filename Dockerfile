# ──────────────────────────────────────────────────────────────
# Multi-stage Dockerfile — Builds Angular frontend + Node.js backend
# ──────────────────────────────────────────────────────────────
# Stage 1: Build the Angular frontend
# Stage 2: Set up the Node.js backend and serve the built frontend
#
# This Dockerfile is called from the REPO ROOT (context: .)
# so it can access both frontend/ and backend/ directories.
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Build Angular Frontend ──────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build -- --configuration production

# ── Stage 2: Production Backend ──────────────────────────────
FROM node:18-alpine
WORKDIR /app

# Copy backend package files first (layer caching)
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ .

# Copy the Angular build output into a public directory
COPY --from=frontend-build /build/dist/frontend/browser ./public

# Create the uploads directory
RUN mkdir -p uploads

EXPOSE 3000
CMD ["node", "server.js"]
