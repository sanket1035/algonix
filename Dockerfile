# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + serve frontend build
FROM node:18-alpine

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --only=production

COPY backend/ ./

# Copy frontend build into backend so Express can serve it
COPY --from=frontend-build /app/frontend/build ../frontend/build

RUN addgroup -g 1001 -S nodejs && \
    adduser -S algonix -u 1001 && \
    chown -R algonix:nodejs /app

USER algonix

EXPOSE 5000

CMD ["node", "server.js"]
