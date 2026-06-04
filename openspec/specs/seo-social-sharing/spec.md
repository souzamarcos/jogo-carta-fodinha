# seo-social-sharing Specification

## Purpose

Defines SEO metadata and social-sharing support so the app is discoverable by search engines and renders rich previews when shared on social platforms and messengers. (Source: SPEC-025 — SEO e Compartilhamento Social.)

## Requirements

### Requirement: Basic SEO Metadata

The system SHALL include in `<head>`: a `<title>` (game name + tagline), `<meta name="description">` (≤160 chars), `<meta name="keywords">`, and correct language and charset tags.

#### Scenario: Head contains SEO metadata
- **WHEN** the page HTML is served
- **THEN** the `<head>` contains a title, a description of at most 160 characters, keywords, and correct language and charset declarations

### Requirement: Open Graph Tags

The system SHALL include Open Graph tags: `og:title`, `og:description` (≤200 chars), `og:image` (≥1200×630px), `og:url` (canonical), `og:type` = "website", and `og:locale` = "pt_BR", with a publicly accessible image.

#### Scenario: Sharing renders an Open Graph preview
- **WHEN** the URL is shared on a platform that reads Open Graph tags
- **THEN** a preview renders using the og:title, og:description, and publicly accessible og:image

### Requirement: Twitter Card Tags

The system SHALL include Twitter Card tags: `twitter:card` = "summary_large_image", `twitter:title`, `twitter:description`, and `twitter:image`.

#### Scenario: Twitter renders a large-image card
- **WHEN** the URL is shared on Twitter
- **THEN** a "summary_large_image" card renders with title, description, and image

### Requirement: Preview Image Asset

The system SHALL provide a representative preview image of at least 1200×630px, containing "Fodinha" and card-game visuals, in PNG or JPG, at most 1MB, publicly accessible.

#### Scenario: Preview image meets constraints
- **WHEN** the preview image is requested
- **THEN** it is publicly accessible, at least 1200×630px, PNG or JPG, and at most 1MB

### Requirement: Crawler Files and Canonical URL

The system SHALL provide `robots.txt` (allowing all public pages and referencing the sitemap) and `sitemap.xml` (valid Sitemaps.org format with last-modified date) at the site root, and each page SHALL declare a canonical `<link rel="canonical">` matching its public URL.

#### Scenario: robots and sitemap available at root
- **WHEN** a crawler requests `/robots.txt` and `/sitemap.xml`
- **THEN** both are publicly accessible, `robots.txt` allows crawling and references the sitemap, and `sitemap.xml` is valid with a last-modified date

#### Scenario: Canonical URL declared
- **WHEN** a page is served
- **THEN** it declares `<link rel="canonical">` matching its definitive public URL
