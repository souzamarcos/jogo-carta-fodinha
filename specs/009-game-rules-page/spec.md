# Página de Regras do Jogo

**Feature ID**: SPEC-027
**Status**: Draft
**Created**: 2026-04-19
**Author**: Marcos Souza

---

## Overview

A tela inicial do aplicativo (onde o usuário escolhe entre Modo 1 e Modo 2) deve exibir um link clicável "Regras do jogo". Ao tocar nesse link, o usuário é levado a uma página dedicada que explica todas as regras, conceitos, nomenclaturas e fluxo do jogo Fodinha de forma clara para quem nunca jogou.

---

## Problem Statement

Atualmente, não há nenhuma documentação de regras acessível dentro do aplicativo. Jogadores novos precisam aprender as regras por fora (boca a boca ou fontes externas), criando barreiras de entrada e potencial confusão durante a partida.

Sem acesso rápido às regras no próprio app, o usuário não sabe:
- O que é a manilha e como ela é determinada a cada rodada
- Como funciona o sistema de vidas e a lógica de eliminação
- A hierarquia de cartas e o que significa "melou"
- O que são palpites e como são calculadas as perdas de vidas
- A diferença de propósito entre Modo 1 e Modo 2

---

## Goals

- Exibir um elemento clicável "Regras do jogo" na tela inicial, acessível antes de entrar em qualquer modo.
- Criar uma página de regras completa e didática que explique o jogo do zero para um iniciante absoluto.
- A página deve ser acessível a qualquer momento sem perda de estado (não interrompe uma partida ativa).
- Organizar o conteúdo em seções claras com hierarquia visual, facilitando leitura rápida e consulta pontual.

---

## Non-Goals

- Regras interativas ou animadas (ex.: simulação de jogada).
- Tradução para outros idiomas além do português brasileiro.
- Edição ou personalização das regras pelo usuário.
- Versão impressa ou exportação em PDF das regras.
- Tutorial passo a passo integrado ao fluxo de jogo.

---

## User Scenarios & Testing

### Scenario 1 — Link visível na tela inicial

**Given** o usuário está na tela inicial do aplicativo  
**When** a tela carrega  
**Then** o texto clicável "Regras do jogo" está visível na tela  
**And** o elemento está posicionado de forma que não interfira com os botões de Modo 1 e Modo 2

### Scenario 2 — Navegação para a página de regras

**Given** o usuário está na tela inicial  
**When** o usuário toca em "Regras do jogo"  
**Then** o aplicativo navega para a página de regras do jogo  
**And** não há perda de estado de nenhuma partida ativa

### Scenario 3 — Retorno à tela inicial

**Given** o usuário está na página de regras  
**When** o usuário aciona o controle de retorno (botão de voltar ou equivalente)  
**Then** o usuário retorna à tela inicial  
**And** qualquer sessão ativa (Modo 1 ou Modo 2) continua intacta

### Scenario 4 — Conteúdo das regras cobre os conceitos fundamentais

**Given** o usuário está na página de regras  
**When** o usuário lê a página  
**Then** consegue encontrar explicação para: objetivo do jogo, baralho utilizado, hierarquia de cartas, o que é a manilha, como determinar a manilha, o que é palpite, como funciona uma vaza, como são calculadas perdas de vidas, condição de vitória, e diferença entre Modo 1 e Modo 2

### Scenario 5 — Rolagem fluida em dispositivo móvel

**Given** o usuário está na página de regras em um smartphone  
**When** o usuário rola a página verticalmente  
**Then** a rolagem é fluida e todo o conteúdo é legível sem necessidade de zoom horizontal

### Scenario 6 — Acesso direto via URL

**Given** o usuário acessa diretamente a rota da página de regras (ex.: `/rules`)  
**When** a página carrega  
**Then** o conteúdo das regras é exibido corretamente  
**And** há um caminho de volta para a tela inicial

---

## Functional Requirements

### FR-001 — Link "Regras do jogo" na tela inicial

**Acceptance criteria**:
- O elemento "Regras do jogo" está presente e visível em `HomePage` sem necessidade de rolagem em dispositivos com tela de 375px de largura ou maior.
- O elemento é interativo (responde a toque/clique) e navega para a rota da página de regras.
- O elemento não cobre nem interfere com os botões de seleção de Modo 1 e Modo 2.
- O toque/clique é reconhecido com área mínima de 44×44 CSS pixels.

### FR-002 — Rota dedicada para a página de regras

**Acceptance criteria**:
- A página de regras está disponível em uma rota específica (ex.: `/rules`).
- A rota pode ser acessada diretamente por URL.
- Ao acessar diretamente, o usuário vê as regras sem redirecionamento forçado para outra tela.

### FR-003 — Navegação de retorno da página de regras

**Acceptance criteria**:
- A página de regras oferece um controle visível para voltar à tela inicial (botão "Voltar" ou equivalente).
- O botão de voltar do navegador/SO também funciona para retornar à tela anterior.
- Nenhum estado de jogo (Modo 1 ou Modo 2) é perdido ao navegar para as regras e voltar.

### FR-004 — Conteúdo obrigatório da página de regras

A página deve conter, no mínimo, as seguintes seções com explicações claras em linguagem acessível:

**Seções obrigatórias**:

1. **Objetivo do jogo** — ser o último jogador com vidas restantes.
2. **O baralho** — 40 cartas (deck padrão sem 8, 9 e 10); valores e naipes.
3. **Hierarquia de cartas** — ordem crescente de força: `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`; o que acontece quando duas cartas de mesmo valor se encontram ("melou").
4. **A manilha** — definição; como é determinada a partir da "vira" (carta virada); hierarquia entre os quatro naipes de manilha (Paus < Copas < Espadas < Ouros); por que a manilha é sempre a carta mais forte.
5. **Vidas (pontuação)** — cada jogador começa com 5 vidas; como as vidas são perdidas.
6. **Rodadas e distribuição de cartas** — na rodada N, cada jogador recebe N cartas; limite máximo baseado no número de jogadores.
7. **Palpite (bid)** — o que é; quando e como cada jogador faz seu palpite; ordem de palpites (primeiro bidder = jogador após o distribuidor).
8. **O distribuidor** — quem é; como rotaciona a cada rodada.
9. **Vaza (trick)** — o que é; como é vencida; o que acontece em empate.
10. **Cálculo de perda de vidas** — fórmula `|palpite − vazas feitas|`; exemplos com números concretos.
11. **Eliminação e vitória** — jogador eliminado quando vidas ≤ 0; vencedor = último sobrevivente; regra de desempate simultâneo.
12. **Modo 1 vs. Modo 2** — breve descrição de para que serve cada modo e quando usar.

**Acceptance criteria**:
- Cada seção listada acima está presente com conteúdo não vazio.
- O conteúdo usa exemplos concretos (ex.: "Se a vira é o 4, a manilha é o 5").
- Termos em destaque (manilha, vaza, palpite, vira, naipe) são introduzidos com definição na primeira ocorrência.

### FR-005 — Legibilidade e organização visual

**Acceptance criteria**:
- O conteúdo está dividido em seções com títulos distinguíveis visualmente.
- O texto de corpo tem tamanho legível em mobile sem zoom (mínimo 14px equivalente).
- Listas e tabelas (ex.: hierarquia de cartas) usam formatação visual clara.
- O layout é responsivo: não há overflow horizontal em telas de 320px–768px de largura.
- O esquema de cores é consistente com o restante do aplicativo (tema escuro slate).

---

## Success Criteria

| Critério | Meta |
|----------|------|
| Link "Regras do jogo" visível na tela inicial sem rolagem | 100% dos dispositivos com tela ≥ 375px |
| Navegação para página de regras sem perda de estado | 100% — nenhuma sessão ativa afetada |
| Todas as 12 seções de conteúdo presentes na página | 100% das seções obrigatórias |
| Página legível em dispositivos móveis (320px–768px) sem scroll horizontal | 100% das larguras no intervalo |
| Retorno à tela inicial funcional (botão na página e botão nativo) | 100% |

---

## Key Entities

| Entidade | Descrição |
|----------|-----------|
| Link "Regras do jogo" | Elemento interativo na `HomePage` que navega para a rota de regras |
| Página de Regras (`/rules`) | Nova rota/tela do aplicativo com conteúdo estático de regras do jogo |
| Seções de regras | Blocos de conteúdo temáticos dentro da página (objetivo, baralho, manilha, etc.) |

---

## Assumptions

1. O conteúdo das regras é estático — não há necessidade de busca de dados externos ou personalização por usuário.
2. A rota utilizada será `/rules`; se houver conflito com roteamento existente, uma rota alternativa equivalente é aceitável.
3. O link "Regras do jogo" será apresentado como texto sublinhado ou com estilo de link, posicionado abaixo dos botões de modo na tela inicial, para não criar ambiguidade com as ações principais.
4. A hierarquia de naipes para manilhas (Paus < Copas < Espadas < Ouros) e a ordem de valores de carta são extraídas diretamente das regras de negócio em `docs/business-rules.md`.
5. Não é necessário suporte a deep-link externo para a página de regras na versão inicial.

---

## Dependencies

- `HomePage.tsx`: Adicionar o elemento "Regras do jogo" com navegação para `/rules`.
- Novo componente/página `RulesPage.tsx` (ou equivalente) na estrutura de rotas existente.
- Router do projeto (React Router ou equivalente): registrar a nova rota `/rules`.
- `docs/business-rules.md`: fonte autoritativa para o conteúdo das regras.

---

## Out of Scope

- Tutorial interativo ou passo a passo dentro do fluxo de jogo.
- Regras com animações ou elementos multimídia.
- Busca ou filtro dentro da página de regras.
- Conteúdo de regras editável pelo usuário ou carregado de um servidor.
- Qualquer alteração na lógica de jogo existente (Modo 1 ou Modo 2).
