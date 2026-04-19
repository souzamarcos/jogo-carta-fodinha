# Research — Technology Decisions

> Phase 0 research resolving all technology decisions for the Fodinha PWA stack.
> Generated: 2026-04-12
> Last updated: 2026-04-19 (SPEC-027 additions)
> Each section: decision, rationale, key gotchas, alternatives considered.

---

## 10. SPEC-027 — Página de Regras do Jogo: Design Decisions

### 10.1 Route and Navigation Approach

**Decision:** Add `/rules` as a flat top-level route registered in `createBrowserRouter`. Navigate from `HomePage` using React Router's `<Link>` component.

- **Rationale:** The project already uses a flat route structure (`/`, `/game/setup`, `/game/round`, `/player`, etc.) with `createBrowserRouter`. Adding `/rules` at the same level is zero-config and consistent with the existing pattern. Using `<Link>` (not `<button onClick={() => navigate()}>`) gives the browser native navigation semantics (right-click → open in tab, browser back button works automatically).
- **Alternative considered:** Open rules in a slide-over drawer/modal overlay — rejected; a separate route is simpler, avoids z-index and scroll-trap complexity, and makes the page directly shareable via URL.
- **Alternative considered:** Nested route under a layout — rejected; the project has no layout wrapper and this feature doesn't require one.

### 10.2 Content Rendering Approach

**Decision:** Render rules content as JSX in the `RulesPage` component. No external Markdown file, no CMS, no fetch.

- **Rationale:** The content is static, authored in Portuguese, and unlikely to change frequently. Inline JSX avoids adding a Markdown parser dependency (e.g., `react-markdown`) and keeps the bundle smaller. The content is structured (headings, lists, tables) — Tailwind classes can style it directly without CSS overrides for a Markdown renderer.
- **Alternative considered:** `react-markdown` with a `.md` file — rejected; adds ~6 KB to bundle and requires a build-time loader or fetch. Overkill for a single static page.
- **Alternative considered:** `dangerouslySetInnerHTML` with a plain HTML string — rejected; bypasses React's safety guarantees for no benefit.

### 10.3 "Regras do jogo" Link Placement

**Decision:** Place the link below the two mode-selection buttons in `HomePage`, centered, styled as a text link (underlined, muted color matching the slate theme).

- **Rationale:** The two mode buttons are the primary CTA on the home screen. The rules link is secondary — placing it below avoids competing with the main flow. A text link (not a third card/button) visually de-emphasises it while remaining clearly actionable. Muted color (`text-slate-400 underline`) is consistent with secondary text in the existing UI.
- **Gotcha:** The link must have a tap area of at least 44×44 CSS px. Add `py-3 px-4` padding to satisfy this even though it's rendered as inline text.
- **Alternative considered:** A floating help icon (❓) — rejected; icon-only actions are less discoverable and require a tooltip.

### 10.4 Back Navigation

**Decision:** Provide an explicit "← Voltar" button at the top of `RulesPage` using `useNavigate(-1)`. Also rely on native browser/OS back gesture.

- **Rationale:** This is a PWA installed on mobile — users may not have a visible browser back button. An in-app back button is a usability requirement, not just a convenience. `useNavigate(-1)` is correct here because the user always arrives from `HomePage` (there is no deep-link use case in scope).
- **Alternative considered:** `<Link to="/">` hardcoded — also valid but `useNavigate(-1)` is more robust if the referrer ever changes.

### 10.5 Styling

**Decision:** Use Tailwind prose-like utility classes directly (no `@tailwindcss/typography` plugin) — `text-slate-300` for body text, `text-white font-semibold` for section headings, `bg-slate-700` for table rows, `bg-slate-800 rounded-xl` for section cards.

- **Rationale:** Adding the `@tailwindcss/typography` plugin just for one page is disproportionate. The existing Tailwind setup already has all the primitives needed. Hand-crafting the hierarchy with utilities keeps the design consistent with the rest of the app.
- **Alternative considered:** `@tailwindcss/typography` with `.prose` class — rejected; would require custom overrides to match the dark slate color scheme anyway.

### 10.6 Testing Approach

**Decision:** Vitest unit test verifies that all 12 required sections are present in the rendered output. Playwright E2E test verifies navigation from `HomePage` → `RulesPage` → back.

- **Rationale:** The content is static JSX — rendering tests are the right tool. An RTL test that renders `<RulesPage />` and asserts heading text is fast and reliable. A Playwright test verifies the full navigation flow including the link tap and back button.
- **Alternative considered:** Only Playwright — rejected; unit test catches a missing section earlier in the dev cycle without needing a running server.

---

## 9. SPEC-025 — SEO Meta Tags & Social Sharing: Design Decisions

### 9.1 Meta Tag Injection Approach

**Decision:** Edit `index.html` directly. No Vite plugin or build-time injection script.

- **Rationale:** The app is a fully static SPA with a single `index.html` entry point. All meta tags are static (no per-route dynamic content). Direct HTML editing is the simplest and most maintainable approach — no extra dependencies, no build complexity.
- **Alternative considered:** `vite-plugin-html` for template interpolation — rejected; unnecessary for static values. React Helmet / `react-helmet-async` — rejected; run-time DOM injection is invisible to crawlers that only read initial HTML and social-sharing link previewers that don't execute JS.

### 9.2 Canonical URL

**Decision:** Hard-code `https://souzamarcos.github.io/jogo-carta-fodinha/` as the canonical URL in `index.html`.

- **Rationale:** `vite.config.ts` already has `base: '/jogo-carta-fodinha/'` hardcoded. The GitHub Pages URL is stable and known. No env var indirection is needed.
- **Gotcha:** The `og:image` URL must also use the absolute production URL (not a relative path), because social media crawlers resolve it against the page URL — which may differ in dev vs prod if a relative path is used. Always use `https://souzamarcos.github.io/jogo-carta-fodinha/og-image.png`.

### 9.3 OG Image Strategy

**Decision:** Static `public/og-image.png` file (1200×630 px, ≤ 1 MB PNG). No dynamic image generation.

- **Rationale:** The game has a single identity — no per-route or per-game images are needed. A static asset copied to `dist/` by Vite's `public/` passthrough is zero-config and cache-friendly on the CDN.
- **Image content:** Name "Fodinha" + playing cards visual. Must be created as a design asset (Figma, Canva, or equivalent) — not generated by code.
- **Alternative considered:** Server-side OG image generation (e.g., `@vercel/og`) — rejected; no server component. SVG-to-PNG build script — overkill for a single static image.

### 9.4 `robots.txt` and `sitemap.xml` Delivery

**Decision:** Static files in `public/`. Vite copies everything in `public/` verbatim to `dist/` during build — no additional build step or plugin needed.

- **Rationale:** Zero-config approach. Files are at the root of the deployed site automatically.
- **`sitemap.xml` content:** Single `<url>` entry for the GitHub Pages root `https://souzamarcos.github.io/jogo-carta-fodinha/` with today's `<lastmod>` date.
- **`robots.txt` content:** `User-agent: *`, `Allow: /`, `Sitemap: https://souzamarcos.github.io/jogo-carta-fodinha/sitemap.xml`.
- **Gotcha:** GitHub Pages serves the app from a sub-path — `robots.txt` and `sitemap.xml` will be at `https://souzamarcos.github.io/jogo-carta-fodinha/robots.txt`. Google respects `robots.txt` at the root of the canonical URL's origin (`https://souzamarcos.github.io/`), not at sub-paths. However, there is no way to place files at the GitHub Pages origin root without owning the repo `souzamarcos.github.io`. This is a known limitation of GitHub Pages sub-path hosting. The `<link rel="canonical">` in HTML ensures correct indexing of the specific page.

### 9.5 Testing Approach

**Decision:** Playwright test verifies meta tags in the rendered HTML of the deployed (or built) app. No Vitest unit test needed for static HTML.

- **Rationale:** Meta tags live in `index.html` which is served as-is — no runtime logic. Playwright's `page.locator('meta[property="og:title"]')` directly verifies the built output. This also doubles as a regression guard against accidental tag removal.
- **Alternative considered:** Vitest test reading `index.html` as a string — valid but less realistic than a browser-based check. Chosen to use Playwright since the project already has it configured.

---

## 8. SPEC-022 — Merge Playing and Result Phases: Design Decisions

### 8.1 Pre-filling Tricks with Bids

**Decision:** Pre-fill `currentRound.tricks` with `currentRound.bids` values inside `startRound()`.

- **Rationale:** The most common outcome for each player is achieving exactly their bid (tricks = bid). Pre-filling means the user only needs to change values that differ from the bid — minimising edits in the average round. This is done in the store action so the pre-fill is persisted immediately and available on any re-render.
- **Implementation:** `tricks: { ...currentRound.bids }` in the `startRound()` setter.
- **Alternative considered:** Pre-fill in the UI only (local state) — rejected; the store's `setTricks` must be called to persist changes, and initialising from local state then syncing back is complexity without benefit.

### 8.2 Removing the Confirmation Modal

**Decision:** "Finalizar Rodada" calls `confirmResult()` directly after validation — no `ConfirmResultModal` shown.

- **Rationale:** The spec goal is to reduce friction and steps. The modal in `ResultPhase` was a safety check against the separate result-entry screen. With tricks inputs visible throughout the playing phase, the user has already reviewed values before clicking "Finalizar Rodada". Adding a modal reintroduces the friction the feature aims to eliminate.
- **Alternative considered:** Keep the modal — rejected per spec Scenario 6 ("no intermediate result-confirmation screen is shown") and the stated goal of speeding up site usage.

### 8.3 Inline Validation Error

**Decision:** Show an inline error message when total tricks ≠ cards per player; do not disable the button.

- **Rationale:** Keeping the button enabled allows the user to tap and get immediate, specific feedback (the mismatch message). Disabling the button provides no hint about what is wrong. This matches the existing pattern in `ResultPhase`.
- **Implementation:** `useState<string | null>(null)` for `tricksError`; cleared on any `setTricks` call; set on failed `handleFinish()`.

### 8.4 `endRound()` Action Retention

**Decision:** Keep `endRound()` in the store but remove its call from the UI.

- **Rationale:** Removing a public store action is a breaking change to the contracts file and could affect any future tiebreak/test code that reaches `phase === 'result'`. Since `endRound()` is a one-liner with no side effects beyond a phase transition, retaining it costs nothing.
- **`ResultPhase` component:** Removed from `GameRoundPage.tsx` rendering — the `phase === 'result'` branch is deleted. The `'result'` GamePhase value is retained in the type for potential future use.

### 8.5 Persist Version Bump

**Decision:** Bump Zustand persist version from 2 to 3.

- **Rationale:** `startRound()` now sets `tricks` on entering the playing phase. Old persisted state in `phase === 'playing'` will have an empty `tricks` record. The migration handles this gracefully: an empty `tricks` record means all inputs default to 0, which is safe — the user can still fill them in before confirming. No data loss.
- **Migration:** No-op for `fromVersion < 3` (empty `tricks` is valid; no destructive change to existing state shape).

---

## 7. SPEC-020 — Dealer Selection Flow: Design Decisions

### 7.1 Bid Sub-Phase Tracking

**Decision:** Add `bidSubPhase: 'manilha' | 'dealer' | 'bids'` to `RoundState`.

- **Rationale:** The bid phase now has three sequential steps. Storing sub-phase in `RoundState` keeps the state self-contained per round and makes the transitions explicit and testable. Storing it in `GameState` would work but mixes game-level and round-level concerns.
- **Transitions:**
  - `startGame()` / `startTiebreakRound()` / `confirmResult()` (next round) → `bidSubPhase = 'manilha'`
  - `setManilha(card)` when `phase === 'bid'` → `bidSubPhase = 'dealer'`
  - `confirmDealer(overrideDealerIndex?)` → `bidSubPhase = 'bids'`
- **Alternative considered:** A `dealerConfirmed: boolean` flag — rejected; doesn't capture the three-step flow. A `bidStep: number` — rejected; opaque to readers.

### 7.2 dealerIndex Semantics

**Decision:** Keep `dealerIndex` as an index into `alivePlayers()` (unchanged from current implementation).

- **Rationale:** This already provides correct circular skip-dead-player rotation. The UI reads `alivePlayers()[dealerIndex]` to get the dealer player object. No index recalculation needed.
- **First bidder derivation:** `alivePlayers()[(dealerIndex + 1) % alivePlayers().length]`
- **Manual override:** `confirmDealer(overrideDealerIndex?)` receives an index into `alivePlayers()`. If provided, it updates `GameState.dealerIndex` before transitioning to `'bids'`.
- **Alternative considered:** Index into all `players` — rejected; would require dead-player skipping logic in multiple places.

### 7.3 Player List Display Order

**Decision:** Always render player lists in registration order (`position` field, ascending). Remove the UI rotation that puts the first bidder at the top.

- **Rationale:** Stable rows reduce cognitive load — each player is always in the same visual row across all rounds and phases. Tooltip labels ("Distribui", "Primeiro palpite") communicate role without reordering.
- **Impact on GameRoundPage.tsx:** The `ordered` array computed via `alive.slice(firstBidderIndex)` is replaced by `alive` (already sorted by `position`).
- **Alternative considered:** Keep rotation, add tooltips anyway — rejected per spec FR-005 which explicitly requires stable order.

### 7.4 Tooltip Presentation

**Decision:** Use a persistent visible label (small badge/tag) below or beside the player name, not a hover-only tooltip.

- **Rationale:** This is a mobile PWA. Hover states don't exist on touch devices. The spec states the information "must be accessible" — a persistent label satisfies this for all device types.
- **Suggested rendering:** A small `<span>` with text `Distribui` or `Primeiro palpite` in a muted style (e.g., `text-xs text-slate-400`) appended to the player name row.
- **Alternative considered:** `title` attribute (hover tooltip) — rejected for mobile. A modal/popover on tap — rejected; adds interaction cost for read-only information.

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

---

## 6. GitHub Pages — Automated Deployment for a Vite PWA

**Decision:** Deploy via GitHub Actions using the official GitHub Pages action set (`actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages`). Pass `--base=/jogo-carta-fodinha/` as a Vite CLI flag during the CI build. No `gh-pages` branch.

### Deployment method

- **Official Actions approach (chosen):** Workflow uploads the `dist/` artifact and deploys it via the GitHub Pages CDN. No extra branch, no `gh-pages` npm package. Repository Settings → Pages → Source must be set to "GitHub Actions".
- **Alternative — `gh-pages` npm package:** Pushes built files to a `gh-pages` branch. Works but adds an orphan branch, requires a personal access token or `GITHUB_TOKEN` with write access, and is an unofficial pattern superseded by the Actions-native approach.

### Vite base path

- GitHub Pages serves the app from `https://souzamarcos.github.io/jogo-carta-fodinha/` (sub-path).
- Vite requires `base: '/jogo-carta-fodinha/'` so asset URLs in the built HTML include the sub-path.
- **Chosen approach:** Pass `--base=/jogo-carta-fodinha/` directly to the `vite build` CLI call in the workflow (`npm run build -- --base=/jogo-carta-fodinha/`). This keeps `vite.config.ts` unchanged for local dev (base defaults to `/`).
- **Alternative:** Use a `VITE_BASE_URL` env var and reference it in `vite.config.ts`. Adds env-var coupling; unnecessary when the base is always `/jogo-carta-fodinha/` in CI and `/` locally.

### PWA manifest with sub-path base

- When Vite builds with `--base=/jogo-carta-fodinha/`, `vite-plugin-pwa` automatically rewrites:
  - Icon `src` paths → `/jogo-carta-fodinha/icon-192.png` etc.
  - Injected asset URLs in the service worker precache manifest
- `start_url` in the PWA manifest must also reference the sub-path. Add `start_url: '/jogo-carta-fodinha/'` in the `vite-plugin-pwa` manifest config.
- **Gotcha:** If `start_url` stays as `'/'`, Chrome will fail the PWA installability check on GitHub Pages because `/` does not match the page's origin path. Update it before the CI deployment.

### SPA routing on GitHub Pages

- `createBrowserRouter` uses the HTML5 History API. GitHub Pages has no server-side redirect for unknown paths — a user who directly navigates to `/jogo-carta-fodinha/game/round` gets a 404.
- **Decision: accept limitation.** This is a PWA card game; users always open from the home screen shortcut or root URL, never via bookmarked deep links. The Workbox service worker handles navigation fallback for cached visits. No 404.html trick needed.
- **If deep links become a requirement later:** Add `public/404.html` containing the [SPA GitHub Pages redirect script](https://github.com/rafgraph/spa-github-pages) and a corresponding redirect script in `index.html`.

### Workflow permissions and environment

- The `deploy` job must have `pages: write` and `id-token: write` permissions — required by `actions/deploy-pages`.
- The `deploy` job must run in the `github-pages` named environment — GitHub enforces this for the Pages deployment API.
- Use `concurrency: { group: pages, cancel-in-progress: false }` so an in-progress deployment is never cancelled by a rapid second push.

### Build failure behavior

- GitHub Actions marks the workflow run as failed and notifies the repository owner via the default GitHub notification settings.
- The previously deployed version on GitHub Pages is unaffected — GitHub Pages keeps the last successful deployment live until explicitly replaced.

### Status visibility

- A workflow status badge added to `README.md` gives at-a-glance deploy health: `![Deploy](https://github.com/souzamarcos/jogo-carta-fodinha/actions/workflows/deploy.yml/badge.svg)`
