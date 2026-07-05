# ──────────────────────────────────────────────────────────────
# Backend Dockerfile — Multi-stage production build
# ──────────────────────────────────────────────────────────────
# WHAT THIS DOES:
#   1. Uses a lightweight Node.js 18 Alpine image (~120MB vs ~900MB for full)
#   2. Installs ONLY production dependencies (no devDependencies like jest/nodemon)
#   3. Copies your backend source code into the container
#   4. Runs your server.js on port 3000
#
# WHY ALPINE?
#   Alpine Linux is a tiny Linux distro (~5MB). Using node:18-alpine
#   keeps the final Docker image very small, which means:
#   - Faster uploads to EC2
#   - Faster container startup
#   - Less disk space used on your free-tier EC2
# ──────────────────────────────────────────────────────────────

FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files FIRST (Docker caches this layer)
# This means if your code changes but dependencies don't,
# Docker won't re-install node_modules — saving build time!
COPY package.json package-lock.json ./

# Install ONLY production dependencies
# npm ci is faster and more reliable than npm install for CI/CD
RUN npm ci --only=production

# Now copy the rest of your backend source code
COPY . .

# Create the uploads directory (for file uploads)
RUN mkdir -p uploads

# Expose port 3000 so Docker knows the app listens here
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
