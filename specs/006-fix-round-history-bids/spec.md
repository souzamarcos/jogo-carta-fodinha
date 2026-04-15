# Fix Round History: Missing Bids and Tricks for Zero-Bid Players

**Feature ID**: SPEC-024
**Status**: Draft
**Created**: 2026-04-14
**Author**: Marcos Souza

---

## Overview

The round scoring history table ("Histórico") does not display bid (palpite) or tricks (acertos) data for players who kept the default bid of 0 in a given round. Those players appear as "–" in the history instead of showing their actual values (e.g. "0/0"). This makes the history unreliable for reviewing what happened in past rounds.

---

## Problem Statement

When a player keeps their bid at the default value of 0 (i.e. never taps + or − during the bids phase), their bid is never written to the round state. Because the tricks counter is seeded from the bids at round start, their tricks entry is also absent. The history entry for that round stores only the bids and tricks that were explicitly changed, leaving out all players who bid 0 by default.

The history table uses the condition `bids[playerId] !== undefined` to decide whether to show a cell. For players with no stored bid, the cell renders "–" — the same symbol used for eliminated players who genuinely did not participate. This makes it impossible to distinguish between "player bid 0 and lost 0 lives" and "player was already eliminated".

Losses are calculated correctly (using a fallback of 0 for missing bids/tricks) and ARE stored for all alive players in every round. Only the `bids` and `tricks` records are incomplete.

**Observed during manual testing (Rodada 1-3 with players Ana, Bob, Carlos):**
- Bob bid 0 every round and showed "–" in all rounds he played
- In Round 3, Ana also bid 0 and showed "–" alongside Bob, while Carlos (bid 3) showed correctly as "3/0 -3"
- The raw persisted state confirmed: `bids` and `tricks` only contained entries for Carlos; `losses` correctly contained Ana, Bob, and Carlos

---

## Goals

- Every player who was alive at the start of a round must have their bid, tricks made, and lives lost displayed in the history row for that round.
- A bid of 0 with 0 tricks made (no lives lost) must be shown as data (e.g. "0/0"), not as "–".
- The "–" symbol must be reserved exclusively for players who were eliminated before that round and did not participate.
- The fix must not change how losses are calculated (they are already correct).

---

## Non-Goals

- Changes to the history table's visual design or layout.
- Changes to how lives, bids, or tricks are calculated.
- Retroactive correction of already-saved game sessions (persisted history entries already in localStorage are not changed).
- Changes to Modo 2 (Painel Individual).

---

## User Scenarios & Testing

### Scenario 1 — Player bids 0 and gets 0 tricks: history shows data, not "–"

**Given** a player bids 0 (never taps + or −) during the bids phase
**And** the player gets 0 tricks during the round
**When** the round is confirmed and the history is expanded
**Then** that player's history cell shows "0/0" (or equivalent)
**And** no loss indicator is shown (0 lives lost)
**And** the cell does NOT show "–"

### Scenario 2 — Player bids 0 and gets 0 tricks: history distinguishes from eliminated

**Given** player A was eliminated in a previous round
**And** player B is alive and bids 0 this round
**When** the history is expanded
**Then** player A's cell shows "–" for this round (not a participant)
**And** player B's cell shows "0/0" (participated, bid 0, got 0)

### Scenario 3 — Player bids 0 and gets 1 trick: history shows loss

**Given** a player bids 0 but wins 1 trick during the round
**When** the round is confirmed and the history is expanded
**Then** that player's cell shows "0/1 -1" (bid 0, got 1, lost 1 life)

### Scenario 4 — Player bids non-zero and matches: history shows no loss

**Given** a player bids 2 and wins exactly 2 tricks
**When** the round is confirmed and the history is expanded
**Then** that player's cell shows "2/2" with no loss indicator

### Scenario 5 — All players bid 0: history shows all as data

**Given** all alive players keep their bids at 0 in a round
**When** the round is confirmed and the history is expanded
**Then** every alive player's cell shows "0/0" (or their actual tricks if different)
**And** no alive player's cell shows "–"

### Scenario 6 — History is consistent across all past rounds

**Given** a game has been played through several rounds with various bid combinations
**When** the history is expanded at any point during or after the game
**Then** every round row shows data for every player who was alive at the start of that round
**And** eliminated players show "–" for all rounds after their elimination
**And** the loss values shown in history match the lives each player lost that round

### Scenario 7 — Winner screen shows complete history

**Given** a game has finished (one player remaining)
**When** the history is viewed on the finished/winner screen
**Then** all rounds are displayed with complete bid, tricks, and loss data for all participants

---

## Functional Requirements

### FR-001 — All alive players' bids must be stored when a round is confirmed

When a round result is confirmed, the history entry's `bids` record must include an entry for every player who was alive at the start of that round, with a value of 0 for players who never explicitly changed their bid.

**Acceptance criteria**:
- For every alive player at round start, `history[n].bids[playerId]` is a number (not `undefined`).
- Players who never tapped + or − have their bid recorded as 0.
- Players who explicitly set a bid have their actual bid recorded unchanged.

### FR-002 — All alive players' tricks must be stored when a round is confirmed

When a round result is confirmed, the history entry's `tricks` record must include an entry for every player who was alive at the start of that round.

**Acceptance criteria**:
- For every alive player at round start, `history[n].tricks[playerId]` is a number (not `undefined`).
- Players who never changed their tricks counter have their tricks recorded as their bid value (since the tricks counter is seeded from the bid).
- Players who explicitly adjusted their tricks have the adjusted value recorded.

### FR-003 — History table must show "0/0" for alive players with zero bid and zero tricks

The history table must not display "–" for any player who was alive during a round, regardless of their bid or tricks value.

**Acceptance criteria**:
- The cell for an alive player in a given round shows `bid/tricks` (e.g. "0/0", "1/1", "2/0") and optionally a loss indicator.
- The "–" value is only shown for players who were eliminated before that round began.
- The condition for showing "–" must distinguish between "no data for this player" and "player was eliminated".

### FR-004 — Loss display is unaffected

The existing loss display (e.g. " -1", " -3") must continue to work correctly and not be changed by this fix.

**Acceptance criteria**:
- Loss indicators still appear in red for rounds where lives were lost.
- Loss values in history continue to match the lives lost shown in the "Confirmar Resultado" dialog.
- Players with 0 lives lost show no loss indicator (no change from current behavior).

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Alive players with bid=0 show "0/0" in history | 100% of such rounds — no "–" for participants |
| "–" only appears for eliminated players | 100% — no false negatives |
| Loss values in history match "Confirmar Resultado" dialog | 100% match across all rounds |
| Bids record completeness (all alive players present) | 100% of history entries |
| Tricks record completeness (all alive players present) | 100% of history entries |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| `currentRound.bids` | Record mapping player ID → bid value; currently only populated for players who explicitly tap +/−; must include all alive players |
| `currentRound.tricks` | Record mapping player ID → tricks made; seeded from `bids` at round start; inherits the same gap |
| `RoundHistory.bids` | The bids snapshot saved when confirming a result; must be complete |
| `RoundHistory.tricks` | The tricks snapshot saved when confirming a result; must be complete |
| `RoundHistory.losses` | The losses record; already complete (calculated with `?? 0` fallback) — no change needed |
| History table "–" cell | Currently shown when `bids[playerId] === undefined`; must only appear for eliminated players |

---

## Assumptions

1. The correct fix is applied at the data layer (ensuring `bids` and `tricks` are fully populated before saving to history), not at the display layer (masking undefined with a fallback).
2. Retroactive fixing of existing localStorage-persisted history entries is out of scope.
3. The "Confirmar Resultado" dialog already shows correct data (using `?? 0` fallbacks) — no changes needed there.
4. The `losses` record is already correct and must not be changed.

---

## Dependencies

- SPEC-022: Playing and result phases are merged; `confirmResult` is the single save point for history.

---

## Out of Scope

- Changing the visual format of history cells (e.g. adding icons, colors, or tooltips).
- Adding undo or edit functionality for past rounds.
- Fixing retroactively persisted history in localStorage.
- Any changes to Modo 2.
