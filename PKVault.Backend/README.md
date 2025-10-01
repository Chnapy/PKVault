# PKVault.Backend

All the logic & data manipulation (including save) is done here. It's also where PKHeX & PokeApi data are used.

Dependencies & versions can be found in [PKVault.Backend.csproj](./PKVault.Backend.csproj).

## Setup

Generate PokeApi data. This process pick only the data used by the app & compress it as `.json.gz` files.

```
dotnet run gen-pokeapi
```

## Dev

Basic dev process.

```
dotnet run
```

Then you can use swagger: `http://localhost:5000/swagger`

## Build

Basic build process.

```
dotnet publish
```
