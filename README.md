# 🃏 Fodinha PWA

[![Deploy](https://github.com/souzamarcos/jogo-carta-fodinha/actions/workflows/deploy.yml/badge.svg)](https://github.com/souzamarcos/jogo-carta-fodinha/actions/workflows/deploy.yml)

Aplicativo PWA mobile-first para auxiliar partidas do jogo de cartas brasileiro **Fodinha**.

## Sobre o Jogo

Fodinha é um jogo de cartas com baralho de 40 cartas onde os jogadores apostam quantas vazas vão fazer em cada rodada. Quem errar o palpite perde vidas. Último sobrevivente vence.

## Funcionalidades

### 🎮 Modo 1 — Suporte Geral
Gerenciamento completo da partida:
- Registro de jogadores e controle de vidas (começam com 5)
- Seleção de manilha (virada) por rodada
- Registro de palpites e vazas
- Histórico de rodadas (colapsável)
- Cronômetro por rodada
- Tratamento de empate simultâneo (rodada extra ou declarar empate)
- Tela de vencedor com resumo e opção de revanche

### 🤚 Modo 2 — Painel Individual
Auxílio para acompanhar a própria mão:
- Configuração da manilha da rodada
- Registro das cartas da sua mão
- Indicadores de disponibilidade de cada carta
- Marcação de cartas jogadas pelos outros
- Análise das cartas restantes ordenadas por força
- Finalização automática avança para próxima rodada

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilização | Tailwind CSS v3 |
| Roteamento | React Router v6 |
| Estado | Zustand 4 + persist middleware |
| PWA | vite-plugin-pwa + Workbox |
| Testes unitários | Vitest + React Testing Library |
| Testes E2E | Playwright |
| Armazenamento | localStorage (offline-first) |

## Executar Localmente

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build (necessário para PWA e E2E)
npm run preview

# Testes unitários
npm run test

# Testes E2E (requer `npm run preview` em outro terminal ou usa webServer do Playwright)
npm run test:e2e
```

## Instalação como PWA

Após `npm run preview`:

- **Android (Chrome)**: Menu → "Adicionar à tela inicial"
- **iOS (Safari)**: Compartilhar → "Adicionar à Tela de Início"
- **Desktop (Chrome/Edge)**: Ícone de instalação na barra de endereço

## Documentação

- [Regras de Negócio](docs/business-rules.md) — RN-001 a RN-015
- [Cenários de Teste E2E](docs/e2e-test-scenarios.md) — E2E-001 a E2E-015
- [Especificação](spec.md) — Especificação completa do produto
- [Plano de Implementação](.specify/impl-plan.md) — 18 tarefas em 6 sprints

## Estrutura do Projeto

```
src/
├── components/       # Componentes compartilhados (CardGrid, BidInput, Timer, etc.)
├── pages/            # Páginas (Home, GameSetup, GameRound, Winner, Player)
├── store/            # Zustand stores (gameStore, playerHandStore)
├── utils/            # Utilitários (cardUtils, gameUtils)
└── types.ts          # Tipos TypeScript compartilhados

docs/
├── business-rules.md
└── e2e-test-scenarios.md

tests/e2e/            # Testes Playwright E2E
```

## Regras do Jogo (Resumo)

- Baralho de 40 cartas (sem 8, 9, 10)
- Ordem das cartas: 4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
- **Manilha**: carta seguinte à virada; a mais forte do baralho
- Ordem dos naipes da manilha: ♣ Paus < ♥ Copas < ♠ Espadas < ♦ Ouros
- Cada rodada o número de cartas por jogador avança (1, 2, 3, …)
- Limite máximo: `floor(40 / nJogadores)`
- Jogadores começam com 5 vidas; erro = `|palpite − vazas|` vidas perdidas
- Eliminado quando chega a 0 vidas
- Vence quem sobrar (ou declarado empate em eliminação simultânea)
