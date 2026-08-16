<p align="center">
    <img height="200" src="frontend\public\logo.svg" alt="PKVault logo" />
</p>

<h1 align="center">PKVault</h1>

<h4 align="center">
    <a href="https://pkvault-demo.chnapy.dev"><b>DEMO</b></a>
</h4>

<h6 align="center">
    <a href="https://github.com/Chnapy/PKVault/releases"><b>RELEASES</b></a>
    &nbsp;|&nbsp;
    <a href="https://projectpokemon.org/home/files/file/5766-pkvault/"><b>PROJECT POKEMON TOOL PAGE</b></a>
    &nbsp;|&nbsp;
    <a href="https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app"><b>PROJECT POKEMON DISCUSSION PAGE</b></a>
</h6>

PKVault is a Pokémon storage & save manipulation tool based on [PKHeX](https://github.com/kwsch/PKHeX).
Similar to Pokémon Home, offline as online.

<img src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/microsoft-windows.svg" width="100" /> | <img src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/linux.svg" width="100" /> | <img src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/png/steam-deck-light.png" width="100" /> | <img src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/png/docker.png" width="100" /> |
|:---:|:---:|:---:|:---:|
| [![Download for Windows](https://img.shields.io/badge/Windows-Release-blue)](https://github.com/Chnapy/PKVault/releases/latest) | <a href='https://flathub.org/apps/details/io.github.chnapy.pkvault'><img width='110' alt='Download on Flathub' src='https://flathub.org/api/badge?locale=en' /></a><br/>[![Download for Linux](https://img.shields.io/badge/Linux-Release-blue)](https://github.com/Chnapy/PKVault/releases/latest) | <a href='https://flathub.org/apps/details/io.github.chnapy.pkvault'><img width='110' alt='Download on Flathub' src='https://flathub.org/api/badge?locale=en' /></a><br/>[![Download for SteamDeck](https://img.shields.io/badge/SteamDeck-Release-blue)](https://github.com/Chnapy/PKVault/releases/latest) | [![Docker usage](https://img.shields.io/badge/Docker-Setup-purple)](#docker-usage) |
| PKVault.exe | pkvault.flatpak<br/>pkvault.AppImage<br/>pkvault.deb<br/>pkvault.linux | pkvault.flatpak | `ghcr.io/chnapy/pkvault` |

![License](https://img.shields.io/badge/License-GPLv3-green.svg)

<p align="center">
    <img src="img/snap_storage.png" alt="PKVault snapshot 1" />
    <img src="img/snap_storage_dark.png" alt="PKVault snapshot 2" style="display: inline-block; width: 24%" />
    <img src="img/snap_storage_details.png" alt="PKVault snapshot 3" style="display: inline-block; width: 24%" />
    <img src="img/snap_dex.png" alt="PKVault snapshot 4" style="display: inline-block; width: 24%" />
    <img src="img/snap_saves.png" alt="PKVault snapshot 5" style="display: inline-block; width: 24%" />
</p>

## Bulk features

- Storage & save manipulation
  - compatible with all pokémon games, from first generation to **Pokémon Legends: Z-A**
  - **move** pokémons between saves
  - **convert** pokémon to any generation (ex. G7 to G2)
  - **store** pokémons outside saves using banks & boxes
  - allow use of multiple **"variants"** for stored pokémons
  - move/delete actions
  - **edit** pokémon moves, EVs & nickname
  - **evolve** pokémons requiring trade or trade + held-item (ex. Kadabra -> Alakazam)
  - **link** a save pokémon with all his variants, sharing data like exp & EVs
  - use of **external PKM files**, outside PKVault environment
  - **backup** all saves & storage before any save action
    - backups listing
    - backups restore always possible
- Centralized **Pokédex** based on all listed saves
  - views with forms & genders
  - multiple filters: species name, seen/caught/owned/shiny/alpha, types, ...
    - possible living dex
    - possible shiny dex
- Dynamic saves listing based on paths & globs
- Dark mode & sprite sizing

## Desktop/SteamDeck usage

You can find all executables in [releases](https://github.com/Chnapy/PKVault/releases/latest) page.

On Windows, just use `PKVault.exe`.

On Linux & SteamDeck, it's recommanded to get PKVault from Flathub: <a href='https://flathub.org/apps/details/io.github.chnapy.pkvault'><img width='110' alt='Download on Flathub' src='https://flathub.org/api/badge?locale=en' /></a><br/>
Otherwise there is plenty of Linux executables in [releases](https://github.com/Chnapy/PKVault/releases/latest) page.

### Steam-based usage

PKVault can be added to Steam as a non-steam game.
This is especially useful for SteamDeck, allowing to run the app in gaming mode.

Here are the steps to add the app in Steam, and customize with icons, covers etc:

- SteamDeck only: first ensure to be in desktop mode
- [Add PKVault as non-Steam game](https://help.steampowered.com/en/faqs/view/4B8B-9697-2338-40EC)
- Add icon, logo, covers, background:
  - Download & extract [steam-customize.zip](./steam-customize.zip)
  - Find PKVault in your library, right-click -> "Properties"
  - In "Shortcut" tab:
    - Click on empty icon at the very start, then select `steam-customize/icon.png`
  - In "Customization" tab, select for each form step:
    - Cover -> `steam-customize/cover.png`
    - Background -> `steam-customize/background.png`
    - Logo -> `steam-customize/logo.png`
    - Wide cover -> `steam-customize/cover-big.png`

### Data synchronization

Check [below](#online-data-synchronization).

## Docker usage

You can use a plug'n'play docker image, compatible `Linux x86_64` and `Linux ARM` (like Raspberry Pis).

`docker-compose.yml` example:

```yml
services:
  pkvault:
    image: ghcr.io/chnapy/pkvault:latest # or specific version, like 1.5.1
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - LOG_FILE_COUNT_LIMIT=10     # removes extra log files, default: 10
      - BACKUP_FILE_COUNT_LIMIT=30  # removes extra backup files, default: no limit
    volumes:
      - ./path/to/pkvault/data:/pkvault

      # save paths sample
      - ./path/to/saves:/data/saves
      - ./path/to/other/saves:/data/other-saves
      
      # external-pkms path sample (optional)
      - ./path/to/external-pkms:/data/external-pkms
```

> Note: with this config sample, you can use in PKVault settings:
> - Saves files locations:
>   - /data/saves/ (or any subpath)
>   - /data/other-saves/ (or any subpath)
> - External PKM files locations:
>   - /data/external-pkms/ (or any subpath)

Perfect for homelab context.

Or using basic docker run:

```
docker run \
  -p 3000:3000 \
  -v ./path/to/pkvault/data:/pkvault \
  -v ./path/to/saves:/data/saves \
  ghcr.io/chnapy/pkvault:latest
```

## Online data synchronization

You may want to synchronize PKVault data between your devices, keeping your saves up-to-date everywhere, avoiding need of copy/paste and others manual actions.

PKVault is made to work 100% offline, and online features are considered out of project scope.
It is recommanded to use instead third-party solutions.

[syncthing](https://syncthing.net) works really well, whether for desktop or Docker.
Other known solutions may be adapted too, like Dropbox, Onedrive, etc. Choose following your needs.

## [Functional documentation](./docs/functional/en/README.md)

## [Technical documentation](./docs/technical/README.md)

Includes quick start.

## [Contribute](./.github/CONTRIBUTING.md)

## Licenses

This app (PKVault) is licensed under GPLv3 terms, as described in file [LICENSE](./LICENSE).
Your can use this app for your own projects following license restrictions.

- Backend / Desktop
  - [PKHeX (Core part)](https://github.com/kwsch/PKHeX/tree/master/PKHeX.Core) - License GPLv3
  - Versions & all others dependencies can be found into `*.csproj` files

- Frontend
  - Font "Pixel Operator" - from [onlinewebfonts](http://www.onlinewebfonts.com) - License CC BY 4.0
  - Icons "Input prompts" - from [Kenney](www.kenney.nl) - License CC0
  - Versions & all others dependencies can be found into [frontend/package.json](./frontend/package.json).

All image contents of game-icons, pokémons, types, items, move-categories are Copyright The Pokémon Company.
