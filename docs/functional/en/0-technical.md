# 0 - Technical considerations

PKVault runs on Windows for its desktop version. A dedicated Linux/Steamdeck version is planned.

Like PKHeX, PKVault depends on .NET 10 to run. Since the application is based on web technologies, PKVault also depends on WebView.

Currently, the interface is designed for use on large screens with keyboard/mouse only.

## Files Manipulated

By default, PKVault manipulates its own files and folders at its level.
It is recommended to place the PKVault.exe executable in a dedicated folder.

You will find the following files:

- `config/pkvault.json` - The PKVault configuration file
- `storage/` - Folder for PK files of stored pokémon (ex: `storage/3/0132 - DITTO - xxxxx.pk3`)
- `db/` - Folder for PKVault data
- `backup/` - Folder for backups (standard `.zip` format)
- `logs/` - Folder for logs, useful for debugging
- `PKVault.exe.WebView2/` - Folder generated for WebView

Beyond these files, the saves you specify will also be manipulated.
