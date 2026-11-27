# Stage 1: Build Vue 3 Frontend (Direct Express API Mode — Zero External/Google Dependencies)
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN VITE_BACKEND_MODE=express VITE_API_BASE_URL=/api/v1 VITE_HASH_ROUTER=false npx vite build

# Stage 2: Build Express + Prisma Backend
FROM node:20-slim AS backend-builder
WORKDIR /app/backend
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci
COPY backend/ ./
RUN npx prisma generate && npm run build

# Stage 3: Lean Production Single-Container Runtime (Frontend + Backend + SQLite on Persistent Volume)
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:/app/data/qingji.db"
ENV UPLOADS_DIR="/app/data/uploads"
ENV STATIC_DIR="/app/public"

COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=frontend-builder /app/frontend/dist ./public
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && mkdir -p /app/data/uploads

VOLUME ["/app/data"]
EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
