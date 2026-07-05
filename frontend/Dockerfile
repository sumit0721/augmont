# ──────────────────────────────────────────────────────────────
# Frontend Dockerfile — Multi-stage build for Angular
# ──────────────────────────────────────────────────────────────
# WHAT THIS DOES:
#   Stage 1 (Builder): Installs Angular dependencies + builds the production bundle
#   Stage 2 (Server):  Serves the built files using Nginx (a blazing-fast web server)
#
# WHY TWO STAGES?
#   The build stage has ~800MB of node_modules, TypeScript compiler, Angular CLI, etc.
#   We DON'T need any of that to serve the final HTML/CSS/JS files.
#   By using a second stage with just Nginx, the final image is only ~25MB!
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Build the Angular app ──────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies like @angular/cli)
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Angular app for production
# This compiles TypeScript, bundles, minifies, and outputs to dist/frontend/browser
RUN npx ng build --configuration=production

# ── Stage 2: Serve with Nginx ──────────────────────────────
FROM nginx:alpine

# Copy the built Angular files into Nginx's serving directory
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy our custom Nginx config (handles Angular SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Nginx starts automatically, no CMD needed (it's the default)
