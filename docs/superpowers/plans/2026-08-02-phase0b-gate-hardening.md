# Phase 0B — Destructive Contrast Fix + Gate Hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the solid `destructive` variant, which fails WCAG AA in dark mode across three components, and close the gaps that let the contrast gate report green while it did.

**Architecture:** The `dark:bg-destructive/60` dilution existed because dark `--destructive-foreground` used to be near-white (2.82:1 on the fill). Phase 0 darkened that token to `oklch(0.2 0.03 25)`, which makes the workaround obsolete — removing it both fixes the contrast and deletes the `twMerge` `dark:`-scope hazard documented in Badge.

**Tech Stack:** React 19, TypeScript, Tailwind v4, cva, Vitest, bun.

---

## The defect

Measured with the repo's own oklch→sRGB→WCAG math, using each theme's actual token values:

| Component | Renders | light | dark |
|---|---|---|---|
| `Badge` destructive | `text-white` on `dark:bg-destructive/60` | 4.78:1 ✓ | **4.47:1 ✗** |
| `Button` destructive | same | 4.78:1 ✓ | **4.47:1 ✗** |
| `DynamicTab` delete button | `text-white` on undiluted fill | 4.78:1 ✓ | **2.99:1 ✗** |

**After the fix** — `text-destructive-foreground`, no dilution:

| | light | dark |
|---|---|---|
| all three | **4.65:1 ✓** | **6.11:1 ✓** |

Light drops slightly (4.78 → 4.65) because the light `-foreground` token is near-white rather than pure white. Still clears AA, and it is worth it to stop hardcoding `text-white` against a token-driven fill.

### Why the gate missed it

`scripts/contrast.mjs` measures `--destructive-foreground` on full-opacity `--destructive` and gets 6.11:1. No component rendered that combination: two diluted the fill, all three overrode the foreground with literal white. The gate measured a surface nothing draws.

Once the dilution and the `text-white` overrides are gone, the token pair **is** the rendered surface, so the existing solid gating becomes truthful. Task 4 adds a regression test so it stays that way.

---

## File Structure

**Modified:** `src/components/badge/badge.variants.ts`, `src/components/badge/badge.test.tsx`,
`src/components/button/button.variants.ts`, `src/components/dynamic-tab/dynamic-tab.tsx`,
`scripts/contrast.mjs`, `package.json`
**Created:** `src/lib/contrast.ts`, `src/lib/contrast.test.ts`

---

### Task 1: Fix the destructive variant in all three components

- [ ] **Step 1: Write the failing tests**

Append to `src/components/badge/badge.test.tsx` inside the existing describe block:

```tsx
  it("uses the destructive foreground token rather than literal white", () => {
    render(<Badge data-testid="b" variant="destructive">Ditolak</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("text-destructive-foreground");
    expect(el).not.toHaveClass("text-white");
  });

  it("does not dilute the destructive fill in dark mode", () => {
    render(<Badge data-testid="b" variant="destructive">Ditolak</Badge>);
    expect(screen.getByTestId("b")).not.toHaveClass("dark:bg-destructive/60");
  });
```

Run `bunx vitest run badge.test` and confirm both fail.

- [ ] **Step 2: Fix Badge**

In `src/components/badge/badge.variants.ts`, change the `destructive` variant entry to:

```ts
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
```

Removed: `text-white` → `text-destructive-foreground`, and `dark:bg-destructive/60` entirely.

- [ ] **Step 3: Simplify the subtle compound**

The `destructive` + `subtle` compound carries `dark:bg-destructive-subtle` purely to override the
dilution that Step 2 just deleted. With nothing at `dark:` scope left to cancel, it is now
genuinely redundant. Change that entry's `class` to:

```ts
        class: "bg-destructive-subtle text-destructive-text [a&]:hover:bg-destructive-subtle/80",
```

and delete the explanatory comment above it about `twMerge` being unable to cancel a
`dark:`-scoped class — it no longer describes the code.

**Verify this claim rather than trusting it:** the existing test
`supports subtle destructive without the dark solid override` asserts
`not.toHaveClass("dark:bg-destructive/60")` and must still pass. Also print the merged class
string for `{variant:"destructive", appearance:"subtle"}` and confirm no `dark:bg-*` remains.

- [ ] **Step 4: Fix Button**

In `src/components/button/button.variants.ts`, the `destructive` entry: replace `text-white` with
`text-destructive-foreground` and delete `dark:bg-destructive/60`. Leave every other class
(hover, active, scale, data-[state=on], focus rings) exactly as-is.

- [ ] **Step 5: Fix DynamicTab**

`src/components/dynamic-tab/dynamic-tab.tsx` around line 332 has an inline
`className="bg-destructive text-white hover:bg-destructive/90"` on the delete-confirm button.
Change `text-white` to `text-destructive-foreground`. This one has no dilution, so it was the
worst of the three at 2.99:1 in dark.

- [ ] **Step 6: Verify**

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/ui
bunx vitest run badge.test
bun run typecheck && bun run lint && bun run contrast
grep -rn "text-white" src/components --include="*.ts" --include="*.tsx"
```

All badge tests pass. The final grep should show no `text-white` paired with `bg-destructive`
anywhere (other `text-white` uses unrelated to destructive may legitimately remain — report them).

- [ ] **Step 7: Commit**

```bash
git add src/components/badge src/components/button src/components/dynamic-tab
git commit -m "fix(a11y): destructive variant failed AA in dark mode

Badge and Button rendered text-white on a dark:bg-destructive/60 diluted fill
(4.47:1) and DynamicTab's delete button rendered it on the undiluted fill
(2.99:1). The dilution existed because dark --destructive-foreground used to
be near-white; Phase 0 darkened that token, making the workaround obsolete.
All three now use text-destructive-foreground on an undiluted fill: 4.65:1
light, 6.11:1 dark.

Removing the dark:-scoped dilution also removes the twMerge hazard that
forced the subtle compound to carry an explicit dark: override."
```

---

### Task 2: Make the gate parse all blocks, not just the first

- [ ] **Step 1: Reproduce the gap**

Append a second `:root` block to the END of `src/styles/tokens.css` containing a deliberately
failing pair:

```css
@media print {
  :root {
    --success-text: oklch(0.9 0.02 155);
  }
}
```

Run `bun run contrast`. It currently reports all PASS and exits 0 — the later block is invisible
because `re.exec` takes only the first match. Record that output, then remove the block.

- [ ] **Step 2: Fix `parseBlock`**

Change it to find **every** occurrence of the selector, parse each block body, and merge them in
document order (later declarations win, matching CSS cascade). Keep `findBlockBody`'s
brace-counting.

- [ ] **Step 3: Re-run the reproduction**

Re-add the `@media print` block, run `bun run contrast`, confirm it now **FAILS** on
`--success-text`, then remove the block and confirm exit 0 with the usual 16 PASS lines.

---

### Task 3: Make the `@theme` check comment-aware and the selector safe

- [ ] **Step 1: Reproduce**

Comment out one mapping inside `@theme inline` in `src/styles/base.css`, e.g.
`/* --color-info-text: var(--info-text); */`. Run `bun run contrast` — it currently passes,
because the check is a raw `includes()` substring test. Record the output.

- [ ] **Step 2: Fix**

Strip `/* ... */` comments from the `@theme inline` body before checking, and match
`--color-<name>\s*:` rather than a bare substring.

- [ ] **Step 3: Escape the selector**

`findBlockBody`/`parseBlock` interpolate the selector into a `RegExp` unescaped, which is why the
call site must hand-write `"\\.dark"` and why a missing block prints
`Could not find "\.dark" block`. Escape inside the function and pass a plain `.dark`, so error
messages read naturally.

- [ ] **Step 4: Re-run both reproductions and confirm exit 0 afterwards**

---

### Task 4: Unit-test the maths

The gate's oklch→luminance chain has no in-repo test; it has only ever been verified externally.

- [ ] **Step 1: Extract the pure functions**

Create `src/lib/contrast.ts` exporting `oklchToLinearSrgb`, `relativeLuminance` and `contrastRatio`.
Move the implementations there verbatim — do not change the maths.

- [ ] **Step 2: Make the script a thin CLI over it**

`scripts/contrast.mjs` imports from the module rather than redefining. Note the script is `.mjs`
and the module is `.ts` — if importing TS from the script proves awkward under bun, keep the
script self-contained and instead have the **test** import from `src/lib/contrast.ts`, with the
script's copy clearly marked as mirroring it. State which approach you took and why.

- [ ] **Step 3: Write the tests**

Create `src/lib/contrast.test.ts` with golden values:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio, oklchToLinearSrgb, relativeLuminance } from "./contrast";

describe("contrast maths", () => {
  it("maps oklch white to linear 1", () => {
    const [r, g, b] = oklchToLinearSrgb(1, 0, 0);
    expect(r).toBeCloseTo(1, 3);
    expect(g).toBeCloseTo(1, 3);
    expect(b).toBeCloseTo(1, 3);
  });

  it("gives white-on-black the maximum ratio", () => {
    expect(contrastRatio([1, 0, 0], [0, 0, 0])).toBeCloseTo(21, 1);
  });

  it("matches the canonical WCAG boundary grey", () => {
    // #767676 on white is the textbook 4.54:1 boundary case
    expect(contrastRatio([0.5462, 0, 0], [1, 0, 0])).toBeCloseTo(4.54, 1);
  });

  it("is symmetric", () => {
    const a: [number, number, number] = [0.58, 0.22, 27];
    const b: [number, number, number] = [1, 0, 0];
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 6);
  });

  it("computes luminance on linearised channels", () => {
    expect(relativeLuminance([1, 1, 1])).toBeCloseTo(1, 6);
    expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 6);
  });
});
```

If the `#767676` case does not land near 4.54, **do not adjust the expectation** — investigate,
since that would mean the maths is wrong and every measurement in this project with it.

- [ ] **Step 4: Run and commit**

```bash
bunx vitest run contrast.test
bun run typecheck && bun run lint && bun run contrast
```

---

### Task 5: Release 0.30.0

- [ ] **Step 1: Full suite**

```bash
bun run contrast && bun run lint && bun run typecheck && bun run build
```

`bun run test` will still abort on the missing Playwright chromium build — that is the known
pre-existing environment issue, not a regression. Run the unit project via a temporary jsdom-only
vitest config inside the repo (see the note in Phase 0's plan) and report
**passed/failed counts**, expecting the same 22 pre-existing `app-shell` failures and no new ones.

- [ ] **Step 2: Bump and commit**

`package.json` 0.29.0 → 0.30.0.

```
chore(release): 0.30.0

Fixes the solid destructive variant, which failed AA in dark mode in Badge,
Button and DynamicTab. Hardens scripts/contrast.mjs: it now parses every
:root/.dark block rather than the first, understands commented-out @theme
mappings, and its maths is unit-tested in-repo for the first time.

Behaviour change: destructive Badge/Button/DynamicTab text is now
--destructive-foreground rather than literal white, and the dark fill is no
longer diluted. Visually darker text on an undiluted red in dark mode.
```

- [ ] **Step 3: Tag locally, do NOT push**

```bash
git tag v0.30.0
```

**Do not push the tag.** `.github/workflows/ci.yml` has a `publish` job gated on `refs/tags/v*`;
whether it fires depends on a server-side runner that cannot be checked from the clone. Creating
the tag is inert, pushing may publish. Leave that to the user, along with `bun publish`.

---

## Definition of done

- [ ] Destructive renders `text-destructive-foreground` on an undiluted fill in Badge, Button and DynamicTab
- [ ] `bun run contrast` reports 16 PASS and exits 0, and now **fails** on a duplicate later block or a commented-out `@theme` mapping (both reproduced and re-tested)
- [ ] `src/lib/contrast.test.ts` passes, including the `#767676` boundary case
- [ ] `typecheck`, `lint`, `build` clean; unit project shows no new failures beyond the 22 pre-existing app-shell ones
- [ ] 0.30.0 committed and tagged locally, **not pushed, not published**
