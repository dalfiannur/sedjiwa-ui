# sedjiwa-ui

## Package manager

This project uses **bun** (`bun.lock` is committed). Use `bun install`, `bun run <script>`, `bunx <bin>`. Do not use `npm`/`yarn`/`pnpm`.

## Running CLI tools

CLI binaries from devDeps are not on `$PATH`. Always invoke via:

- `bun run <script>` for anything in `package.json` scripts
- `bunx <bin>` for one-off invocations of an installed binary

Examples — do NOT run `storybook dev` directly; run `bun run storybook` (or `bunx storybook dev`). Same applies to `vite`, `vitest`, `tsup`, `eslint`, `tsc`.

## Scripts

- `bun run dev` — Storybook on port 6006 (alias of `bun run storybook`; there is no separate playground)
- `bun run build` — library build via `tsup`
- `bun run test` / `bun run test:watch` — Vitest (uses `projects` config: unit tests + Storybook tests in Playwright/chromium)
- `bunx vitest run <path>` — narrow to one component while iterating. Note it
  runs BOTH projects for that path (the unit test *and* the Chromium render of
  its stories). `--project` cannot narrow further: the unit project has no
  `name`, so any name filter matches nothing.
- `bun run lint` — ESLint
- `bun run typecheck` — `tsc --noEmit`
- `bun run storybook` — Storybook dev on port 6006
- `bun run build-storybook` — static Storybook build

## Adding new components

Build on a Radix primitive where one exists; otherwise write the component
here. There is no CLI step and no generated code to refactor.

shadcn/ui was the original source of much of this library and its token names
still follow shadcn's shape, but it is not a dependency and is no longer the
starting point. Do not run `bunx shadcn@latest add`; there is no
`components.json` for it to read.

**Does something here already cover it?** `Combobox` is the one that catches
people out: `multiple` makes it a MultiSelect, `creatable` a TagsInput,
`searchable` an Autocomplete. `TagsInput` is a thin preset over it, not a
second implementation.

**Does Radix cover it?** About half the library has a primitive and half does
not, and the split is not arbitrary. Anything with behaviour to get right —
focus traps, roving tabindex, portals, controlled/uncontrolled state, ARIA
wiring — almost certainly has one, and you MUST use it rather than
reimplement it; that behaviour is the whole reason the dependency is there.
Anything purely presentational (`Table`, `Card`, `Badge`, `Skeleton`,
`StatCard`) has none, so write it directly.

1. If a Radix primitive applies, install it **per-package**
   (`@radix-ui/react-<name>`) and add it to BOTH `peerDependencies` and
   `devDependencies`. Never add the unified `radix-ui` metapackage.
2. Create `src/components/<name>/` holding `<name>.tsx`,
   `<name>.variants.ts` (any `cva` variants, extracted), `<name>.test.tsx`,
   `<name>.stories.tsx`, and an `index.ts` barrel.
3. Follow the house patterns:
   - Import `cn` from `../../lib/cn`.
   - Put `data-slot` on every element a consumer might target, and
     `data-variant` / `data-state` wherever a variant or state is worth
     exposing to CSS.
   - Read `button/` for a variant-driven presentational component,
     `alert/` for one whose accessibility decision needed writing down,
     `dialog/` for a thin Radix wrapper, and `stat-card/` for a composite
     built out of other components in this library.
   - Numeric fields share one mask engine: pure functions in
     `lib/number-mask.ts`, the React half in `lib/use-number-mask.ts`.
     `CurrencyInput` and `NumberInput` are both thin adapters over it. Do not
     write fresh locale or caret-restoration logic.
   - Building on `Button`? It writes its own `data-state` *after* spreading
     props, for `loading` / `pressed`. A wrapper cannot pass one through —
     give your state its own attribute (`CopyButton` uses `data-copied`)
     rather than overloading that one.
4. Export from `src/index.ts`: the component, its prop types, and its `cva`
   function if it has one — those are public API.
5. Tests and a Storybook story before it is done.

## Design system material (`design-kit/`)

Design tokens, component specs, accessibility rules, framework adapters and 138
named design-system references live in `design-kit/`. It ships **no runtime
code** — 174 markdown files and 14 JSON token files. It is reference material
that shapes what you build here; it is not a library you can import.

It sits in one directory rather than at the repo root on purpose: a root-level
`components/` full of markdown would shadow `src/components/`, where the 68 real
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

**Where it does and does not override the rules above.** The structural rules
stand: new components follow the file layout above and use a Radix primitive
wherever one exists. The kit does not replace that base. What it governs is
everything layered on top — token mapping, the eight states, accessibility
criteria, and visual direction. If `design-kit/CLAUDE.md` reads as telling you
to generate a component whose behaviour reimplements what Radix already
provides, this file wins.

Note that `design-kit/design-systems/` catalogues *other* design systems,
shadcn/ui among them, as mapping targets. Those references describe an
external system to interoperate with; they are not instructions to build
this library from it.

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
The runners endpoint needs repo-owner rights, so the repo token cannot read
it; `…/actions/tasks` needs only the repo token, and its `"total_count": 0`
is the same proof — still 0 as of 0.46.0.

That is the whole explanation for the release history. 0.33.0 and 0.34.0 have
no `chore(release)` commit and no tag because the tag path publishes nothing;
they went out by hand. `publishConfig.registry` pointed at
`https://npm.qyubit.io/`, a host that does not answer, and nobody noticed
because the `bun publish --dry-run` step that would have caught it never ran.
0.46.0 and 0.47.0 went through the Gitea instance's own npm registry. Since
0.48.0 the package is public: `publishConfig` points at
`https://registry.npmjs.org/` with `access: public`, and the licence is MIT.
Still run the dry-run.

**The project `.npmrc` is load-bearing.** Your `~/.npmrc` may still carry
`@qyubit:registry=https://git.rubick.qyubit.io/…` from the Gitea days. A
scoped registry line beats *both* `publishConfig.registry` and `--registry`
in `bun publish` — verified on bun 1.4.0: with only the home file present the
dry-run reported the Gitea URL under both. The committed `.npmrc` pins
`@qyubit` to npmjs at project level, which wins over the home file. Do not
delete it. Read the `Registry:` line of the dry-run output before publishing,
and confirm the landing with
`curl https://registry.npmjs.org/@qyubit%2Fsedjiwa-ui` — `npm view` also
honours the scope line, so it is not proof of where you are.

**The GitHub mirror is where CI actually runs.** The repo is pushed to both
Gitea (`origin`) and GitHub (`github`, `dalfiannur/sedjiwa-ui`, public).
GitHub has runners, so `.github/workflows/ci.yml` executes there on every
push to `main`: lint, typecheck, the full test suite, contrast, build,
dry-run. The `publish` job on `v*` tags needs an `NPM_TOKEN` repo secret
(npm granular token with publish rights) — until that secret is set, the tag
push turns red at the publish step and you still publish by hand.

So until that secret exists, **you are the CI**. Run every gate in step 4 yourself
before publishing; skipping them is skipping them entirely, not deferring them
to a machine. One gate cannot be run everywhere: `bun run test` includes the
Storybook project, which drives a real Chromium through Playwright
(`bunx playwright install chromium` first). If that browser will not install on
your machine, say so in the release commit rather than implying the suite was
green.

Once the `NPM_TOKEN` secret exists on GitHub, delete step 4 and this
section's warning — the workflow already does the right thing.
