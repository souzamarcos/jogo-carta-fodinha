# rules-page Specification

## Purpose

Provides an in-app, didactic rules page so newcomers can learn Fodinha without leaving the app, reachable from the home screen at any time without losing active game state. (Source: SPEC-027 — Página de Regras do Jogo.)

## Requirements

### Requirement: Rules Link on Home Screen

The system SHALL display an interactive "Regras do jogo" element on the home screen, positioned so it does not interfere with the Modo 1 and Modo 2 selection buttons, with a tap area of at least 44×44 CSS pixels.

#### Scenario: Link visible on the home screen
- **WHEN** the home screen loads on a device at least 375px wide
- **THEN** the "Regras do jogo" element is visible without scrolling and does not cover the mode-selection buttons

#### Scenario: Tapping the link opens the rules page
- **WHEN** the user taps "Regras do jogo"
- **THEN** the app navigates to the rules page without losing any active Modo 1 or Modo 2 session state

### Requirement: Dedicated Rules Route

The system SHALL serve the rules page at a dedicated route (e.g. `/rules`) that can be opened directly by URL without forced redirection.

#### Scenario: Direct URL access
- **WHEN** the user navigates directly to the rules route
- **THEN** the rules content is displayed without being redirected to another screen

### Requirement: Return Navigation Preserves State

The system SHALL provide a visible back control on the rules page returning the user to the home screen, and the OS/browser back action SHALL also work; no game state is lost.

#### Scenario: Returning home keeps sessions intact
- **WHEN** the user is on the rules page and triggers the back control or native back action
- **THEN** the user returns to the home screen and any active Modo 1 or Modo 2 session remains intact

### Requirement: Mandatory Rules Content

The system SHALL present the rules content covering, at minimum: objective, the deck, card hierarchy and "melou", the manilha (definition, derivation from the vira, suit hierarchy), lives, rounds and card distribution, bids and bid order, the dealer and its rotation, tricks (vaza), the loss formula `|bid − tricks|` with concrete examples, elimination and victory including the simultaneous-tie rule, and the difference between Modo 1 and Modo 2. Highlighted terms are defined on first use.

#### Scenario: All required sections present
- **WHEN** the user reads the rules page
- **THEN** each required section is present with non-empty content and uses concrete examples (e.g. "Se a vira é o 4, a manilha é o 5")

### Requirement: Mobile Readability

The system SHALL render the rules page legibly on mobile: body text at least ~14px, clear section headings, formatted lists/tables, no horizontal overflow on widths 320px–768px, consistent with the app's dark slate theme.

#### Scenario: Fluid scrolling on mobile
- **WHEN** the user scrolls the rules page on a smartphone (320px–768px wide)
- **THEN** scrolling is smooth, all content is readable without horizontal zoom, and there is no horizontal overflow
