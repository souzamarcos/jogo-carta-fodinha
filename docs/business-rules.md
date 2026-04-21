# Regras de Negócio — jogo-carta-fodinha

> Este documento mapeia todas as regras de negócio do jogo.
> Cada regra possui um identificador único para rastreabilidade.

---

## Regras

### RN-001: Vidas iniciais dos jogadores

- **Descrição**: Todo jogador começa a partida com 5 vidas.
- **Comportamento esperado**: Ao iniciar uma nova partida, `lives = 5` para todos.
- **Exceções**: Nenhuma.

---

### RN-002: Perda de vidas por erro de palpite

- **Descrição**: Ao final de cada rodada, o jogador perde vidas igual à diferença absoluta entre o palpite e o número de jogadas que efetivamente fez.
- **Comportamento esperado**: `vidas_perdidas = |palpite - jogadas_feitas|`. Se acertar o palpite, não perde vidas.
- **Exceções**: Nenhuma.

---

### RN-003: Eliminação de jogador

- **Descrição**: Um jogador é eliminado quando suas vidas chegam a zero ou menos.
- **Comportamento esperado**: `alive = false`; o jogador não participa das rodadas seguintes.
- **Exceções**: Nenhuma.

---

### RN-004: Condição de vitória

- **Descrição**: O jogo termina quando apenas um jogador permanece vivo.
- **Comportamento esperado**: Esse jogador é declarado vencedor e o app navega para a tela de encerramento.
- **Exceções**: Nenhuma.

---

### RN-005: Quantidade de cartas por rodada

- **Descrição**: Na rodada `N`, cada jogador recebe `N` cartas. O limite máximo é `floor(40 / jogadores_vivos)`.
- **Comportamento esperado**: `cardsPerPlayer = min(round, floor(40 / alivePlayers.length))`.
- **Exceções**: Se o número de rodadas ultrapassar o limite calculado, `cardsPerPlayer` é fixado no valor máximo.

---

### RN-006: Ordem das cartas (sem manilha)

- **Descrição**: A força das cartas segue a mesma ordem do truco paulista com manilha móvel.
- **Comportamento esperado**: Ordem crescente: `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`.
- **Exceções**: Cartas iguais que não são manilha resultam em empate ("melou"); nenhum jogador ganha a jogada.

---

### RN-007: Determinação da manilha (vira → manilha)

- **Descrição**: A manilha é a carta cujo valor está imediatamente acima da carta virada (vira), na sequência circular da RN-006.
- **Comportamento esperado**: Tabela vira → manilha:
  - `4` → `5`, `5` → `6`, `6` → `7`, `7` → `Q`, `Q` → `J`, `J` → `K`, `K` → `A`, `A` → `2`, `2` → `3`, `3` → `4`
  - No app, o usuário informa diretamente qual é a manilha (valor + naipe); o cálculo da vira é opcional/informativo.
- **Exceções**: Nenhuma.

---

### RN-008: Força da manilha e desempate por naipe

- **Descrição**: A manilha é a carta mais forte da rodada e não pode empatar com outra manilha.
- **Comportamento esperado**: Ordem de força dos naipes da manilha (crescente): `♣️ Paus < ♥️ Copas < ♠️ Espadas < ♦️ Ouros`.
- **Exceções**: Nenhuma; o naipe sempre desempata entre manilhas.

---

### RN-009: Ordem de palpites

- **Descrição**: O primeiro a fazer o palpite na rodada é o jogador imediatamente após o dealer (sentido horário/posição).
- **Comportamento esperado**: `firstBidderIndex = (dealerIndex + 1) % alivePlayers.length`. Os demais seguem em ordem de posição.
- **Exceções**: Nenhuma.

---

### RN-010: Rotação do dealer

- **Descrição**: A cada nova rodada, o papel de dealer passa para o próximo jogador vivo na ordem da mesa.
- **Comportamento esperado**: `dealerIndex = (dealerIndex + 1) % alivePlayers.length`.
- **Exceções**: Nenhuma.

---

### RN-011: Persistência local da partida

- **Descrição**: O estado completo da partida é salvo no `localStorage` do dispositivo.
- **Comportamento esperado**: Ao fechar e reabrir o app, a partida é restaurada na fase em que estava.
- **Exceções**: Ao iniciar nova partida, o estado anterior é apagado (com confirmação do usuário).

---

### RN-012: Número mínimo de jogadores

- **Descrição**: Uma partida só pode ser iniciada com pelo menos 2 jogadores cadastrados.
- **Comportamento esperado**: O botão "Começar" permanece desabilitado enquanto há menos de 2 jogadores na lista.
- **Exceções**: Nenhuma.

---

### RN-013: Indicador visual de vidas

- **Descrição**: A cor do indicador de vidas de cada jogador reflete o estado de saúde no jogo.
- **Comportamento esperado**:
  - `lives > 3` → Verde
  - `lives === 3` → Amarelo (`lives > 2`)
  - `lives <= 2` → Vermelho
- **Exceções**: Jogadores eliminados (`alive = false`) são exibidos em cinza / riscados.

---

### RN-014: Palpite padrão

- **Descrição**: O valor de palpite sugerido para cada jogador é o mesmo da rodada anterior.
- **Comportamento esperado**: Na 1ª rodada, o palpite padrão é `0`. Nas demais, é o último palpite registrado para aquele jogador.
- **Exceções**: Nenhuma.

---

### RN-015: Funcionamento offline

- **Descrição**: O app funciona completamente sem conexão com a internet após a instalação.
- **Comportamento esperado**: Service Worker com cache-first garante que todos os assets estejam disponíveis offline.
- **Exceções**: Nenhuma; não há chamadas de rede em nenhuma funcionalidade.

---

### RN-016: Ocultação dos palpites até a seleção da manilha (Modo 1)

- **Descrição**: Na fase de palpite de cada rodada (Modo 1), a seção de entrada de palpites só é exibida após a manilha ser selecionada e o distribuidor confirmado.
- **Comportamento esperado**: Ao iniciar a fase bid, somente o seletor de manilha é exibido. Após selecionar a manilha, a etapa de seleção do distribuidor é mostrada. Após confirmar o distribuidor, os controles de palpite aparecem.
- **Exceções**: Nenhuma.

---

### RN-017: Etapa de seleção do distribuidor (Modo 1)

- **Descrição**: Após selecionar a manilha em cada rodada, o jogador deve confirmar quem distribui as cartas antes de registrar os palpites.
- **Comportamento esperado**: A etapa mostra todos os jogadores vivos em ordem de cadastro. O distribuidor pré-selecionado é o próximo jogador vivo na rotação circular. Em todas as rodadas, há opção de alterar quem distribui — tanto na etapa de confirmação do distribuidor quanto durante a fase de palpites e a fase de jogo.
- **Exceções**: Nenhuma.

---

### RN-018: Marcadores de distribuidor e primeiro palpite (Modo 1)

- **Descrição**: O jogador que distribui as cartas recebe o marcador "Distribui" visível em seu nome; o próximo jogador vivo na ordem circular recebe o marcador "Primeiro palpite". Esses marcadores permanecem visíveis durante todas as fases da rodada (palpite, jogo e resultado).
- **Comportamento esperado**: Os marcadores "Distribui" e "Primeiro palpite" são rótulos persistentes (não dependem de hover) exibidos abaixo do nome do respectivo jogador. A ordem de exibição dos jogadores não muda entre fases ou rodadas.
- **Exceções**: Se restar apenas um jogador vivo, ele acumula os dois marcadores simultaneamente.

---

### RN-019: Ordem estável de exibição dos jogadores (Modo 1)

- **Descrição**: Em todas as fases e rodadas, os jogadores são exibidos sempre na mesma ordem de cadastro (campo `position`), sem reordenação baseada em quem dá o primeiro palpite.
- **Comportamento esperado**: A posição de cada jogador na lista visual nunca muda entre fases (palpite, jogo) nem entre rodadas. Jogadores eliminados permanecem visíveis em sua posição original com tratamento visual de eliminação.
- **Exceções**: Nenhuma.

---

### RN-020: Fluxo de rodada unificado — fase de jogo com registro de vazas (Modo 1)

- **Descrição**: No Modo 1, após clicar em "Iniciar Rodada", a fase de jogo exibe tanto os palpites (somente leitura) quanto os controles de entrada de vazas feitas por cada jogador. Não há uma tela separada de "resultado" — clicar em "Finalizar Rodada" valida as vazas e confirma o resultado diretamente.
- **Comportamento esperado**:
  - Ao entrar na fase de jogo, cada jogador exibe seu palpite (somente leitura) e um controle de entrada do número de vazas feitas.
  - O cronômetro corre durante toda a fase de jogo, até o clique em "Finalizar Rodada".
  - Ao clicar em "Finalizar Rodada": se a soma das vazas for diferente do número de cartas por jogador, uma mensagem de erro é exibida e a partida não avança. Se a soma for válida, o resultado é calculado e a partida avança para a próxima rodada (ou para o estado de empate/encerramento).
- **Exceções**: Nenhuma.

---

### RN-021: Pré-preenchimento das vazas com os palpites ao iniciar a rodada (Modo 1)

- **Descrição**: Ao iniciar uma rodada (clicar em "Iniciar Rodada"), o valor de vazas de cada jogador é inicializado com o mesmo valor do seu palpite.
- **Comportamento esperado**: Os controles de entrada de vazas na fase de jogo exibem inicialmente o valor do palpite de cada jogador. O usuário pode alterar qualquer valor antes de clicar em "Finalizar Rodada".
- **Exceções**: Nenhuma.

---

### RN-022: Alteração do distribuidor durante a fase de palpites e de jogo (Modo 1)

- **Descrição**: O distribuidor pode ser alterado manualmente durante a fase de palpites (sub-fase de palpites, quando o botão "Iniciar Rodada" está visível) e durante a fase de jogo (rodada em andamento).
- **Comportamento esperado**: Ao alterar o distribuidor, os marcadores "Distribui" e "Primeiro palpite" são atualizados imediatamente. O índice do distribuidor (`dealerIndex`) é persistido, e a rotação automática da rodada seguinte deriva do novo distribuidor.
- **Exceções**: A fase de jogo não é interrompida — o cronômetro continua e as entradas de vazas são preservadas durante a alteração do distribuidor.


---

### RN-023: Completude dos dados de palpite e vazas no histórico de rodadas (Modo 1)

- **Descrição**: O histórico de rodadas (`RoundHistory`) sempre contém uma entrada para cada jogador que estava vivo no início daquela rodada, tanto em `bids` (palpites) quanto em `tricks` (vazas feitas).
- **Comportamento esperado**: Jogadores que mantiveram o palpite padrão de 0 (sem clicar em + ou −) têm o valor 0 registrado explicitamente nos campos `bids` e `tricks` do histórico. O símbolo "–" na tabela de histórico indica exclusivamente que o jogador estava eliminado antes do início daquela rodada e não participou dela.
- **Exceções**: Nenhuma. Um palpite de 0 não é o mesmo que ausência de participação.

---

### RN-024: URL canônica e consistência de metadados SEO

- **Descrição**: A URL canônica definitiva do projeto é `https://souzamarcos.github.io/jogo-carta-fodinha/`. Todos os metadados de SEO e compartilhamento social devem referenciar esta URL de forma consistente.
- **Comportamento esperado**: O valor de `og:url` em `index.html`, o atributo `href` de `link[rel=canonical]`, a `<loc>` principal em `sitemap.xml`, e o `start_url` no manifest PWA devem todos apontar para esta URL.
- **Exceções**: Em ambiente de desenvolvimento local (`localhost`), os metadados ainda referenciam a URL de produção — isso é intencional, pois as tags OG são consumidas por crawlers externos que sempre acessam a URL de produção.

---

### RN-025: Edição da ordem dos jogadores durante a fase de palpites e de jogo (Modo 1)

- **Descrição**: A ordem dos jogadores pode ser alterada manualmente durante a fase de palpites (sub-fase `bids`, quando o botão "Iniciar Rodada" está visível) e durante a fase de jogo (rodada em andamento).
- **Comportamento esperado**: Ao confirmar a nova ordem, as posições (`position`) dos jogadores vivos são atualizadas. O marcador "Primeiro palpite" é recalculado imediatamente como o jogador vivo imediatamente após o distribuidor na nova ordem (circular). A identidade do distribuidor não muda — o marcador "Distribui" permanece no mesmo jogador. A nova ordem persiste nas rodadas seguintes: a rotação automática do distribuidor segue a nova sequência. A tabela de histórico e o modal de confirmação de resultado refletem a nova ordem imediatamente.
- **Exceções**: Jogadores eliminados não aparecem no modal de reordenação e não têm sua posição alterada. A fase de jogo não é interrompida — o cronômetro continua e as entradas de vazas são preservadas durante a alteração da ordem.

---

### RN-027: Acesso às regras do jogo

- **Descrição**: A tela inicial exibe o link "Regras do jogo" que abre a página `/rules` com as regras completas do Fodinha.
- **Comportamento esperado**: O link é sempre visível na tela inicial, independentemente de haver sessões ativas. Navegar para as regras e voltar não afeta o estado de nenhuma sessão ativa (Modo 1 ou Modo 2).
- **Exceções**: Nenhuma.

---

### RN-026: Ajuste do número de jogadores no Modo 2 (Etapa 1)

- **Descrição**: Na tela Etapa 1 (seleção de manilha) do Modo 2, o usuário pode ajustar o número de jogadores ativos usando os botões − e + antes de confirmar a manilha.
- **Comportamento esperado**: Cada toque no botão − reduz o número de jogadores em 1; cada toque no + aumenta em 1. O valor mínimo é 2 e o máximo é 10. O campo `cardsPerPlayer` é recalculado imediatamente usando a fórmula `min(rodada, floor(40 / numJogadores))`. O novo valor persiste para as próximas rodadas via `finishRound()`.
- **Motivação**: Após cada rodada, jogadores podem ser eliminados da partida física. O ajuste manual mantém o cálculo de cartas correto sem exigir reinício da sessão.
- **Exceções**: O ajuste não retroage sobre rodadas já concluídas. Não há limite superior baseado em cartas disponíveis — a validação é somente pelo intervalo 2–10.

---

### RN-027: Ciclos dentro de uma rodada no Modo 2 (Painel Individual)

- **Descrição**: No Modo 2, cada rodada é organizada em **ciclos**. Em cada ciclo, cada jogador da mesa joga no máximo uma carta. A capacidade do ciclo é igual a `numJogadores` (incluindo o próprio usuário do app). O avanço entre ciclos é explícito — o usuário toca "Próximo Ciclo ›" para fechar o ciclo atual e abrir o próximo.
- **Comportamento esperado**:
    - A tela de jogo (Etapa 3/4) exibe um indicador "CICLO N · X/numJogadores" mostrando o ciclo atual e quantas cartas (próprias + de outros jogadores) já foram registradas nesse ciclo.
    - O usuário pode marcar no máximo uma carta própria como jogada por ciclo. Desmarcar essa carta no mesmo ciclo libera o "slot" e permite marcar outra carta própria (mas ainda apenas uma por vez).
    - A soma de cartas próprias + cartas de outros jogadores por ciclo não pode exceder `numJogadores`. Ao atingir o limite, os controles de adicionar carta e marcar carta própria ficam desabilitados.
    - **Cada ciclo deve obrigatoriamente conter a carta do próprio usuário**. Enquanto a carta própria não for marcada no ciclo, os registros de cartas de outros jogadores ficam limitados a `numJogadores − 1` (um slot permanece reservado para a carta própria). Assim que a carta própria é marcada, o ciclo pode chegar a `numJogadores`.
    - O botão "Próximo Ciclo ›" só é habilitado quando `cardsPlayedInCycle > 0` **e** a carta própria do ciclo já foi jogada, evitando ciclos vazios ou ciclos sem participação do usuário.
    - O botão "Ciclo anterior ‹" só é habilitado quando o ciclo atual tem 0 cartas registradas; ao tocar, o número do ciclo decrementa mas contadores de ciclos fechados não são restaurados (ciclos fechados permanecem fechados).
    - Quando todas as cartas da mão foram jogadas e o ciclo final está cheio, é exibido o selo "Rodada completa"; a rodada não finaliza automaticamente — o usuário toca "Finalizar Rodada" normalmente.
    - Estado de ciclo (`currentCycle`, `cardsPlayedInCycle`, `ownCardIndexThisCycle`, `otherCardsAddedThisCycle`) é persistido no store e restaurado em recarregamentos mid-rodada.
- **Motivação**: Alinhar o Modo 2 com o fluxo físico do jogo (uma volta na mesa = um ciclo) e prevenir estados inválidos onde um jogador registra mais cartas do que existem no ciclo.
- **Exceções**: Remover uma carta de outro jogador que foi adicionada em um ciclo anterior (já fechado) não altera os contadores do ciclo atual; só remover uma carta adicionada no ciclo atual libera espaço nesse ciclo.

---
