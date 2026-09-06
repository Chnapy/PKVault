# 0 - Considerações técnicas

O PKVault roda no Windows, Linux e macOS em sua versão para desktop. Existe também uma versão para Steam Deck (flatpak).

Assim como o PKHeX, o PKVault depende do .NET 10 para funcionar. Como o aplicativo é multiplataforma e baseado em tecnologias web, o PKVault também depende de componentes de visualização web específicos para o sistema operacional em uso:

- WebView2 para Windows,
- WebKitGTK+2 para Linux,
- WKWebView para Mac

O aplicativo foi projetado para ser utilizado em telas com resolução mínima de 1280x800 (a resolução do Steam Deck), com suporte para uso de mouse/teclado ou controle (gamepad).

## Arquivos manipulados

No Windows, o PKVault manipula seus próprios arquivos e pastas no diretório onde está localizado, por padrão.
Recomenda-se colocar o executável `PKVault.exe` em uma pasta dedicada.

No Linux, a pasta utilizada é uma das seguintes:

- `/home/$USER/Documents/pkvault`
- `/home/$USER/.var/app/io.github.chnapy.pkvault/data` - esperado ao usar a versão Flatpak

No macOS, a pasta utilizada é `/Users/$USER/Documents/pkvault`.

Você encontrará os seguintes arquivos:

- `config/pkvault.json` - O arquivo de configuração do PKVault
- `storage/` - Pasta para arquivos PK de Pokémon armazenados (ex: `storage/3/0132 - DITTO - xxxxx.pk3`)
- `db/` - Pasta para dados do PKVault
- `backup/` - Pasta para backups (formato padrão `.zip`)
- `logs/` - Pasta para registros (logs), útil para depuração

Além desses arquivos, os arquivos de save que você especificar também serão manipulados.