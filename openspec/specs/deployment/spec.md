# deployment Specification

## Purpose

Defines automatic deployment of the app to GitHub Pages on every merge to `main`, with a stable public URL and protection against publishing broken builds. (Source: SPEC-019 — GitHub Pages Automatic Deployment.)

## Requirements

### Requirement: Automatic Build on Merge to Main

The system SHALL trigger a build (`npm run build`) automatically on every push/merge to `main`, with no manual action required.

#### Scenario: Merge triggers a build
- **WHEN** a commit is merged or pushed to `main`
- **THEN** the CI pipeline runs `npm run build` automatically without manual intervention

### Requirement: Publish Build Output to GitHub Pages

The system SHALL deploy the generated static files (`dist/`) to the GitHub Pages environment, and the deployed version SHALL match the state of `main` at trigger time.

#### Scenario: Successful build is published
- **WHEN** the build succeeds
- **THEN** the contents of `dist/` are published to GitHub Pages matching the triggering `main` commit

### Requirement: Stable Public URL

The system SHALL be reachable at an unchanging public URL where all routes, PWA installation, and the service worker load correctly.

#### Scenario: App reachable at the public URL
- **WHEN** a user opens the public URL
- **THEN** the app loads, all routes resolve, and PWA install and the service worker function correctly

### Requirement: Failed Builds Do Not Overwrite Live Version

The system SHALL keep the previously published app intact when a pipeline run fails, and report the failure in GitHub checks and notifications.

#### Scenario: Failed build leaves live app unchanged
- **WHEN** a pipeline run fails
- **THEN** the live published app is unchanged and the failure is reported in GitHub checks with maintainer notification
