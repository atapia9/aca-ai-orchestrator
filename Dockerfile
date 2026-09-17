# Nota: construir esta imagen en el mismo arco del host de destino (OCI A1 = arm64/Ampere),
# o con `docker buildx build --platform linux/arm64`, para que better-sqlite3 compile bien.

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
  && apt-get purge -y python3 make g++ && apt-get autoremove -y
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/http.js"]
