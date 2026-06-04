# pwa-platform Specification

## Purpose

Defines the Progressive Web App platform requirements — installability, offline operation, service worker, and the isolated local persistence model for both modes — so the app runs without any backend and resumes exactly where the user left off.

## Requirements

### Requirement: PWA Installability

The system SHALL ship a web app manifest with `name`, `short_name`, `icons` (192×192 and 512×512), `display: standalone`, `theme_color`, and `background_color`, plus a `viewport` meta tag of `width=device-width, initial-scale=1`.

#### Scenario: App is installable on mobile and desktop
- **WHEN** a supported browser loads the app
- **THEN** the manifest enables installation as a standalone app on phones and desktops

### Requirement: Offline Operation

The system SHALL function fully offline using a Workbox service worker with a cache-first strategy for static assets and make no network calls during gameplay.

#### Scenario: Gameplay with no network
- **WHEN** the device has no network connection
- **THEN** the app loads from cache and all gameplay works without any network request

### Requirement: Isolated Local Persistence

The system SHALL persist Modo 1 state under `localStorage` key `fodinha-game` (`gameStore`) and Modo 2 state under key `fodinha-hand` (`playerHandStore`), with neither store reading nor writing the other's key, and rehydrate state automatically on app open.

#### Scenario: State survives app restart
- **WHEN** the app is closed mid-session and reopened
- **THEN** Zustand rehydrates the affected store from its `localStorage` key and the session resumes exactly where it left off

#### Scenario: Stores stay isolated
- **WHEN** either mode mutates its state
- **THEN** only its own `localStorage` key (`fodinha-game` or `fodinha-hand`) is written, never the other mode's key
