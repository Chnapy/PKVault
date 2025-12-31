FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["PKVault.Backend.csproj", "./"]
RUN dotnet restore
COPY . .

RUN dotnet publish "PKVault.Backend.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY pokeapi/generated/ ./pokeapi/generated/ 
ENTRYPOINT ["dotnet", "PKVault.Backend.dll"]
