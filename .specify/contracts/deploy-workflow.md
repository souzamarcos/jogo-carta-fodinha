# Deployment Workflow Contract — GitHub Pages

> Defines the expected behavior of the CI/CD pipeline for GitHub Pages deployment.
> Implementations must satisfy these contracts.

---

## Trigger

| Event | Condition | Result |
|---|---|---|
| `push` | branch == `main` | Full build + deploy pipeline runs |
| Any other event | — | No deployment |

---

## Build Job Contract

| Step | Input | Output | Failure behavior |
|---|---|---|---|
| Checkout | `main` HEAD | Repo files | Job fails; deploy skipped |
| Node setup | `node-version: 20`, npm cache | Node + cached `node_modules` | Job fails; deploy skipped |
| `npm ci` | `package-lock.json` | Exact dependency tree | Job fails; deploy skipped |
| `npm run build -- --base=/jogo-carta-fodinha/` | Source files | `dist/` directory | Job fails; deploy skipped |
| Upload artifact | `dist/` | Pages artifact (retained 1 day) | Job fails; deploy skipped |

**Invariant:** If any build step fails, the deploy job does not run and the live site is unchanged.

---

## Deploy Job Contract

| Condition | Action |
|---|---|
| Build job succeeded | Upload artifact deployed to GitHub Pages CDN |
| Build job failed | Deploy job skipped; previous deployment remains live |
| Deploy job fails | Error reported in workflow run; previous deployment may still be live |

**Environment:** `github-pages` (required by GitHub for the Pages deployment API)  
**Output:** `page_url` — the public URL of the deployed application

---

## Permissions Required

| Permission | Scope | Reason |
|---|---|---|
| `contents: read` | Repository | Checkout source code |
| `pages: write` | Repository | Upload Pages artifact and deploy |
| `id-token: write` | Workflow | OIDC token for trusted deployment |

---

## Concurrency Contract

```
group: pages
cancel-in-progress: false
```

- At most one Pages deployment runs at a time.
- A new push to `main` while a deployment is in progress **queues** behind the running deployment — it does not cancel it.
- This prevents race conditions where a fast second push would overwrite a nearly-complete first deployment with an older build.

---

## Public URL Contract

| Property | Value |
|---|---|
| Base URL | `https://souzamarcos.github.io/jogo-carta-fodinha/` |
| Stable between deployments | Yes — URL never changes |
| PWA `start_url` | `/jogo-carta-fodinha/` |
| PWA `scope` | `/jogo-carta-fodinha/` |
| Deep links | Not supported (known limitation; first load of sub-routes returns 404) |

---

## Repository Settings Prerequisite (one-time manual)

GitHub repository → Settings → Pages → Source → **GitHub Actions**

This must be set once before the first deployment. Subsequent deployments are fully automatic.

---

## Status Observable Behaviors

| Event | Observable |
|---|---|
| Successful deployment | Workflow run marked green; app updated at public URL within ~5 min |
| Failed build | Workflow run marked red; GitHub notification sent to owner; previous site unchanged |
| In-progress deployment | Workflow run shown as in-progress in Actions tab |
