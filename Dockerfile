# syntax=docker/dockerfile:1

# Production image for the mitos marketing site. Multi stage: build the static
# Astro output, then serve dist/ from an unprivileged nginx on port 8080 so the
# single origin mitos.run deploy can run marketing as an in cluster Service.

# Stage 1: build the static site (dist/).
# astro@6 needs Node >=22.12. The prebuild (scripts/sync-engine-docs.mjs) clones
# mitos-run/mitos@main for the engine docs, so git and network are required here.
FROM node:22-slim AS build
WORKDIR /app

# git: sync-engine-docs.mjs shallow clones mitos-run/mitos for the docs.
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install with the committed lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build = prebuild docs sync + astro build + clean URL fixup + gh stars pill.
COPY . .
RUN npm run build

# Stage 2: serve dist/ as a non root, unprivileged static server on 8080.
# nginx-unprivileged already runs as uid 101 and listens on 8080 by default.
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

# Routing + cache headers: clean URLs, the /mitos go vanity meta, immutable
# fingerprinted assets, and no-cache HTML.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The built static site.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
