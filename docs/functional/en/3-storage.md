# 3 - Storage

The main PKVault page manages storage at the PKVault level and/or backups.

Pokémons can be viewed in detail, moved or modified.
Banks and boxes can also be created, modified or deleted.

## Banks and boxes

Banks are displayed at the top of the page.

They represent a container for boxes, for organizational purposes.
They also allow you to define "views", so that selecting the bank directly displays a set of boxes and saves on the screen.

The default bank is selected when the app is launched.

Banks can be dedicated to external pokémons. These specific banks cannot be manually edited.
They are handled by external pokémons files and folders structure.

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

Deletes a bank and all its boxes (and their pokémons).

</details>

Boxes are displayed at the level of each storage (PKVault and saves).

They represent a container for pokémon, like in Pokémon games.

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

Deletes the box and all its pokémons.

</details>

## PKVault storage and pokémons variants

PKVault storage (also called main storage) stores a set of pokémons.

To be able to use a pokémon in a different generation than the one it came from, a variant-per-generation system is used.

Thus each pokémon in storage can have multiple variants.
For example, a Generation 3 Pikachu can have a Generation 1 variant to be used in a Pokémon Blue save.

Each variant can be modified or deleted.

Each pokémon can have between 1 and 9 variants (one for each generation).
Variants share most of their characteristics with each other, as do the modifications applied.

## Saves storage

Each save can be selected and display its storage including: team, boxes, daycare, etc.

Pokémons displayed can be moved, modified or deleted.

## Attached pokémons

It is possible to move a pokémon in an attached manner (PKVault -> save, or vice versa).
Thus a clone attached to the pokémon is made on the target storage.

The purpose behind this is to synchronize the pokémon with its attached clone, a few examples:

- save->PKVault: the pokémon in the save gained a level => synchronizes with the attached variant
- PKVault->save: the variant evolves => synchronizes the pokémon in the save

This system is useful with the use of variants: when synchronization occurs, all variants receive the changes.

It is then possible to use the same pokémon in multiple games, and watch it progress across generations.

A pokémon can be attached to a single save at once.

## External pokémons

External pokémon files (`.pk3`, `.pa9`, etc) can be used from outside PKVault environment.

These specific variants cannot be edited or deleted from PKVault, and available actions are quite limited.

## Actions on pokémons

<details> 
<summary>Create a pokémon variant</summary>

In PKVault storage, creates a variant for a given pokémon and generation.
The characteristics of the base pokémon are taken and converted for the target generation.

The conversion of the created pokémon may be imperfect, and involuntarily create an illegal pokémon.
If needed, you can open the pokémon (its PK file) via PKHeX, and correct legality issues directly.

</details>

<details> 
<summary>Modify a pokémon</summary>

Modifies a pokémon on one or more aspects: nickname, moves, EVs.
If it is a variant, the modifications are propagated to other variants.

</details>

<details> 
<summary>Delete a pokémon</summary>

Deletes a pokémon.
If it is a variant, only deletes the target variant.

</details>

<details> 
<summary>Detach a pokémon</summary>

Detaches an attached pokémon.
Whether it is a variant compared to the pokémon in its save, or vice versa.

</details>

<details> 
<summary>Evolve a pokémon</summary>

Evolves a pokémon.
Only possible with pokémon that evolve through trade.
If a held item is required, it must be present.

</details>

<details> 
<summary>Move a pokémon</summary>

Moves a pokémon, with several possible cases:

- within the current box
- from one box to another
- from PKVault storage to a save
- from a save to PKVault storage
- from one save to another save

Moving a variant to a save may create a variant of the correct generation if required. In this case the move will be done as attached.

The move can be done in an attached manner, in which case the pokémon is actually cloned (see [Attached pokémons](#attached-pokémons)).

If the pokémon is not attached, the move can target an already occupied slot, the pokémons will swap places.

</details>

Advanced actions:

<details> 
<summary>Sort pokémons</summary>

Sorts pokémons on one or more boxes, using the national Pokédex as reference.

Possibility to leave empty slots for missing species.
If there is not enough space, the action can create new boxes.

</details>

<details> 
<summary>Synchronize Pokédex</summary>

Synchronizes the Pokédex of all selected storages.
Pokémons seen or caught are propagated across all Pokédex, taking into account forms, genders and shiny.

</details>

## Multi-selection

Multiple pokémons can be selected to perform a grouped action, for example moving all or part of a box to another box.
