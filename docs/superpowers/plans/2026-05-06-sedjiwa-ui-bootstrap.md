# sedjiwa-ui Bootstrap & Pipeline Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `sedjiwa-ui` package with build/test/publish pipeline, foundational utilities (`cn`, design tokens), one fully-implemented primitive (`Button`), a dev playground, GitHub Actions CI, and a smoke-test publish of `v0.0.1` to the private registry. Validates the entire pipeline before fanning out to the remaining 18 primitives in Plan B.

**Architecture:** Standalone git repo at `sedjiwa-ui/`. Vite-based playground for local dev, tsup for the published artifact (ESM-only, declaration files included). Tailwind v4 utility classes baked into JSX; consumer's Tailwind scans the lib's `dist/` via `@source`. Theming via shadcn-shaped CSS variables.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, tsup, vitest, @testing-library/react, jsdom, ESLint flat config, class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot.

**Spec:** `docs/superpowers/specs/2026-05-06-sedjiwa-ui-design.md`

**Working directory:** `/home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui`

---

## File Structure

Files created or modified by this plan:

```
sedjiwa-ui/
├── .github/workflows/ci.yml              # CI: lint + test + build on push
├── .gitignore                            # node_modules, dist, etc.
├── .npmrc                                # registry config (placeholder)
├── README.md                             # consumer setup guide
├── eslint.config.js                      # flat config
├── package.json                          # name, scripts, deps, exports
├── playground/index.html                 # dev playground entry
├── playground/src/main.tsx               # mounts <Playground />
├── playground/src/playground.tsx         # routes per primitive
├── playground/styles.css                 # imports lib styles + Tailwind
├── playground/tsconfig.json              # extends root tsconfig
├── playground/vite.config.ts             # Vite config for playground
├── src/components/button/button.tsx      # Button component
├── src/components/button/button.test.tsx # Button behavioral tests
├── src/components/button/button.variants.ts  # CVA variant definitions
├── src/components/button/index.ts        # re-exports for the folder
├── src/index.ts                          # public barrel
├── src/lib/cn.ts                         # tailwind-merge + clsx helper
├── src/lib/cn.test.ts                    # cn helper tests
├── src/styles/tokens.css                 # CSS variable definitions (light + dark)
├── src/styles/base.css                   # imports tokens, exposes @theme
├── src/test/setup.ts                     # vitest jsdom setup
├── tsconfig.json                         # strict TS for lib build
├── tsconfig.eslint.json                  # tsconfig ESLint references
├── tsup.config.ts                        # build config
└── vitest.config.ts                      # test config
```

---

## Task 1: Initialize package.json, tsconfig, .gitignore

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.npmrc`

- [ ] **Step 1: Create `.gitignore`**

Write to `.gitignore`:
```
node_modules
dist
coverage
.DS_Store
*.log
.env
.env.local
```

- [ ] **Step 2: Create `package.json`**

Write to `package.json`:
```json
{
  "name": "@qyubit/sedjiwa-ui",
  "version": "0.0.1",
  "description": "Shared React + TailwindCSS UI primitives for sedjiwa-portal apps.",
  "type": "module",
  "license": "UNLICENSED",
  "files": [
    "dist",
    "README.md"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": [
    "**/*.css"
  ],
  "scripts": {
    "dev": "vite --config playground/vite.config.ts",
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "@radix-ui/react-slot": "^1.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "tw-animate-css": "^1.4.0"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@radix-ui/react-slot": "^1.2.4",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "@tailwindcss/vite": "^4.1.18",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "jsdom": "^29.0.0",
    "tw-animate-css": "^1.4.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwindcss": "^4.1.18",
    "tsup": "^8.3.5",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^2.1.8"
  },
  "publishConfig": {
    "registry": "https://npm.qyubit.io/"
  }
}
```

> **Note for engineer:** Confirm the registry URL with the team — replace `https://npm.qyubit.io/` if `@qyubit/sedjiwa-permissions` uses a different one. Check `uang-gantung/frontend/package.json`'s install metadata or ask the team before publishing.

- [ ] **Step 3: Create `tsconfig.json`**

Write to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "playground"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create `.npmrc`**

Write to `.npmrc`:
```
@qyubit:registry=https://npm.qyubit.io/
//npm.qyubit.io/:_authToken=${NPM_TOKEN}
```

> **Note:** The `${NPM_TOKEN}` is read from the environment (CI sets it as a secret). Do not commit a token. Confirm registry URL matches what publishes `@qyubit/sedjiwa-permissions`.

- [ ] **Step 5: Install dependencies and verify**

Run: `bun install`

Expected: lockfile created, no errors. Confirm `node_modules/@radix-ui/react-slot` and `node_modules/class-variance-authority` exist.

- [ ] **Step 6: Commit**

```bash
git add .gitignore .npmrc package.json tsconfig.json bun.lock
git commit -m "chore: bootstrap package.json, tsconfig, gitignore"
```

---

## Task 2: tsup build config

**Files:**
- Create: `tsup.config.ts`

- [ ] **Step 1: Write `tsup.config.ts`**

```typescript
import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "tailwindcss"],
  treeshake: true,
  splitting: false,
  async onSuccess() {
    mkdirSync("dist", { recursive: true });
    copyFileSync("src/styles/base.css", "dist/styles.css");
  },
});
```

- [ ] **Step 2: Create a placeholder `src/index.ts` so build can run**

Write to `src/index.ts`:
```typescript
export {};
```

- [ ] **Step 3: Create placeholder `src/styles/base.css`**

Write to `src/styles/base.css`:
```css
/* placeholder — replaced in Task 6 */
```

- [ ] **Step 4: Run build, verify output**

Run: `bun run build`

Expected: command exits 0; `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` all exist.

- [ ] **Step 5: Commit**

```bash
git add tsup.config.ts src/index.ts src/styles/base.css
git commit -m "chore: tsup build config"
```

---

## Task 3: vitest config + jsdom setup

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 2: Write `src/test/setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Create a smoke test to verify the runner works**

Write to `src/test/smoke.test.ts`:
```typescript
import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `bun run test`

Expected: 1 test passing, 0 failing.

- [ ] **Step 5: Delete the smoke test (no longer needed)**

Run: `rm src/test/smoke.test.ts`

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/test/setup.ts
git commit -m "chore: vitest + jsdom + testing-library setup"
```

---

## Task 4: ESLint flat config

**Files:**
- Create: `eslint.config.js`

- [ ] **Step 1: Write `eslint.config.js`**

```javascript
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);
```

- [ ] **Step 2: Run lint**

Run: `bun run lint`

Expected: command exits 0 (no files to lint yet, but no config errors).

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "chore: eslint flat config"
```

---

## Task 5: `cn` helper with TDD

**Files:**
- Create: `src/lib/cn.test.ts`
- Create: `src/lib/cn.ts`

- [ ] **Step 1: Write the failing test**

Write to `src/lib/cn.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("merges conflicting tailwind utilities — last one wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, undefined, null, "", "bar")).toBe("foo bar");
  });

  it("expands conditional class objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens arrays", () => {
    expect(cn(["a", "b"], ["c", { d: true }])).toBe("a b c d");
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `bun run test src/lib/cn.test.ts`

Expected: FAIL — module `./cn` not found.

- [ ] **Step 3: Implement `cn`**

Write to `src/lib/cn.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `bun run test src/lib/cn.test.ts`

Expected: 5 tests passing, 0 failing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cn.ts src/lib/cn.test.ts
git commit -m "feat: cn helper (clsx + tailwind-merge)"
```

---

## Task 6: Design tokens stylesheet

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/base.css` (replace placeholder)

- [ ] **Step 1: Write `src/styles/tokens.css`**

This file contains all CSS variables for light + dark themes. Source: ported from `uang-gantung/frontend/src/index.css` lines 58–166. Copy as-is — these are the canonical tokens for the design system. Do not modify color values; if a consumer needs different tokens, they override in their own CSS after `@import`ing the library stylesheet.

```css
:root {
  --radius: 0.625rem;

  --background: oklch(0.99 0.005 175);
  --foreground: oklch(0.18 0.02 200);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.02 200);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.02 200);

  --primary: oklch(0.55 0.13 175);
  --primary-foreground: oklch(0.99 0.005 175);

  --secondary: oklch(0.96 0.01 175);
  --secondary-foreground: oklch(0.25 0.03 195);

  --muted: oklch(0.96 0.008 175);
  --muted-foreground: oklch(0.5 0.015 195);

  --accent: oklch(0.95 0.03 175);
  --accent-foreground: oklch(0.3 0.06 185);

  --destructive: oklch(0.58 0.22 27);
  --destructive-foreground: oklch(0.99 0.005 175);

  --success: oklch(0.62 0.14 155);
  --success-foreground: oklch(0.99 0.005 175);

  --warning: oklch(0.7 0.15 70);
  --warning-foreground: oklch(0.2 0.03 70);

  --info: oklch(0.6 0.13 240);
  --info-foreground: oklch(0.99 0.005 175);

  --border: oklch(0.92 0.01 175);
  --input: oklch(0.92 0.01 175);
  --ring: oklch(0.55 0.13 175);

  --chart-1: oklch(0.55 0.13 175);
  --chart-2: oklch(0.6 0.15 245);
  --chart-3: oklch(0.7 0.15 70);
  --chart-4: oklch(0.62 0.14 155);
  --chart-5: oklch(0.62 0.2 305);

  --sidebar: oklch(0.985 0.005 175);
  --sidebar-foreground: oklch(0.22 0.02 200);
  --sidebar-primary: oklch(0.55 0.13 175);
  --sidebar-primary-foreground: oklch(0.99 0.005 175);
  --sidebar-accent: oklch(0.95 0.025 175);
  --sidebar-accent-foreground: oklch(0.3 0.06 185);
  --sidebar-border: oklch(0.92 0.01 175);
  --sidebar-ring: oklch(0.55 0.13 175);
}

.dark {
  --background: oklch(0.16 0.012 200);
  --foreground: oklch(0.96 0.005 175);

  --card: oklch(0.21 0.014 200);
  --card-foreground: oklch(0.96 0.005 175);

  --popover: oklch(0.21 0.014 200);
  --popover-foreground: oklch(0.96 0.005 175);

  --primary: oklch(0.72 0.13 175);
  --primary-foreground: oklch(0.18 0.02 200);

  --secondary: oklch(0.27 0.018 200);
  --secondary-foreground: oklch(0.96 0.005 175);

  --muted: oklch(0.26 0.015 200);
  --muted-foreground: oklch(0.72 0.012 195);

  --accent: oklch(0.32 0.05 185);
  --accent-foreground: oklch(0.96 0.005 175);

  --destructive: oklch(0.7 0.2 25);
  --destructive-foreground: oklch(0.98 0.005 175);

  --success: oklch(0.72 0.14 155);
  --success-foreground: oklch(0.16 0.02 200);

  --warning: oklch(0.78 0.15 75);
  --warning-foreground: oklch(0.2 0.03 70);

  --info: oklch(0.72 0.13 240);
  --info-foreground: oklch(0.16 0.02 200);

  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.72 0.13 175);

  --chart-1: oklch(0.72 0.13 175);
  --chart-2: oklch(0.72 0.15 245);
  --chart-3: oklch(0.78 0.15 75);
  --chart-4: oklch(0.72 0.14 155);
  --chart-5: oklch(0.72 0.2 305);

  --sidebar: oklch(0.18 0.014 200);
  --sidebar-foreground: oklch(0.96 0.005 175);
  --sidebar-primary: oklch(0.72 0.13 175);
  --sidebar-primary-foreground: oklch(0.16 0.02 200);
  --sidebar-accent: oklch(0.26 0.02 200);
  --sidebar-accent-foreground: oklch(0.96 0.005 175);
  --sidebar-border: oklch(1 0 0 / 8%);
  --sidebar-ring: oklch(0.72 0.13 175);
}
```

- [ ] **Step 2: Replace `src/styles/base.css` with the real content**

Write to `src/styles/base.css` (overwrite the placeholder from Task 2):
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./tokens.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

> **Note:** This file does NOT set `body` background, font, or `html` font-family. The library does not impose typography or page-level styling on consumer apps — those decisions stay with the consumer.

- [ ] **Step 3: Verify build still works**

Run: `bun run build`

Expected: command exits 0; `dist/styles.css` contains the contents of `src/styles/base.css`.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/styles/base.css
git commit -m "feat: design tokens (light + dark) and base stylesheet"
```

---

## Task 7: Vite playground app scaffold

**Files:**
- Create: `playground/index.html`
- Create: `playground/src/main.tsx`
- Create: `playground/src/playground.tsx`
- Create: `playground/styles.css`
- Create: `playground/tsconfig.json`
- Create: `playground/vite.config.ts`

- [ ] **Step 1: Write `playground/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>sedjiwa-ui playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Write `playground/styles.css`**

```css
@import "tailwindcss";
@import "../src/styles/base.css";

@source "../src";
```

> **Note:** `@source "../src"` tells Tailwind to scan the library's source for utility classes used in components. This is exactly the directive consumer apps will use (pointed at `node_modules/@qyubit/sedjiwa-ui` instead).

- [ ] **Step 3: Write `playground/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Playground } from "./playground";
import "../styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root");

createRoot(rootEl).render(
  <StrictMode>
    <Playground />
  </StrictMode>
);
```

- [ ] **Step 4: Write `playground/src/playground.tsx`**

```tsx
export function Playground() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-semibold mb-6">sedjiwa-ui playground</h1>
      <p className="text-muted-foreground">
        Components will appear here as they are added.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Write `playground/tsconfig.json`**

```json
{
  "extends": "../tsconfig.json",
  "include": ["src", "../src"]
}
```

- [ ] **Step 6: Write `playground/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@qyubit/sedjiwa-ui": resolve(__dirname, "../src/index.ts"),
    },
  },
});
```

- [ ] **Step 7: Start the playground**

Run: `bun run dev`

Expected: Vite reports a local URL (usually `http://localhost:5173`). Open it and confirm the page renders the heading "sedjiwa-ui playground" with a tinted background (proves tokens + Tailwind are wired). Stop the dev server (Ctrl-C).

- [ ] **Step 8: Commit**

```bash
git add playground/
git commit -m "feat: vite playground scaffold"
```

---

## Task 8: Button — variants definition

**Files:**
- Create: `src/components/button/button.variants.ts`

- [ ] **Step 1: Write the variants file**

Source pattern: ported from `uang-gantung/frontend/src/components/ui/button.tsx` lines 7–37 (the `cva()` block), extracted into its own file so the component file stays focused on rendering.

Write to `src/components/button/button.variants.ts`:
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

- [ ] **Step 2: Verify TS compiles**

Run: `bun run typecheck`

Expected: command exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/button/button.variants.ts
git commit -m "feat(button): variants definition"
```

---

## Task 9: Button — component & behavioral tests (TDD)

**Files:**
- Create: `src/components/button/button.test.tsx`
- Create: `src/components/button/button.tsx`
- Create: `src/components/button/index.ts`

- [ ] **Step 1: Write the failing tests**

Write to `src/components/button/button.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("<Button />", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>);
    expect(
      screen.getByRole("button", { name: "Save" })
    ).toBeInTheDocument();
  });

  it("applies default variant and size data attributes", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-slot", "button");
    expect(btn).toHaveAttribute("data-variant", "default");
    expect(btn).toHaveAttribute("data-size", "default");
  });

  it("applies the requested variant and size data attributes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "destructive");
    expect(btn).toHaveAttribute("data-size", "lg");
  });

  it("forwards onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges consumer className with variant classes", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders as a child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/home">Home</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveAttribute("data-slot", "button");
  });

  it("forwards ref to the underlying element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `bun run test src/components/button/button.test.tsx`

Expected: FAIL — module `./button` not found.

- [ ] **Step 3: Implement `button.tsx`**

Write to `src/components/button/button.tsx`:
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

> **Note:** React 19 passes `ref` as a regular prop on `React.ComponentProps<"button">`; no `forwardRef` needed. The `Slot` from Radix forwards the ref to its child when `asChild` is true.

- [ ] **Step 4: Write `src/components/button/index.ts`**

```typescript
export { Button, type ButtonProps } from "./button";
export { buttonVariants, type ButtonVariants } from "./button.variants";
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `bun run test src/components/button/button.test.tsx`

Expected: 8 tests passing, 0 failing.

- [ ] **Step 6: Commit**

```bash
git add src/components/button/
git commit -m "feat(button): component, slot support, behavioral tests"
```

---

## Task 10: Wire Button into the public barrel

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update `src/index.ts`**

Replace the entire contents of `src/index.ts` (which currently is `export {};`) with:
```typescript
export { Button, buttonVariants } from "./components/button";
export type { ButtonProps, ButtonVariants } from "./components/button";

export { cn, type ClassValue } from "./lib/cn";
```

- [ ] **Step 2: Verify build emits Button in `dist/index.js`**

Run: `bun run build`

Expected: command exits 0. Confirm `dist/index.d.ts` exports `Button`, `buttonVariants`, `cn`. (Use `grep "export" dist/index.d.ts` to check.)

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: export Button, buttonVariants, cn from public barrel"
```

---

## Task 11: Show Button in the playground

**Files:**
- Modify: `playground/src/playground.tsx`

- [ ] **Step 1: Replace `playground/src/playground.tsx`**

```tsx
import { Button } from "@qyubit/sedjiwa-ui";

const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
const sizes = ["sm", "default", "lg"] as const;

export function Playground() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">sedjiwa-ui playground</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toggle <code className="font-mono">.dark</code> on{" "}
          <code className="font-mono">&lt;html&gt;</code> in devtools to preview dark mode.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button — variants</h2>
        <div className="flex flex-wrap gap-3">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button — sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((s) => (
            <Button key={s} size={s}>
              size={s}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button — disabled</h2>
        <Button disabled>Disabled</Button>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run the playground and inspect visually**

Run: `bun run dev`

Open the URL Vite reports. Verify:
- All 6 variants render with distinct styling.
- All 3 sizes render with distinct heights.
- The disabled button is dimmed and not clickable.
- Toggle `<html class="dark">` in devtools — colors invert correctly.

Stop the dev server (Ctrl-C).

- [ ] **Step 3: Commit**

```bash
git add playground/src/playground.tsx
git commit -m "chore(playground): showcase Button variants and sizes"
```

---

## Task 12: README with consumer setup guide

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# @qyubit/sedjiwa-ui

Shared React + Tailwind CSS UI primitives for the sedjiwa-portal apps.

## Status

`v0.0.x` is a pipeline-validation preview. The full v0.1.0 ships ~19 primitives — see Plan B.

## Requirements

- React 19+
- Tailwind CSS 4+
- A consumer app set up to use Tailwind v4's `@source` directive.

## Install

```bash
bun add @qyubit/sedjiwa-ui
```

## Setup

In your app's main stylesheet (e.g., `src/index.css`):

```css
@import "tailwindcss";
@import "@qyubit/sedjiwa-ui/styles.css";

@source "../node_modules/@qyubit/sedjiwa-ui";
```

The `@source` directive tells Tailwind to scan the library's compiled JSX so utility classes used inside our components are emitted into your final CSS.

## Theming

The library exposes shadcn-shaped CSS variables: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--success`, `--warning`, `--info`, `--border`, `--input`, `--ring`, `--radius`, plus `--sidebar-*` and `--chart-*`.

Override any token in your own `:root { ... }` and `.dark { ... }` blocks **after** importing the library stylesheet.

## Dark mode

Toggle the `.dark` class on `<html>` (or any ancestor of your app):

```ts
document.documentElement.classList.toggle("dark");
```

## Components (preview)

- `<Button />` — variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`. Supports `asChild` for composition.

## Development

```bash
bun install
bun run dev       # vite playground
bun run test      # vitest
bun run build     # tsup
bun run lint
```

## Publishing

Publish is gated by tag pushes (`v*`) in CI. See `.github/workflows/ci.yml`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with consumer setup, theming, dark mode"
```

---

## Task 13: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run typecheck
      - run: bun run test
      - run: bun run build

  publish:
    needs: verify
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run build
      - name: Publish to private registry
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: bun publish
```

> **Note for engineer:** Confirm `secrets.NPM_TOKEN` exists in the GitHub repo settings before pushing a tag. Confirm `bun publish` is the correct command for the private registry — if `@qyubit/sedjiwa-permissions` uses `npm publish` instead, mirror that.

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "ci: lint + typecheck + test + build, gated publish on v* tags"
```

---

## Task 14: Local pre-publish smoke test

**Files:** none — this task validates the package can be installed by a consumer.

- [ ] **Step 1: Run a clean build**

Run: `bun run build`

Expected: `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` exist.

- [ ] **Step 2: Pack the tarball**

Run: `bun pm pack`

Expected: a `.tgz` file is created at the repo root (e.g., `qyubit-sedjiwa-ui-0.0.1.tgz`).

- [ ] **Step 3: Inspect the tarball contents**

Run: `tar -tzf qyubit-sedjiwa-ui-0.0.1.tgz | sort`

Expected: file list includes `package/dist/index.js`, `package/dist/index.d.ts`, `package/dist/styles.css`, `package/package.json`, `package/README.md`. It MUST NOT include `src/`, `playground/`, `node_modules/`, or test files (the `files` field in `package.json` controls this).

- [ ] **Step 4: Smoke-install into a scratch directory**

```bash
mkdir -p /tmp/sedjiwa-ui-smoke
cp qyubit-sedjiwa-ui-0.0.1.tgz /tmp/sedjiwa-ui-smoke/
cd /tmp/sedjiwa-ui-smoke
bun init -y
bun add ./qyubit-sedjiwa-ui-0.0.1.tgz react react-dom @radix-ui/react-slot tailwindcss
```

Expected: install succeeds. Check `node_modules/@qyubit/sedjiwa-ui/dist/` exists.

- [ ] **Step 5: Smoke-import in a TS file**

In `/tmp/sedjiwa-ui-smoke`, write `smoke.ts`:
```typescript
import { Button, cn } from "@qyubit/sedjiwa-ui";
console.log(typeof Button, typeof cn);
```

Run: `bun run smoke.ts`

Expected: prints `function function`. (Components are functions.)

- [ ] **Step 6: Clean up scratch dir and tarball**

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui
rm -rf /tmp/sedjiwa-ui-smoke
rm qyubit-sedjiwa-ui-0.0.1.tgz
```

- [ ] **Step 7: Tag and document the smoke test**

The smoke test is a manual gate — no commit needed. Move on to Task 15 only if every step above passed.

---

## Task 15: Publish v0.0.1 to private registry

**Files:** none — this task pushes a tag and lets CI publish.

> **⚠️ Confirm with the user before running this task.** Publishing is a side-effecting, hard-to-reverse action. The user should explicitly approve before the tag is pushed.

- [ ] **Step 1: Confirm CI is green on `main`**

Check the GitHub Actions tab. The most recent push to `main` should have passed `verify`. If not, fix before tagging.

- [ ] **Step 2: Tag v0.0.1**

```bash
git tag v0.0.1
git push origin v0.0.1
```

- [ ] **Step 3: Watch the publish job**

Monitor the `publish` workflow in GitHub Actions. Expected: succeeds, package appears in the private registry.

- [ ] **Step 4: Verify the published package**

```bash
mkdir -p /tmp/sedjiwa-ui-published
cd /tmp/sedjiwa-ui-published
bun init -y
bun add @qyubit/sedjiwa-ui@0.0.1
ls node_modules/@qyubit/sedjiwa-ui/dist/
```

Expected: `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` are present.

- [ ] **Step 5: Clean up**

```bash
rm -rf /tmp/sedjiwa-ui-published
```

---

## Done

The pipeline is validated end-to-end:

- ✅ Repo bootstrapped with strict TS, ESLint, Vitest, tsup
- ✅ `cn` helper tested
- ✅ Design tokens shipped
- ✅ Playground app runs locally
- ✅ Button — full TDD coverage (variants, sizes, disabled, asChild, ref forwarding)
- ✅ README with consumer setup
- ✅ CI runs lint+typecheck+test+build on every push, publishes on tags
- ✅ v0.0.1 published to private registry and reinstallable

**Next:** Plan B will fan out the remaining 18 primitives, each as an independent task suitable for parallel subagent execution. v0.1.0 ships when Plan B completes. Consumer migration (uang-gantung) is deferred — the user will handle that separately when the time comes.
