# PKVault.Backend

Backend used by Docker export (x64/arm64).

All PKVault logic is in [PKVault.Core](../PKVault.Core/README.md), which is used by backend.
Checkout Core documentation before working on backend.

Dependencies & versions can be found in [PKVault.Backend.csproj](./PKVault.Backend.csproj).

## Dev

```sh
dotnet run --project PKVault.Backend
# or
make backend-run
```
