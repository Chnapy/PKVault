# Scripts

### DB migration

Since PKVault.Desktop is using PublishTrimmed property, reflection is disabled all over the project.
Because of this constraint, EF Core generated migrations cannot work by themselves.

To avoid this issue migration should be generated using a script.

```sh
dotnet run --project Scripts gen-migration MigrationName
# or
NAME=MigrationName make migration-generate
```

### Generate static-data & spritesheets

Generate PokéApi data & spritesheets.
This process picks only the data used by the app & compress it as `.json.gz` files, and generates spritesheets.

Process may take some minutes.

```sh
dotnet run --project Scripts gen-static-data
# or
make static-data-generate
```

### Update PKHeX version

Update PKHeX to latest release using a script.

```sh
dotnet run --project Scripts update-pkhex
# or
make pkhex-update
```
