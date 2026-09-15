# PKVault.Mobile

Mobile package for Android app (x64/arm64).

All PKVault logic is in [PKVault.Core](../PKVault.Core/README.md), which is used by this package.
Checkout Core documentation before working here.

Dependencies & versions can be found in [PKVault.Mobile.csproj](./PKVault.Mobile.csproj).
PKVault.Mobile is based on MAUI.

## Dev

Testing the app on Android implies to have setup Android SDK & emulator (not described here).

```sh
android emulator create medium_phone
android emulator start medium_phone

dotnet build -t:InstallAndroidDependencies
```

Once the emulator is started:

```sh
dotnet run --project PKVault.Mobile
# or
make mobile-run
```
