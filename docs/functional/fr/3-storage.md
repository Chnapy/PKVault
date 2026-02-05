# 3 - Stockage

La page principale de PKVault gère le stockage, au niveau PKVault et/ou des sauvegardes.

Les pokémons peuvent y être vu en détail, déplacés ou modifiés.
Les banques et boites peuvent également être créées, modifiées ou supprimées.

## Banques et boîtes

Les banques sont affichées en haut de la page.

Elles représentent un conteneur pour des boîtes, à des fins d'organisation.
Elles permettent également de définir des "vues", de sorte à ce que la sélection de la banque affiche directement un ensemble de boîtes et sauvegardes à l'écran.

La banque par défaut est sélectionnée lors du lancement de l'app.

Actions possibles liées aux banques:

<details>
<summary>Créer une banque</summary>

Créé une nouvelle banque vide.

</details>

<details>
<summary>Modifier une banque</summary>

Modifie les propriétés d'une banque: nom, par défaut, ordre, vue enregistrée.

</details>

<details>
<summary>Supprimer une banque</summary>

Supprime une banque ainsi que toutes ses boîtes (et leurs pokémons).

</details>

---

Les boîtes sont affichées au niveau de chaque stockage (PKVault et sauvegardes).

Elles représentent un conteneur pour des pokémons, comme dans les jeux Pokemon.

Actions possibles liées aux boites:

<details>
<summary>Créer une boîte</summary>

Créé une nouvelle boîte vide liée à la banque sélectionnée.

</details>

<details>
<summary>Modifier une boîte</summary>

Modifie les propriétés d'une boîte: nom, type, nombre de slot, ordre, banque liée.

Le type de box n'est qu'indicatif.

</details>

<details>
<summary>Supprimer une boîte</summary>

Supprime la boîte et tous ses pokémons.

</details>

## Stockage PKVault et variantes de pokémons

Le stockage PKVault (aussi dit stockage principal) stocke un ensemble de pokemons.

Afin de pouvoir utiliser un pokemon dans une autre génération que celle d'où il provient, un système de variant par génération est utilisé.

Ainsi chaque pokemon dans le stockage peut posséder plusieurs variantes.
Par exemple un Pikachu de génération 3 peut avoir une variante de génération 1 afin de pouvoir être utilisé dans une sauvegarde Pokemon Bleu.

Chaque variante peut être modifiée ou supprimée.

Chaque pokémon peut avoir entre 1 et 9 variantes (une pour chaque génération).
Les variantes partagent entre elles la plupart de leur caractéristiques, idem pour les modifications appliquées.

## Stockage des sauvegardes

Chaque sauvegarde peut être sélectionnée et afficher son stockage comprenant: équipe, boîtes, pension, etc.

Les pokémons affichés peuvent être déplacés, modifiés ou supprimés.

## Pokémons attachés

Il est possible de déplacer un pokémon de manière attaché (PKVault -> sauvegarde, ou inverse).
Ainsi un clone attaché au pokémon est faite sur le stockage ciblé.

Le but derrière est de synchroniser le pokémon avec son clone attaché, quelques exemples:

- sauvegarde->PKVault: le pokémon dans la sauvegarde a gagné en niveau => synchronise avec la variante attachée
- PKVault->sauvegarde: la variante évolue => synchronise le pokémon dans la sauvegarde

Ce système trouve son intérêt avec l'utilisation de variantes: lorsqu'une synchronisation se produit, toutes les variantes recoivent les changements.

Il est alors possible d'utiliser un même pokémon dans plusieurs jeux, et le voir progresser au fil des générations.

Un pokemon ne peut être attaché qu'à une sauvegarde à la fois.

## Actions sur les pokémons

<details>
<summary>Créer une variante de pokémon</summary>

Dans le stockage PKVault, créé une variante pour un pokémon et une génération donnés.
Les caractéristiques du pokémon de base sont reprises et converties pour la génération ciblée.

La convertion du pokémon créé peut être imparfaite, et créer involontairement un pokémon illégal.
Si besoin, vous pouvez ouvrir le pokémon (son fichier PK) via PKHeX, et corriger les problème de légalité directement.

</details>

<details>
<summary>Modifier un pokémon</summary>

Modifie un pokémon sur un ou plusieurs aspects: surnom, capacités, EVs.
S'il s'agit d'une variante, les modifications sont propagées aux autres variantes.

</details>

<details>
<summary>Supprimer un pokémon</summary>

Supprime un pokémon.
S'il s'agit d'une variante, ne supprime que la variante ciblée.

</details>

<details>
<summary>Détacher un pokémon</summary>

Détache un pokémon attaché.
Qu'il s'agisse d'une variante par rapport au pokemon dans sa sauvegarde, ou l'inverse.

</details>

<details>
<summary>Evoluer un pokémon</summary>

Fait évoluer un pokémon.
N'est possible qu'avec les pokémons évoluant par échange.
Si un objet tenu est requis, il doit être présent.

</details>

<details>
<summary>Déplacer un pokémon</summary>

Déplace un pokémon, avec plusieurs cas possibles:

- dans la boîte actuelle
- d'une boîte à l'autre
- du stockage PKVault à une sauvegarde
- d'une sauvegarde au stockage PKVault
- d'une sauvegarde à une autre sauvegarde

Le déplacement d'une variante vers une sauvegarde peut créer dans le même temps une variante compatible avec la sauvegarde, si besoin.

Le déplacement peut se faire de manière attaché, auquel cas le pokémon est en réalité cloné (voir [Pokémons attachés](#pokémons-attachés)).

Si le pokémon n'est pas attaché, le déplacement peut cibler un slot déjà occupé, les pokémons échangeront leur place.

</details>

Actions avancées:

<details>
<summary>Trier les pokémons</summary>

Trie les pokémons sur une ou plusieurs boîtes, avec pour référence le pokédex national.

Possibilité de laisser des slots vides pour les espèces manquantes.
Si manque de place, l'action peut créer de nouvelles boîtes.

</details>

<details>
<summary>Synchroniser les pokédex</summary>

Synchronise les pokédex de l'ensemble des stockages sélectionnés.
Les pokémons vus ou attrapés sont propagés sur l'ensemble des pokédex, prenant en compte les formes, genres et shiny.

</details>

## Multi-sélection

Plusieurs pokémons peuvent être sélectionnés afin d'effectuer une action groupée, par exemple déplacer tout ou partie d'une boîte vers une autre boîte.

La sélection peut être facilitée en gardant la touche Maj. enfoncée.
