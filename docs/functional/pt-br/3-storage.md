# 3 - Armazenamento

A página principal do PKVault gerencia o armazenamento no nível do PKVault e/ou backups.

Pokémons podem ser visualizados em detalhes, movidos ou modificados.
Bancos e boxes também podem ser criados, modificados ou excluídos.

## Bancos e boxes

Os bancos são exibidos no topo da página.

Eles representam um contêiner para as boxes, para fins de organização.
Eles também permitem definir "visualizações", de modo que selecionar o banco exibe diretamente um conjunto de boxes e saves na tela.

O banco padrão é selecionado quando o aplicativo é iniciado.

Bancos podem ser dedicados a pokémons externos. Esses bancos específicos não podem ser editados manualmente.
Eles são gerenciados pela estrutura de pastas e arquivos de pokémons externos.

Ações possíveis relacionadas aos bancos:

<details> 
<summary>Criar um banco</summary>

Cria um novo banco vazio.

</details>

<details> 
<summary>Modificar um banco</summary>

Modifica as propriedades de um banco: nome, padrão, ordem, visualização salva.

</details>

<details> 
<summary>Excluir um banco</summary>

Exclui um banco e todas as suas boxes (e seus pokémons).

</details>

As boxes são exibidas no nível de cada armazenamento (PKVault e saves).

Elas representam um contêiner para os pokémons, como nos jogos Pokémon.

Ações possíveis relacionadas às boxes:

<details> 
<summary>Criar uma box</summary>

Cria uma nova box vazia vinculada ao banco selecionado.

</details>

<details> 
<summary>Modificar uma box</summary>

Modifica as propriedades de uma box: nome, tipo, quantidade de slots, ordem, banco vinculado.

O tipo da box é apenas indicativo.

</details>

<details> 
<summary>Excluir uma box</summary>

Exclui a box e todos os seus pokémons.

</details>

## Armazenamento do PKVault e variantes de pokémons

O armazenamento do PKVault (também chamado de armazenamento principal) armazena um conjunto de pokémons.

Para poder usar um pokémon em uma geração diferente da qual ele veio, é utilizado um sistema de variantes por geração.

Assim, cada pokémon no armazenamento pode ter múltiplas variantes.
Por exemplo, um Pikachu da Geração 3 pode ter uma variante da Geração 1 para ser usada em um save de Pokémon Blue.

Cada variante pode ser modificada ou excluída.

Cada pokémon pode ter entre 1 e 9 variantes (uma para cada geração).
As variantes compartilham a maior parte de suas características entre si, assim como as modificações aplicadas.

## Armazenamento de saves

Cada save pode ser selecionado para exibir seu armazenamento, incluindo: equipe, boxes, daycare, etc.

Os pokémons exibidos podem ser movidos, modificados ou excluídos.

## Pokémons anexados

É possível mover um pokémon de forma anexada (PKVault -> save, ou vice-versa).
Assim, um clone anexado ao pokémon é criado no armazenamento de destino.

O objetivo por trás disso é sincronizar o pokémon com seu clone anexado. Alguns exemplos:

- save->PKVault: o pokémon no save ganhou um nível => sincroniza com a variante anexada
- PKVault->save: a variante evolui => sincroniza com o pokémon no save

Esse sistema é útil com o uso de variantes: quando a sincronização ocorre, todas as variantes recebem as alterações.

Portanto, é possível usar o mesmo pokémon em múltiplos jogos e observar seu progresso através das gerações.

Um pokémon pode estar anexado a apenas um único save por vez.

## Pokémons externos

Arquivos de pokémons externos (`.pk3`, `.pa9`, etc.) podem ser usados a partir de fora do ambiente do PKVault.

Essas variantes específicas não podem ser editadas ou excluídas pelo PKVault, e as ações disponíveis são bastante limitadas.

## Ações em pokémons

<details> 
<summary>Criar uma variante de pokémon</summary>

No armazenamento do PKVault, cria uma variante para um determinado pokémon e geração.
As características do pokémon base são copiadas e convertidas para a geração de destino.

A conversão do pokémon criado pode ser imperfeita e, involuntariamente, gerar um pokémon ilegal.
Se necessário, você pode abrir o pokémon (seu arquivo PK) via PKHeX e corrigir problemas de legalidade diretamente.

</details>

<details> 
<summary>Modificar um pokémon</summary>

Modifica um pokémon em um ou mais aspectos: apelido, movimentos, EVs.
Se for uma variante, as modificações são propagadas para as outras variantes.

</details>

<details> 
<summary>Excluir um pokémon</summary>

Exclui um pokémon.
Se for uma variante, exclui apenas a variante alvo.

</details>

<details> 
<summary>Desanexar um pokémon</summary>

Desanexa um pokémon que estava anexado.
Seja ele uma variante vinculada ao pokémon em seu save, ou vice-versa.

</details>

<details> 
<summary>Evoluir um pokémon</summary>

Evolui um pokémon.
Possível apenas com pokémons que evoluem por troca.
Se for necessário um item segurado, ele deve estar presente.

</details>

<details> 
<summary>Mover um pokémon</summary>

Mova um pokémon, com diversos casos possíveis:

- dentro da box atual
- de uma box para outra
- do armazenamento do PKVault para um save
- de um save para o armazenamento do PKVault
- de um save para outro save

Mover uma variante para um save pode criar uma variante da geração correspondente, se necessário. Nesse caso, o movimento será feito de forma anexada.

O movimento pode ser feito de forma anexada, caso em que o pokémon é efetivamente clonado (veja [Pokémons anexados](#pokémons-anexados)).

Se o pokémon não estiver anexado, o movimento pode ter como alvo um slot já ocupado, fazendo com que os pokémons troquem de lugar.

</details>

Ações avançadas:

<details> 
<summary>Ordenar pokémons</summary>

Ordena os pokémons em uma ou mais boxes, usando a Pokédex nacional como referência.

Há a possibilidade de deixar espaços vazios para as espécies ausentes.
Se não houver espaço suficiente, a ação pode criar novas boxes.

</details>

<details> 
<summary>Sincronizar Pokédex</summary>

Sincroniza a Pokédex de todos os armazenamentos selecionados.
Pokémons vistos ou capturados são propagados para todas as Pokédex, levando em consideração formas, gêneros e versões shiny.

</details>

## Seleção múltipla

Múltiplos pokémons podem ser selecionados para realizar uma ação em grupo, por exemplo, mover toda ou parte de uma box para outra box.