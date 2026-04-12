# Quickstart — Fodinha PWA

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Setup

```bash
# Clone and enter the repo
git clone <repo-url>
cd jogo-carta-fodinha

# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev
```

Open `http://localhost:5173` in the browser. For PWA testing, use a browser that supports service workers (Chrome/Edge recommended).

## Available Scripts

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run test         # Unit tests (Vitest, watch mode)
npm run test:run     # Unit tests (single run, CI mode)
npm run test:e2e     # E2E tests (Playwright, requires running dev or preview server)
npm run type-check   # TypeScript type checking without emit
npm run lint         # ESLint
```

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── CardGrid.tsx     # Reusable card value grid (Block A, setup Etapa 2)
│   ├── CardDisplay.tsx  # Single card visual representation
│   ├── LivesIndicator.tsx
│   ├── PlayerCard.tsx
│   ├── BidInput.tsx
│   ├── Timer.tsx
│   ├── RoundHistoryTable.tsx
│   ├── ConfirmResultModal.tsx
│   ├── OtherCardsBlock.tsx  # Mode 2 Block A
│   └── MyHandBlock.tsx      # Mode 2 Block B
├── pages/
│   ├── HomePage.tsx         # / — Mode selection
│   ├── GameSetupPage.tsx    # /game/setup
│   ├── GameRoundPage.tsx    # /game/round
│   ├── WinnerPage.tsx       # /game/winner
│   └── PlayerPage.tsx       # /player
├── store/
│   ├── gameStore.ts         # Zustand store — Mode 1 state (localStorage: fodinha-game)
│   └── playerHandStore.ts   # Zustand store — Mode 2 state (localStorage: fodinha-hand)
├── utils/
│   ├── cardUtils.ts         # Card ordering, manilha logic, availability counting
│   └── gameUtils.ts         # Lives calculation, round management helpers
├── hooks/
│   ├── useTimer.ts          # Elapsed time hook (mm:ss format)
│   └── useGame.ts           # Convenience selectors over gameStore
├── main.tsx
└── App.tsx                  # React Router setup
public/
├── manifest.webmanifest     # PWA manifest
└── icons/                   # PWA icons (192×192, 512×512, maskable)
```

## PWA Testing

To test PWA installability:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` in Chrome. DevTools → Application → Service Workers to verify registration. The install prompt should appear on mobile or via the address bar "Install" button.

## Key Architecture Decisions

- **No server**: all state in `localStorage` via Zustand persist
- **Two independent modes**: `gameStore` and `playerHandStore` never communicate
- **Offline-first**: Workbox cache-first for all static assets
- **TypeScript strict mode**: all types in `src/types.ts` (shared primitives) and store files
