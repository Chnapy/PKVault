# 0 - Considerações técnicas

O PKVault roda no Windows e no Linux em sua versão para desktop. Existe uma versão para SteamDeck (Flatpak).

Assim como o PKHeX, o PKVault depende do .NET 10 para funcionar. Como o aplicativo é multiplataforma e baseado em tecnologias web, o PKVault também depende de controles web de acordo com o sistema operacional atual:

* WebView2 para Windows;
* WebKitGTK+2 para Linux;
* WKWebView para Mac.

O aplicativo foi projetado para ser utilizado em telas com resolução mínima de 1280x800 (a resolução do SteamDeck), com suporte para o uso de mouse/teclado ou controle.

## Arquivos manipulados

No Windows, por padrão, o PKVault manipula seus próprios arquivos e pastas dentro de seu diretório.

É recomendado colocar o executável `PKVault.exe` em uma pasta dedicada.

No Linux, uma das seguintes pastas é utilizada:

* `/home/$USER/Documents/pkvault`
* `/home/$USER/.var/app/org.chnapy.pkvault/data` - esperado quando instalado via Flatpak.

Você encontrará os seguintes arquivos:

* `config/pkvault.json` - arquivo de configuração do PKVault;
* `storage/` - pasta para os arquivos PK dos Pokémon armazenados (ex.: `storage/3/0132 - DITTO - xxxxx.pk3`);
* `db/` - pasta para os dados do PKVault;
* `backup/` - pasta para os backups (formato `.zip` padrão);
* `logs/` - pasta para os logs, úteis para depuração.

Além desses arquivos, os arquivos de save que você especificar também serão manipulados.
