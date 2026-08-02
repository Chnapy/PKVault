# 5 - Configurações e Backups

A página de configurações e backups permite definir certos parâmetros globais para toda a aplicação.

Você pode indicar a localização dos seus arquivos de save, seja especificando diretamente os caminhos dos arquivos ou fornecendo os caminhos das pastas.
Os arquivos de save serão lidos diretamente pelo PKVault, sem necessidade de copiá-los ou movê-los.

Uma vez validada a sessão, as ações que afetam os saves modificam diretamente os arquivos correspondentes. Assim, a manipulação dos saves pode ser realizada sem a necessidade de mover seus arquivos.

A alteração do idioma afeta tanto a interface quanto o idioma utilizado para exibir dados estáticos dos Pokémon (nome da espécie, tipos, golpes, etc.).
A alteração do idioma não afeta o idioma dos seus arquivos de save.

Arquivos externos de Pokémon (`.pk3`, `.pa9`, etc.) podem ser utilizados a partir de fora do ambiente do PKVault.
Você pode fornecer múltiplos caminhos de arquivos e pastas que os contenham.
O PKVault fará a leitura desses arquivos a cada inicialização e criará variantes de Pokémon, bancos e caixas que reflitam a estrutura desses arquivos externos.

Parâmetros avançados: você pode alterar diversos caminhos utilizados por padrão, definidos em [Considerações Técnicas](./0-technical.md#files-manipulated).

## Backups

O PKVault previne a perda de dados por meio de um sistema de backup: antes de qualquer manipulação de arquivos, um backup completo é criado. Dessa forma, todos os dados gerenciados pelo PKVault podem ser restaurados a qualquer momento.

Cada backup contém os seguintes dados:

- Armazenamento do PKVault, incluindo todos os arquivos PK, bem como bancos e caixas
- Todos os arquivos de save, conforme as localizações definidas nas configurações

Os backups seguem o formato `.zip` e, portanto, podem ser abertos mesmo fora do PKVault.

A partir do PKVault, cada backup pode ser restaurado, substituindo os arquivos atuais pelo conteúdo do backup. Um backup é criado antes da restauração.