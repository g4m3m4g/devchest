<div align="center">

<img width="1280" height="640" alt="DevChest — Developer Utility Hub" src="https://github.com/user-attachments/assets/75b5de18-b5ce-47a0-92de-31cb408a281c" />

<h1>DevChest</h1>

<p>A fast, privacy-first developer utility hub.<br>53 tools, zero backend, everything runs in your browser.</p>

[![Deploy](https://github.com/g4m3m4g/DevChest/actions/workflows/deploy.yml/badge.svg)](https://github.com/g4m3m4g/DevChest/actions/workflows/deploy.yml)
![Tests](https://img.shields.io/badge/tests-1356%20passing-22c55e?style=flat)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat&logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-%3E%3D22-339933?style=flat&logo=node.js&logoColor=white)

**[Live Demo →](https://g4m3m4g.github.io/devchest)**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tools](#tools)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## Overview

DevChest is an open-source collection of everyday developer utilities — formatters, encoders, generators, and text tools — bundled into a single fast web app. There is no server. No data is transmitted. Everything is processed locally in the browser using standard Web APIs.

**Key properties:**

- **Private by default** — input never leaves your machine
- **No login, no tracking, no cookies**
- **Instant** — tools load on demand via code splitting, keeping the initial bundle small
- **Keyboard-friendly** — `⌘K` / `Ctrl+K` focuses the sidebar search from anywhere

---

## Tools

### Formatters & Minifiers

| Tool | Description |
|---|---|
| **JSON Formatter** | Format and validate JSON with configurable indentation |
| **SQL Formatter** | Transform messy SQL into clean, structured queries |
| **HTML / CSS Minifier** | Strip spaces and comments from HTML and CSS payloads |
| **XML Formatter** | Pretty-print and validate XML with configurable indentation |
| **YAML Converter** | Format YAML or convert between YAML and JSON |
| **TOML Converter** | Format TOML or convert between TOML and JSON |
| **JS / TS Formatter** | Format JavaScript and TypeScript using Prettier rules |
| **CSV Formatter & Viewer** | Parse, view, and reformat CSV with configurable delimiters |
| **Markdown Preview** | Preview rendered Markdown or format and normalise its syntax |
| **GraphQL Formatter** | Format GraphQL schemas, queries, mutations, and fragments |
| **INI Formatter** | Format INI and config files — normalize separators, sort sections and keys |
| **Dockerfile Formatter** | Format Dockerfiles and lint for common mistakes — deprecated instructions, missing version tags, apt hygiene |
| **Nginx Config Formatter** | Format and normalize Nginx configuration files with consistent indentation |
| **HTTP Headers Formatter** | Parse and format HTTP request and response headers — sort, normalize casing, table view |
| **Log Formatter** | Parse structured JSON logs (pino, winston, bunyan) into a readable view — filter by level, toggle metadata |

### Encoders & Decoders

| Tool | Description |
|---|---|
| **Base64 Encoder** | Encode or decode Base64 text and convert images to Data URLs |
| **URL Encoder** | Encode and decode URL components safely |
| **JWT Decoder** | Inspect JWT header, payload, and expiration client-side |
| **HTML Entity Encoder / Decoder** | Escape reserved HTML characters or decode named and numeric entities |
| **Unicode Encoder / Decoder** | Convert text to Unicode escape sequences (JS, CSS, Python, U+ notation) and back |
| **Hex Encoder / Decoder** | Convert text to its UTF-8 hexadecimal byte representation and back |
| **Number Base Converter** | Convert integers between binary, octal, decimal, and hexadecimal |
| **Morse Code Encoder / Decoder** | Convert text to Morse code and back, with word separators |
| **Punycode / IDN Encoder / Decoder** | Convert internationalized domain names to Punycode ASCII form and back |
| **Quoted-Printable Encoder / Decoder** | Convert text to Quoted-Printable (RFC 2045) encoding and back |
| **Caesar Cipher / ROT-13** | Shift letters by a configurable amount, with a ROT-13 preset |
| **Gzip / Deflate Compress & Decompress** | Compress and decompress text with Gzip or Deflate entirely in the browser |
| **JWT Builder** | Build and sign JSON Web Tokens with HMAC-SHA256 |
| **MIME Type Lookup** | Look up MIME types by file extension, filename, or find extensions for a MIME type |
| **Data URL ↔ File Converter** | Convert a file to a Data URL, or decode a Data URL back into a downloadable file |

### Regex & Text

| Tool | Description |
|---|---|
| **Regex Tester** | Test regular expressions with live match highlighting |
| **Case Converter** | Convert text to camelCase, snake_case, PascalCase, and more |
| **Diff Checker** | Compare two text blocks and visualize line differences |
| **Word & Character Counter** | Count words, characters, sentences, paragraphs, and lines as you type |
| **Lorem Ipsum Generator** | Generate placeholder text by words, sentences, or paragraphs |
| **Text Sorter** | Sort lines alphabetically, numerically, or by length — with dedup and cleanup options |
| **Text Reverse** | Reverse text by character, word, or line order |
| **Slug Generator** | Turn a title into a clean, URL-safe slug |
| **Whitespace / Line Cleaner** | Trim, collapse, and strip whitespace and blank lines from text |
| **String Escape / Unescape** | Escape or unescape strings for JS, Python, or SQL |
| **Find & Replace** | Find and replace text with plain matching or regex, including capture group substitution |
| **Line Filter** | Keep or remove lines matching a plain-text or regex pattern, like grep |
| **Column Extractor** | Split delimited text and extract selected columns by index |
| **Markdown to HTML Converter** | Convert Markdown source into sanitized HTML, with a live preview |
| **HTML to Markdown Converter** | Convert HTML markup into clean Markdown syntax |
| **Text to ASCII Art** | Render short text as blocky ASCII art letters |
| **Levenshtein Distance Calculator** | Compute the edit distance and similarity percentage between two strings |
| **Readability Score** | Flesch Reading Ease and Flesch-Kincaid Grade Level for a block of text |
| **Duplicate Line Remover** | Remove duplicate lines from text, keeping the first occurrence of each |
| **Sentence Counter** | Count sentences and words, and see the average sentence length |

### Security & Generators

| Tool | Description |
|---|---|
| **Hash Generator** | Compute MD5, SHA-1, SHA-256, and SHA-512 simultaneously |
| **UUID Generator** | Bulk-generate v4 UUIDs with format and delimiter controls |
| **Timestamp Converter** | Convert Unix epochs and ISO dates with a live ticker |

---

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org) 22 or later.

```bash
# 1. Clone the repository
git clone https://github.com/g4m3m4g/DevChest.git
cd DevChest

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The dev server starts at **http://localhost:5173**.

### All commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check, bundle for production, and generate SEO pages/sitemap |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Single test pass (use before committing) |
| `npm run test:coverage` | Generate V8 coverage report |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, ToolLayout, Breadcrumbs
│   └── tools/
│       ├── encoders/    # 15 encoder/decoder tools
│       ├── formatters/  # 15 formatter/minifier tools
│       ├── generators/  # 3 security/generator tools
│       └── text/        # 20 regex & text tools
├── config/
│   ├── tools.ts          # Central tool & category registry
│   └── toolComponents.tsx # React.lazy registry, keyed by tool id
├── context/
│   └── ToolContext.tsx   # Active tool ID + search query
├── hooks/
│   ├── useLocalStorage.ts
│   └── useSEO.ts
├── pages/
│   ├── ToolCatalog.tsx   # Landing grid of all tools
│   ├── ToolPage.tsx      # Lazy-loads the active tool via Suspense
│   └── NotFound.tsx
├── lib/                  # Pure functions — independently testable, no DOM
│   └── ...                # One module per tool (e.g. base64.ts, levenshtein.ts, readability.ts)
└── __tests__/             # Mirrors src/ — one test file per lib module and component
    ├── components/
    ├── hooks/
    └── lib/
```

All tools are lazy-loaded via `React.lazy` + `Suspense`, registered in `src/config/toolComponents.tsx` and keyed by the tool `id` from `src/config/tools.ts`. Business logic lives in `src/lib/` as pure functions — components only read state and call lib functions.

A build-time script (`scripts/build-seo.ts`) generates a static SEO page per tool plus `sitemap.xml`, run automatically as part of `npm run build`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) with React Compiler |
| Routing | [React Router 7](https://reactrouter.com) |
| Build tool | [Vite 8](https://vite.dev) with Rolldown |
| Language | [TypeScript 6](https://www.typescriptlang.org) (`erasableSyntaxOnly`, `verbatimModuleSyntax`) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest 4](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Formatting | [Prettier 3](https://prettier.io) (JS/TS/Markdown formatter tools) |
| CSV | [Papa Parse](https://www.papaparse.com) |
| YAML | [js-yaml](https://github.com/nodeca/js-yaml) |
| TOML | [smol-toml](https://github.com/nicolo-ribaudo/smol-toml) |
| SQL | [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) |
| Markdown | [marked](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify) |
| Diffing | [diff](https://github.com/kpdecker/jsdiff) |
| Hashing | [crypto-js](https://github.com/brix/crypto-js) + Web `SubtleCrypto` |

---

## Testing

```bash
npm run test:run        # Single pass — run before every commit
npm run test:coverage   # With V8 coverage report
```

**1356 tests, 0 failures** across 105 test files — every tool component and every lib module is covered.

Notable patterns in the test suite:

- `fireEvent.change` for inputs containing `{`, `}`, `[` to avoid `userEvent` key-sequence interpretation
- Clipboard mocks set **after** `userEvent.setup()` to prevent `userEvent` from overwriting them
- `waitFor` with explicit timeouts for async tools (JS/TS Formatter, Markdown Formatter) that call Prettier
- `vi.useFakeTimers()` + `fireEvent.click` for components using `setInterval` (TimestampConverter)
- `vi.spyOn(globalThis.crypto, 'randomUUID')` + `afterEach(() => vi.restoreAllMocks())` for UuidGenerator

---

## Architecture

**No backend.** All processing runs in the browser via standard Web APIs (`DOMParser`, `SubtleCrypto`, `crypto.randomUUID`, `Clipboard`, `CompressionStream`). No data leaves the client.

**Layering rule:** business logic lives in `src/lib/` as pure, side-effect-free functions. Components are thin — they manage local UI state and call lib functions. This keeps lib functions fast to test without a DOM.

**Tailwind CSS v4.** No `tailwind.config.js`. All configuration (fonts, design tokens) is defined via `@theme {}` blocks in `src/index.css`.

**React Compiler.** Enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel`. Do not add manual `useMemo`/`useCallback` performance wrappers — the compiler handles memoisation. Use `useMemo` only for semantically derived values (e.g. formatter output).

**GitHub Pages.** `base: '/devchest/'` in `vite.config.ts` ensures assets resolve correctly under the subdirectory. Deployment is automated via `.github/workflows/deploy.yml` on every push to `main`.

---

## Contributing

Contributions are welcome. To add a new tool, follow the steps in [`CLAUDE.md`](./CLAUDE.md):

1. Create `src/lib/<name>.ts` with pure functions and export types
2. Create `src/components/tools/<category>/<Name>.tsx` using `ToolLayout` and `Panel`
3. Register the tool in `src/config/tools.ts` (add to `TOOLS[]`, ensure the category exists in `CATEGORIES[]`)
4. Add a `React.lazy` import and `TOOL_MAP` entry in `src/config/toolComponents.tsx`
5. Write `src/__tests__/lib/<name>.test.ts` and `src/__tests__/components/<Name>.test.tsx`
6. Run `npm run test:run && npm run build` — both must pass clean before opening a PR

See [`roadmap.md`](./roadmap.md) for the full list of planned tools.
