# Tasks — SEO e Compartilhamento Social (SPEC-025)

**Feature**: SEO e Compartilhamento Social
**Spec**: `specs/007-seo-social-sharing/spec.md`
**Plan**: `.specify/impl-plan.md` (Sprint 13)
**Total tasks**: 7

---

## User Stories

| ID | Story | Spec Ref |
|----|-------|----------|
| US1 | Ao compartilhar o link do jogo em redes sociais ou apps de mensagens, vejo uma prévia rica com imagem, título e descrição — para que o jogo seja atraente antes mesmo de ser aberto | FR-001, FR-002, FR-003, FR-004, Scenarios 1, 2, 5 |
| US2 | Como mecanismo de busca, consigo rastrear e indexar o site a partir de `robots.txt` e `sitemap.xml` — para que o jogo apareça organicamente nos resultados de busca | FR-005, FR-006, FR-007, Scenarios 3, 4 |

---

## Phase 1 — User Story 1: Prévias ricas em redes sociais

> **Story goal**: O `<head>` de `index.html` contém título, descrição, Open Graph e Twitter Card corretos, e `public/og-image.png` existe com dimensões mínimas de 1200×630 px — de modo que qualquer rede social ou app de mensagens exibe uma prévia visual do jogo ao receber o link.

**Independent test criteria**:
- `<title>` do documento é `Fodinha – Jogo de Cartas Online`
- `<meta name="description">` existe e tem conteúdo com até 160 caracteres
- `<meta property="og:title">` existe com o nome do jogo
- `<meta property="og:image">` existe, e seu `content` começa com `https://`
- `<meta property="og:url">` aponta para a URL canônica do GitHub Pages
- `<meta property="og:locale">` é `pt_BR`
- `<meta name="twitter:card">` é `summary_large_image`
- `<link rel="canonical">` existe com a URL definitiva do site
- `public/og-image.png` existe no projeto e é referenciada pelas tags OG/Twitter

- [x] T001 [US1] Criar a imagem de compartilhamento social `public/og-image.png`: dimensões 1200×630 px, formato PNG, tamanho máximo 1 MB — a imagem deve conter o título "Fodinha" e elementos visuais de jogo de cartas; usar Figma, Canva ou ferramenta equivalente para produzir o arquivo e salvá-lo em `public/og-image.png`

- [x] T002 [US1] Atualizar `index.html` com todos os metadados de SEO e compartilhamento social:
  - Alterar `<title>` para `Fodinha – Jogo de Cartas Online`
  - Verificar que `<html lang="pt-BR">` está presente (já existe — manter)
  - Adicionar após as meta tags PWA existentes:
    ```html
    <!-- SEO básico -->
    <meta name="description" content="Auxiliar digital para o jogo de cartas Fodinha. Gerencie vidas, palpites e rodadas sem papel e caneta." />
    <meta name="keywords" content="fodinha, jogo de cartas, cartas online, auxiliar de jogo, palpites" />
    <link rel="canonical" href="https://souzamarcos.github.io/jogo-carta-fodinha/" />

    <!-- Open Graph -->
    <meta property="og:type"         content="website" />
    <meta property="og:url"          content="https://souzamarcos.github.io/jogo-carta-fodinha/" />
    <meta property="og:title"        content="Fodinha – Jogo de Cartas Online" />
    <meta property="og:description"  content="Auxiliar digital para o jogo de cartas Fodinha. Gerencie vidas, palpites e rodadas sem papel e caneta." />
    <meta property="og:image"        content="https://souzamarcos.github.io/jogo-carta-fodinha/og-image.png" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale"       content="pt_BR" />
    <meta property="og:site_name"    content="Fodinha" />

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="Fodinha – Jogo de Cartas Online" />
    <meta name="twitter:description" content="Auxiliar digital para o jogo de cartas Fodinha. Gerencie vidas, palpites e rodadas sem papel e caneta." />
    <meta name="twitter:image"       content="https://souzamarcos.github.io/jogo-carta-fodinha/og-image.png" />
    ```

- [x] T003 [P] [US1] Criar `tests/e2e/seo.spec.ts` com os seguintes testes Playwright verificando os metadados de compartilhamento social na página `/`:
  - `'has correct page title'` — `expect(page).toHaveTitle('Fodinha – Jogo de Cartas Online')`
  - `'has meta description'` — locator `meta[name="description"]` tem atributo `content` contendo `'Auxiliar digital'`
  - `'has og:title'` — locator `meta[property="og:title"]` tem `content` = `'Fodinha – Jogo de Cartas Online'`
  - `'has og:description'` — locator `meta[property="og:description"]` tem `content` não vazio
  - `'has og:image with absolute URL'` — locator `meta[property="og:image"]` tem `content` começando com `'https://'`
  - `'has og:url pointing to canonical'` — locator `meta[property="og:url"]` tem `content` contendo `'jogo-carta-fodinha'`
  - `'has og:locale set to pt_BR'` — locator `meta[property="og:locale"]` tem `content` = `'pt_BR'`
  - `'has twitter:card summary_large_image'` — locator `meta[name="twitter:card"]` tem `content` = `'summary_large_image'`
  - `'has canonical link'` — locator `link[rel="canonical"]` tem atributo `href` contendo `'jogo-carta-fodinha'`
  - `'og:image and twitter:image point to same URL'` — ambos locators têm o mesmo `content`

---

## Phase 2 — User Story 2: Indexação por mecanismos de busca

> **Story goal**: `public/robots.txt` e `public/sitemap.xml` existem, são acessíveis pela URL pública, e fornecem as informações corretas para crawlers rastrearem e indexarem o site sem bloqueios.

**Independent test criteria**:
- GET `/robots.txt` retorna HTTP 200 e contém `User-agent: *` e `Sitemap:`
- GET `/sitemap.xml` retorna HTTP 200 e contém `<urlset` com ao menos uma `<url>`
- `sitemap.xml` lista a URL canônica `https://souzamarcos.github.io/jogo-carta-fodinha/`

- [x] T004 [US2] Criar `public/robots.txt` com o seguinte conteúdo exato:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://souzamarcos.github.io/jogo-carta-fodinha/sitemap.xml
  ```

- [x] T005 [P] [US2] Criar `public/sitemap.xml` com o seguinte conteúdo exato:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://souzamarcos.github.io/jogo-carta-fodinha/</loc>
      <lastmod>2026-04-14</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```

- [x] T006 [P] [US2] Adicionar ao final de `tests/e2e/seo.spec.ts` os testes de crawler:
  - `'robots.txt is accessible and valid'` — usando `request.get('/robots.txt')`: assert `response.ok()`, body contém `'User-agent: *'`, body contém `'Sitemap:'` e body contém `'sitemap.xml'`
  - `'sitemap.xml is accessible and valid'` — usando `request.get('/sitemap.xml')`: assert `response.ok()`, body contém `'<urlset'`, body contém `'jogo-carta-fodinha'`

---

## Phase 3 — Documentação

> **Story goal**: As regras de negócio e cenários E2E refletem o comportamento de SEO, garantindo que futuros contribuidores entendam os requisitos de metadados.

- [x] T007 [P] Atualizar `docs/e2e-test-scenarios.md` adicionando os seguintes cenários ao final do arquivo:
  - **E2E-026**: "SEO — tags Open Graph e Twitter Card presentes": preconditions (app carregada no browser), steps (inspecionar `<head>` da página `/`), expected (og:title, og:description, og:image com URL absoluta, og:locale=pt_BR, twitter:card=summary_large_image presentes e com valores corretos)
  - **E2E-027**: "`robots.txt` acessível e com conteúdo correto": steps (GET /robots.txt), expected (HTTP 200, contém `User-agent: *` e referência ao `sitemap.xml`)
  - **E2E-028**: "`sitemap.xml` acessível e válido": steps (GET /sitemap.xml), expected (HTTP 200, XML válido com `<urlset>` e URL canônica listada)

  Atualizar `docs/business-rules.md` adicionando uma nota na seção de deploy/configuração: "A URL canônica definitiva do projeto é `https://souzamarcos.github.io/jogo-carta-fodinha/`. Esta URL deve ser consistente entre `og:url`, `link[rel=canonical]` em `index.html`, e `start_url` no manifest PWA."

---

## Dependency Graph

```
T001 (og-image.png — design asset)
  └─► T002 (index.html tags — referencia og-image.png)
        └─► T003 (seo.spec.ts social tags — valida index.html)

T004 (robots.txt)  ←─ paralelo ─→  T005 (sitemap.xml)
  └─► T006 (seo.spec.ts crawler tests — valida T004 + T005)

T007 (docs — totalmente independente)
```

T001 deve preceder T002 (og-image deve existir antes de ser referenciada).
T002 deve preceder T003 (tags devem existir antes dos testes).
T004 e T005 são independentes entre si.
T006 depende de T004 e T005.
T007 pode ser feito a qualquer momento.

---

## Parallel Execution

**Após T001 estar em progresso** (design asset pode ser feito em paralelo com outros):
- T004 e T005 podem ser criados em paralelo entre si e com T002
- T007 pode ser feito a qualquer momento

**Após T002 e T004+T005 concluídos**:
- T003 e T006 podem ser escritos em paralelo (ambos no mesmo arquivo, mas seções independentes)

---

## Implementation Strategy

**MVP (mínimo para habilitar prévias sociais)**:
1. T001 — imagem de preview criada
2. T002 — tags inseridas em `index.html`

**Indexação completa**:
3. T004 — robots.txt
4. T005 — sitemap.xml

**Cobertura de testes (exigida pela constituição)**:
5. T003 — testes das tags sociais
6. T006 — testes de robots/sitemap

**Documentação (exigida pela constituição)**:
7. T007 — e2e-test-scenarios.md + business-rules.md

Após deploy no GitHub Pages (SPEC-019), validar manualmente usando:
- [OpenGraph.xyz](https://www.opengraph.xyz) ou o debugger do Facebook para testar prévias OG
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) para Twitter Card
- Google Search Console após indexação para confirmar title/description
