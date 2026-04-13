# GitHub Pages Automatic Deployment

**Feature ID**: SPEC-019
**Status**: Draft
**Created**: 2026-04-12
**Author**: Marcos Souza

---

## Overview

Configure the Fodinha PWA repository so that every merge to the `main` branch automatically builds the application and publishes it to GitHub Pages, making the latest version publicly accessible via a stable URL without any manual steps.

---

## Problem Statement

Currently, the application can only be run locally. There is no public URL where users can access the Fodinha PWA. Deploying a new version requires manual steps, which creates friction and risks inconsistency between the live version and what is in the repository.

---

## Goals

- Any merge to `main` results in an updated, publicly accessible application within minutes.
- The deployment process requires no manual intervention from maintainers.
- The live URL remains stable and does not change between releases.

---

## Non-Goals

- Staging or preview environments for pull requests (not in scope for this feature).
- Custom domain configuration (may be addressed separately).
- Rollback mechanisms beyond re-deploying a previous commit.

---

## User Scenarios & Testing

### Scenario 1 — Developer merges a change to main

**Given** a developer merges a pull request into the `main` branch  
**When** the merge is complete  
**Then** the deployment pipeline starts automatically, builds the application, and publishes the new version to the GitHub Pages URL  
**And** the updated application is accessible at the public URL within 5 minutes

### Scenario 2 — Visitor accesses the public URL

**Given** a user navigates to the GitHub Pages URL in a browser  
**When** the page loads  
**Then** the Fodinha PWA loads fully with all functionality working  
**And** the PWA can be installed on mobile and desktop devices

### Scenario 3 — Deployment fails due to build error

**Given** a commit on `main` introduces a build error  
**When** the deployment pipeline runs  
**Then** the pipeline reports the failure visibly (e.g., a status badge, GitHub Actions check failure)  
**And** the previously deployed version remains live and unchanged  
**And** the repository owner is notified of the failure

### Scenario 4 — First-time setup

**Given** the repository has no GitHub Pages configuration  
**When** the configuration is applied  
**Then** GitHub Pages is enabled for the repository  
**And** the deployment pipeline is in place and ready to trigger on the next merge to `main`

---

## Functional Requirements

### FR-001 — Automatic build on merge to main

The system must automatically trigger a build of the application whenever a commit is pushed or merged to the `main` branch.

**Acceptance criteria**:
- Every push to `main` triggers the build pipeline without manual action.
- The pipeline uses the same build command defined in the project (`npm run build`).

### FR-002 — Publish build output to GitHub Pages

Upon a successful build, the pipeline must publish the generated static files to GitHub Pages.

**Acceptance criteria**:
- The contents of the build output directory are deployed to the GitHub Pages environment.
- The deployed version matches exactly the state of `main` at the time of the triggering commit.

### FR-003 — Stable public URL

The application must be accessible at a stable, predictable public URL after deployment.

**Acceptance criteria**:
- The URL does not change between deployments.
- All application routes load correctly from the published URL (no broken sub-pages on direct navigation).
- PWA installation prompts and service worker function correctly at the public URL.

### FR-004 — Failed builds do not overwrite live version

If the build fails, the previously deployed version must remain live and unchanged.

**Acceptance criteria**:
- A failed pipeline run does not affect the currently published application.
- The failure is reported in the GitHub repository's checks/status interface.

### FR-005 — Build status visibility

The repository must display the current deployment status so maintainers can monitor health at a glance.

**Acceptance criteria**:
- A pipeline status indicator (badge or check) is visible in the repository.
- Maintainers are notified of failures via GitHub's standard notification system.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Deployment time after merge | Under 5 minutes from merge to live update |
| Manual steps required to deploy | Zero |
| Application availability after successful deploy | 100% of routes accessible via the public URL |
| Live version preserved on build failure | Yes — no regression on failed deployments |
| PWA installable at public URL | Yes — install prompt and service worker active |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| `main` branch | Source of truth; every commit here triggers a deployment |
| Build pipeline | Automated process that compiles the application and publishes the output |
| Build output | Static files generated by `npm run build` (the `dist/` directory) |
| GitHub Pages environment | GitHub-hosted static file server where the application is published |
| Public URL | Stable URL where the application is accessible to end users |

---

## Assumptions

1. The repository is hosted on GitHub and the owner has permissions to enable GitHub Pages and configure GitHub Actions.
2. The application builds successfully from the `main` branch at the time of this feature's implementation.
3. No custom domain is required; the default GitHub Pages URL (`https://<owner>.github.io/<repo>/`) is acceptable.
4. Because GitHub Pages serves from a sub-path (e.g., `/jogo-carta-fodinha/`), the application's build configuration must be updated to set the correct base path so assets and client-side routing work correctly.
5. The project uses Vite, so `vite.config.ts` needs a `base` option aligned with the repository name.
6. Secrets or environment variables are not required for this deployment (the application is a fully static PWA).

---

## Dependencies

- GitHub Actions must be available and enabled for the repository.
- GitHub Pages must be enabled (or configurable) for the repository.
- The project's build script (`npm run build`) must produce a self-contained static output in `dist/`.

---

## Out of Scope

- Server-side rendering or backend services.
- Preview deployments for feature branches or pull requests.
- Custom domain or HTTPS certificate management beyond GitHub Pages defaults.
- Secrets management or environment-specific configuration.
