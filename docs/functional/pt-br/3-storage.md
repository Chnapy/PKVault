# 3 - Armazenamento

A página principal do PKVault gerencia o armazenamento no nível do PKVault e/ou os backups.

Os Pokémon podem ser visualizados em detalhes, movidos ou modificados.

Bancos e caixas também podem ser criados, modificados ou excluídos.

## Bancos e caixas

Os bancos são exibidos na parte superior da página.

Eles representam um contêiner para caixas, com finalidade de organização.

Eles também permitem definir "visualizações", de modo que, ao selecionar diretamente um banco, um conjunto de caixas e saves seja exibido na tela.

O banco padrão é selecionado quando o aplicativo é iniciado.

Os bancos podem ser dedicados a Pokémon externos. Esses bancos específicos não podem ser editados manualmente.

Eles são gerenciados pela estrutura de arquivos e pastas dos Pokémon externos.

Possíveis ações relacionadas aos bancos:

<details> 
<summary>Criar um banco</summary>

Cria um novo banco vazio.

</details>

<details> 
<summary>Modificar um banco</summary>

Modifica as propriedades de um banco: nome, padrão, ordem e visualização salva.

</details>

<details> 
<summary>Excluir um banco</summary>

Exclui um banco e todas as suas caixas (e os Pokémon contidos nelas).

</details>

As caixas são exibidas no nível de cada armazenamento (PKVault e saves).

Elas representam um contêiner para Pokémon, assim como nos jogos Pokémon.

Possíveis ações relacionadas às caixas:

<details> 
<summary>Criar uma caixa</summary>

Cria uma nova caixa vazia vinculada ao banco selecionado.

</details>

<details> 
<summary>Modificar uma caixa</summary>

Modifica as propriedades de uma caixa: nome, tipo, quantidade de espaços, ordem e banco vinculado.

O tipo da caixa é apenas informativo.

</details>

<details> 
<summary>Excluir uma caixa</summary>

Exclui a caixa e todos os Pokémon contidos nela.

</details>

## Armazenamento do PKVault e variantes dos Pokémon

O armazenamento do PKVault (também chamado de armazenamento principal) guarda um conjunto de Pokémon.

Para permitir o uso de um Pokémon em uma geração diferente daquela em que ele foi originalmente obtido, é utilizado um sistema de variantes por geração.

Assim, cada Pokémon armazenado pode possuir várias variantes.

Por exemplo, um Pikachu da Geração 3 pode possuir uma variante da Geração 1 para ser utilizado em um save de Pokémon Blue.

Cada variante pode ser modificada ou excluída.

Cada Pokémon pode possuir entre 1 e 9 variantes (uma para cada geração).

As variantes compartilham a maior parte de suas características, assim como as alterações aplicadas.

## Armazenamento dos saves

Cada save pode ser selecionado e seu armazenamento pode ser exibido, incluindo: equipe, caixas, creche etc.

Os Pokémon exibidos podem ser movidos, modificados ou excluídos.

## Pokémon vinculados

É possível mover um Pokémon de maneira vinculada (PKVault -> save ou vice-versa).

Dessa forma, um clone vinculado ao Pokémon é criado no armazenamento de destino.

O objetivo é sincronizar o Pokémon com seu clone vinculado. Alguns exemplos:

* save -> PKVault: o Pokémon do save ganhou um nível => sincroniza com a variante vinculada;
* PKVault -> save: a variante evoluiu => sincroniza o Pokémon no save.

Esse sistema é útil em conjunto com o uso de variantes: quando ocorre uma sincronização, todas as variantes recebem as alterações.

Assim, é possível utilizar o mesmo Pokémon em vários jogos e acompanhar sua progressão através das gerações.

Um Pokémon pode estar vinculado a apenas um save por vez.

## Pokémon externos

Arquivos externos de Pokémon (`.pk3`, `.pa9` etc.) podem ser utilizados fora do ambiente do PKVault.

Essas variantes específicas não podem ser editadas ou excluídas pelo PKVault, e as ações disponíveis são bastante limitadas.

## Ações sobre os Pokémon

<details> 
<summary>Criar uma variante de Pokémon</summary>

No armazenamento do PKVault, cria uma variante para um determinado Pokémon e geração.

As características do Pokémon base são utilizadas e convertidas para a geração de destino.

A conversão do Pokémon criado pode ser imperfeita e, involuntariamente, criar um Pokémon ilegal.

Se necessário, você pode abrir o Pokémon (seu arquivo PK) pelo PKHeX e corrigir diretamente os problemas de legalidade.

</details>

<details> 
<summary>Modificar um Pokémon</summary>

Modifica um Pokémon em um ou mais aspectos: apelido, golpes, EVs.

Se for uma variante, as modificações serão propagadas para as outras variantes.

</details>

<details> 
<summary>Excluir um Pokémon</summary>

Exclui um Pokémon.

Se ele for uma variante, apenas a variante selecionada será excluída.

</details>

<details> 
<summary>Desvincular um Pokémon</summary>

Desvincula um Pokémon vinculado.

Isso pode ser feito tanto para uma variante em relação ao Pokémon presente no save quanto no sentido inverso.

</details>

<details> 
<summary>Evoluir um Pokémon</summary>

Evolui um Pokémon.

Isso só é possível com Pokémon que evoluem por troca.

Caso seja necessário um item segurado, ele deverá estar presente.

</details>

<details> 
<summary>Mover um Pokémon</summary>

Move um Pokémon, com várias possibilidades:

* dentro da caixa atual;
* de uma caixa para outra;
* do armazenamento do PKVault para um save;
* de um save para o armazenamento do PKVault;
* de um save para outro save.

Mover uma variante para um save pode criar uma variante da geração correta, caso seja necessário. Nesse caso, a movimentação será feita de maneira vinculada.

A movimentação também pode ser feita de maneira vinculada; nesse caso, o Pokémon é efetivamente clonado (consulte [Pokémon vinculados](#pokemon-vinculados)).

Se o Pokémon não estiver vinculado, a movimentação pode ter como destino um espaço já ocupado. Nesse caso, os Pokémon trocarão de lugar.

</details>

Ações avançadas:

<details> 
<summary>Ordenar Pokémon</summary>

Organiza os Pokémon em uma ou mais caixas utilizando a Pokédex Nacional como referência.

É possível deixar espaços vazios para espécies ausentes.

Se não houver espaço suficiente, a ação poderá criar novas caixas.

</details>

<details> 
<summary>Sincronizar Pokédex</summary>

Sincroniza a Pokédex de todos os armazenamentos selecionados.

Os Pokémon vistos ou capturados são propagados entre todas as Pokédex, levando em consideração formas, gêneros e Pokémon shiny.

</details>

## Seleção múltipla

É possível selecionar vários Pokémon para executar uma ação em grupo, como mover todos ou parte dos Pokémon de uma caixa para outra.

A seleção pode ser facilitada mantendo a tecla Shift pressionada.
