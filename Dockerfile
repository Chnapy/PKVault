# backend builder
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder

WORKDIR /src

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY ["PKVault.Backend/PKVault.Backend.csproj", "PKVault.Backend/"]

RUN dotnet restore "PKVault.Backend/PKVault.Backend.csproj"

COPY ./PKVault.Backend ./PKVault.Backend

RUN dotnet build "PKVault.Backend/PKVault.Backend.csproj"

RUN dotnet run --project "PKVault.Backend/PKVault.Backend.csproj" --no-build & \
  until curl -f -s http://localhost:5000/swagger/v1/swagger.json -o /swagger.json; do \
  sleep 1; \
  done && \
  pkill dotnet

# backend test
FROM backend-builder AS backend-test

COPY ["PKVault.Backend.Tests/PKVault.Backend.Tests.csproj", "PKVault.Backend.Tests/"]

RUN dotnet restore "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

COPY ./global.json ./global.json
COPY ./PKVault.Backend.Tests ./PKVault.Backend.Tests

RUN dotnet build "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

# tests
RUN dotnet test --project "./PKVault.Backend.Tests/PKVault.Backend.Tests.csproj" --no-restore --no-build

# backend publish
FROM backend-builder AS backend-publish

RUN dotnet publish "PKVault.Backend/PKVault.Backend.csproj" -c Release -o /app/publish

# extract swagger from backend
FROM alpine:latest AS swagger-extractor
COPY --from=backend-builder /swagger.json /swagger.json

# frontend builder
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

# frontend check
FROM frontend-builder AS frontend-check

RUN npm run c:type

# RUN npm run c:lint

# frontend publish
ARG VITE_SERVER_URL
FROM frontend-builder AS frontend-publish

# build
ARG VITE_SERVER_URL=http://localhost:3000
RUN VITE_SERVER_URL=$VITE_SERVER_URL npm run build

# desktop builder
FROM backend-builder AS desktop-builder

WORKDIR /src

COPY ["PKVault.Desktop/PKVault.Desktop.csproj", "PKVault.Desktop/"]

RUN dotnet restore "PKVault.Desktop/PKVault.Desktop.csproj"

COPY --exclude=publishers ./PKVault.Desktop ./PKVault.Desktop
COPY --from=frontend-publish /app/dist ./PKVault.Desktop/Resources/wwwroot

RUN dotnet build "PKVault.Desktop/PKVault.Desktop.csproj"

# desktop publish
FROM desktop-builder AS desktop-publish

ARG RID
ENV RID=${RID:-linux-x64}

RUN dotnet publish "PKVault.Desktop/PKVault.Desktop.csproj" -c Release -o /app/publish -r ${RID}

RUN ls -la /app/publish

RUN if [ "$(echo $RID | grep -o 'win-x64')" ]; then \
  cp -r /app/publish /app/publish-final && \
  echo "=== Skip AppImage (non-linux-x64: $RID) ==="; \
  fi

FROM desktop-publish AS desktop-publish-linux-base

COPY ./PKVault.Desktop/publishers/common ./PKVault.Desktop/publishers/common

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  wget binutils file \
  lintian \
  flatpak flatpak-builder ostree && \
  apt-get clean && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN mkdir -p /app/publish-final

# desktop linux - AppImage
FROM desktop-publish-linux-base AS desktop-publish-linux-appimage

ARG VERSION
ENV VERSION=${VERSION}

COPY ./PKVault.Desktop/publishers/AppImage ./PKVault.Desktop/publishers/AppImage

WORKDIR /src/PKVault.Desktop/publishers/AppImage

RUN chmod +x build-appimage.sh && \
  sh build-appimage.sh

# desktop linux - deb  
FROM desktop-publish-linux-base AS desktop-publish-linux-deb

ARG VERSION
ENV VERSION=${VERSION}

COPY ./PKVault.Desktop/publishers/deb ./PKVault.Desktop/publishers/deb

WORKDIR /src/PKVault.Desktop/publishers/deb

RUN chmod +x build-deb.sh && \
  sh build-deb.sh

# desktop linux - flatpak
FROM desktop-publish-linux-base AS desktop-publish-linux-flatpak

ARG VERSION
ENV VERSION=${VERSION}

COPY ./PKVault.Desktop/publishers/flatpak ./PKVault.Desktop/publishers/flatpak

WORKDIR /src/PKVault.Desktop/publishers/flatpak

RUN chmod +x build-flatpak-build.sh build-flatpak-install.sh && \
  sh build-flatpak-install.sh && \
  sh build-flatpak-build.sh

FROM alpine:latest AS desktop

COPY --from=desktop-publish /app/publish-final /app

RUN ls -la /app

FROM alpine:latest AS desktop-linux

COPY --from=desktop-publish /app/publish/PKVault /tmp/raw/PKVault
COPY --from=desktop-publish-linux-appimage /app/publish-final/ /tmp/appimage/
COPY --from=desktop-publish-linux-deb /app/publish-final/ /tmp/deb/
COPY --from=desktop-publish-linux-flatpak /app/publish-final/ /tmp/flatpak/

RUN mkdir -p /app && \
  cp /tmp/raw/* /tmp/appimage/* /tmp/deb/* /tmp/flatpak/* /app/ && \
  ls -la /app/

# monolith: backend & frontend
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS monolith

ARG VERSION
ARG VCS_REF
ARG BUILD_DATE

LABEL org.opencontainers.image.title="PKVault" \
  org.opencontainers.image.description="Pokemon storage and save manipulation tool based on PKHeX." \
  org.opencontainers.image.url="https://github.com/Chnapy/PKVault" \
  org.opencontainers.image.source="https://github.com/Chnapy/PKVault" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.revision="${VCS_REF}" \
  org.opencontainers.image.created="${BUILD_DATE}" \
  org.opencontainers.image.licenses="GPLv3" \
  org.opencontainers.image.vendor="PKVault" \
  org.opencontainers.image.authors="Richard Haddad" \
  org.opencontainers.image.base.name="mcr.microsoft.com/dotnet/aspnet:10.0-alpine"

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
COPY --from=frontend-publish /app/dist /app/frontend

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ARG VITE_SERVER_URL=http://localhost:3000
ENV VITE_SERVER_URL=$VITE_SERVER_URL

VOLUME [ "/app/backend/config", "/app/backend/db", "/app/backend/storage", "/app/backend/backup", "/app/backend/logs" ]

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
