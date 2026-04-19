# Research — SPEC-026: Adjust Player Count During Manilha Selection (Modo 2)

**Generated**: 2026-04-18
**Branch**: `claude/strange-napier-e018b9`

---

## Decision 1: Valid Range for numPlayers

**Decision**: 2–10 (inclusive).

**Rationale**: The `ConfigScreen` in `PlayerPage.tsx` uses `Math.max(2, n - 1)` for the decrease button and `Math.min(10, n + 1)` for the increase button. The same bounds must apply in `ManilhaSetupScreen` for consistency and to match the data constraints already established at session initialization.

**Alternatives considered**: Allowing the count to go to 1 (one player remaining). Rejected — the game does not make sense with a single player and the `cardsOnTable` formula (`numPlayers × cardsPerPlayer`) would produce incorrect results.

---

## Decision 2: When to Apply the Updated Count

**Decision**: Apply immediately when the user taps +/− on Etapa 1 (update `numPlayers` and recalculate `cardsPerPlayer` in one store action). Do NOT defer until manilha confirmation.

**Rationale**: `ManilhaSetupScreen` already shows `numPlayers` as part of the subtitle ("Rodada N · X jogadores"). Updating the store immediately keeps the display consistent and avoids a two-step commit. `HandSetupScreen` reads `cardsPerPlayer` directly from the store, so it will always see the correct value when it renders after manilha confirmation.

**Alternatives considered**: Defer the count update to the `setManilha()` action. Rejected — this would require passing `numPlayers` as a parameter to `setManilha()`, which changes the existing action contract unnecessarily.

---

## Decision 3: New Store Action vs. Direct State Mutation

**Decision**: Add a dedicated `updateNumPlayers(n: number): void` action to `playerHandStore`.

**Rationale**: Consistent with the store-actions contract pattern. The action clamps the input to `[2, 10]`, updates `numPlayers`, and immediately recalculates `cardsPerPlayer = Math.min(round, Math.floor(40 / n))`. This keeps all derivation logic inside the store, matching the existing pattern in `initSession()` and `finishRound()`.

**Alternatives considered**: Using local React `useState` in `ManilhaSetupScreen` and only committing to the store on confirm. Rejected — the count must persist across remounts (e.g., user navigates away and back), and the store is already persisted to localStorage.

---

## Decision 4: UI Pattern for the Control

**Decision**: Reuse the exact same button/counter pattern from `ConfigScreen`:
- Two `min-h-[44px] min-w-[44px]` buttons (`−` and `+`) with `bg-slate-700 rounded-xl`
- Central display as `text-2xl font-mono font-bold`

**Rationale**: The pattern is already proven (ConfigScreen passes all touch-target requirements) and reusing it avoids introducing a new component. The spec does not require a separate extracted component.

**Alternatives considered**: Extracting a `PlayerCountStepper` shared component. Deferred — the pattern is used in only two places; extraction would be premature (three-line duplication threshold not reached).

---

## Decision 5: persist Version Bump

**Decision**: No version bump required for `fodinha-hand` store.

**Rationale**: `numPlayers` is already in the persisted shape (included in `partialize`). Adding `updateNumPlayers` is an action-only change. The serialized state schema is unchanged, so old stored values rehydrate correctly without migration.

**Alternatives considered**: Bumping to version 2. Rejected — there is no schema change to migrate.

---

## Decision 6: Impact on finishRound()

**Decision**: `finishRound()` requires no changes.

**Rationale**: `finishRound()` already reads `numPlayers` from state (`const { round, numPlayers, playerName } = get()`) and recalculates `cardsPerPlayer` from it. If `updateNumPlayers` was called before `finishRound()`, the updated value is already in state and `finishRound()` will produce the correct `cardsPerPlayer` for the next round.

---

## Constitution Check

| Principle | Status |
|---|---|
| Cobertura de Testes Obrigatória | ✅ — New store action covered by unit tests; UI covered by updated E2E scenario |
| DRY | ✅ — Reuses existing button pattern; no premature extraction |
| README Completo | N/A — No new user-facing feature requiring README update |
| Regras de Negócio Documentadas | ✅ — New rule to be added to `docs/business-rules.md` |
| Cenários E2E Documentados | ✅ — New E2E scenario added to `docs/e2e-test-scenarios.md` |
