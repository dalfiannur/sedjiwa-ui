# sedjiwa-ui — Design Spec

**Status:** Approved 2026-05-06
**Owner:** uray@qyubit.io

## Goals

`sedjiwa-ui` is a React + TailwindCSS UI library that consolidates the duplicated `components/ui/` primitives currently scattered across the sedjiwa-portal monorepo apps (uang-gantung, sales-pipeline, kreasi-quotation, magenta-quotation, …). It ships as an installable NPM package (`@qyubit/sedjiwa-ui`) so apps consume one versioned source of truth.

The library is built first to serve internal consumers, but its API surface, theming model, and documentation are designed so it can later be opened to external use without breaking changes.

### Non-goals (v1)

- Composed application patterns (PageHeader, AppSidebar, ConfirmDialog wrapper, DataTable). These will be extracted in a later version after they have proven stable across multiple apps.
- A public docs site. The dev playground covers v1 needs; Storybook + docs site come with v1.0.0.
- Tailwind v3 support. All consumer apps already run Tailwind v4.
- Multi-framework support (Vue, Svelte, etc.).

## Scope

Port the ~20 primitives currently duplicated in uang-gantung's `src/components/ui/`:

`alert-dialog`, `avatar`, `badge`, `breadcrumb`, `button`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `table`, `tabs`, plus `tooltip` and `popover` if they exist in another app.

Each primitive is a thin wrapper over its corresponding Radix UI package, styled with Tailwind utility classes via `class-variance-authority`.

## Architecture

### Repo structure

```
sedjiwa-ui/
├── src/
│   ├── components/
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.variants.ts   # CVA definitions
│   │   │   └── button.test.tsx
│   │   ├── dialog/
│   │   ├── input/
│   │   └── ...                      # one folder per primitive
│   ├── lib/
│   │   └── cn.ts                    # tailwind-merge + clsx helper
│   ├── styles/
│   │   ├── tokens.css               # CSS variables (colors, radii, etc.)
│   │   └── base.css                 # imports tokens + light/dark
│   └── index.ts                     # barrel export
├── playground/                      # local Vite app for visual dev
│   ├── index.html
│   └── src/main.tsx
├── package.json
├── tsup.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

One folder per component (not a flat directory) so each primitive can grow variants, tests, and helper files without polluting siblings.

### Public API surface

- Single barrel: `import { Button, Dialog, … } from '@qyubit/sedjiwa-ui'`.
- Subpath imports (`@qyubit/sedjiwa-ui/button`) are NOT exposed in v1, keeping the package's `exports` map small and movable.
- One stylesheet entry: `@qyubit/sedjiwa-ui/styles.css` (tokens + base).
- The `cn` helper is exported so consumers can compose classes the same way the library does.

## Styling & Tailwind v4 distribution

The library does NOT ship a precompiled stylesheet of utility classes. Instead:

1. Components ship with Tailwind utility classes baked into JSX inside `dist/`.
2. Consumer apps add two lines to their main CSS:
   ```css
   @import "@qyubit/sedjiwa-ui/styles.css";
   @source "../node_modules/@qyubit/sedjiwa-ui";
   ```
   - `styles.css` provides the design tokens and the `@theme` block.
   - `@source` directs the consumer's Tailwind v4 to scan the library's `dist/` so utility classes used inside our components are emitted into the final CSS.
3. Theming is driven entirely by CSS variables. Token names mirror shadcn convention so existing apps migrate with no rename: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, plus dark-mode counterparts under `.dark`.
4. Consumer toggles dark mode by setting `.dark` on `<html>` (matches the existing `next-themes` setup in uang-gantung).
5. `tw-animate-css` is a peer dependency (already used by uang-gantung) for entrance/exit animation utilities on Radix-driven components.

**Trade-off:** Consumers must run Tailwind v4. This is acceptable because all current consumer apps already run v4.

## Component API conventions

- **`cn` helper** — `clsx` + `tailwind-merge`, exported from the package.
- **`class-variance-authority` (CVA)** for variant systems. Each component exports both the component and its `*Variants` (e.g., `Button` and `buttonVariants`) so consumers can build composed components without forking source.
- **`asChild` prop via Radix `Slot`** — preserved for composition (e.g., `<Button asChild><Link to="/">…</Link></Button>`).
- **React 19 — no `forwardRef`.** Refs are passed as a normal prop in React 19; the library uses that and avoids `forwardRef` to keep types clean.
- **Headless-first.** Primitives are thin wrappers over Radix; all visual styling goes through CVA + Tailwind. No CSS-in-JS, no styled-components, no emotion.
- **Naming:** kebab-case file names, PascalCase exports. Compound components export as namespaces — `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, etc.
- **Peer dependencies, not direct dependencies:** `react`, `react-dom`, `tailwindcss`, and the Radix packages backing each primitive (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, …). Keeps the consumer bundle de-duplicated.

## Tooling

- **Build:** `tsup` (esbuild). ESM-only output. `dts: true` for declaration files. External = all peer dependencies. Entry `src/index.ts` produces `dist/index.js` + `dist/index.d.ts`. CSS files are copied via a tsup `onSuccess` hook into `dist/styles.css`.
- **Dev playground:** Vite app under `playground/` that imports the library directly from `src/` (no build step in dev). Each primitive gets a route or panel. Lighter than Storybook for v1 and graduates to Storybook in v2 when external docs become a goal.
- **Tests:** `vitest` + `@testing-library/react` + `@testing-library/user-event`. One test file per component focused on behavioral contracts (renders, fires callbacks, respects `disabled`, manages focus correctly via Radix). Visual snapshots are NOT used in v1.
- **Lint:** ESLint flat config matching the existing apps — `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`. No Prettier (sibling apps don't use it).
- **CI:** GitHub Actions — `bun install`, `bun run lint`, `bun run test`, `bun run build`. Publish job is gated by tag push (`v*`).
- **Versioning:** semver. Manual version bumps in v1 (no changesets — overkill for a single-package repo). Publish via `bun publish` to the same private registry that already hosts `@qyubit/sedjiwa-permissions`.

## Local development & consumption

The library is published to the private registry rather than linked through a workspace. Apps install it the same way they install `@qyubit/sedjiwa-permissions`:

```jsonc
{
  "dependencies": {
    "@qyubit/sedjiwa-ui": "^0.1.0"
  }
}
```

For local iteration on the library itself, the `playground/` Vite app provides a fast feedback loop. When a developer needs to test a library change against a real consumer app before publishing, they use `bun link` ad-hoc.

## Migration & publishing flow

1. **v0.1.0 ships the ~20 primitives** listed in Scope. README documents the Tailwind v4 setup snippet and theme variable names.
2. **First consumer migration: uang-gantung.** Replace each `src/components/ui/*` import with the corresponding `@qyubit/sedjiwa-ui` import, then delete the local copies. This is the validation gate before announcing the library more broadly.
3. **Subsequent apps** (sales-pipeline, kreasi-quotation, magenta-quotation) migrate one at a time. API gaps surfaced during migration trigger minor-version bumps. Breaking changes (rare) trigger major-version bumps.
4. **External readiness (post-v1.0.0):** add Storybook, a public docs site, and per-component subpath imports. Out of scope for this spec.

## Risks & open questions

- **Radix bundle weight.** Every primitive pulls a Radix package. Consumers using only Button + Input still pay for them transitively. Mitigation: marking each Radix package as a peer dependency means consumers only install what they import (handled by their package manager's tree-shaking + peer-dep resolution). Re-evaluate if bundle bloat surfaces.
- **Token drift between consumer apps.** Apps currently set their own CSS variables. Migration must reconcile token values across apps; differences are flagged during uang-gantung's migration and resolved before sales-pipeline migrates.
- **React 19 ref-prop pattern.** Some Radix versions still type-check with `forwardRef`. If type errors surface during port, fall back to `forwardRef` for the affected component — this is a localized concession, not a global pattern shift.

## Success criteria

- v0.1.0 published to the private registry.
- uang-gantung successfully migrated: zero files remain in `src/components/ui/`, all imports point to `@qyubit/sedjiwa-ui`, dev/build/test all pass.
- One additional app (sales-pipeline OR kreasi-quotation) migrated as a second-consumer validation.
- README documents Tailwind setup, theme variables, and dark-mode toggling clearly enough for a new app to integrate without reading source.
