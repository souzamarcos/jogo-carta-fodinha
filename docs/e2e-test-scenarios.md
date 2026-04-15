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

### E2E-003: Fluxo completo de uma rodada (palpites → jogo unificado → próxima rodada)

- **Regras relacionadas**: RN-002, RN-005, RN-007, RN-008, RN-009, RN-014, RN-020, RN-021
- **Pré-condições**: Partida iniciada com 2 jogadores (Alice, Bob), rodada 1.
- **Passos**:
  1. Em `/game`, selecionar manilha: valor `5`, naipe `♦️ Ouros`
  2. Definir palpite de Alice: `1`, palpite de Bob: `0`
  3. Clicar em "Iniciar Rodada"
  4. Verificar que manilha fica em destaque, cronômetro inicia e controles de vazas estão ativos e pré-preenchidos (Alice = 1, Bob = 0)
  5. Alterar vazas: Alice = `0`, Bob = `1`
  6. Clicar em "Finalizar Rodada"
- **Resultado esperado**: Alice e Bob têm 4 vidas; rodada avança diretamente para 2 com 2 cartas por jogador. Nenhuma tela intermediária de resultado é exibida.

---

### E2E-004: Jogador acerta palpite e não perde vidas

- **Regras relacionadas**: RN-002, RN-021
- **Pré-condições**: Partida em andamento, rodada qualquer.
- **Passos**:
  1. Definir palpite de Alice: `2`
  2. Iniciar rodada (controle de vazas já pré-preenchido com `2`)
  3. Não alterar o valor de vazas de Alice
  4. Garantir que a soma das vazas é válida e clicar em "Finalizar Rodada"
- **Resultado esperado**: Vidas de Alice permanecem inalteradas.

---

### E2E-005: Eliminação de jogador quando vidas chegam a zero

- **Regras relacionadas**: RN-002, RN-003
- **Pré-condições**: Alice com 1 vida restante, partida com 3 jogadores.
- **Passos**:
  1. Na fase de jogo, ajustar as vazas de Alice de forma que |palpite - vazas| = 1
  2. Garantir soma válida e clicar em "Finalizar Rodada"
- **Resultado esperado**: Alice aparece como eliminada (cinza/riscada), não participa da próxima rodada. Contador de jogadores vivos cai para 2.

---

### E2E-006: Encerramento do jogo e exibição do vencedor

- **Regras relacionadas**: RN-003, RN-004
- **Pré-condições**: Partida com 2 jogadores; Bob tem 1 vida, Alice tem 3 vidas. Bob vai perder 1 vida nessa rodada.
- **Passos**:
  1. Na fase de jogo, ajustar as vazas de Bob de forma que |palpite - vazas| = 1
  2. Garantir soma válida e clicar em "Finalizar Rodada"
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

### E2E-016: Fluxo completo de seleção de manilha → distribuidor → palpites (Modo 1, Rodada 1)

- **Regras relacionadas**: RN-016, RN-017, RN-018
- **Pré-condições**: Partida iniciada no Modo 1 com 3 jogadores (Alice, Bob, Carol). Rodada 1.
- **Passos**:
  1. Verificar que a seção de palpites **não** está visível ao entrar na fase bid.
  2. Verificar que apenas o seletor de manilha é exibido.
  3. Selecionar a manilha "7".
  4. Verificar que a etapa de seleção do distribuidor é exibida.
  5. Verificar que "Distribui" aparece no nome de Alice (posição 0) e "Primeiro palpite" aparece no nome de Bob (posição 1).
  6. Verificar que **não** há opção de alterar o distribuidor na rodada 1.
  7. Clicar em "Confirmar".
  8. Verificar que a seção de palpites está agora visível com jogadores em ordem de cadastro (Alice, Bob, Carol).
  9. Verificar que os marcadores "Distribui" e "Primeiro palpite" permanecem visíveis.
- **Resultado esperado**: Fluxo passa pelas três etapas na ordem correta; marcadores visíveis; ordem de jogadores estável.

---

### E2E-017: Alteração manual do distribuidor na rodada 2+ (Modo 1)

- **Regras relacionadas**: RN-017, RN-018
- **Pré-condições**: Partida no Modo 1, rodada 2 atingida após completar a rodada 1.
- **Passos**:
  1. Selecionar manilha na rodada 2.
  2. Verificar que a etapa de seleção do distribuidor mostra opção de alteração.
  3. Tocar no nome de Carol (posição 2) para selecioná-la como distribuidora.
  4. Verificar que "Distribui" move para Carol e "Primeiro palpite" move para Alice (próximo na ordem circular após Carol).
  5. Clicar em "Confirmar".
  6. Verificar que os marcadores na seção de palpites e nas fases seguintes (jogo, resultado) refletem Carol como distribuidora.
- **Resultado esperado**: Alteração manual refletida em tempo real e persistida para as fases seguintes da rodada.

---

### E2E-018: Ordem estável de jogadores em todas as fases (Modo 1)

- **Regras relacionadas**: RN-019, RN-018
- **Pré-condições**: Partida no Modo 1 com 3 jogadores (Alice pos.0, Bob pos.1, Carol pos.2), rodada 2.
- **Passos**:
  1. Na etapa de palpites: verificar ordem Alice → Bob → Carol.
  2. Iniciar rodada (fase de jogo): verificar ordem Alice → Bob → Carol.
  3. Finalizar rodada (próxima rodada, fase palpite): verificar ordem Alice → Bob → Carol.
- **Resultado esperado**: A ordem dos jogadores nunca muda em nenhuma fase ou transição de rodada.

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

---

### E2E-019: Marcadores de distribuidor persistem em todas as fases da rodada (Modo 1)

- **Regras relacionadas**: RN-018, RN-019
- **Pré-condições**: Partida no Modo 1 com 2 jogadores (Alice pos.0, Bob pos.1), rodada 1.
- **Passos**:
  1. Selecionar manilha.
  2. Confirmar Alice como distribuidora.
  3. Na fase de palpites: verificar "Distribui" no nome de Alice e "Primeiro palpite" no nome de Bob.
  4. Clicar em "Iniciar Rodada".
  5. Na fase de jogo: verificar "Distribui" no nome de Alice e "Primeiro palpite" no nome de Bob.
- **Resultado esperado**: Os marcadores "Distribui" e "Primeiro palpite" aparecem no nome correto dos jogadores em ambas as fases sem interrupção.

---

### E2E-020: Vazas pré-preenchidas com palpites ao iniciar a rodada (Modo 1)

- **Regras relacionadas**: RN-020, RN-021
- **Pré-condições**: Partida no Modo 1 com 2 jogadores (Alice, Bob), palpites registrados: Alice = 1, Bob = 0.
- **Passos**:
  1. Clicar em "Iniciar Rodada".
  2. Na fase de jogo, verificar o valor dos controles de vazas de cada jogador.
- **Resultado esperado**: O controle de vazas de Alice mostra `1` e o de Bob mostra `0`; os palpites são exibidos como rótulo somente leitura (`palpite: 1` e `palpite: 0`).

---

### E2E-021: Validação do total de vazas antes de finalizar a rodada (Modo 1)

- **Regras relacionadas**: RN-020
- **Pré-condições**: Partida no Modo 1 com 2 jogadores, fase de jogo ativa, 1 carta por jogador.
- **Passos**:
  1. Alterar os controles de vazas de forma que a soma seja diferente de 1 (ex.: Alice = 0, Bob = 0).
  2. Clicar em "Finalizar Rodada".
  3. Verificar que uma mensagem de erro é exibida.
  4. Corrigir o total (ex.: Alice = 1, Bob = 0) e clicar novamente em "Finalizar Rodada".
- **Resultado esperado**: No passo 3, a mensagem "Total de vazas (0) ≠ cartas por jogador (1)" é visível e a partida não avança. No passo 4, a partida avança para a próxima rodada sem tela intermediária.

---

### E2E-022: Alteração do distribuidor na fase de palpites — rodada 1 (Modo 1)

- **Regras relacionadas**: RN-022, RN-017
- **Pré-condições**: Partida no Modo 1 com 2 jogadores (Alice pos.0, Bob pos.1), rodada 1, sub-fase de palpites (`bidSubPhase = 'bids'`).
- **Passos**:
  1. Selecionar manilha e confirmar distribuidor (Alice é selecionada automaticamente).
  2. Verificar que o botão "Editar distribuidor" está visível na rodada 1.
  3. Tocar em "Editar distribuidor".
  4. Selecionar Bob como distribuidor.
  5. Clicar em "Confirmar".
  6. Verificar que "Distribui" está no nome de Bob e "Primeiro palpite" está no nome de Alice.
  7. Verificar que os palpites já digitados foram preservados.
- **Resultado esperado**: A alteração do distribuidor é refletida imediatamente nos marcadores; a restrição da rodada 1 foi removida; os palpites não são perdidos.

---

### E2E-023: Alteração do distribuidor durante a fase de jogo (Modo 1)

- **Regras relacionadas**: RN-022, RN-018
- **Pré-condições**: Partida no Modo 1 com 2 jogadores, fase de jogo ativa (`phase = 'playing'`).
- **Passos**:
  1. Verificar que o botão "Alterar distribuidor" está visível na fase de jogo.
  2. Tocar em "Alterar distribuidor".
  3. Verificar que a lista de seleção do distribuidor aparece (texto "Quem distribui as cartas?").
  4. Verificar que o cronômetro continua rodando durante a seleção.
  5. Selecionar o segundo jogador como distribuidor.
  6. Clicar em "Confirmar".
  7. Verificar que a lista de jogadores retorna com os marcadores "Distribui" e "Primeiro palpite" atualizados.
  8. Verificar que os controles de entrada de vazas estão presentes com os valores anteriores intactos.
- **Resultado esperado**: A alteração do distribuidor é aplicada sem interromper a rodada; os dados da rodada são preservados.

---

### E2E-024: Rotação do distribuidor na rodada seguinte após alteração manual (Modo 1)

- **Regras relacionadas**: RN-010, RN-022
- **Pré-condições**: Partida no Modo 1 com 2 jogadores (Alice pos.0, Bob pos.1), rodada 1 na fase de jogo.
- **Passos**:
  1. Durante a fase de jogo da rodada 1, tocar em "Alterar distribuidor".
  2. Selecionar Bob como distribuidor e confirmar.
  3. Finalizar a rodada 1 via "Finalizar Rodada" com valores de vazas válidos.
  4. Na rodada 2, verificar quem é o distribuidor pré-selecionado na etapa de seleção do distribuidor.
- **Resultado esperado**: Na rodada 2, Alice é o distribuidor pré-selecionado (próximo jogador vivo após Bob na ordem circular), confirmando que a rotação deriva do distribuidor definido manualmente.

---

### E2E-025: Jogador com palpite 0 — histórico mostra "0/0", não "–" (Modo 1)

- **Regras relacionadas**: RN-023
- **Pré-condições**: Partida no Modo 1 com 3 jogadores (Alice, Bob, Carlos). Bob mantém o palpite padrão de 0 em todas as rodadas (não toca em + ou −).
- **Passos**:
  1. Iniciar partida com Alice, Bob e Carlos.
  2. Selecionar manilha e confirmar distribuidor.
  3. Alice define palpite = 1; Carlos define palpite = 1; Bob não toca nos controles (palpite = 0).
  4. Clicar em "Iniciar Rodada".
  5. Ajustar vazas (Alice = 1, Bob = 0, Carlos = 0) e clicar em "Finalizar Rodada".
  6. Na tela da rodada 2, expandir o "Histórico".
  7. Verificar a linha da rodada 1 para cada jogador.
- **Resultado esperado**: A célula de Bob na rodada 1 exibe "0/0" (palpite 0, vazas 0), não "–". A célula de Carlos exibe "1/0 -1". A célula de Alice exibe "1/1". O símbolo "–" não aparece para nenhum jogador que estava vivo durante a rodada 1.

---

### E2E-026: SEO — tags Open Graph e Twitter Card presentes na página inicial

- **Regras relacionadas**: RN-024
- **Pré-condições**: Aplicação carregada no browser (página `/`).
- **Passos**:
  1. Abrir o app na URL raiz.
  2. Inspecionar o `<head>` do documento.
  3. Verificar presença e valores das tags de metadados.
- **Resultado esperado**: As seguintes tags existem com os valores corretos: `<title>` = "Fodinha – Jogo de Cartas Online"; `og:title` = "Fodinha – Jogo de Cartas Online"; `og:description` não vazio; `og:image` com URL absoluta (`https://`); `og:locale` = "pt_BR"; `twitter:card` = "summary_large_image"; `link[rel=canonical]` com href contendo "jogo-carta-fodinha". As URLs de `og:image` e `twitter:image` são idênticas.

---

### E2E-027: `robots.txt` acessível e com conteúdo correto

- **Regras relacionadas**: RN-024
- **Pré-condições**: Aplicação publicada / servidor de preview em execução.
- **Passos**:
  1. Fazer GET em `/robots.txt`.
- **Resultado esperado**: Resposta HTTP 200. Corpo contém `User-agent: *`, `Allow: /` e referência ao `Sitemap:` apontando para `sitemap.xml`.

---

### E2E-028: `sitemap.xml` acessível e válido

- **Regras relacionadas**: RN-024
- **Pré-condições**: Aplicação publicada / servidor de preview em execução.
- **Passos**:
  1. Fazer GET em `/sitemap.xml`.
- **Resultado esperado**: Resposta HTTP 200. Corpo é XML válido contendo `<urlset` e ao menos uma entrada `<url>` com `<loc>` apontando para a URL canônica do GitHub Pages (`jogo-carta-fodinha`).

---

### E2E-029: Botão "Editar ordem" visível na fase de palpites (Modo 1)

- **Regras relacionadas**: RN-025
- **Pré-condições**: Partida no Modo 1 com 2+ jogadores, fase de palpites (sub-fase `bids`).
- **Passos**:
  1. Selecionar a manilha e confirmar o distribuidor para entrar na sub-fase de palpites.
  2. Verificar que o botão "Editar ordem" está visível ao lado de "Editar distribuidor".
- **Resultado esperado**: O botão "Editar ordem" é exibido junto ao botão "Editar distribuidor" na sub-fase de palpites.

---

### E2E-030: Reordenação de jogadores na fase de palpites atualiza "Primeiro palpite" (Modo 1)

- **Regras relacionadas**: RN-025, RN-017
- **Pré-condições**: Partida no Modo 1 com 3 jogadores (A pos.0, B pos.1, C pos.2), distribuidor = A, "Primeiro palpite" = B, sub-fase de palpites.
- **Passos**:
  1. Tocar em "Editar ordem".
  2. Mover o jogador C para a primeira posição (nova ordem: C, A, B).
  3. Clicar em "Confirmar".
  4. Verificar os marcadores "Distribui" e "Primeiro palpite" na lista de jogadores.
- **Resultado esperado**: "Distribui" permanece em A. "Primeiro palpite" muda para B (próximo jogador vivo após A na nova ordem C, A, B).

---

### E2E-031: Reordenação de jogadores durante a fase de jogo preserva cronômetro e vazas (Modo 1)

- **Regras relacionadas**: RN-025
- **Pré-condições**: Partida no Modo 1 com 2+ jogadores, fase de jogo (cronômetro rodando), entradas de vazas com valores não-zero.
- **Passos**:
  1. Verificar que o botão "Editar ordem" está visível ao lado de "Alterar distribuidor".
  2. Tocar em "Editar ordem".
  3. Mover um jogador para uma posição diferente.
  4. Clicar em "Confirmar".
  5. Verificar o cronômetro e os valores das entradas de vazas.
- **Resultado esperado**: O cronômetro continua rodando sem ser reiniciado. Os valores de vazas previamente inseridos estão preservados. O marcador "Primeiro palpite" é atualizado para refletir a nova ordem.

---

### E2E-032: Ordem dos jogadores persiste na rodada seguinte após alteração manual (Modo 1)

- **Regras relacionadas**: RN-025, RN-010
- **Pré-condições**: Partida no Modo 1 com 3 jogadores (A pos.0, B pos.1, C pos.2), sub-fase de palpites, distribuidor = A.
- **Passos**:
  1. Tocar em "Editar ordem" e reordenar para [C, A, B]. Confirmar.
  2. Completar a rodada normalmente (inserir palpites, iniciar, finalizar, confirmar resultado).
  3. Na rodada seguinte, verificar a ordem dos jogadores na lista e o distribuidor pré-selecionado.
- **Resultado esperado**: Na rodada seguinte, a lista exibe os jogadores na ordem [C, A, B]. O distribuidor pré-selecionado é B (próximo jogador vivo após A na ordem [C, A, B]).
