## Saves

- .adapt sprite depending game & gender
- .group by generation

## Storage

Pkm:

- .highlight pkm with link main<->save
- .display shiny, shadow, eggs
- permissions:
  - can move (current storage)
  - can move from/to storage
  - can create attached copy
  - can create version (main)
  - can edit
  - can evolve
  - can release

Box main:

- create
- delete (only if box is empty)
- edit name

## Pokedex

Pkm:

- moves
- related with stockage & saves:
  - is-owned
  - list owned pkms

---

Next steps:

.- save files auto-sync (local saves) & backup system & checks

- local saves
  - give path list to check
    .- manual sync trigger

refresh-step:

- backend

  - do not put all data in base-pkm-dto for performance
  - base-pkm-version
    - consider merging pkm-save & pkm-version
      .- create dedicated routes for constants etc
  - improve performance, avoid List.Find etc
  - remove code duplicates
  - add links between pokedex<->storage
  - use correct http code for errors
  - fix all TODOs
  - fix startup warnings

- frontend
  - redesign
    - new features: settings, dex sync, living-dex, shiny-dex, dex sort, regional-dex, storage search & filters & sort, action on multiple pkm (move, etc)
    - rework all: saves, backups, storage, details, dex
      .- add icons (generic, games, gen, ...)
    - add notifications
    - preload images
    - change spacing & size ? more compact ?
  - code clean up

features:

sfs = search + filters + sort

- saves

- backups

- storage

  - main storage sfs
  - save storage sfs
    .- save choice
    - storage
  - multiple save storages sfs => v2
  - action multiple pkm => v2
    .- pkm details panel
    .- actions & save

- pokedex sfs

  - add region to generation filter naming
  - pre-filters
    - living-dex
    - shiny-dex
    - only-missing

- settings

  .- paths

  - sound volume

- notifications (error, warning, info, success)

- splash screen

  .- first data load

  - all image preload

- compact styling option ? item size 1/2

- fix some legality issues

storage pkm actions:

- move
- move attached copy
  .- create version (primary)
  .- edit
  .- evolve (primary)
  .- detach
  .- release (red)

on pkm select

- show pkm actions menu
- show details

keep attach feature ? yes but simplify:

- by default just move, without attach
- use action "move attached copy"
- from storage or save, same use
- synchronize is done auto during save loading

storage pkm status:

- legality

.details fully open by default
.reduced+low opacity during move, and similar action

icons:

.- games
/- generation
.- types
.- physic/spec
.- generic: arrows, close, error, warning, info, success, linked, download, eye (check), bell/messages (notif), filter, sort, edit
pixel-icon-library
.- pkvault (header)
.- dex: seen, caught, living ?
.- storage (dex, storage, save)
