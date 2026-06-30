# DevChest — Claude Code Instructions

## Commands

```bash
npm run dev          # Vite dev server at localhost:5173
npm run build        # tsc -b && vite build  (type-check then bundle)
npm run lint         # ESLint
npm run test         # Vitest watch mode
npm run test:run     # Vitest single pass (use this to verify before committing)
npm run test:coverage
```

Always run `npm run test:run` and `npm run build` after making changes. Both must pass clean.

## Architecture

**No backend.** All processing is in the browser. No data leaves the client.

```
src/
├── lib/             # Pure functions — testable with no DOM
├── components/
│   ├── layout/      # Sidebar, ToolLayout
│   └── tools/       # 12 tool components, grouped by category
├── config/tools.ts  # Central registry: TOOLS[] and CATEGORIES[]
├── context/         # ToolContext (activeToolId, searchQuery)
├── hooks/           # useLocalStorage
└── __tests__/       # Mirror of src/ — lib/, hooks/, components/
```

The layering rule: business logic lives in `src/lib/`, components only read state and call lib functions. This keeps components thin and lib functions independently testable.

## Adding a New Tool

1. Create `src/lib/<name>.ts` with pure functions and export types.
2. Create `src/components/tools/<category>/<Name>.tsx` using `ToolLayout` and `Panel`.
3. Register it in `src/config/tools.ts` (add to `TOOLS[]` and ensure the category exists in `CATEGORIES[]`).
4. Add a `React.lazy` import and a `<Suspense>` case in `src/App.tsx`.
5. Write `src/__tests__/lib/<name>.test.ts` and `src/__tests__/components/<Name>.test.tsx`.

## TypeScript Constraints

- **`erasableSyntaxOnly: true`** — no `enum`, no `namespace`. Use `const` objects or union types instead.
- **`verbatimModuleSyntax: true`** — type-only imports must use `import type { Foo }`, not `import { Foo }`.
- **`noUnusedLocals` / `noUnusedParameters`** — no dead variables. Prefix intentionally unused params with `_`.
- Test files are excluded from `tsconfig.app.json` and covered by `tsconfig.node.json` via `vitest.config.ts`.

## Tailwind CSS v4

No `tailwind.config.js`. All configuration is in `src/index.css` via `@theme { }` blocks.

```css
@import "tailwindcss";
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

Glassmorphism card pattern used throughout:
```
bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5
```

Page background: `bg-[#1c1c1e]`. Accent: `blue-500` / `blue-600`. Success: `emerald-500`.

## React Compiler

Enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel`. Do not add manual `useMemo` / `useCallback` optimisation wrappers — the compiler handles memoisation automatically. Do use `useMemo` for derived values that are semantically computed (e.g. formatter output), not for performance.

## GitHub Pages Deployment

`base: '/devchest/'` is set in `vite.config.ts`. All asset paths in the built output are relative to this subpath. Do not remove or change it.

## Testing Rules

**Framework:** Vitest 4 + `@testing-library/react` + `@testing-library/user-event` v14 + `@testing-library/jest-dom`.

Setup file: `src/test/setup.ts` — imported via `vitest.config.ts`. It registers jest-dom matchers (`@testing-library/jest-dom/vitest`) and sets up `ResizeObserver`.

**Global clipboard mock** is in `setup.ts` but `userEvent.setup()` installs its own clipboard implementation and overwrites it. Always set clipboard mocks **after** calling `userEvent.setup()`:

```ts
const user = userEvent.setup();
const readTextFn = vi.fn().mockResolvedValue('some text');
Object.defineProperty(navigator, 'clipboard', {
  value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
  configurable: true,
  writable: true,
});
```

**Special characters in `userEvent.type`:**
- `{` and `}` are key-sequence delimiters — use `fireEvent.change` for any input that contains them (JSON, CSS).
- `[` starts pointer-key syntax — use `fireEvent.change` for regex patterns.

**Fake timers + components with `setInterval`** (e.g. `TimestampConverter`): use `fireEvent.click` instead of `userEvent.click`. `userEvent` tries to advance timers and gets stuck in the interval loop.

**Crypto spy for `UuidGenerator`:**

```ts
beforeEach(() => {
  vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(MOCK_UUID as ...);
});
afterEach(() => {
  vi.restoreAllMocks(); // required — prevents spy stacking across tests
});
```

**Multiple elements with the same text:** `getByText` throws if more than one element matches. Use `document.body.toHaveTextContent('...')` or `getAllByText(...)` when a string appears in both a leaf element and its parent (e.g. "HS256" in both a `<span>` and `<pre>`).

**`getRegexSegments` returns `error: null` when `testString` is empty** — always set both `pattern` and `testString` when testing invalid-regex error states.

**Controlled number inputs:** `user.clear()` then `user.type('3')` on a React-controlled `<input type="number">` appends to the restored state value, not the cleared DOM value. Use `fireEvent.change(input, { target: { value: '3' } })` to set the value directly.

**Quantity + `getByText` for UuidGenerator:** setting quantity > 1 produces N identical UUID spans; `getByText` throws on multiple matches. Set quantity to 1 before asserting a single element.

## File Naming

- Components: `PascalCase.tsx`
- Lib modules: `camelCase.ts`
- Tests: `<ComponentName>.test.tsx` / `<moduleName>.test.ts` in `src/__tests__/` mirroring `src/`
