# SEO e Compartilhamento Social

**Feature ID**: SPEC-025
**Status**: Draft
**Created**: 2026-04-14
**Author**: Marcos Souza

---

## Overview

Adicionar metadados de SEO e Open Graph ao Fodinha PWA para que, ao compartilhar o link do jogo em redes sociais ou aplicativos de mensagens, seja exibida uma prévia rica com imagem representativa, título e descrição do jogo. Além disso, configurar o site para ser corretamente indexado por mecanismos de busca.

---

## Problem Statement

Atualmente, ao compartilhar o link do Fodinha em redes sociais (WhatsApp, Twitter, Facebook, etc.) ou em buscadores, o site não apresenta nenhuma prévia visual ou descritiva. Isso reduz o apelo ao clicar no link e impede que o jogo seja descoberto organicamente via busca.

---

## Goals

- Ao compartilhar o link do jogo, redes sociais e apps de mensagens exibem uma prévia com imagem, título e descrição do jogo.
- O site aparece nos resultados de busca com título e descrição relevantes.
- Robôs de busca conseguem rastrear e indexar o conteúdo do site corretamente.

---

## Non-Goals

- Otimização de desempenho de página (Core Web Vitals) — tratado separadamente.
- Configuração de analytics ou rastreamento de conversões.
- SEO para múltiplos idiomas além do português.
- Campanhas pagas de busca (Google Ads, etc.).

---

## User Scenarios & Testing

### Scenario 1 — Jogador compartilha o link no WhatsApp

**Given** um jogador copia a URL do Fodinha PWA  
**When** cola o link em uma conversa no WhatsApp ou Telegram  
**Then** o app exibe uma prévia com a imagem do jogo, o título "Fodinha" e uma breve descrição das regras  
**And** ao clicar na prévia o link abre o jogo corretamente

### Scenario 2 — Usuário compartilha no Twitter / X

**Given** um jogador compartilha o link do Fodinha no Twitter/X  
**When** o tweet é publicado  
**Then** o card do Twitter exibe imagem grande (summary_large_image), título e descrição  
**And** a imagem e o texto representam fielmente o jogo

### Scenario 3 — Busca no Google

**Given** um usuário pesquisa "Fodinha jogo de cartas online" no Google  
**When** o site já foi indexado  
**Then** o resultado mostra o título correto e a meta descrição do site  
**And** o snippet não exibe texto genérico ou vazio

### Scenario 4 — Robô de busca rastreia o site

**Given** o Googlebot (ou outro crawler) acessa o site  
**When** lê o arquivo `robots.txt`  
**Then** recebe permissão para indexar todas as páginas públicas  
**And** encontra o `sitemap.xml` para descobrir as URLs disponíveis

### Scenario 5 — Prévia no iMessage / LinkedIn

**Given** um usuário compartilha o link em iMessage ou LinkedIn  
**When** o link é inserido  
**Then** a plataforma exibe a imagem Open Graph, título e descrição definidos

---

## Functional Requirements

### FR-001 — Metadados básicos de SEO

O site deve incluir as seguintes tags `<meta>` no `<head>` de todas as páginas:

**Acceptance criteria**:
- `<title>` com o nome e tagline do jogo (ex.: "Fodinha – Jogo de Cartas Online").
- `<meta name="description">` com até 160 caracteres descrevendo o jogo e suas funcionalidades.
- `<meta name="keywords">` com termos relevantes (jogo de cartas, fodinha, online, etc.).
- Tags de idioma e charset definidas corretamente.

### FR-002 — Tags Open Graph para compartilhamento social

O site deve incluir tags Open Graph para que redes sociais gerem prévias ricas.

**Acceptance criteria**:
- `og:title` com o nome do jogo.
- `og:description` com descrição do jogo (até 200 caracteres).
- `og:image` apontando para uma imagem representativa do jogo (mínimo 1200×630 px).
- `og:url` com a URL canônica do site.
- `og:type` definido como `website`.
- `og:locale` definido como `pt_BR`.
- A imagem referenciada em `og:image` existe e é acessível publicamente.

### FR-003 — Tags Twitter Card

O site deve incluir tags Twitter Card para prévias no Twitter/X.

**Acceptance criteria**:
- `twitter:card` definido como `summary_large_image`.
- `twitter:title` com o nome do jogo.
- `twitter:description` com descrição do jogo.
- `twitter:image` apontando para a mesma imagem Open Graph ou variante apropriada.

### FR-004 — Imagem representativa do jogo

Uma imagem de prévia (social sharing image) deve ser criada e incluída no projeto.

**Acceptance criteria**:
- Dimensões mínimas de 1200×630 px.
- Contém o nome "Fodinha" e elementos visuais que remetam ao jogo de cartas.
- Formato PNG ou JPG, tamanho máximo de 1 MB.
- Acessível pela URL pública do site.

### FR-005 — Arquivo `robots.txt`

O site deve disponibilizar um arquivo `robots.txt` na raiz.

**Acceptance criteria**:
- Permite rastreamento de todas as páginas públicas por todos os crawlers (`User-agent: *`, `Allow: /`).
- Inclui referência ao `sitemap.xml`.

### FR-006 — Arquivo `sitemap.xml`

O site deve disponibilizar um `sitemap.xml` na raiz.

**Acceptance criteria**:
- Lista a URL principal do site com data de última modificação.
- Formato válido segundo o protocolo Sitemaps.org.
- Acessível pela URL pública do site.

### FR-007 — URL canônica

Cada página deve declarar sua URL canônica para evitar conteúdo duplicado.

**Acceptance criteria**:
- Tag `<link rel="canonical" href="...">` presente em todas as páginas.
- A URL canônica corresponde à URL pública definitiva do site.

---

## Success Criteria

| Critério | Meta |
|----------|------|
| Prévia com imagem ao compartilhar no WhatsApp/Telegram | 100% das vezes que o link é colado |
| Prévia com imagem ao compartilhar no Twitter/X | Twitter Card validado via Twitter Card Validator |
| Título e descrição corretos nos resultados do Google | Confirmado via Google Search Console após indexação |
| Robôs de busca conseguem rastrear o site sem bloqueios | `robots.txt` e `sitemap.xml` acessíveis e válidos |
| Imagem Open Graph atende às especificações de tamanho | ≥ 1200×630 px, ≤ 1 MB |
| Score de SEO em ferramenta de auditoria (ex.: Lighthouse) | ≥ 90 / 100 na categoria SEO |

---

## Key Entities

| Entidade | Descrição |
|----------|-----------|
| Open Graph tags | Metadados no `<head>` que definem como o conteúdo é exibido ao ser compartilhado |
| Twitter Card tags | Variante do Open Graph específica para o Twitter/X |
| Social sharing image | Imagem representativa do jogo usada nas prévias de compartilhamento |
| `robots.txt` | Arquivo que informa crawlers quais páginas podem ser rastreadas |
| `sitemap.xml` | Mapa de todas as URLs públicas do site para facilitar indexação |
| URL canônica | URL oficial e definitiva de cada página, evitando duplicação de indexação |

---

## Assumptions

1. O site é uma PWA de página única (SPA) sem conteúdo dinâmico por rota — portanto um único conjunto de metadados cobre todo o site.
2. A URL pública definitiva é a do GitHub Pages gerada na SPEC-019 (`https://<owner>.github.io/<repo>/`).
3. A imagem de compartilhamento será criada como um asset estático no projeto; nenhum serviço externo de geração dinâmica de imagens é necessário.
4. As tags serão inseridas diretamente no `index.html` ou configuradas via plugin do bundler (Vite); a decisão de implementação é do desenvolvedor.
5. Não há necessidade de dados estruturados (JSON-LD / Schema.org) nesta fase, dado que o site é um jogo casual sem produtos, artigos ou avaliações.

---

## Dependencies

- SPEC-019 (GitHub Pages Deploy) deve estar concluída para que a URL pública esteja disponível para testes de compartilhamento.
- Acesso ao repositório para adicionar assets estáticos (imagem de preview).

---

## Out of Scope

- SEO dinâmico por rota ou por partida de jogo.
- Dados estruturados (Schema.org / JSON-LD).
- Configuração do Google Search Console ou Bing Webmaster Tools (ações manuais pós-deploy).
- Otimização de performance (Core Web Vitals, LCP, CLS, etc.).
- Internacionalização de metadados para outros idiomas.
