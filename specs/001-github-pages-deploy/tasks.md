# Tasks — GitHub Pages Automatic Deployment (SPEC-019)

**Feature**: GitHub Pages Automatic Deployment  
**Spec**: [spec.md](./spec.md)  
**Plan reference**: `.specify/impl-plan.md` — Sprint 7 (SPEC-019)  
**Generated**: 2026-04-12  
**Total tasks**: 5  

---

## Summary

| Phase | Tasks | Status |
|---|---|---|
| Phase 1 — Setup | T001 | ✅ Done (implemented during /speckit-plan) |
| Phase 2 — Build correctness | T002 | ✅ Done |
| Phase 3 — Pipeline visibility [US1, US2] | T003 | ✅ Done |
| Phase 4 — Manual prerequisite [US1] | T004 | Requires manual action |
| Phase 5 — Validation | T005 | Pending merge to main |

---

## Phase 1 — Setup: CI/CD Workflow

**Goal**: Create the GitHub Actions workflow file that triggers on every push to `main` and deploys to GitHub Pages.

**Independent test criteria**: The workflow file is syntactically valid YAML and contains the required jobs, permissions, and environment configuration.

- [x] T001 Create `.github/workflows/deploy.yml` with `build` and `deploy` jobs, `pages` permissions, and `github-pages` environment

---

## Phase 2 — Build Correctness

**Goal**: Ensure the application builds correctly for the GitHub Pages sub-path URL so assets and PWA installability work.

**Independent test criteria**: Running `npm run build -- --base=/jogo-carta-fodinha/` locally produces a `dist/` with correct asset paths; PWA manifest contains the correct `start_url` and `scope`.

- [x] T002 [P] Update `vite.config.ts` PWA manifest: set `start_url: '/jogo-carta-fodinha/'` and `scope: '/jogo-carta-fodinha/'` so the PWA is installable at the GitHub Pages sub-path URL

---

## Phase 3 — Pipeline Visibility [US1] [US2]

**Goal**: Make the deployment status visible in the repository so maintainers can monitor at a glance (FR-005).

**Independent test criteria**: The badge renders in the README and links to the Actions workflow page.

- [x] T003 [P] [US1] Add deploy status badge to `README.md` below the project title: `[![Deploy](...badge.svg)](...workflow URL)`

---

## Phase 4 — Repository Prerequisite [US1]

**Goal**: Enable GitHub Pages to use GitHub Actions as the deployment source (one-time manual step — cannot be automated via workflow file).

**Independent test criteria**: Repository Settings → Pages shows "Source: GitHub Actions" and the environment `github-pages` is visible under Settings → Environments.

- [ ] T004 [US1] **MANUAL ACTION** — In GitHub repository settings: Settings → Pages → Source → select **GitHub Actions** (replaces branch-based source if previously set)

---

## Phase 5 — End-to-End Validation [US1] [US2] [US3]

**Goal**: Verify all success criteria from the spec are met after the first deployment.

**Independent test criteria**: All five success criteria from `spec.md` are verifiable.

- [ ] T005 [US1] Merge a commit to `main` and verify:
  - Workflow run completes in under 5 minutes (FR-001, SC-001)
  - Application loads at `https://souzamarcos.github.io/jogo-carta-fodinha/` (FR-002, FR-003)
  - PWA install prompt appears in Chrome (FR-003, SC-005)
  - Service worker is registered in DevTools → Application → Service Workers
  - Deploy badge in README shows green (FR-005, SC-002)

---

## Dependencies

```
T001 (workflow file) ──► T004 (manual GitHub Pages setting) ──► T005 (validation)
T002 (vite.config.ts) ──────────────────────────────────────────► T005
T003 (README badge) ────────────────────────────────────────────► T005
```

T001, T002, T003 are independent and were implemented in parallel during `/speckit-plan`.  
T004 must be done before T005 (first merge to main).  
T005 validates the full end-to-end behavior.

---

## Parallel Execution

T001, T002, and T003 have no mutual dependencies — they can be implemented simultaneously:

```
[T001: workflow file] ─┐
[T002: vite.config.ts] ─┼──► [T004: manual setting] ──► [T005: validate]
[T003: README badge] ──┘
```

---

## Implementation Strategy

**MVP** (minimum to have the pipeline working):
1. T001 — workflow file (done)
2. T002 — correct base path (done)
3. T004 — manual GitHub Pages setting

**Polish** (already done):
- T003 — status badge in README

**Validation**:
- T005 — triggered automatically on next push to `main`

---

## Known Limitations

- **SPA deep links**: Users navigating directly to a sub-route (e.g., `/jogo-carta-fodinha/game/round`) will get a 404 from GitHub Pages on first load. The Workbox service worker handles navigation fallback for subsequent cached visits. This is an accepted limitation (out of scope per spec).
- **T004 is manual**: GitHub does not expose a repository setting for Pages source via workflow files. This step must be done once by a repository owner with admin permissions.
