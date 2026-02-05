# backend builder
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder

WORKDIR /src

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY ["PKVault.Backend/PKVault.Backend.csproj", "PKVault.Backend/"]
COPY ["PKVault.Backend.Tests/PKVault.Backend.Tests.csproj", "PKVault.Backend.Tests/"]

RUN dotnet restore "PKVault.Backend/PKVault.Backend.csproj"
RUN dotnet restore "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

COPY ./PKVault.Backend ./PKVault.Backend
COPY ./global.json ./global.json
COPY ./PKVault.Backend.Tests ./PKVault.Backend.Tests

RUN dotnet build "PKVault.Backend/PKVault.Backend.csproj"
RUN dotnet build "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

# generate swagger for frontend
RUN dotnet run --project "PKVault.Backend/PKVault.Backend.csproj" --no-build & \
  until curl -f -s http://localhost:5000/swagger/v1/swagger.json -o /swagger.json; do \
  sleep 1; \
  done && \
  pkill dotnet

# tests
RUN dotnet test --project "./PKVault.Backend.Tests/PKVault.Backend.Tests.csproj" --no-restore --no-build

# backend publish
FROM backend-builder AS backend-publish
# build including dotnet runtime + compatible Alpine
RUN dotnet build "PKVault.Backend/PKVault.Backend.csproj" -r linux-musl-x64
RUN dotnet publish "PKVault.Backend/PKVault.Backend.csproj" -c Release -o /app/publish --self-contained -r linux-musl-x64

# extract swagger from backend
FROM alpine:latest AS swagger-extractor
COPY --from=backend-builder /swagger.json /swagger.json

# frontend builder
ARG VITE_SERVER_URL
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
COPY --from=swagger-extractor /swagger.json ./

RUN npm ci

COPY frontend .

RUN npm run gen:routes

# generate SDK
ARG VITE_OPENAPI_PATH=swagger.json
ENV VITE_OPENAPI_PATH=$VITE_OPENAPI_PATH

RUN npm run gen:sdk:basic

RUN npm run c:type

# RUN npm run c:lint

# build
ARG VITE_SERVER_URL=http://localhost:3000
RUN VITE_SERVER_URL=$VITE_SERVER_URL npm run build

# monolith: backend & frontend
FROM alpine:latest AS monolith
RUN apk add --no-cache \
  nginx \
  supervisor \
  curl \
  # icu libs required for backend date manipulation non-utc
  icu-libs \
  # complete cultures (en/fr/...)
  icu-data-full \
  # timezones
  tzdata \
  && rm -rf /var/cache/apk/*
WORKDIR /app

# setup logs folders
RUN mkdir -p /var/log/supervisord /var/log/nginx /var/run/nginx \
  && chown -R 755 /var/log/nginx /var/run/nginx \
  && chmod -R 755 /var/log/supervisord

COPY --from=backend-publish /app/publish /app/backend
COPY --from=frontend-builder /app/dist /app/frontend

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ARG VITE_SERVER_URL=http://localhost:3000
ENV VITE_SERVER_URL=$VITE_SERVER_URL

VOLUME [ "/app/backend/config", "/app/backend/db", "/app/backend/storage", "/app/backend/backup", "/app/backend/logs" ]

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
