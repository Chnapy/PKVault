FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG TARGETARCH
WORKDIR /src
COPY ["PKVault.Backend.csproj", "./"]
RUN dotnet restore
COPY . .

RUN dotnet publish "PKVault.Backend.csproj" -c Release -a $TARGETARCH --no-self-contained -o /app/publish -p:UseAppHost=false -p:PublishSingleFile=false -p:PublishReadyToRun=false

FROM base AS final
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
COPY pokeapi/generated/ ./pokeapi/generated/ 
ENTRYPOINT ["dotnet", "PKVault.Backend.dll", "--contentRoot", "/app"]
