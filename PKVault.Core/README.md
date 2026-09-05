# PKVault.Core

All the logic & data manipulation (including save) is done here. It's also where PKHeX & PokeApi data are used.

Dependencies & versions can be found in [PKVault.Core.csproj](./PKVault.Core.csproj).

## Technical foundations

PKVault is based on .NET 10, and is using C# 14.

Database is using EF Core with SQLite.

Pokémon files & saves are manipulated using PKHeX.Core.

## Flowcharts

These docs help understanding backend architecture & some lifecycles:

- [Architecture](./docs/ARCHITECTURE.md)
- [Session lifecycle](./docs/SESSION.md)
- [Data structure](./docs/DATA.md)

### Scripts

Checkout [Scripts](../Scripts/README.md):

- Database migration
- Generate static-data & spritesheets
- Update PKHeX
