# backend builder
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder

WORKDIR /src

COPY ["PKVault.Backend/PKVault.Backend.csproj", "PKVault.Backend/"]
COPY ["PKVault.Backend.Tests/PKVault.Backend.Tests.csproj", "PKVault.Backend.Tests/"]

RUN dotnet restore "PKVault.Backend/PKVault.Backend.csproj"
RUN dotnet restore "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

COPY ./PKVault.Backend ./PKVault.Backend
COPY ./global.json ./global.json
COPY ./PKVault.Backend.Tests ./PKVault.Backend.Tests

RUN dotnet build "PKVault.Backend/PKVault.Backend.csproj"
RUN dotnet build "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

RUN dotnet tool install --global NSwag.ConsoleCore
ENV PATH="$PATH:/root/.dotnet/tools"

# generate swagger for frontend
RUN nswag aspnetcore2openapi \
  /project:"PKVault.Backend/PKVault.Backend.csproj" \
  /configuration:Debug \
  /output:/app/swagger.json \
  /noBuild:true

# tests
RUN dotnet test --project "./PKVault.Backend.Tests/PKVault.Backend.Tests.csproj" --no-restore --no-build

# backend publish
FROM backend-builder AS backend-publish
RUN dotnet publish "PKVault.Backend/PKVault.Backend.csproj" -c Release -o /app/publish --no-restore

# backend runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS backend-runtime

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=backend-publish /app/publish .

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD dotnet-health || exit 1

EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# extract swagger from backend
FROM alpine:latest AS swagger-extractor
COPY --from=backend-builder /app/swagger.json /swagger.json

# frontend builder
ARG VITE_SERVER_URL
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
COPY --from=swagger-extractor /swagger.json ./

RUN npm ci

COPY frontend .

# generate SDK
ARG VITE_OPENAPI_PATH=swagger.json
ENV VITE_OPENAPI_PATH=$VITE_OPENAPI_PATH

RUN npm run gen:sdk:basic

RUN npm run c:type

# RUN npm run c:lint

# build
ARG VITE_SERVER_URL
RUN VITE_SERVER_URL=$VITE_SERVER_URL npm run build

# frontend runtime
FROM node:22-alpine AS frontend-runtime

WORKDIR /app

RUN npm install -g serve

COPY --from=frontend-builder /app/dist ./dist

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/index.html || exit 1

EXPOSE 3000
