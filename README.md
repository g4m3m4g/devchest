# DevChest

A client-side developer utility hub built with React 19, Vite 8, and Tailwind CSS v4. Twelve tools covering the most common day-to-day tasks — formatting, encoding, hashing, and text transformation — all running entirely in the browser with no backend or data transmission.

**Live:** [g4m3m4g.github.io/devchest](https://g4m3m4g.github.io/devchest)

---

## Tools

| Category | Tool | Description |
|---|---|---|
| Formatters | JSON Formatter | Format and validate JSON with configurable indentation or minify |
| Formatters | SQL Formatter | Format SQL queries with dialect-aware pretty-printing |
| Formatters | HTML / CSS Minifier | Strip whitespace and comments from HTML and CSS |
| Encoders | Base64 Tool | Encode and decode text or images via drag-and-drop |
| Encoders | URL Encoder | Encode and decode URL components |
| Encoders | JWT Decoder | Inspect JWT header, payload, and expiration status client-side |
| Text | Regex Tester | Test regular expressions with live inline match highlighting |
| Text | Case Converter | Transform text into eight casing formats simultaneously |
| Text | Diff Checker | Side-by-side text comparison with line-level diff highlighting |
| Generators | Hash Generator | Compute MD5, SHA-1, SHA-256, and SHA-512 hashes in parallel |
| Generators | UUID Generator | Bulk-generate v4 UUIDs with delimiter and case controls |
| Generators | Timestamp Converter | Convert Unix epochs and date strings with a live ticker |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 with React Compiler |
| Build tool | Vite 8 with Rolldown |
| Language | TypeScript 6 (`erasableSyntaxOnly`, `verbatimModuleSyntax`) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Icons | Lucide React |
| Testing | Vitest 4 + Testing Library |

---

## Getting Started

**Prerequisites:** Node.js 22 or later.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run the test suite
npm test

# Build for production
npm run build
```

The dev server starts at `http://localhost:5173`. The production build outputs to `dist/` and is configured for deployment to the `/DevChest/` subpath on GitHub Pages.

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, ToolLayout (header + Copy/Paste/Clear)
│   └── tools/
│       ├── encoders/    # Base64Tool, JwtDecoder, UrlEncoder
│       ├── formatters/  # HtmlCssMinifier, JsonFormatter, SqlFormatter
│       ├── generators/  # HashGenerator, TimestampConverter, UuidGenerator
│       └── text/        # CaseConverter, DiffChecker, RegexTester
├── config/              # Tool and category registry
├── context/             # ToolContext (active tool, search query)
├── hooks/               # useLocalStorage
├── lib/                 # Pure utility functions (tested independently)
│   ├── base64.ts
│   ├── cases.ts
│   ├── jwt.ts
│   ├── minifiers.ts
│   ├── regex.ts
│   ├── timestamp.ts
│   ├── url.ts
│   └── uuid.ts
└── __tests__/           # 247 tests across 21 files
    ├── components/      # Component integration tests
    ├── hooks/
    └── lib/             # Unit tests for utility modules
```

All tools are lazy-loaded via `React.lazy` + `Suspense` to keep the initial bundle small. Business logic lives in `src/lib/` as pure functions, keeping components thin and tests fast.

---

## Testing

```bash
npm run test:run        # Single pass
npm run test:coverage   # With V8 coverage report
```

The suite covers all 12 tool components, 8 utility modules, and the `useLocalStorage` hook — **247 tests, 0 failures**.

Key testing patterns used:
- `fireEvent.change` for inputs containing special characters (`{`, `}`, `[`) to avoid userEvent key-sequence interpretation
- Clipboard mocks set **after** `userEvent.setup()` to prevent userEvent from overwriting them
- `vi.useFakeTimers()` + `fireEvent.click` for components with `setInterval` (TimestampConverter)
- `vi.spyOn(globalThis.crypto, 'randomUUID')` + `afterEach(() => vi.restoreAllMocks())` for UuidGenerator

---

## Architecture Notes

- **No backend.** All processing is done in the browser. No data leaves the client.
- **Tailwind CSS v4.** Configuration is handled entirely through `@theme` blocks in CSS — no `tailwind.config.js`.
- **React Compiler.** Enabled via `babel-plugin-react-compiler` and `@rolldown/plugin-babel`. Components are written without manual `useMemo`/`useCallback` memoisation guards.
- **TypeScript 6.** `erasableSyntaxOnly: true` disallows `enum` and `namespace`. All type-only imports use `import type`.
- **GitHub Pages.** `base: '/devchest/'` in `vite.config.ts` ensures asset paths resolve correctly under the subdirectory.
