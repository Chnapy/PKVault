# 0 - Considérations techniques

PKVault fonctionne sur Windows pour sa version desktop. Une version dédiée Linux/Steamdeck est prévue.

A l'instar de PKHeX, PKVault dépend de .NET 10 pour fonctionner. L'application étant basée sur des technologies web, PKVault dépend également de WebView.

Pour le moment l'interface est conçue pour une utilisation sur grand écran et clavier/souris uniquement.

## Fichiers manipulés

De base PKVault manipule ses propres fichiers et dossiers, à son niveau.
Il est d'ailleurs recommandé de placer l'executable PKVault.exe dans un dossier dédié.

Vous trouverez les fichiers suivant:

- `config/pkvault.json` - Le fichier de configuration de PKVault
- `storage/` - Dossier pour les fichiers PK des pokémons stockés (exemple: `storage/3/0132 - DITTO - xxxxx.pk3`)
- `db/` - Dossier pour les données PKVault
- `backup/` - Dossier pour les backups (format `.zip` standard)
- `logs/` - Dossier pour les logs, utiles pour le débugguage
- `PKVault.exe.WebView2/` - Dossier généré pour WebView

Au delà de ces fichiers, les sauvegardes que vous renseignez seront également manipulées.
