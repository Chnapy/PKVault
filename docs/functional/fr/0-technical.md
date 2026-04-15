# 0 - Considérations techniques

PKVault fonctionne sur Windows pour sa version desktop. Une version dédiée Linux/Steamdeck est prévue.

A l'instar de PKHeX, PKVault dépend de .NET 10 pour fonctionner. L'application étant multi-plateforme et basée sur des technologies web, PKVault dépend également de controles web dépendant de l'OS utilisé:

- WebView2 pour Windows,
- WebKitGTK+2 pour Linux,
- WKWebView pour Mac

Pour le moment l'interface est conçue pour une utilisation sur grand écran et clavier/souris uniquement.

## Fichiers manipulés

Sur Windows, PKVault manipule ses propres fichiers et dossiers, à son niveau.
Il est d'ailleurs recommandé de placer l'executable PKVault.exe dans un dossier dédié.

Sur Linux, le dossier utilisé est l'un d'eux:

- `/home/$USER/Documents/pkvault`
- `/home/$USER/.var/app/org.chnapy.pkvault/data` - pour le fichier flatpak

Vous trouverez les fichiers suivant:

- `config/pkvault.json` - Le fichier de configuration de PKVault
- `storage/` - Dossier pour les fichiers PK des pokémons stockés (exemple: `storage/3/0132 - DITTO - xxxxx.pk3`)
- `db/` - Dossier pour les données PKVault
- `backup/` - Dossier pour les backups (format `.zip` standard)
- `logs/` - Dossier pour les logs, utiles pour le débugguage

Au delà de ces fichiers, les sauvegardes que vous renseignez seront également manipulées.
