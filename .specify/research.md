# Research — Technology Decisions

> Phase 0 research resolving all technology decisions for the Fodinha PWA stack.
> Generated: 2026-04-12
> Each section: decision, rationale, key gotchas, alternatives considered.

---

## 1. vite-plugin-pwa — Offline-First PWA Configuration

**Decision:** Use `vite-plugin-pwa` with `generateSW` mode, Workbox `CacheFirst` strategy for all static assets, and `registerType: 'autoUpdate'`.

- **Workbox strategy:** `CacheFirst` for precached assets (JS, CSS, images, fonts) — serves from cache without hitting the network. Directly satisfies RN-015 (complete offline support) since the app has zero network calls in production.
- **Manifest requirements for installability:**
  - iOS (Safari Add to Home Screen): requires `display: standalone`, `apple-touch-icon` link tags in `<head>` (Safari ignores `icons` in manifest), `theme_color`, correct `viewport` meta.
  - Android (Chrome install prompt): requires `icons` array with 192×192 and 512×512 PNG, `display: standalone`, `start_url`, `name` + `short_name`.
  - Use `maskable` purpose on the 512×512 icon to pass Lighthouse PWA audit on Android.
- **Service worker registration:** `autoUpdate` + `skipWaiting: true` + `clientsClaim: true` — new SWs activate immediately without a manual page reload prompt. Correct for a game app with no backend.
- **Key configuration:**
  ```ts
  // vite.config.ts
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [],          // no network calls; precache only
      skipWaiting: true,
      clientsClaim: true,
    },
    manifest: {
      name: 'Fodinha',
      short_name: 'Fodinha',
      display: 'standalone',
      start_url: '/',
      theme_color: '#1e293b',
      background_color: '#0f172a',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  })
  ```
- **Gotcha:** During `vite dev`, the SW is intentionally disabled by default. Use `devOptions: { enabled: true }` only for PWA-specific debugging, not routine dev work. Also: `injectManifest` mode gives more control but requires a custom SW file — unnecessary for a purely static app.
- **Alternative considered:** Manual Workbox CLI — rejected; `vite-plugin-pwa` handles Vite's asset hashing and manifest injection automatically.

---

## 2. Zustand Persist Middleware — Complex Nested State

**Decision:** Use `zustand/middleware/persist` with explicit `partialize`, a `version` field, and a `migrate` function. Two separate stores with distinct `localStorage` keys: `fodinha-game` (Mode 1) and `fodinha-hand` (Mode 2).

- **Separate stores per mode:** Complete state isolation between Mode 1 and Mode 2 enforced at the storage level, not just component level. Each store has its own key and can evolve independently.
- **Nested state serialization:** `persist` uses `JSON.stringify` by default — safe for plain objects and arrays. Avoid `Date` objects, `Map`, `Set` in state; keep everything as primitives, plain objects, and arrays.
- **Migrations/versioning pattern:**
  ```ts
  persist(storeCreator, {
    name: 'fodinha-game',
    version: 1,
    migrate(persistedState: unknown, fromVersion: number) {
      const state = persistedState as Partial<GameState>;
      if (fromVersion < 1) {
        state.phase = state.phase ?? 'setup';
      }
      return state as GameState;
    },
    partialize: (state) => ({
      players: state.players,
      round: state.round,
      phase: state.phase,
      dealerIndex: state.dealerIndex,
      currentRound: state.currentRound,
      history: state.history,
      startedAt: state.startedAt,
      finishedAt: state.finishedAt,
    }),
  })
  ```
  Increment `version` whenever the shape of persisted state changes.
- **`partialize` is mandatory:** Never persist derived/computed values or transient UI state (e.g., modal open flags). This also prevents bloating `localStorage`.
- **Gotcha:** Zustand's `persist` middleware rehydrates asynchronously on first render. Gate components that read persisted state behind `useStore.persist.hasHydrated()` to avoid a flash of stale/empty state on first render.
- **Alternative considered:** `localforage` / IndexedDB — rejected; overkill for <5 KB of state, adds async complexity without benefit.

---

## 3. React Router v6 — Route Structure

**Decision:** Use `createBrowserRouter` with flat route definitions per page. No nested `<Outlet>` layouts — each page is self-contained.

- **Route structure:**
  ```ts
  const router = createBrowserRouter([
    { path: '/',             element: <HomePage /> },
    { path: '/game/setup',   element: <GameSetupPage /> },
    { path: '/game/round',   element: <GameRoundPage /> },
    { path: '/game/winner',  element: <WinnerPage /> },
    { path: '/player',       element: <PlayerPage /> },
  ]);
  ```
- **State isolation is at the Zustand layer** — pages read from `useGameStore` or `usePlayerHandStore` directly. No shared layout component holds React state.
- **Navigation guards:** Use simple `useEffect`-based redirects in each page component (e.g., redirect `/game/round` → `/` if `players.length === 0`). No loaders/actions needed — localStorage-only app.
- **PWA offline deep links:** Configure SW with `navigateFallback: 'index.html'` so all client-side routes resolve offline.
- **Gotcha:** Always use absolute paths (`/game/round`) — relative path resolution inside nested layouts is confusing. `useNavigate` must be called inside Router context; never call it from Zustand actions.
- **Alternative considered:** Layout route with `<Outlet>` — considered but rejected; no shared navigation chrome is needed that would justify the added nesting complexity.

---

## 4. Tailwind CSS — Mobile-First Touch-Optimized Card Game UI

**Decision:** Tailwind mobile-first utilities; `min-h-[44px] min-w-[44px]` on all tap targets; `touch-manipulation` on interactive elements; complete class strings only (no dynamic interpolation).

- **Touch targets:** `min-h-[44px] min-w-[44px]` on all button elements (Apple HIG / WCAG 2.5.5 minimum). Card grid uses `grid grid-cols-5 gap-2` with `aspect-square flex items-center justify-center` — naturally large tap areas.
- **Grid layouts:**
  ```tsx
  {/* Non-manilha row (9 values + "?") */}
  <div className="grid grid-cols-5 gap-2">
    {nonManilhaValues.map(v => <CardButton key={v} value={v} />)}
  </div>
  {/* Manilha row (4 suits) */}
  <div className="grid grid-cols-4 gap-2 mt-1">
    {suits.map(s => <ManilhaButton key={s} suit={s} />)}
  </div>
  ```
- **Badge overlays:** `relative` on card button + `absolute -top-1 -right-1` on badge `<span>`. Use `text-xs font-bold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center`.
- **Lives indicator color mapping:**
  ```ts
  function livesColor(lives: number, alive: boolean): string {
    if (!alive) return 'bg-gray-400 text-gray-200 line-through';
    if (lives > 3) return 'bg-green-500 text-white';
    if (lives === 3) return 'bg-yellow-400 text-black';
    return 'bg-red-500 text-white';
  }
  ```
- **Custom config tokens:**
  ```ts
  extend: {
    colors: {
      'lives-green': '#22c55e',
      'lives-yellow': '#eab308',
      'lives-red': '#ef4444',
    }
  }
  ```
- **Gotcha:** Tailwind purges dynamically assembled class strings at build time (e.g., `` `bg-${color}-500` `` is purged). Always use complete strings in conditionals. Add a `safelist` array in `tailwind.config.ts` for any classes built at runtime.
- **Alternative considered:** CSS Modules — rejected; no benefit for this scope. CSS-in-JS — rejected; runtime injection conflicts with PWA CSP and adds bundle weight.

---

## 5. Vitest + React Testing Library — Zustand Stores and UI Components

**Decision:** Vitest with `jsdom` environment; Zustand store reset in `beforeEach` via `setState(initialState)`; RTL for component tests with `renderWithProviders` wrapper; Playwright for E2E flows.

- **Store testing — reset between tests:**
  ```ts
  import { useGameStore } from '@/store/gameStore';
  import { initialGameState } from '@/store/gameStore';

  beforeEach(() => {
    useGameStore.setState(initialGameState);
    localStorage.clear();
  });

  it('eliminates player when lives reach 0', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    // ... test logic
  });
  ```
  `setState(initialState)` fully replaces state on the singleton store — no re-import or module reset needed.
- **`localStorage` in tests:** `environment: 'jsdom'` provides a working `localStorage`. No mock needed for basic tests. For migration tests, seed manually: `localStorage.setItem('fodinha-game', JSON.stringify({ state: oldShape, version: 0 }))`.
- **RTL component wrapper:**
  ```ts
  function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
  }
  ```
  Required for components using `useNavigate` or `useParams`.
- **Vitest config:**
  ```ts
  // vitest.config.ts
  export default defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],  // imports @testing-library/jest-dom
    },
  });
  ```
- **Gotchas:**
  - `jsdom` does not implement `matchMedia` or `IntersectionObserver` — mock them in `setup.ts` if needed.
  - `persist` middleware's async rehydration can cause flaky tests — either disable `persist` in test environment or `await` the rehydration promise before asserting.
- **Alternative considered:** Jest — rejected; requires manual ESM transform config for Vite projects. Vitest is native to Vite with zero extra config.
