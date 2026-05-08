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
