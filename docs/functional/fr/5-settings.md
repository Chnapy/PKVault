# 5 - Paramètres & backups

La page des paramètres et backups permet de déterminer certains paramètres globaux à toute l'application.

Vous pouvez fournir l'emplacement de vos sauvegardes, soit en indiquant le chemin des fichiers directement, soit en fournissant des chemins de dossiers.
Les sauvegardes seront alors lues directement par PKVault, sans les copier ni déplacer.

Une fois la session validée, les actions affectant les sauvegardes modifient les fichiers de sauvegarde directement. Ainsi la manipulation de sauvegarde peut se faire sans avoir à déplacer vos fichiers.

Le changement de langue impacte l'affichage ainsi la langue utilisée pour afficher les données pokémon statiques (nom d'espèce, types, capacités etc).
Le changement de langue n'impacte pas la langue de vos sauvegardes.

Paramètres avançées: vous pouvez changer plusieurs chemins utilisés par défaut, définis dans les [Considérations techniques](./0-technical.md#fichiers-manipulés).

## Backups

PKVault évite toute perte de donnée via un système de backup: avant toute manipulation de fichier un backup complet est créé. Ainsi l'ensemble des données gérées par PKVault peuvent être restauré à tout moment.

Chaque backup contient les données suivantes:

- le stockage PKVault, incluant tous les fichiers PK, ainsi que les banques et boîtes
- toutes les sauvegardes selon les emplacements définis dans les paramètres

Les backups suivent le format `.zip`, et peuvent donc être ouvert même en dehors de PKVault.

Depuis PKVault chaque backup peut être restauré, remplaçant les fichiers actuels par le contenu du backup. Avant la restauration un backup est créé.
