# 0 - Technical considerations

PKVault runs on Windows & Linux for its desktop version. A Steamdeck version exists (flatpak).

Like PKHeX, PKVault depends on .NET 10 to run. Since the application is multi-platform and based on web technologies, PKVault also depends on web controls depending on current OS:

- WebView2 for Windows,
- WebKitGTK+2 for Linux,
- WKWebView for Mac

The app is designed to be used on screen with minimal size of 1280x800 (resolution of SteamDeck), with usage of mouse/keyboard or gamepad supported.

## Files Manipulated

On Windows, PKVault manipulates its own files and folders at its level by default.
It is recommended to place the PKVault.exe executable in a dedicated folder.

On Linux, folder used is one of:

- `/home/$USER/Documents/pkvault`
- `/home/$USER/.var/app/io.github.chnapy.pkvault/data` - expected with flatpak file

You will find the following files:

- `config/pkvault.json` - The PKVault configuration file
- `storage/` - Folder for PK files of stored pokémon (ex: `storage/3/0132 - DITTO - xxxxx.pk3`)
- `db/` - Folder for PKVault data
- `backup/` - Folder for backups (standard `.zip` format)
- `logs/` - Folder for logs, useful for debugging

Beyond these files, the saves you specify will also be manipulated.
