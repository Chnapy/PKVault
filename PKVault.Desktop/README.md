# PKVault.Desktop

Desktop package for Windows/Linux/macOS app, including all variants (x64/arm64, flatpak, appimage, etc).

All PKVault logic is in [PKVault.Core](../PKVault.Core/README.md), which is used by desktop.
Checkout Core documentation before working on desktop.

Dependencies & versions can be found in [PKVault.Desktop.csproj](./PKVault.Desktop.csproj).

## Dev

```sh
dotnet run --project PKVault.Desktop
# or
make desktop-run
```
