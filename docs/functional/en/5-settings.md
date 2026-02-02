# 5 - Settings & Backups

The settings and backups page allows you to determine certain global parameters for the entire application.

You can provide the location of your saves, either by specifying the file paths directly, or by providing folder paths.
The saves will then be read directly by PKVault, without copying or moving them.

Once the session is validated, actions affecting saves modify the save files directly. Thus save manipulation can be done without having to move your files.

Language change impacts the display as well as the language used to display static pokemon data (species name, types, moves, etc).
Language change does not impact the language of your saves.

Advanced parameters: you can change several paths used by default, defined in [Technical Considerations](./0-technical.md#files-manipulated).

## Backups

PKVault prevents any data loss through a backup system: before any file manipulation a full backup is created. Thus all data managed by PKVault can be restored at any time.

Each backup contains the following data:

- PKVault storage, including all PK files, as well as banks and boxes
- all saves according to the locations defined in the settings

Backups follow the `.zip` format, and can therefore be opened even outside of PKVault.

From PKVault, each backup can be restored, replacing the current files with the backup content. Before restoration a backup is created.
