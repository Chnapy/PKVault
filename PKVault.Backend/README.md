# PKVault.Backend

All the logic & data manipulation (including save) is done here. It's also where PKHeX & PokeApi data are used.

Dependencies & versions can be found in [PKVault.Backend.csproj](./PKVault.Backend.csproj).

## Technical foundations

PKVault backend is based on .NET 10, and is using C# 14.

Database is using EF Core with SQLite (previously JSON, now legacy).

Pokemon files & saves are manipulated using PKHeX.Core.

## Flowcharts

These docs help understanding backend architecture & some lifecycles:

- [Architecture](./docs/ARCHITECTURE.md)
- [Session lifecycle](./docs/SESSION.md)
- [Data structure](./docs/DATA.md)

## Dev

Basic dev process.

```
dotnet run
```

Then you can use swagger: `http://localhost:5000/swagger`

### DB migration

Since PKVault.Desktop is using PublishTrimmed property, reflection is disabled all over the project.
Because of this constraint, EF Core generated migrations cannot work by themselves.

To avoid this issue migration should be generated using this command.

```
dotnet run -p:Mode=gen-migration MigrationName
```

### Generate static-data & spritesheets

Generate PokeApi data & spritesheets.
This process picks only the data used by the app & compress it as `.json.gz` files, and generates spritesheets.

```
dotnet run -p:Mode=gen-pokeapi
```

## Build

Basic build process.

```
dotnet publish
```
