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
