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
not to the repo root.

**The two contrast tools do different jobs — do not swap one for the other.**
`scripts/contrast.mjs` is the gate: it parses `src/styles/tokens.css`, checks
all 16 semantic pairs (8 solid, 8 subtle) across light and dark at 4.5:1, and
runs in CI via `bun run contrast`. Its oklch maths comes from
`src/lib/contrast.ts`, which the library itself uses and which is unit-tested.
`design-kit/scripts/contrast.py` is a hand-run calculator: give it two hex
colours, it prints the ratio and AA/AAA verdict. It reads no files, and it
understands hex only — it cannot parse an oklch token at all. Keep it for
one-off "what is the ratio between these two" questions while designing; it is
not a substitute for the gate, and the gate is not a substitute for it.

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

## Releasing

There is no CHANGELOG file — the release commit body is the changelog. Write it
for the people upgrading: what changed, and whether anything they rely on moves.

1. Land the work on `main` the usual way (branch, then merge).
2. Bump `version` in `package.json` and commit **directly on `main`** as
   `chore(release): X.Y.Z`, with a body describing the release.
3. Tag `vX.Y.Z` and push the commit and the tag.
4. **Run the gates and publish by hand** — see below for why:
   `bun run lint && bun run typecheck && bun run test && bun run contrast && bun run build`,
   then `bun publish --dry-run`, then `bun publish`.

**CI does not publish today, whatever `.github/workflows/ci.yml` says.**
Actions is enabled on the repo, but the Gitea instance has **no runners
registered** — `/api/v1/repos/Qyubit/sedjiwa-ui/actions/runners` returns zero,
and the workflow-run list is empty. Nothing in that workflow has ever
executed: not lint, not typecheck, not the test suite, not the publish job.

That is the whole explanation for the release history. 0.33.0 and 0.34.0 have
no `chore(release)` commit and no tag because the tag path publishes nothing;
they went out by hand. `publishConfig.registry` pointed at
`https://npm.qyubit.io/`, a host that does not answer, and nobody noticed
because the `bun publish --dry-run` step that would have caught it never ran.

So until a runner exists, **you are the CI**. Run every gate in step 4 yourself
before publishing; skipping them is skipping them entirely, not deferring them
to a machine. One gate cannot be run everywhere: `bun run test` includes the
Storybook project, which drives a real Chromium through Playwright
(`bunx playwright install chromium` first). If that browser will not install on
your machine, say so in the release commit rather than implying the suite was
green.

Once a runner is registered, delete step 4 and this section's warning — the
workflow already does the right thing, it has simply never had anything to run
it.
