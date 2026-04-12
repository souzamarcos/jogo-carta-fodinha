# Cenários de Teste E2E — jogo-carta-fodinha

> Este documento mapeia todos os cenários de teste end-to-end do projeto.
> Cada cenário deve estar vinculado a uma ou mais regras de negócio.

---

## Cenários

### E2E-001: Iniciar nova partida com 3 jogadores

- **Regras relacionadas**: RN-001, RN-005, RN-012
- **Pré-condições**: Nenhuma partida salva no localStorage.
- **Passos**:
  1. Abrir o app → tela inicial
  2. Clicar em "Nova Partida"
  3. Adicionar jogadores: "Alice", "Bob", "Carol"
  4. Verificar que a ordem na lista respeita a posição 1, 2, 3
  5. Clicar em "Começar"
- **Resultado esperado**: Painel da partida exibe 3 jogadores, todos com 5 vidas (verde), rodada 1, 1 carta por jogador.

---

### E2E-002: Bloquear início com menos de 2 jogadores

- **Regras relacionadas**: RN-012
- **Pré-condições**: Nenhuma partida salva.
- **Passos**:
  1. Ir para `/setup`
  2. Adicionar apenas 1 jogador
  3. Verificar estado do botão "Começar"
- **Resultado esperado**: Botão "Começar" está desabilitado e não permite navegação.

---

### E2E-003: Fluxo completo de uma rodada (palpites → jogo → resultado)

- **Regras relacionadas**: RN-002, RN-005, RN-007, RN-008, RN-009, RN-014
- **Pré-condições**: Partida iniciada com 2 jogadores (Alice, Bob), rodada 1.
- **Passos**:
  1. Em `/game`, selecionar manilha: valor `5`, naipe `♦️ Ouros`
  2. Definir palpite de Alice: `1`, palpite de Bob: `0`
  3. Clicar em "Iniciar Rodada"
  4. Verificar que manilha fica em destaque e cronômetro inicia
  5. Clicar em "Finalizar Rodada"
  6. Marcar Alice fez `0`, Bob fez `1`
  7. Clicar "Confirmar" → verificar modal com penalidades: Alice −1, Bob −1
  8. Confirmar modal
- **Resultado esperado**: Alice e Bob têm 4 vidas; rodada avança para 2 com 2 cartas por jogador.

---

### E2E-004: Jogador acerta palpite e não perde vidas

- **Regras relacionadas**: RN-002
- **Pré-condições**: Partida em andamento, rodada qualquer.
- **Passos**:
  1. Definir palpite de Alice: `2`
  2. Iniciar rodada, finalizar rodada
  3. Marcar Alice fez `2`
  4. Confirmar resultado
- **Resultado esperado**: Vidas de Alice permanecem inalteradas.

---

### E2E-005: Eliminação de jogador quando vidas chegam a zero

- **Regras relacionadas**: RN-002, RN-003
- **Pré-condições**: Alice com 1 vida restante, partida com 3 jogadores.
- **Passos**:
  1. Na fase de resultado, marcar que Alice perdeu 1 vida (|palpite - fez| = 1)
  2. Confirmar resultado
- **Resultado esperado**: Alice aparece como eliminada (cinza/riscada), não participa da próxima rodada. Contador de jogadores vivos cai para 2.

---

### E2E-006: Encerramento do jogo e exibição do vencedor

- **Regras relacionadas**: RN-003, RN-004
- **Pré-condições**: Partida com 2 jogadores; Bob tem 1 vida, Alice tem 3 vidas. Bob vai perder 1 vida nessa rodada.
- **Passos**:
  1. Na fase de resultado, marcar Bob com perda de 1 vida
  2. Confirmar resultado
- **Resultado esperado**: App navega para `/winner` e exibe "Alice venceu!" (único jogador vivo).

---

### E2E-007: Restauração de partida após fechar o app

- **Regras relacionadas**: RN-011
- **Pré-condições**: Partida em andamento na fase `playing` (rodada em progresso).
- **Passos**:
  1. Recarregar a página (simular fechamento e reabertura)
- **Resultado esperado**: App volta para a tela de partida com o mesmo estado (fase `playing`, mesmos jogadores, mesmas vidas, mesma manilha).

---

### E2E-008: Iniciar nova partida apaga a partida salva

- **Regras relacionadas**: RN-011
- **Pré-condições**: Partida em andamento salva no localStorage.
- **Passos**:
  1. Ir para a tela inicial
  2. Clicar "Nova Partida"
  3. Confirmar diálogo de sobreescrita (se houver)
  4. Cadastrar novos jogadores e começar
- **Resultado esperado**: Estado anterior é apagado; nova partida inicia do zero.

---

### E2E-009: Indicadores de cor das vidas

- **Regras relacionadas**: RN-013
- **Pré-condições**: Partida com 3 jogadores em estados diferentes de vida.
- **Passos**:
  1. Aplicar perdas até: Alice = 5 vidas, Bob = 3 vidas, Carol = 2 vidas
  2. Observar cores no painel
- **Resultado esperado**: Alice → verde; Bob → amarelo; Carol → vermelho.

---

### E2E-010: Limitar cartas ao máximo calculado

- **Regras relacionadas**: RN-005
- **Pré-condições**: Partida com 5 jogadores (máximo: `floor(40/5) = 8` cartas).
- **Passos**:
  1. Avançar o jogo até a rodada 9
- **Resultado esperado**: A rodada 9 ainda exibe 8 cartas por jogador (não 9), respeitando o limite máximo.

---

### E2E-011: Painel individual do jogador — selecionar cartas na mão

- **Regras relacionadas**: RN-005, RN-007, RN-008
- **Pré-condições**: Partida na fase `playing`, rodada 3 (3 cartas por jogador).
- **Passos**:
  1. Navegar para `/player`
  2. Selecionar jogador "Alice"
  3. Adicionar 3 cartas: `3♦️`, `5♠️`, manilha `6♣️`
  4. Observar ordenação e indicadores visuais
- **Resultado esperado**: Cartas exibidas da mais forte para mais fraca; manilha `6♣️` destacada com 🏆; `3♦️` exibida como mais forte das não-manilhas; contador de cartas na mesa inicializado corretamente.

---

### E2E-012: Contador de cartas restantes na mesa

- **Regras relacionadas**: RN-005
- **Pré-condições**: Painel individual aberto, rodada com 3 jogadores vivos e 2 cartas cada (total: 6 cartas na mesa).
- **Passos**:
  1. Verificar contador inicial: 6 cartas
  2. Clicar "−1" três vezes
- **Resultado esperado**: Contador exibe 3; barra de progresso mostra 50% jogado.

---

### E2E-013: Histórico colapsável de rodadas

- **Regras relacionadas**: RN-002
- **Pré-condições**: Pelo menos 2 rodadas completadas.
- **Passos**:
  1. No painel da partida, clicar em "📋 Histórico de Rodadas"
  2. Verificar tabela expandida
  3. Clicar novamente para colapsar
- **Resultado esperado**: Tabela exibe palpite/fez/perdas para cada jogador por rodada; ao colapsar, a tabela some sem quebrar o layout.

---

### E2E-014: Rotação do dealer entre rodadas

- **Regras relacionadas**: RN-010, RN-009
- **Pré-condições**: Partida com 3 jogadores; Alice é dealer na rodada 1.
- **Passos**:
  1. Completar rodada 1
  2. Observar informações de dealer na rodada 2
  3. Completar rodada 2
  4. Observar informações de dealer na rodada 3
- **Resultado esperado**: Dealer avança em ordem: Alice (R1) → Bob (R2) → Carol (R3) → Alice (R4).

---

### E2E-015: Instalação PWA e funcionamento offline

- **Regras relacionadas**: RN-015
- **Pré-condições**: App acessado via navegador mobile com suporte a PWA.
- **Passos**:
  1. Acessar o app via URL
  2. Aceitar prompt de instalação (ou "Adicionar à tela inicial")
  3. Ativar modo avião no dispositivo
  4. Abrir o app pela tela inicial do celular
  5. Iniciar uma nova partida e avançar uma rodada
- **Resultado esperado**: App carrega completamente sem conexão; partida funciona normalmente; dados persistem no localStorage.
