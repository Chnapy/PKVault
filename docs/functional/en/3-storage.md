# 3 - Storage

The main PKVault page manages storage at the PKVault level and/or backups.

Pokemons can be viewed in detail, moved or modified.
Banks and boxes can also be created, modified or deleted.

## Banks and boxes

Banks are displayed at the top of the page.

They represent a container for boxes, for organizational purposes.
They also allow you to define "views", so that selecting the bank directly displays a set of boxes and saves on the screen.

The default bank is selected when the app is launched.

Possible actions related to banks:

<details> 
<summary>Create a bank</summary>

Creates a new empty bank.

</details>

<details> 
<summary>Modify a bank</summary>

Modifies the properties of a bank: name, default, order, saved view.

</details>

<details> 
<summary>Delete a bank</summary>

Deletes a bank and all its boxes (and their pokemons).

</details>

Boxes are displayed at the level of each storage (PKVault and saves).

They represent a container for pokemon, like in Pokemon games.

Possible actions related to boxes:

<details> 
<summary>Create a box</summary>

Creates a new empty box linked to the selected bank.

</details>

<details> 
<summary>Modify a box</summary>

Modifies the properties of a box: name, type, number of slots, order, linked bank.

The box type is only indicative.

</details>

<details> 
<summary>Delete a box</summary>

Deletes the box and all its pokemons.

</details>

## PKVault storage and pokemons variants

PKVault storage (also called main storage) stores a set of pokemons.

To be able to use a pokemon in a different generation than the one it came from, a variant-per-generation system is used.

Thus each pokemon in storage can have multiple variants.
For example, a Generation 3 Pikachu can have a Generation 1 variant to be used in a Pokemon Blue save.

Each variant can be modified or deleted.

Each pokemon can have between 1 and 9 variants (one for each generation).
Variants share most of their characteristics with each other, as do the modifications applied.

## Saves storage

Each save can be selected and display its storage including: team, boxes, daycare, etc.

Pokemons displayed can be moved, modified or deleted.

## Attached pokemons

It is possible to move a pokemon in an attached manner (PKVault -> save, or vice versa).
Thus a clone attached to the pokemon is made on the target storage.

The purpose behind this is to synchronize the pokemon with its attached clone, a few examples:

- save->PKVault: the pokemon in the save gained a level => synchronizes with the attached variant
- PKVault->save: the variant evolves => synchronizes the pokemon in the save

This system is useful with the use of variants: when synchronization occurs, all variants receive the changes.

It is then possible to use the same pokemon in multiple games, and watch it progress across generations.

## Actions on pokemons

<details> 
<summary>Create a pokemon variant</summary>

In PKVault storage, creates a variant for a given pokemon and generation.
The characteristics of the base pokemon are taken and converted for the target generation.

The conversion of the created pokemon may be imperfect, and involuntarily create an illegal pokemon.
If needed, you can open the pokemon (its PK file) via PKHeX, and correct legality issues directly.

</details>

<details> 
<summary>Modify a pokemon</summary>

Modifies a pokemon on one or more aspects: nickname, moves, EVs.
If it is a variant, the modifications are propagated to other variants.

</details>

<details> 
<summary>Delete a pokemon</summary>

Deletes a pokemon.
If it is a variant, only deletes the target variant.

</details>

<details> 
<summary>Detach a pokemon</summary>

Detaches an attached pokemon.
Whether it is a variant compared to the pokemon in its save, or vice versa.

</details>

<details> 
<summary>Evolve a pokemon</summary>

Evolves a pokemon.
Only possible with pokemon that evolve through trade.
If a held item is required, it must be present.

</details>

<details> 
<summary>Move a pokemon</summary>

Moves a pokemon, with several possible cases:

- within the current box
- from one box to another
- from PKVault storage to a save
- from a save to PKVault storage
- from one save to another save

Moving a variant to a save can only be done if there is a variant of the correct generation. Otherwise create one first.

The move can be done in an attached manner, in which case the pokemon is actually cloned (see [Attached pokemons](#attached-pokemons)).

If the pokemon is not attached, the move can target an already occupied slot, the pokemons will swap places.

</details>

Advanced actions:

<details> 
<summary>Sort pokemons</summary>

Sorts pokemons on one or more boxes, using the national pokédex as reference.

Possibility to leave empty slots for missing species.
If there is not enough space, the action can create new boxes.

</details>

<details> 
<summary>Synchronize pokedex</summary>

Synchronizes the pokedex of all selected storages.
Pokemons seen or caught are propagated across all pokedex, taking into account forms, genders and shiny.

</details>

## Multi-selection

Multiple pokemons can be selected to perform a grouped action, for example moving all or part of a box to another box.

Selection can be facilitated by holding down the Shift key.
