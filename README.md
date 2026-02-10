<p align="center">
    <img height="200" src="frontend\public\logo.svg" alt="PKVault logo" />
</p>

<h1 align="center">PKVault</h1>

<h6 align="center">
    <a href="https://github.com/Chnapy/PKVault/releases"><b>RELEASES</b></a>
    &nbsp;|&nbsp;
    <a href="https://projectpokemon.org/home/files/file/5766-pkvault/"><b>PROJECT POKEMON TOOL PAGE</b></a>
    &nbsp;|&nbsp;
    <a href="https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app"><b>PROJECT POKEMON DISCUSSION PAGE</b></a>
</h6>

PKVault is a Pokemon storage & save manipulation tool based on [PKHeX](https://github.com/kwsch/PKHeX).
Similar to Pokemon Home, offline as online.

This tool can be used as:

- 📥 Desktop app
  - Windows -> [PKVault.exe](https://github.com/Chnapy/PKVault/releases/latest)
  - Linux & SteamDeck -> [PKVault.AppImage](https://github.com/Chnapy/PKVault/releases/latest)

- 🐳 Docker web-app
  - `image: ghcr.io/chnapy/pkvault` -> check [below for usage](#docker-usage)

![Platforms](https://img.shields.io/badge/Platform-Windows%20|%20Linux%20|%20SteamDeck%20|%20Docker-informational)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)

<p align="center">
    <img src="img/snap_1.png" alt="PKVault snapshot 1" />
    <img src="img/snap_2.png" alt="PKVault snapshot 2" style="display: inline-block; width: 24%" />
    <img src="img/snap_3.png" alt="PKVault snapshot 3" style="display: inline-block; width: 24%" />
    <img src="img/snap_4.png" alt="PKVault snapshot 4" style="display: inline-block; width: 24%" />
    <img src="img/snap_5.png" alt="PKVault snapshot 5" style="display: inline-block; width: 24%" />
</p>

## Bulk features

- Storage & save manipulation
  - compatible with all pokemon games, from first generation to **Pokemon Legends: Z-A**
  - move pokemons between saves
  - convert pokemon to any generation (ex. G7 to G2)
  - store pokemons outside saves using banks & boxes
  - allow use of multiple "variants" for stored pokemons
  - move/delete actions
  - edit pokemon moves, EVs & nickname
  - evolve pokemons requiring trade or trade + held-item (ex. Kadabra -> Alakazam)
  - link a save pokemon with all his variants, sharing data like exp & EVs
  - backup all saves & storage before any save action
    - backups listing
    - backups restore always possible
- Centralized Pokedex based on all listed saves
  - views with forms & genders
  - multiple filters: species name, seen/caught/owned, types, ...
    - possible living dex
    - possible shiny dex
- Dynamic saves listing based on paths & globs

## Docker usage

You can use a plug'n'play docker image, compatible `Linux x86_64` and `Linux ARM` (like Raspberry Pis).

`docker-compose.yml` example:

```yml
services:
  pkvault:
    image: ghcr.io/chnapy/pkvault:latest # or specific version, like 1.2.0
    ports:
      - "3000:3000"
    volumes:
      # Note: if you update settings paths, you should update them here too
      - ./your-data/config:/app/backend/config
      - ./your-data/db:/app/backend/db
      - ./your-data/storage:/app/backend/storage
      - ./your-data/backup:/app/backend/backup
      - ./your-data/logs:/app/backend/logs
      - ./your-data/saves:/app/backend/saves # saves can be somewhere else, no constraints
```

Perfect for homelab context.

## [Functional documentation](./docs/functional/en/README.md)

## [Technical documentation](./docs/technical/README.md)

Includes quick start.

## [Contribute](./.github/CONTRIBUTING.md)

## Licenses

This app (PKVault) is licensed under GPLv3 terms, as described in file [LICENSE](./LICENSE).
Your can use this app for your own projects following license restrictions.

- Backend / Desktop
  - [PKHeX (Core part)](https://github.com/kwsch/PKHeX/tree/master/PKHeX.Core) - License GPLv3
  - PokeApiNet - License MIT
  - Versions & all others dependencies can be found into `*.csproj` files

- Frontend
  - Font "Pixel Operator" - from [onlinewebfonts](http://www.onlinewebfonts.com) - License CC BY 4.0
  - Font "Pokemon Emerald" - from [fontstruct](https://fontstruct.com/fontstructions/show/1975556) by "aztecwarrior28" - License CC BY-SA 3.0
  - [HackerNoon's Pixel Icon Library](https://github.com/hackernoon/pixel-icon-library) - License MIT
  - Versions & all others dependencies can be found into [frontend/package.json](./frontend/package.json).

All image contents of game-icons, pokemons, types, items, move-categories are Copyright The Pokémon Company.
