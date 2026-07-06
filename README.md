<div align="center">

<img width="1280" height="640" alt="DevChest — Developer Utility Hub" src="https://github.com/user-attachments/assets/75b5de18-b5ce-47a0-92de-31cb408a281c" />

<h1>DevChest</h1>

<p>A fast, privacy-first developer utility hub.<br>27 tools, zero backend, everything runs in your browser.</p>

[![Deploy](https://github.com/g4m3m4g/DevChest/actions/workflows/deploy.yml/badge.svg)](https://github.com/g4m3m4g/DevChest/actions/workflows/deploy.yml)
![Tests](https://img.shields.io/badge/tests-814%20passing-22c55e?style=flat)
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
| **JSON Formatter** | Format and validate JSON with 2 or 4-space indent, or minify |
| **SQL Formatter** | Pretty-print SQL queries with dialect-aware keyword casing |
| **HTML / CSS Minifier** | Strip whitespace and comments from HTML and CSS payloads |
| **XML Formatter** | Pretty-print and validate XML with configurable indentation |
| **YAML Converter** | Format YAML or convert between YAML ↔ JSON |
| **TOML Converter** | Format TOML or convert between TOML ↔ JSON |
| **JS / TS Formatter** | Format JavaScript and TypeScript via Prettier (semi, quotes, indent, trailing commas) |
| **Markdown Preview** | Live-render Markdown to HTML or normalise syntax via Prettier |
| **CSV Formatter & Viewer** | Parse CSV into a sortable table; reformat with any delimiter |
| **GraphQL Formatter** | Format GraphQL schemas, queries, mutations, and fragments |
| **INI Formatter** | Format INI and config files — normalize separators, sort sections and keys |
| **Dockerfile Formatter** | Format Dockerfiles and lint for common mistakes — deprecated instructions, missing tags, apt hygiene |
| **Nginx Config Formatter** | Format and normalize Nginx configuration files with consistent indentation |
| **HTTP Headers Formatter** | Parse and format HTTP request/response headers — sort, normalize casing, structured table view |
| **Log Formatter** | Parse structured JSON logs (pino, winston, bunyan, logrus) — filter by level, toggle metadata |

### Encoders & Decoders

| Tool | Description |
|---|---|
| **Base64 Encoder** | Encode or decode Base64 text; convert images to Data URLs via drag-and-drop |
| **URL Encoder** | Encode and decode URL components with a reference table |
| **JWT Decoder** | Inspect JWT header, payload, signature, and expiration status |

### Regex & Text

| Tool | Description |
|---|---|
| **Regex Tester** | Live inline match highlighting with flag toggles and match counter |
| **Case Converter** | Transform text into 8 formats simultaneously (camelCase, snake_case, PascalCase, …) |
| **Diff Checker** | Side-by-side line diff with added / removed statistics |

### Security & Generators

| Tool | Description |
|---|---|
| **Hash Generator** | Compute MD5, SHA-1, SHA-256, and SHA-512 simultaneously |
| **UUID Generator** | Bulk-generate v4 UUIDs with delimiter, case, and quantity controls |
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
| `npm run build` | Type-check then bundle for production |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Single test pass (use before committing) |
| `npm run test:coverage` | Generate V8 coverage report |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar (collapsible, responsive), ToolLayout
│   └── tools/
│       ├── encoders/    # Base64Tool, JwtDecoder, UrlEncoder
│       ├── formatters/  # CsvViewer, DockerfileFormatter, GraphqlFormatter,
│       │                # HtmlCssMinifier, HttpHeadersFormatter, IniFormatter,
│       │                # JsFormatter, JsonFormatter, LogFormatter,
│       │                # MarkdownPreview, NginxConfigFormatter, SqlFormatter,
│       │                # TomlConverter, XmlFormatter, YamlConverter
│       ├── generators/  # HashGenerator, TimestampConverter, UuidGenerator
│       └── text/        # CaseConverter, DiffChecker, RegexTester
├── config/
│   └── tools.ts         # Central tool & category registry
├── context/
│   └── ToolContext.tsx  # Active tool ID + search query
├── hooks/
│   └── useLocalStorage.ts
├── lib/                 # Pure functions — independently testable
│   ├── base64.ts
│   ├── cases.ts
│   ├── csv.ts
│   ├── dockerfile.ts
│   ├── graphqlFormatter.ts
│   ├── httpHeaders.ts
│   ├── ini.ts
│   ├── jsFormatter.ts
│   ├── jwt.ts
│   ├── logFormatter.ts
│   ├── markdownFormatter.ts
│   ├── minifiers.ts
│   ├── nginxConfig.ts
│   ├── regex.ts
│   ├── timestamp.ts
│   ├── toml.ts
│   ├── url.ts
│   ├── uuid.ts
│   ├── xml.ts
│   └── yaml.ts
└── __tests__/           # 814 tests across 56 files
    ├── components/      # Component integration tests
    ├── hooks/
    └── lib/             # Unit tests for utility modules
```

All tools are lazy-loaded via `React.lazy` + `Suspense`. Business logic lives in `src/lib/` as pure functions — components only read state and call lib functions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) with React Compiler |
| Build tool | [Vite 8](https://vite.dev) with Rolldown |
| Language | [TypeScript 6](https://www.typescriptlang.org) (`erasableSyntaxOnly`, `verbatimModuleSyntax`) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest 4](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Formatting | [Prettier 3](https://prettier.io) (JS/TS/Markdown formatter tool) |
| CSV | [Papa Parse](https://www.papaparse.com) |
| YAML | [js-yaml](https://github.com/nodeca/js-yaml) |
| TOML | [smol-toml](https://github.com/nicolo-ribaudo/smol-toml) |
| Markdown | [marked](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify) |

---

## Testing

```bash
npm run test:run        # Single pass — run before every commit
npm run test:coverage   # With V8 coverage report
```

**814 tests, 0 failures** across 56 test files — every tool component and every lib module is covered.

Notable patterns in the test suite:

- `fireEvent.change` for inputs containing `{`, `}`, `[` to avoid `userEvent` key-sequence interpretation
- Clipboard mocks set **after** `userEvent.setup()` to prevent `userEvent` from overwriting them
- `waitFor` with explicit timeouts for async tools (JS/TS Formatter, Markdown Formatter) that call Prettier
- `vi.useFakeTimers()` + `fireEvent.click` for components using `setInterval` (TimestampConverter)
- `vi.spyOn(globalThis.crypto, 'randomUUID')` + `afterEach(() => vi.restoreAllMocks())` for UuidGenerator

---

## Architecture

**No backend.** All processing runs in the browser via standard Web APIs (`DOMParser`, `SubtleCrypto`, `crypto.randomUUID`, `Clipboard`). No data leaves the client.

**Layering rule:** business logic lives in `src/lib/` as pure, side-effect-free functions. Components are thin — they manage local UI state and call lib functions. This keeps lib functions fast to test without a DOM.

**Tailwind CSS v4.** No `tailwind.config.js`. All configuration (fonts, design tokens) is defined via `@theme {}` blocks in `src/index.css`.

**React Compiler.** Enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel`. Do not add manual `useMemo`/`useCallback` performance wrappers — the compiler handles memoisation. Use `useMemo` only for semantically derived values (e.g. formatter output).

**GitHub Pages.** `base: '/devchest/'` in `vite.config.ts` ensures assets resolve correctly under the subdirectory. Deployment is automated via `.github/workflows/deploy.yml` on every push to `main`.

---

## Contributing

Contributions are welcome. To add a new tool, follow the steps in [`CLAUDE.md`](./CLAUDE.md):

1. Create `src/lib/<name>.ts` with pure functions and export types
2. Create `src/components/tools/<category>/<Name>.tsx` using `ToolLayout` and `Panel`
3. Register the tool in `src/config/tools.ts`
4. Add a `React.lazy` import and Suspense case in `src/App.tsx`
5. Write `src/__tests__/lib/<name>.test.ts` and `src/__tests__/components/<Name>.test.tsx`
6. Run `npm run test:run && npm run build` — both must pass clean before opening a PR

See [`roadmap.md`](./roadmap.md) for the full list of planned tools.
