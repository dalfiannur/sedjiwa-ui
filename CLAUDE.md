# sedjiwa-ui

## Package manager

This project uses **bun** (`bun.lock` is committed). Use `bun install`, `bun run <script>`, `bunx <bin>`. Do not use `npm`/`yarn`/`pnpm`.

## Running CLI tools

CLI binaries from devDeps are not on `$PATH`. Always invoke via:

- `bun run <script>` for anything in `package.json` scripts
- `bunx <bin>` for one-off invocations of an installed binary

Examples — do NOT run `storybook dev` directly; run `bun run storybook` (or `bunx storybook dev`). Same applies to `vite`, `vitest`, `tsup`, `eslint`, `tsc`.

## Scripts

- `bun run dev` — Vite playground (`playground/vite.config.ts`)
- `bun run build` — library build via `tsup`
- `bun run test` / `bun run test:watch` — Vitest (uses `projects` config: unit tests + Storybook tests in Playwright/chromium)
- `bun run lint` — ESLint
- `bun run typecheck` — `tsc --noEmit`
- `bun run storybook` — Storybook dev on port 6006
- `bun run build-storybook` — static Storybook build

## Adding new components

New components MUST start from shadcn/ui as the base — do not build from scratch.

1. Pull the canonical source via the shadcn CLI:
   `bunx shadcn@latest add <component>`
   (`components.json` is configured; it writes to `src/components/<name>.tsx`.)
2. Refactor the generated code to match this repo's conventions:
   - Move into its own folder: `src/components/<name>/`.
   - Split files: `<name>.tsx`, `<name>.variants.ts` (extract any `cva` variants),
     `<name>.test.tsx`, `<name>.stories.tsx`, and an `index.ts` barrel.
   - Import `cn` from `../../lib/cn` (not `@/lib/utils`).
   - Convert unified `radix-ui` imports (e.g. `import { Foo } from "radix-ui"`)
     to per-package imports (`@radix-ui/react-foo`), and add them as
     `peerDependencies` + `devDependencies` — do NOT keep the `radix-ui`
     metapackage the CLI adds.
   - Keep `data-slot` / `data-variant` attributes; follow the patterns in
     existing components (e.g. `button/`).
3. Export the component from `src/index.ts`.
4. Add tests and a Storybook story before considering it done.

## Design system material (`design-kit/`)

Design tokens, component specs, accessibility rules, framework adapters and 138
named design-system references live in `design-kit/`. It ships **no runtime
code** — 174 markdown files and 14 JSON token files. It is reference material
that shapes what you build here; it is not a library you can import.

It sits in one directory rather than at the repo root on purpose: a root-level
`components/` full of markdown would shadow `src/components/`, where the 40 real
components live, and a root-level `scripts/` would collide with `contrast.mjs`.

`design-kit/CLAUDE.md` is the kit's own instruction surface. Paths inside it
(`tokens/*.json`, `components/*`, `scripts/*`) are relative to `design-kit/`,
not to the repo root. It also carries its own gates — note that `contrast.py`
there overlaps with the existing `scripts/contrast.mjs`; pick one before wiring
either into CI.

**Where it does and does not override the rules above.** The shadcn/ui rule
stands: new components still start from `bunx shadcn@latest add <component>`
and are refactored into this repo's file layout. The kit does not replace that
structural base. What it governs is everything layered on top — token mapping,
the eight states, accessibility criteria, and visual direction. If
`design-kit/CLAUDE.md` reads as telling you to generate a component from a spec
instead of from shadcn, this file wins.

**Visual direction: the calm tone stays.** The consuming apps read as quiet
admin panels today, and that is deliberate. Any redesign driven from
`design-kit/` moves token values, not character.
