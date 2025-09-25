## Pokedex

Pkm:

- moves

---

refresh-step:

- backend

  - improve performance, avoid List.Find etc
  - remove code duplicates
  - fix all TODOs
  - fix startup warnings

- frontend
  - redesign
    - new features: dex sync, living-dex, shiny-dex, dex sort, regional-dex, storage search & filters & sort, action on multiple pkm (move, etc)
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

keep attach feature ? yes but simplify:

- synchronize is done auto during save loading
