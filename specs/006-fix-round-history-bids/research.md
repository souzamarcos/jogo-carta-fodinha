# Research — Fix Round History Missing Bids (SPEC-024)

**Status**: Complete — all decisions resolved via code analysis and live testing

---

## Bug Diagnosis

### Decision: Fix at the data layer (normalization), not the display layer

**Decision**: Normalize `bids` and `tricks` at round-start time so that all alive players always have an entry (defaulting to 0), rather than patching the UI to mask `undefined` with a fallback.

**Rationale**: Fixing in the store keeps the data contract clean and consistent with the existing `losses` behavior (which already uses `?? 0`). A display-layer patch would hide the bug without fixing the underlying data, and would make future use of `bids`/`tricks` in other contexts (stats, replays) still unreliable.

**Alternatives considered**:
1. Fix only in `RoundHistoryTable.tsx` — rejected: data stays broken, other consumers would still get sparse records.
2. Fix only in `confirmResult()` before writing history — feasible, but misses the window where the playing phase can observe `tricks` live. Better to normalize at `startRound()` so `tricks` in the playing phase is also correct.
3. Fix in `setBid()` to eagerly pre-fill all players' bids — rejected: `setBid` is called incrementally; knowing when all players are "done" would require extra coordination.

**Chosen**: Normalize in `startRound()` so both `bids` and `tricks` always cover all alive players before the round begins.

---

## Two-Point Fix

### Point 1 — `startRound()` in `gameStore.ts`

**Current code (lines 178–189)**:
```ts
startRound() {
  const { currentRound } = get();
  if (!currentRound) return;
  set({
    phase: 'playing',
    currentRound: {
      ...currentRound,
      startedAt: new Date().toISOString(),
      tricks: { ...currentRound.bids },
    },
  });
},
```

**Problem**: `currentRound.bids` only contains players who explicitly called `setBid()`. Players who kept bid=0 by default are absent.

**Fix**: Before setting state, build a normalized bids object that includes all alive players, then seed tricks from the normalized bids:
```ts
startRound() {
  const { currentRound, players } = get();
  if (!currentRound) return;
  const alive = alivePlayers(players);
  const normalizedBids: Record<string, number> = {};
  for (const p of alive) {
    normalizedBids[p.id] = currentRound.bids[p.id] ?? 0;
  }
  set({
    phase: 'playing',
    currentRound: {
      ...currentRound,
      startedAt: new Date().toISOString(),
      bids: normalizedBids,
      tricks: { ...normalizedBids },
    },
  });
},
```

### Point 2 — `RoundHistoryTable.tsx` display condition

**Current code (line 47)**:
```tsx
{h.bids[p.id] !== undefined ? (
  <span>...</span>
) : '–'}
```

**Problem**: After the fix, all alive players will have `bids[p.id]` defined, so the condition works correctly for new data. However, the condition must correctly show "–" for players who were eliminated *before* the round (not participants). The check should be based on whether the player participated, not whether the data exists.

**Fix**: Pass player alive status at round time, OR use the history's `losses` record (which already covers all alive players) as the participation signal:
- If `h.losses[p.id] !== undefined` → player participated in this round → show `bids/tricks`
- Else → player was eliminated → show "–"

This also handles any legacy data (old localStorage entries with sparse bids/tricks) correctly, since `losses` was always populated for all alive players.

---

## Test Strategy

### Unit tests (gameStore.test.ts additions)

1. **`startRound` — normalizes bids for all alive players**: Start a game with 3 players, set only player 1's bid explicitly (non-zero), call `startRound()`. Assert `currentRound.bids` contains entries for all 3 players, with player 2 and 3 having bid=0.

2. **`startRound` — tricks seeded from normalized bids**: After the above, assert `currentRound.tricks` matches `currentRound.bids` exactly (all 3 players present).

3. **`confirmResult` — history bids record complete**: Play a full round where one player keeps bid=0. Assert `history[0].bids` contains all 3 players.

4. **`confirmResult` — history tricks record complete**: Same as above, assert `history[0].tricks` contains all 3 players.

### Regression tests (RoundHistoryTable)

5. **Alive player with bid=0 shows "0/0" not "–"**: Render `RoundHistoryTable` with a history entry where player has bid=0 and tricks=0 (but `losses[playerId]=0`). Assert cell shows "0/0" not "–".

6. **Eliminated player shows "–"**: Render with a history entry where eliminated player's id is absent from `losses`. Assert cell shows "–".

---

## Decisions: No New Dependencies

No new packages, no schema changes (the `RoundHistory` type already declares `bids` and `tricks` as `Record<string, number>` — semantics are the same, just fully populated). No migration needed.
