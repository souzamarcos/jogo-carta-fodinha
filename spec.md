# Especificação — Fodinha PWA

**Versão**: 1.0.0
**Data**: 2026-04-12
**Status**: Rascunho

---

## Visão Geral

Aplicação Progressive Web App (PWA) para auxiliar partidas do jogo de cartas **Fodinha**. Sem servidor — todo estado é persistido localmente via `localStorage`. Instalável em celulares e desktops.

**Arquitetura de modos:** O app possui dois modos de uso completamente independentes, sem dependência de estado entre si. Ao abrir o app, o usuário escolhe o modo antes de qualquer outra ação:

- **Modo 1 — Suporte Geral**: controle completo da partida (vidas, palpites, manilha, histórico)
- **Modo 2 — Painel Individual**: auxílio a um jogador específico durante a rodada (cartas na mão, análise, cartas na mesa)

Cada modo persiste seu próprio estado isolado no `localStorage`. Um modo não lê nem escreve o estado do outro.

---

## Clarifications

### Session 2026-04-12

- Q: O que acontece se múltiplos jogadores chegarem a 0 vidas na mesma rodada? → A: `phase = 'tiebreak'` — modal oferece "Declarar Empate" ou "Rodada Extra"; rodadas extras seguem o fluxo normal apenas com os empatados; vence quem perder menos numa rodada extra; se empatarem novamente, nova rodada extra inicia automaticamente sem perguntar.
- Q: O `PlayerHandState` armazena um ou múltiplos jogadores por dispositivo? → A: Um jogador por dispositivo. A Funcionalidade 2 é opcional — zero ou um jogador a usa por partida. O jogador selecionado marca as cartas jogadas na mesa para auxiliar sua própria estratégia.
- Q: O `PlayerHandState` é limpo automaticamente ou manualmente ao trocar de rodada? → A: Automaticamente — ao confirmar o resultado da rodada, `PlayerHandState` é resetado (cards: [], cardsOnTable: recalculado para nova rodada); jogador selecionado é mantido.
- Q: Nomes de jogadores duplicados são permitidos no cadastro? → A: Não — bloquear duplicatas com erro inline no campo (case-insensitive); botão "Adicionar" desabilitado enquanto o nome já existir na lista.
- Q: O que acontece quando `round > maxCards` (limite de cartas atingido)? → A: Fixar no máximo — `cardsPerPlayer` permanece em `floor(40 / alivePlayers.length)` até o jogo terminar; não há decréscimo.
- Decisão: Funcionalidade 1 e Funcionalidade 2 são completamente independentes — sem dependência de estado entre si. Cada modo persiste estado isolado.
- Decisão: Tela inicial (`/`) é seleção de modo; usuário escolhe entre "Suporte Geral" ou "Painel Individual" antes de qualquer outra ação.
- Q: Qual bundle de stack tecnológica utilizar? → A: Bundle A — React 18 + Vite + Tailwind CSS + Zustand (confirmado; sem alterações na spec de stack).
- Q: Como o Modo 2 configura seu estado inicial sendo independente do Modo 1? → A: Configuração mínima por rodada — usuário informa nome (texto livre) e nº de jogadores na mesa. `cardsPerPlayer` começa em 1 e é auto-incrementado a cada rodada seguindo `min(round, floor(40/numPlayers))`, com possibilidade de ajuste manual. O app calcula o total de cartas na mesa automaticamente.
- Q: Na tela `/`, o que acontece se houver estado salvo de um ou ambos os modos? → A: Cada botão de modo indica visualmente se há sessão ativa (badge "Em andamento"); ao clicar, oferece "Continuar" ou "Nova sessão" antes de navegar.
- Q: Como exibir a força relativa das cartas na análise do Modo 2? → A: Ranking posicional — "1ª", "2ª", "3ª" mais forte entre as cartas na mão; manilha sempre destacada com ícone especial.
- Q: O que exibir e quais ações disponibilizar na tela `/game/winner`? → A: Nome(s) do(s) vencedor(es) em destaque + resumo (rodadas jogadas + tempo total) + botão "Revanche" (mesmos jogadores, vidas zeradas) + botão "Início" (volta para `/`).
- Decisão: Modo 2 — tela da rodada dividida em dois blocos (A: cartas de outros; B: minha mão). Naipe exigido apenas para cartas manilha, em ambos os blocos. Setup da rodada tem duas etapas: (1) informar manilha; (2) informar cartas da mão (naipe só se manilha). `cardsOnTable` é derivado automaticamente.
- Q: Desfazer marcação de carta jogada é permitido? → A: Bloco A: botão "×" remove da lista + botão "?" para carta desconhecida (`value: 'unknown'`) sem bloquear o fluxo. Bloco B: toggle — segundo toque desmarca. Foco em velocidade sem travar o jogo.
- Q: Como o jogador informa as cartas na mão no setup da rodada (Modo 2)? → A: Grade dos 10 valores com toque direto; manilha abre selector de naipe inline; lista abaixo com "×" para remover; mesma UX do Bloco A.
- Q: Duplicatas de mesmo valor na mão são permitidas? → A: Sim — cartas comuns com mesmo valor exibidas identicamente; ao marcar como jogada, a primeira instância não-jogada é marcada. Manilha é única (naipe já a distingue).
- Q: A análise visual cruza cartas do Bloco A para calcular ranking das suas cartas? → A: Não — ranking considera apenas as suas cartas restantes entre si; Bloco A é independente da análise.
- Q: O Bloco A bloqueia quando o total de cartas jogadas atinge `numPlayers × cardsPerPlayer`? → A: Sim — grade do Bloco A desabilita completamente ao atingir o limite; Bloco B (toggle) também desabilita novos "played = true".
- Decisão: Indicadores de disponibilidade — aparecem na **grade do Bloco A** e na **grade do setup da mão**; não na Análise Visual. Badge por valor; desconta cartas na mão e cartas conhecidas jogadas; `possível = 0` → acinzentado. No setup: badge desabilita o botão ao chegar a 0 (impossível ter mais). No Bloco A: badge 0 = acinzentado mas tocável.
- Q: Grade do setup da mão exibe badges de disponibilidade? → A: Sim — mesma lógica do Bloco A; badge `0` desabilita o botão no setup (impossível adicionar carta que não existe).
- Q: Como exibir a manilha na grade do Bloco A e do setup? → A: Expandida diretamente em 4 naipes (♦️ ♠️ ♥️ ♣️) com badge 0/1 cada; toque direto no naipe registra a carta sem selector adicional.
- Q: Layout da grade com manilha expandida? → A: Duas seções — linha superior com 9 valores não-manilha + "?"; linha inferior sempre visível com 4 naipes da manilha e badge 0/1 cada.
- Q: Etapas do setup são sequenciais ou numa tela única? → A: Sequenciais — Etapa 1 (manilha) confirmada primeiro; Etapa 2 (mão) aparece após confirmação com linha de manilha já populada na grade.
- Decisão: Botão "Finalizar Rodada" sempre habilitado no Modo 2 — sem validação obrigatória; o jogador pode finalizar a qualquer momento.
- Decisão: Modo 2 não tem histórico de rodadas — ao finalizar, dados da rodada são descartados; apenas `round`, `numPlayers` e `playerName` persistem.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite (com plugin PWA: `vite-plugin-pwa`) |
| Estilização | Tailwind CSS |
| Roteamento | React Router v6 |
| Estado global | Zustand (persistência via `zustand/middleware/persist` → `localStorage`) |
| Testes unitários | Vitest + React Testing Library |
| Testes E2E | Playwright |
| Service Worker | Workbox (via `vite-plugin-pwa`) |

### Requisitos PWA
- `manifest.json` com `name`, `short_name`, `icons` (192×192, 512×512), `display: standalone`, `theme_color`, `background_color`
- Service Worker com estratégia **cache-first** para assets estáticos
- Funcionamento **offline completo** (sem chamadas de rede)
- Meta tag `viewport` com `width=device-width, initial-scale=1`

---

## Estrutura de Rotas

```
/                    → Tela de seleção de modo (Suporte Geral | Painel Individual)

── Modo 1: Suporte Geral ──────────────────────────────────────
/game                → Tela inicial do modo (nova partida ou continuar)
/game/setup          → Cadastro de jogadores
/game/round          → Fluxo de rodada (palpites → em jogo → resultado)
/game/winner         → Tela de encerramento / vencedor

── Modo 2: Painel Individual ──────────────────────────────────
/player              → Tela do painel individual (seleção de jogador, mão, mesa)
```

A rota `/` é a única entrada. Cada modo tem seu próprio subconjunto de rotas e estado isolado.

---

## Modelo de Dados

### `GameState` (persistido em localStorage)

```ts
interface GameState {
  players: Player[];           // ordenados pela posição na mesa
  round: number;               // rodada atual (começa em 1)
  dealerIndex: number;         // índice do jogador que embaralhou nesta rodada
  phase: GamePhase;
  currentRound: RoundState | null;
  history: RoundHistory[];     // histórico de rodadas encerradas
  startedAt: string;           // ISO timestamp
  finishedAt?: string;
}

type GamePhase =
  | 'setup'        // cadastro de jogadores
  | 'bid'          // fase de palpites
  | 'playing'      // rodada em andamento (cronômetro ativo)
  | 'result'       // marcação de resultados
  | 'tiebreak'     // morte súbita: múltiplos jogadores eliminados simultaneamente
  | 'finished';    // jogo encerrado

interface Player {
  id: string;       // uuid
  name: string;
  position: number; // 0-based, ordem na mesa
  lives: number;    // começa com 5, mínimo 0
  alive: boolean;   // false quando lives <= 0
}

interface RoundState {
  manilha: Card;               // carta manilha da rodada
  cardsPerPlayer: number;      // quantidade de cartas na mão
  bids: Record<string, number>;// playerId → palpite
  tricks: Record<string, number>; // playerId → jogadas feitas (fase result)
  startedAt: string;           // ISO timestamp (para cronômetro)
  firstBidderIndex: number;    // índice de quem começa os palpites
}

interface RoundHistory {
  round: number;
  manilha: Card;
  cardsPerPlayer: number;
  bids: Record<string, number>;
  tricks: Record<string, number>;
  losses: Record<string, number>; // vidas perdidas por jogador
}

interface Card {
  value: CardValue;  // '4'|'5'|'6'|'7'|'Q'|'J'|'K'|'A'|'2'|'3'
  suit?: CardSuit;   // obrigatório apenas na manilha
}

type CardValue = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3';
type CardSuit  = 'ouros' | 'espadas' | 'copas' | 'paus';
```

### `PlayerHandState` (persistido em localStorage — completamente independente do `GameState`)

Armazena dados de **um único jogador por dispositivo**. Estado autossuficiente — não referencia nenhum dado do Modo 1.

```ts
interface HandCard {
  value: CardValue;
  suit?: CardSuit;  // obrigatório somente se value === manilha.value
  played: boolean;  // true quando o jogador marca a carta como jogada (Bloco B)
}

interface OtherPlayedCard {
  value: CardValue | 'unknown'; // 'unknown' quando o jogador não viu/lembrou a carta
  suit?: CardSuit;              // obrigatório somente se value === manilha.value (e value !== 'unknown')
}

interface PlayerHandState {
  playerName: string;              // nome livre digitado pelo usuário
  numPlayers: number;              // nº de jogadores na mesa (informado pelo usuário)
  round: number;                   // rodada atual (começa em 1, incrementa via botão)
  cardsPerPlayer: number;          // min(round, floor(40/numPlayers)); ajuste manual permitido
  manilha: Card | null;            // manilha da rodada (value + suit obrigatório)
  handCards: HandCard[];           // cartas na mão — informadas antes da rodada iniciar
  otherPlayedCards: OtherPlayedCard[]; // Bloco A: cartas jogadas por outros jogadores
}

// cardsOnTable (derivado, não armazenado):
// total = numPlayers × cardsPerPlayer
// jogadas = handCards.filter(c => c.played).length + otherPlayedCards.length
// restantes = total - jogadas
```

**Regras do `PlayerHandState`:**
- `cardsPerPlayer` recalculado ao avançar rodada: `min(round, floor(40/numPlayers))`; ajuste manual prevalece para aquela rodada
- Ao avançar para nova rodada: `round++`, `handCards` limpo, `otherPlayedCards` limpo, `manilha` limpa, `cardsPerPlayer` recalculado
- `playerName` e `numPlayers` persistem entre rodadas
- Naipe é exigido **apenas** quando `value === manilha.value` — tanto em `handCards` quanto em `otherPlayedCards`
- Duplicatas de mesmo valor em `handCards` são permitidas para cartas comuns; ao marcar como jogada (`played = true`), a primeira instância com `played = false` na lista é marcada
- Manilha é sempre única na mão (mesmo valor + naipe específico; não faz sentido ter dois naipes iguais)

---

## Tela de Seleção de Modo (`/`)

- Exibe logo/título do jogo
- Dois cards/botões grandes, um por modo:

**Card "Suporte Geral":**
- Se `gameStore` tiver partida ativa: badge **"Em andamento"** + rodada atual
- Ao clicar com sessão ativa: modal com opções **"Continuar Partida"** ou **"Nova Partida"**
- Ao clicar sem sessão: navega direto para `/game/setup`

**Card "Painel Individual":**
- Se `playerHandStore` tiver sessão ativa: badge **"Em andamento"** + nome do jogador + rodada atual
- Ao clicar com sessão ativa: modal com opções **"Continuar"** ou **"Nova Sessão"**
- Ao clicar sem sessão: navega direto para `/player` (tela de configuração inicial)

---

## Funcionalidade 1 — Suporte Geral (`/game/*`)

### 1.1 Tela Inicial do Modo 1 (`/game`)

### 1.2 Cadastro de Jogadores (`/game/setup`)

- Campo de texto + botão **"Adicionar"** para cadastrar jogadores (mínimo 2)
- Validação de nome duplicado: comparação case-insensitive contra nomes já na lista; exibe erro inline no campo e desabilita botão "Adicionar" enquanto o nome já existir
- Nomes em branco ou somente espaços também são bloqueados
- Lista de jogadores exibe posição na mesa (1, 2, 3…) com opção de reordenar (drag-and-drop ou botões ↑↓)
- Botão **"Remover"** em cada jogador
- Botão **"Começar"** habilitado apenas com ≥ 2 jogadores
- Ao clicar em "Começar": inicializa `GameState` com `phase: 'bid'`, `round: 1`, `dealerIndex` sorteado aleatoriamente, e navega para `/game`

### 1.3 Painel da Partida (`/game/round`)

#### Painel de Vidas
- Card para cada jogador (em ordem de posição)
- Nome + número de vidas restantes
- Cor do indicador de vida:
  - Verde: `lives > 3`
  - Amarelo: `lives > 2` (ou seja `lives === 3`)
  - Vermelho: `lives <= 2`
- Jogadores eliminados (`alive: false`) ficam acinzentados / riscados

#### Informações da Rodada
- Número da rodada atual
- Cartas por jogador na rodada atual
- Quem está embaralhando (dealer)
- Quem começa os palpites (próximo ao dealer no sentido horário)

#### Fluxo de Rodada — Fase Palpites (`phase: 'bid'`)

1. **Seletor de Manilha**: o usuário informa a carta manilha da rodada
   - Seleção em dois passos: primeiro o valor (`4`…`3`), depois o naipe (♦️ Ouros, ♠️ Espadas, ♥️ Copas, ♣️ Paus)
   - Exibe visualmente a carta selecionada
2. **Lista de palpites**: um campo numérico (spinner/stepper) por jogador, na ordem que começa os palpites
   - Valor default: palpite da última rodada (ou `0` na 1ª rodada)
   - Destaca visualmente o jogador atual (quem está fazendo o palpite agora)
3. Botão **"Iniciar Rodada"** — habilitado após todos terem palpite definido

#### Fluxo de Rodada — Fase Em Jogo (`phase: 'playing'`)

- Manilha exibida em destaque (card grande com naipe e valor)
- Cronômetro contando tempo desde início da rodada (apenas informativo, formato `mm:ss`)
- Palpites de cada jogador visíveis em lista
- Botão **"Finalizar Rodada"** → muda `phase` para `result`

#### Fluxo de Rodada — Fase Resultado (`phase: 'result'`)

- Lista de jogadores com campo numérico para registrar **quantas jogadas cada um fez**
- Valor default: `0`
- Botão **"Confirmar"** → abre modal de confirmação

**Modal de Confirmação**:
- Exibe tabela: Jogador | Palpite | Fez | Diferença | Vidas perdidas
- Vidas perdidas = `|palpite - fez|` (valor absoluto)
- Botão **"Confirmar"** → aplica perdas, avança rodada ou encerra jogo
- Botão **"Voltar"** → fecha modal

Após confirmação:
- Atualiza `lives` de cada jogador
- Marca `alive: false` para quem chegou a `lives <= 0`
- Appenda entrada em `history`
- Se apenas 1 jogador `alive`: `phase = 'finished'` → navega para `/game/winner`
- Se **múltiplos jogadores** chegarem a `lives <= 0` na mesma rodada: `phase = 'tiebreak'` → exibe modal de desempate (ver seção Morte Súbita)
- Caso contrário: incrementa `round`, calcula `cardsPerPlayer` para nova rodada, avança `dealerIndex`, `phase = 'bid'`

#### Morte Súbita (`phase: 'tiebreak'`)

Ativada quando dois ou mais jogadores são eliminados simultaneamente na mesma rodada.

**Modal de desempate** exibe duas opções:
- **"Declarar Empate"** → `phase = 'finished'`, tela `/game/winner` exibe todos os co-vencedores
- **"Rodada Extra"** → os jogadores empatados (com `lives <= 0`) jogam rodadas extras entre si; os demais jogadores já eliminados anteriormente não participam

**Rodadas extras de morte súbita:**
- Seguem o fluxo normal de rodada (bid → playing → result) apenas com os jogadores empatados
- `cardsPerPlayer` reinicia em 1 e incrementa normalmente
- Ao final de cada rodada extra: calcula `|palpite - fez|` para cada participante
- Se um dos participantes perder **mais** vidas que o outro: o que perdeu **menos** é declarado vencedor → `phase = 'finished'`
- Se empatarem novamente (mesma perda): nova rodada extra é iniciada automaticamente (sem perguntar novamente)
- Não há limite de rodadas extras

#### Histórico Colapsável

- Botão/accordion fixo no rodapé ou abaixo do painel de vidas: "📋 Histórico de Rodadas"
- Quando expandido: tabela com colunas Rodada | Manilha | Cartas | e uma coluna por jogador (mostrando `palpite/fez/−perdas`)
- Colapsado por padrão

### 1.4 Tela de Vencedor (`/game/winner`)

- Nome(s) do(s) vencedor(es) exibido(s) em destaque central
- Em caso de empate declarado na morte súbita: exibe todos os co-vencedores
- Resumo da partida:
  - Total de rodadas jogadas
  - Tempo total (calculado de `startedAt` a `finishedAt`)
- Botão **"Revanche"** → reinicia `GameState` com os mesmos jogadores (mesma ordem, vidas = 5), navega para `/game/round`
- Botão **"Início"** → limpa `gameStore`, navega para `/`

---

## Funcionalidade 2 — Painel Individual (`/player`)

Modo completamente independente do Modo 1. Não acessa nem depende do `GameState`. O usuário configura tudo localmente neste modo.

### Configuração Inicial (primeira vez ou nova partida no Modo 2)

- Campo **Nome do jogador** (texto livre, obrigatório)
- Campo **Nº de jogadores na mesa** (número inteiro ≥ 2, obrigatório)
- Ao confirmar: `round = 1`, `cardsPerPlayer = 1`, `cardsOnTable = numPlayers × 1`

### Fase de Setup da Rodada (antes de iniciar)

As etapas são **sequenciais** — Etapa 2 só aparece após Etapa 1 confirmada.

**Etapa 1 — Manilha:**
- Seletor de valor (9 valores não-manilha impossíveis de ser manilha não são filtrados — qualquer valor pode ser manilha) + naipe obrigatório
- Botão **"Confirmar Manilha"** → manilha exibida em destaque; Etapa 2 aparece com a linha de manilha já populada com os 4 naipes do valor escolhido

**Etapa 2 — Suas cartas na mão:**
- **Grade de valores** — mesmo layout de duas seções do Bloco A:
  - **Linha superior**: 9 botões dos valores não-manilha com badge `possível(V) = 4 − já adicionadas com valor V`; badge `0` desabilita o botão
  - **Linha inferior (Manilha)**: 4 naipes (♦️ ♠️ ♥️ ♣️) com badge `0` ou `1`; naipe já adicionado desabilitado (badge `0`)
- Lista abaixo da grade exibe as cartas já adicionadas; botão "×" remove cada uma
- Limite visual: grade desabilita todos os toques ao atingir `cardsPerPlayer` cartas no total
- Botão **"Iniciar Rodada"** habilitado após: manilha definida + pelo menos 1 carta na mão

### Fase de Jogo da Rodada

Tela dividida em dois blocos verticais:

---

#### Bloco A — Cartas Jogadas por Outros

Área para registrar cada carta jogada pelos outros jogadores na mesa. Projetado para marcação rápida — não deve travar o jogo.

- **Grade de valores com indicadores de disponibilidade** — layout em duas seções:
  - **Linha superior**: 9 botões dos valores não-manilha com badge numérico cada + botão **"?"**
  - **Linha inferior (Manilha)**: label "Manilha" + 4 botões de naipe (♦️ ♠️ ♥️ ♣️) sempre visíveis, cada um com badge `0` ou `1`
- Cada botão exibe um **badge numérico** indicando quantas cartas daquele valor ainda podem estar nas mãos de outros jogadores:
  - **Cálculo (não-manilha, valor V)**:
    `possível = 4 − handCards.filter(c=>c.value===V).length − otherPlayedCards.filter(c=>c.value===V && c.value!=='unknown').length`
  - Badge `0` → botão exibido em **estilo acinzentado/opaco** (ainda tocável)
- Ao tocar um valor não-manilha → carta registrada imediatamente
- **O valor da manilha é exibido de forma expandida na grade**: em vez de um único botão, aparecem os **4 naipes diretamente** (♦️ ♠️ ♥️ ♣️), cada um com badge `0` ou `1`:
  - `possível(naipe N) = 1 − (handCards.some(c=>c.value===manilha.value && c.suit===N) ? 1 : 0) − (otherPlayedCards.some(c=>c.value===manilha.value && c.suit===N) ? 1 : 0)`
  - Naipe com badge `0` → acinzentado mas tocável
  - Tocar um naipe → registra `{ value: manilha.value, suit: N }` imediatamente (sem selector adicional)
- Ao tocar **"?"** → registra `{ value: 'unknown' }` imediatamente; não afeta badges de disponibilidade
- Lista das cartas já registradas exibida abaixo da grade (em ordem de marcação); cada item com botão **"×"**
- Cartas `unknown` na lista exibidas como "Carta ?" com ícone de interrogação
- **Limite**: quando total jogado = `numPlayers × cardsPerPlayer`, toda a grade (incluindo "?") desabilitada; label "Todas as cartas foram jogadas"

---

#### Bloco B — Minha Mão

Exibe as cartas do jogador como itens tocáveis.

- Cada carta da `handCards` exibida como um card visual
- Ao tocar carta **não jogada**: marca `played = true` → carta exibida como "jogada" (riscada / acinzentada); desabilitado quando limite total atingido
- Ao tocar carta **já jogada**: desmarca (`played = false`) — toggle de desfazer sempre permitido mesmo com limite atingido
- Cartas manilha já têm naipe registrado desde o setup — nenhuma ação adicional ao marcar como jogada
- Cartas não jogadas ficam em destaque; jogadas ficam visualmente distintas mas permanecem visíveis na lista

---

#### Contador de Cartas na Mesa (entre os dois blocos)

- **Valor derivado** (não armazenado): `(numPlayers × cardsPerPlayer) − handCards.filter(c=>c.played).length − otherPlayedCards.length`
- Exibido como "X restantes de Y" + barra de progresso
- Atualizado automaticamente a cada marcação nos blocos A e B

---

#### Análise Visual (abaixo dos blocos)

- Cartas **não jogadas** da mão (`played = false`) ordenadas da mais forte para a mais fraca
- Ranking calculado **apenas entre as suas cartas restantes** — Bloco A não influencia o ranking

**Indicador por carta:**

- **Ranking posicional**: "1ª mais forte", "2ª mais forte", etc.; manilha com ícone ⭐ + naipe
- Os **indicadores de disponibilidade** aparecem **somente no Bloco A** (grade de valores), não na Análise Visual

- Se manilha não informada: aviso "Informe a manilha para ver a análise"
- Se todas as cartas foram jogadas: aviso "Todas as cartas foram jogadas"

---

### Finalizar Rodada

- Botão **"Finalizar Rodada"** visível e habilitado **a qualquer momento** durante a Fase de Jogo — o jogador pode finalizar mesmo sem ter marcado todas as cartas (pode ter esquecido ou não visto)
- Sem modal de confirmação — ação imediata
- Ao clicar: `round++`, limpa `handCards`, `otherPlayedCards`, `manilha`; recalcula `cardsPerPlayer`; retorna para Fase de Setup
- **Não há histórico de rodadas anteriores no Modo 2** — ao finalizar, os dados da rodada são descartados; apenas o `round`, `numPlayers` e `playerName` são mantidos

---

## Regras do Jogo Fodinha

### Visão Geral

Fodinha é um jogo de cartas para 2 ou mais jogadores. Ganha o **último jogador a permanecer com vida**. Cada jogador começa com **5 vidas** e as perde ao errar palpites ao longo das rodadas.

---

### O Baralho

- Baralho de **40 cartas**: 4 naipes × 10 valores
- Naipes: ♦️ Ouros, ♠️ Espadas, ♥️ Copas, ♣️ Paus
- Valores (do mais fraco ao mais forte, sem manilha): `4, 5, 6, 7, Q, J, K, A, 2, 3`

---

### Ordem de Força das Cartas (sem manilha)

```
4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
```

- O `5` vence o `4`, o `6` vence o `5`, e assim por diante
- **Empate entre cartas iguais que não são manilha**: ninguém ganha a jogada — chamado de "melou" ou "melar"

---

### A Manilha

Antes de distribuir as cartas, uma carta é virada: a **vira**. A **manilha** é a carta imediatamente acima da vira na sequência de força:

| Vira | Manilha |
|------|---------|
| 4 | 5 |
| 5 | 6 |
| 6 | 7 |
| 7 | Q |
| Q | J |
| J | K |
| K | A |
| A | 2 |
| 2 | 3 |
| 3 | 4 |

- A manilha é a **carta mais forte** de todas na rodada
- Para a manilha, o **naipe importa** e serve como desempate
- **Ordem de força dos naipes da manilha** (do mais fraco ao mais forte):
  ```
  ♣️ Paus < ♥️ Copas < ♠️ Espadas < ♦️ Ouros
  ```
- **Não existe empate entre manilhas** — o naipe sempre desempata

---

### Quantidade de Cartas por Rodada

- **Rodada 1**: cada jogador recebe 1 carta
- **Rodada 2**: cada jogador recebe 2 cartas
- **Rodada N**: cada jogador recebe N cartas
- **Limite máximo**: `floor(40 / número_de_jogadores_vivos)` — o total distribuído não pode ultrapassar as 40 cartas do baralho
- Ao atingir o máximo, o número de cartas por jogador permanece fixo nesse valor pelo resto do jogo

---

### Processo de Uma Rodada

**Etapa 1 — Distribuição:**
- Um jogador embaralha e distribui as cartas
- Após a distribuição, uma carta extra é virada (a vira) para determinar a manilha
- Cada jogador olha suas cartas em segredo

**Etapa 2 — Palpites:**
- O jogador seguinte ao que embaralhou (em ordem horária) faz o palpite primeiro
- Cada jogador declara quantas **jogadas** pretende ganhar naquela rodada
- O palpite é um número inteiro de 0 até `cardsPerPlayer`
- Os palpites são feitos em sequência; cada jogador conhece os palpites anteriores

**Etapa 3 — Jogo das Cartas:**
- O mesmo jogador que abriu os palpites joga a primeira carta
- Cada jogador joga uma carta por vez, em sentido horário
- A carta mais forte da rodada vence a **jogada** (trick)
- Regras de vitória por jogada:
  - Manilha vence qualquer carta não-manilha
  - Entre manilhas: vence a de naipe mais forte
  - Entre cartas não-manilha: vence a de maior valor
  - Empate entre não-manilhas: "melou" — ninguém vence a jogada
- O vencedor da jogada começa a próxima jogada
- Em caso de "melou": o mesmo jogador que iniciou a jogada continua

**Etapa 4 — Apuração:**
- Ao final da rodada (todas as cartas jogadas), conta-se quantas jogadas cada um ganhou
- Jogadores que **acertaram o palpite** não perdem vidas
- Jogadores que **erraram** perdem vidas igual à diferença: `|palpite - jogadas_ganhas|`

---

### Vidas

- Todo jogador começa com **5 vidas**
- Perde vidas ao errar o palpite: `vidas_perdidas = |palpite - jogadas_ganhas|`
- Ao chegar a **0 ou menos vidas**: jogador é eliminado (`alive = false`)
- Eliminados não participam das rodadas seguintes

---

### Condição de Vitória

- **Vencedor único**: último jogador vivo
- **Empate**: se múltiplos jogadores forem eliminados na mesma rodada, inicia-se **morte súbita**

### Morte Súbita (Empate de Eliminação)

Quando dois ou mais jogadores chegam a 0 vidas na mesma rodada:
- Os jogadores empatados jogam rodadas extras entre si
- Regras idênticas às rodadas normais, iniciando com 1 carta
- Ao fim de uma rodada extra, o jogador que perder **mais** vidas que o(s) outro(s) é eliminado
- Se empatarem novamente (mesma perda): nova rodada extra automática
- Quem sobrar é declarado vencedor

---

### Ordem dos Jogadores

- A ordem na mesa é fixa e estabelecida no início do jogo
- O papel de **dealer** (quem embaralha) passa para o próximo jogador vivo a cada rodada
- O **primeiro a dar palpite** é o jogador imediatamente após o dealer (sentido horário)

---

## Regras da Aplicação — Modo 1 (Suporte Geral)

### Configuração

- Mínimo de 2 jogadores para iniciar
- Jogadores cadastrados com nome único (case-insensitive)
- Ordem dos jogadores definida no cadastro e representa a ordem real na mesa
- O dealer da primeira rodada é sorteado aleatoriamente ao iniciar

### Ciclo de Rodada

1. Usuário informa a **manilha** (valor + naipe)
2. Usuário registra o **palpite de cada jogador** (na ordem de palpite)
   - Valor default: palpite da rodada anterior (0 na 1ª rodada)
3. Botão **"Iniciar Rodada"** → cronômetro inicia, palpites ficam visíveis
4. Jogadores jogam as cartas fisicamente (o app não controla isso)
5. Botão **"Finalizar Rodada"** → usuário registra quantas jogadas cada um fez
6. Modal de confirmação exibe penalidades; ao confirmar, vidas são atualizadas

### Controles de Vida

- Verde: `lives > 3` | Amarelo: `lives === 3` | Vermelho: `lives <= 2`
- Eliminados ficam acinzentados/riscados no painel

### Histórico

- Todas as rodadas ficam registradas no histórico colapsável
- Histórico mostra: rodada, manilha, cartas, palpite/fez/perdas por jogador

### Persistência

- Estado completo salvo no `localStorage` a cada ação
- Ao reabrir: retoma exatamente onde parou
- "Revanche" reinicia com os mesmos jogadores (vidas = 5)

---

## Regras da Aplicação — Modo 2 (Painel Individual)

### Independência

- Modo 2 não acessa nem depende de nenhum dado do Modo 1
- Estado salvo isoladamente em chave separada no `localStorage`

### Configuração

- Usuário informa seu nome e o número de jogadores na mesa
- Não há cadastro de outros jogadores — apenas contagem

### Ciclo de Rodada

1. Usuário informa a **manilha** (valor + naipe) antes de iniciar
2. Usuário informa suas **cartas na mão** (grade de valores; naipe só para manilha)
3. Botão **"Iniciar Rodada"** habilita após manilha + ≥1 carta na mão
4. Durante a rodada:
   - **Bloco A**: marca cartas jogadas por outros (grade de valores + "?"); naipe só para manilha
   - **Bloco B**: toca suas próprias cartas para marcá-las como jogadas (toggle)
5. Botão **"Finalizar Rodada"** disponível a qualquer momento — sem validação obrigatória

### Indicadores de Disponibilidade (Bloco A)

- A grade do Bloco A exibe para cada valor quantas cartas daquele valor ainda podem estar nas mãos de outros jogadores
- `possível(V) = 4 − handCards.filter(c=>c.value===V).length − otherPlayedCards.filter(c=>c.value===V && c.value!=='unknown').length`
- Para o valor da manilha: badge mostra total possível (0–4); selector de naipe mostra 0 ou 1 por naipe
- `possível = 0` → botão do valor acinzentado (mas tocável)
- Cartas `unknown` do Bloco A não afetam o cálculo

### Sem Histórico

- O Modo 2 não mantém histórico de rodadas anteriores
- Ao finalizar a rodada, apenas `round`, `numPlayers` e `playerName` são preservados

### Cartas Desconhecidas

- Botão "?" no Bloco A permite registrar que uma carta foi jogada sem informar o valor
- Não bloqueia o fluxo; contador de cartas na mesa decrementa normalmente
- Cartas "?" **não afetam** o cálculo de disponibilidade (valor desconhecido)

---

## Telas / Componentes Principais

```
src/
├── components/
│   ├── CardSelector.tsx        # Seletor de carta (valor + naipe)
│   ├── CardDisplay.tsx         # Exibe uma carta visualmente
│   ├── LivesIndicator.tsx      # Indicador de vidas com cor
│   ├── PlayerCard.tsx          # Card de jogador no painel geral
│   ├── BidInput.tsx            # Stepper de palpite
│   ├── Timer.tsx               # Cronômetro informativo
│   ├── RoundHistoryTable.tsx   # Tabela colapsável de histórico
│   ├── ConfirmResultModal.tsx  # Modal de confirmação de resultado
│   ├── HandAnalysis.tsx        # Análise de cartas do jogador individual (ranking posicional)
│   ├── OtherCardsBlock.tsx    # Bloco A: marcação de cartas de outros jogadores
│   └── MyHandBlock.tsx        # Bloco B: cartas da mão tocáveis
├── pages/
│   ├── HomePage.tsx
│   ├── SetupPage.tsx
│   ├── GamePage.tsx
│   ├── PlayerPage.tsx
│   └── WinnerPage.tsx
├── store/
│   ├── gameStore.ts            # Zustand store persistido (GameState)
│   └── playerHandStore.ts      # Zustand store persistido (PlayerHandState)
├── utils/
│   ├── cardUtils.ts            # Ordenação, comparação, cálculo manilha, countRemainingCards()
│   └── gameUtils.ts            # Cálculo de vidas, cartas por rodada, etc.
└── hooks/
    ├── useTimer.ts             # Hook do cronômetro
    └── useGame.ts              # Hook de conveniência sobre gameStore
```

---

## Navegação Mobile

- Layout responsivo, `max-width: 480px` centrado no desktop
- Tela `/` exibe dois cards/botões grandes para seleção de modo — sem bottom nav nesta tela

**Modo 1 — Suporte Geral:** bottom navigation bar com:
  - 🃏 **Partida** → `/game`
  - 🔀 **Trocar Modo** → volta para `/`
  - Visível apenas durante a partida (phases: `bid`, `playing`, `result`)

**Modo 2 — Painel Individual:** interface de página única (`/player`), sem bottom nav adicional
  - Botão "← Trocar Modo" no topo → volta para `/`

Os dois modos não têm navegação cruzada entre si.

---

## Persistência

- `gameStore` → chave `fodinha-game` no `localStorage`
- `playerHandStore` → chave `fodinha-hand` no `localStorage`
- Ao iniciar nova partida: limpa ambas as chaves
- Ao clicar "Finalizar Rodada" no Modo 2: `handCards`, `otherPlayedCards` e `manilha` limpos; `round` incrementado; `playerName` e `numPlayers` mantidos; sem histórico salvo
- Ao reabrir o app: Zustand reidrata o estado automaticamente

---

## Tratamento de Edge Cases

| Situação | Comportamento |
|---|---|
| Empate de jogadas (cartas iguais, não manilha) | App registra normalmente; "melou" é informado oralmente |
| Jogador fica com 0 vidas exatas | `alive = false`, removido das próximas rodadas |
| Apenas 1 jogador restante | Jogo encerrado imediatamente com esse jogador como vencedor |
| **Múltiplos jogadores chegam a 0 vidas na mesma rodada** | `phase = 'tiebreak'`: modal pergunta "Declarar Empate" ou "Rodada Extra"; rodadas extras continuam até que um perca mais que o outro |
| Rodadas extras de morte súbita sem vencedor | Nova rodada extra iniciada automaticamente sem nova pergunta |
| Limite de cartas atingido | `cardsPerPlayer` é fixado no máximo calculado |
| App fechado durante partida | Estado restaurado ao reabrir (localStorage) |
| App fechado durante morte súbita | Estado `tiebreak` restaurado; rodada extra em andamento retomada normalmente |
| Troca de rodada no Modo 2 (botão "Próxima Rodada") | `handCards`, `otherPlayedCards` e `manilha` limpos; `round++`; `cardsPerPlayer` recalculado; `playerName` e `numPlayers` mantidos |
| Ajuste manual de `cardsPerPlayer` no Modo 2 | Valor manual prevalece para aquela rodada; próxima rodada retoma cálculo automático |
| Carta com valor = manilha adicionada à mão sem naipe | App bloqueia e exige seleção de naipe antes de confirmar |
| Duas cartas de mesmo valor comum na mão (ex: dois "7") | Permitido — exibidas identicamente no Bloco B; tocar marca a primeira instância não-jogada |
| Tocar carta comum duplicada já parcialmente jogada | Marca a próxima instância `played = false`; se todas jogadas, toggle desfaz a última |
| Carta com valor = manilha marcada no Bloco A sem naipe | Selector de naipe aparece inline antes de registrar |
| Jogador não lembrou qual carta foi jogada (Bloco A) | Botão "?" registra `value: 'unknown'` sem bloquear; contador decrementa normalmente |
| Remoção de carta no Bloco A | Botão "×" em cada item da lista remove o registro; contador incrementa de volta |
| Desmarcação de carta no Bloco B | Segundo toque na carta jogada reverte `played = false`; contador incrementa de volta; sempre permitido |
| Total de cartas jogadas atinge limite máximo | Grade do Bloco A (incluindo "?") desabilitada; Bloco B desabilita novos toques em não-jogadas; desfazer continua funcionando |

---

## Tarefas de Implementação

- [ ] **SPEC-001** Inicializar projeto Vite + React + TypeScript + Tailwind + vite-plugin-pwa
- [ ] **SPEC-002** Configurar Zustand com middleware `persist` para `gameStore` e `playerHandStore` (isolados)
- [ ] **SPEC-003** Implementar `cardUtils.ts` (ordenação, comparação, cálculo de manilha, ranking posicional) com testes
- [ ] **SPEC-004** Implementar `gameUtils.ts` (cálculo de vidas, cartas por rodada, morte súbita) com testes
- [ ] **SPEC-005** Implementar componente `CardSelector` (valor + naipe) com testes
- [ ] **SPEC-006** Implementar tela `/` — seleção de modo com badges de sessão ativa e modal "Continuar/Nova"
- [ ] **SPEC-007** Implementar tela `/game/setup` — cadastro, validação de nome duplicado e reordenação
- [ ] **SPEC-008** Implementar painel de vidas (`LivesIndicator`, `PlayerCard`) com cores corretas
- [ ] **SPEC-009** Implementar fluxo de palpites (`phase: 'bid'`) — seleção de manilha + palpites
- [ ] **SPEC-010** Implementar fluxo de rodada em jogo (`phase: 'playing'`) — cronômetro + botão finalizar
- [ ] **SPEC-011** Implementar fluxo de resultado (`phase: 'result'`) — marcação + modal de confirmação
- [ ] **SPEC-012** Implementar morte súbita (`phase: 'tiebreak'`) — modal empate/rodada extra + loop automático
- [ ] **SPEC-013** Implementar histórico colapsável (`RoundHistoryTable`)
- [ ] **SPEC-014** Implementar tela `/game/winner` — vencedor(es), resumo, revanche e voltar ao início
- [ ] **SPEC-015** Implementar tela `/player` — setup (manilha + grade de mão), Bloco A (grade de valores + "?" + lista com "×" + limite), Bloco B (cartas tocáveis com toggle), contador derivado, análise com ranking posicional
- [ ] **SPEC-016** Configurar PWA manifest e service worker; testar instalação mobile
- [ ] **SPEC-017** Testes E2E (Playwright) — fluxo completo Modo 1 e fluxo completo Modo 2
