# sedjiwa-ui Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the semantic colour surface the portal apps need — subtle/text token pairs, `Badge` success/warning/info with a subtle appearance, a documented sidebar theming contract, and `EmptyState` tones — and release 0.29.0.

**Architecture:** All changes are additive. Four new token pairs per theme feed a second `appearance` axis on `badgeVariants` and a `tone` axis on `emptyMediaVariants`, both wired through `compoundVariants`. No existing variant value, prop, or token changes meaning, so consumers on 0.28.0 are unaffected.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (`@theme inline`), class-variance-authority, Vitest + Testing Library, Storybook, tsup, bun.

**Source spec:** `transportation-booking/docs/superpowers/specs/2026-08-01-ui-redesign-design.md`

---

## Context the executor needs

Read `CLAUDE.md` in this repo first. The rules that matter here:

- **bun only.** `bun install`, `bun run <script>`, `bunx <bin>`. Never npm/yarn/pnpm.
- **Binaries are not on `$PATH`.** Run `bun run test`, never `vitest`.
- Every component folder holds `<name>.tsx`, `<name>.variants.ts`, `<name>.test.tsx`, `<name>.stories.tsx`, `index.ts`.
- Tests **and** a Storybook story are required before a component change is done.
- `cn` is imported from `../../lib/cn`.

Build layout: `src/styles/tokens.css` → `dist/tokens.css` and `src/styles/base.css` → `dist/styles.css`, copied by `tsup.config.ts`'s `onSuccess`. Tailwind utilities like `bg-success-subtle` only exist if the token is mapped in the `@theme inline` block of `base.css`.

### Why subtle badges need their own token pair

The obvious implementation — `bg-success/12` with `text-success` — was measured and **fails WCAG AA in light mode for every tone**: success 2.99:1, warning 2.30:1, info 2.98:1, destructive 3.96:1 at 12% alpha. Dark mode passes, which is exactly why this class of bug survives a one-theme eyeball review. Each tone therefore gets an explicit background and foreground token.

---

## File Structure

**Modified:**
- `src/styles/tokens.css` — 8 new token pairs (4 tones × light/dark)
- `src/styles/base.css` — 8 new `@theme inline` colour mappings
- `src/components/badge/badge.variants.ts` — 3 new variants + `appearance` axis
- `src/components/badge/badge.tsx` — pass `appearance` through, add data attributes
- `src/components/badge/badge.test.tsx` — new cases
- `src/components/empty-state/empty-state.variants.ts` — `tone` axis
- `src/components/empty-state/empty-state.tsx` — `tone` prop
- `src/components/empty-state/empty-state.stories.tsx` — tone stories
- `package.json` — version bump

**Created:**
- `scripts/contrast.mjs` — parses `tokens.css` and gates every pair at 4.5:1
- `src/components/badge/badge.stories.tsx` — does not exist yet
- `src/components/empty-state/empty-state.test.tsx` — does not exist yet
- `src/components/sidebar/sidebar.stories.tsx` — retinting demo (check first, see Task 5)
- `docs/theming.md` — sidebar theming contract

---

### Task 1: Semantic subtle/text token pairs

The contrast script is the test. It parses the real stylesheet, so it fails before the tokens exist and keeps failing if anyone edits a value below threshold.

**Files:**
- Create: `scripts/contrast.mjs`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/base.css`

- [ ] **Step 1: Write the failing test**

Create `scripts/contrast.mjs`:

```js
// Gates every semantic subtle/text token pair in src/styles/tokens.css at WCAG AA (4.5:1).
// Run: bun run scripts/contrast.mjs
import { readFileSync } from "node:fs";

const TONES = ["success", "warning", "info", "destructive"];
const THRESHOLD = 4.5;

function oklchToLinearSrgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const clamp = (x) => Math.min(1, Math.max(0, x));

function luminance([L, C, H]) {
  const [r, g, b] = oklchToLinearSrgb(L, C, H).map(clamp);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function parseBlock(css, selector) {
  const re = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`);
  const match = css.match(re);
  if (!match) throw new Error(`Could not find "${selector}" block in tokens.css`);
  const tokens = {};
  const tokenRe = /--([\w-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  let m;
  while ((m = tokenRe.exec(match[1])) !== null) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const THEMES = [
  ["light", parseBlock(css, ":root")],
  ["dark", parseBlock(css, "\\.dark")],
];

let failures = 0;
for (const [theme, tokens] of THEMES) {
  for (const tone of TONES) {
    const fgName = `${tone}-text`;
    const bgName = `${tone}-subtle`;
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      console.log(`MISSING  --${fgName} / --${bgName} (${theme})`);
      failures++;
      continue;
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= THRESHOLD;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  --${fgName} on --${bgName} (${theme})`
    );
  }
}

console.log(`\n${failures} failing pair(s) at ${THRESHOLD}:1`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/ui && bun run scripts/contrast.mjs`

Expected: eight `MISSING` lines and `8 failing pair(s) at 4.5:1`, exit code 1.

- [ ] **Step 3: Add the tokens**

In `src/styles/tokens.css`, inside the `:root { ... }` block, immediately after the existing `--info-foreground` line (currently line 35):

```css

  --success-subtle: oklch(0.93 0.06 155);
  --success-text: oklch(0.36 0.09 155);

  --warning-subtle: oklch(0.93 0.07 70);
  --warning-text: oklch(0.43 0.12 55);

  --info-subtle: oklch(0.93 0.05 220);
  --info-text: oklch(0.36 0.1 220);

  --destructive-subtle: oklch(0.94 0.06 27);
  --destructive-text: oklch(0.35 0.15 27);
```

In the `.dark { ... }` block, immediately after its `--info-foreground` line (currently line 89):

```css

  --success-subtle: oklch(0.3 0.06 155);
  --success-text: oklch(0.85 0.12 155);

  --warning-subtle: oklch(0.3 0.06 70);
  --warning-text: oklch(0.88 0.12 80);

  --info-subtle: oklch(0.3 0.06 220);
  --info-text: oklch(0.85 0.1 220);

  --destructive-subtle: oklch(0.3 0.08 27);
  --destructive-text: oklch(0.85 0.12 27);
```

- [ ] **Step 4: Run it to verify it passes**

Run: `bun run scripts/contrast.mjs`

Expected, exit code 0:

```
PASS   8.65:1  --success-text on --success-subtle (light)
PASS   6.68:1  --warning-text on --warning-subtle (light)
PASS   8.32:1  --info-text on --info-subtle (light)
PASS   9.36:1  --destructive-text on --destructive-subtle (light)
PASS   8.81:1  --success-text on --success-subtle (dark)
PASS   9.46:1  --warning-text on --warning-subtle (dark)
PASS   8.66:1  --info-text on --info-subtle (dark)
PASS   7.98:1  --destructive-text on --destructive-subtle (dark)

0 failing pair(s) at 4.5:1
```

If a number differs by more than 0.01, a token was mistyped — fix the token, not the expectation.

- [ ] **Step 5: Map the tokens to Tailwind utilities**

In `src/styles/base.css`, inside `@theme inline { ... }`, immediately after the existing `--color-info-foreground: var(--info-foreground);` line:

```css
  --color-success-subtle: var(--success-subtle);
  --color-success-text: var(--success-text);
  --color-warning-subtle: var(--warning-subtle);
  --color-warning-text: var(--warning-text);
  --color-info-subtle: var(--info-subtle);
  --color-info-text: var(--info-text);
  --color-destructive-subtle: var(--destructive-subtle);
  --color-destructive-text: var(--destructive-text);
```

Without this block, `bg-success-subtle` silently generates no CSS. Task 2's tests would still pass (they assert class names, not computed colour), so this step cannot be skipped and caught later.

- [ ] **Step 6: Add the script to package.json**

In `package.json`, add to `"scripts"`:

```json
    "contrast": "bun run scripts/contrast.mjs",
```

- [ ] **Step 7: Verify the shortcut works**

Run: `bun run contrast`
Expected: same 8 PASS lines, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add scripts/contrast.mjs src/styles/tokens.css src/styles/base.css package.json
git commit -m "feat(tokens): add semantic subtle/text pairs for success, warning, info, destructive

Solid tones used as text over an alpha mix of themselves fail AA in light
mode (2.30-3.96:1 at 12% alpha), so each tone gets an explicit pair.
scripts/contrast.mjs parses tokens.css and gates all 8 pairs at 4.5:1."
```

---

### Task 2: Badge success / warning / info solid variants

**Files:**
- Modify: `src/components/badge/badge.variants.ts`
- Modify: `src/components/badge/badge.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe("<Badge />", ...)` block in `src/components/badge/badge.test.tsx`:

```tsx
  it("renders the success variant with success tokens", () => {
    render(<Badge data-testid="b" variant="success">Aktif</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-success");
    expect(el).toHaveClass("text-success-foreground");
  });

  it("renders the warning variant with warning tokens", () => {
    render(<Badge data-testid="b" variant="warning">Menunggu</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-warning");
    expect(el).toHaveClass("text-warning-foreground");
  });

  it("renders the info variant with info tokens", () => {
    render(<Badge data-testid="b" variant="info">Disetujui</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-info");
    expect(el).toHaveClass("text-info-foreground");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- badge`

Expected: the three new tests fail. TypeScript rejects `variant="success"` because it is not in the union, and the assertions fail because no such class is produced.

- [ ] **Step 3: Add the variants**

In `src/components/badge/badge.variants.ts`, inside `variants.variant`, add these three entries between `destructive` and `outline`:

```ts
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info:
          "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
```

Order matters for readability only; `outline` stays last to match the existing file.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test -- badge`
Expected: all Badge tests pass, including the four pre-existing ones.

- [ ] **Step 5: Commit**

```bash
git add src/components/badge/badge.variants.ts src/components/badge/badge.test.tsx
git commit -m "feat(badge): add success, warning and info solid variants"
```

---

### Task 3: Badge `appearance` axis (solid | subtle)

**Known risk — read before starting.** `badgeVariants` puts `bg-success` in the `variant` slot and `bg-success-subtle` in a compound slot, so both land in the same class string. `cn` runs `twMerge`, which should collapse them and keep the last. If `twMerge` does not recognise `bg-success-subtle` as a background utility it will keep **both**, and which one wins becomes CSS-order-dependent. Step 2's `not.toHaveClass("bg-success")` assertion exists specifically to catch this. If that assertion fails, do not weaken it — apply the fallback in Step 6.

**Files:**
- Modify: `src/components/badge/badge.variants.ts`
- Modify: `src/components/badge/badge.tsx`
- Modify: `src/components/badge/badge.test.tsx`
- Create: `src/components/badge/badge.stories.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe("<Badge />", ...)` block:

```tsx
  it("defaults to the solid appearance", () => {
    render(<Badge data-testid="b" variant="success">Aktif</Badge>);
    expect(screen.getByTestId("b")).toHaveAttribute("data-appearance", "solid");
  });

  it("renders the subtle appearance using the subtle token pair", () => {
    render(
      <Badge data-testid="b" variant="success" appearance="subtle">
        Aktif
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-success-subtle");
    expect(el).toHaveClass("text-success-text");
    expect(el).toHaveAttribute("data-appearance", "subtle");
  });

  it("drops the solid fill when subtle is selected", () => {
    render(
      <Badge data-testid="b" variant="success" appearance="subtle">
        Aktif
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).not.toHaveClass("bg-success");
    expect(el).not.toHaveClass("text-success-foreground");
  });

  it("supports subtle destructive without the dark solid override", () => {
    render(
      <Badge data-testid="b" variant="destructive" appearance="subtle">
        Diblokir
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-destructive-subtle");
    expect(el).toHaveClass("text-destructive-text");
    expect(el).not.toHaveClass("dark:bg-destructive/60");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- badge`
Expected: all four new tests fail — `appearance` is not a valid prop and `data-appearance` is not rendered.

- [ ] **Step 3: Add the appearance axis**

Replace the `variants` and `defaultVariants` sections of `src/components/badge/badge.variants.ts` so the whole `cva` options object reads:

```ts
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info:
          "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      appearance: {
        solid: "",
        subtle: "border-transparent",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        appearance: "subtle",
        class: "bg-success-subtle text-success-text [a&]:hover:bg-success-subtle/80",
      },
      {
        variant: "warning",
        appearance: "subtle",
        class: "bg-warning-subtle text-warning-text [a&]:hover:bg-warning-subtle/80",
      },
      {
        variant: "info",
        appearance: "subtle",
        class: "bg-info-subtle text-info-text [a&]:hover:bg-info-subtle/80",
      },
      {
        variant: "destructive",
        appearance: "subtle",
        class:
          "bg-destructive-subtle text-destructive-text dark:bg-destructive-subtle [a&]:hover:bg-destructive-subtle/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "solid",
    },
  }
```

The explicit `dark:bg-destructive-subtle` exists because the solid `destructive` variant carries `dark:bg-destructive/60`, which would otherwise survive into the subtle rendering in dark mode.

- [ ] **Step 4: Thread the prop through the component**

Replace the body of `src/components/badge/badge.tsx` below the imports:

```tsx
export type BadgeProps = React.ComponentProps<"span"> &
  BadgeVariants & { asChild?: boolean };

export function Badge({
  className,
  variant,
  appearance,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      data-appearance={appearance ?? "solid"}
      className={cn(badgeVariants({ variant, appearance }), className)}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test -- badge`
Expected: all Badge tests pass.

- [ ] **Step 6: Fallback, only if "drops the solid fill" still fails**

If `not.toHaveClass("bg-success")` fails, `twMerge` is not collapsing the pair. Move colour out of the `variant` slot for the four toned variants so the two never coexist.

Set those four entries in `variants.variant` to carry no colour:

```ts
        destructive: "border-transparent",
        success: "border-transparent",
        warning: "border-transparent",
        info: "border-transparent",
```

Then prepend these four entries to `compoundVariants`, above the existing subtle ones:

```ts
      {
        variant: "destructive",
        appearance: "solid",
        class:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      },
      {
        variant: "success",
        appearance: "solid",
        class: "bg-success text-success-foreground [a&]:hover:bg-success/90",
      },
      {
        variant: "warning",
        appearance: "solid",
        class: "bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
      },
      {
        variant: "info",
        appearance: "solid",
        class: "bg-info text-info-foreground [a&]:hover:bg-info/90",
      },
```

With the solid classes now living only on the `solid` compound, the subtle compound can drop its `dark:` guard — change the `destructive` + `subtle` entry's `class` to `"bg-destructive-subtle text-destructive-text [a&]:hover:bg-destructive-subtle/80"`. Re-run Step 5; all Badge tests including Task 2's must still pass.

- [ ] **Step 7: Write the Storybook story**

Create `src/components/badge/badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Badge>;

const VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "success",
  "warning",
  "info",
  "outline",
] as const;

export const Solid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const Subtle: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["destructive", "success", "warning", "info"] as const).map((v) => (
        <Badge key={v} variant={v} appearance="subtle">
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const StatusRow: Story = {
  name: "In a dense table row",
  render: () => (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-3 text-sm">
      <span className="font-medium">Innova Reborn</span>
      <span className="text-muted-foreground">B 1234 XYZ</span>
      <Badge variant="success" appearance="subtle">
        Aktif
      </Badge>
    </div>
  ),
};
```

- [ ] **Step 8: Verify the story renders in both themes**

Run: `bun run storybook`

Open http://localhost:6006, go to Components/Badge, and check the `Subtle` story in light and dark. Every chip must show a tinted background with clearly readable text — not white-on-white and not a solid fill. Stop the server when done.

- [ ] **Step 9: Commit**

```bash
git add src/components/badge/badge.variants.ts src/components/badge/badge.tsx src/components/badge/badge.test.tsx src/components/badge/badge.stories.tsx
git commit -m "feat(badge): add subtle appearance backed by semantic subtle/text tokens

Dense tables need tinted status chips; a solid fill per row is visual noise.
Adds an appearance axis (solid default, subtle) with compound variants for
the four toned variants. Existing call sites are unaffected."
```

---

### Task 4: EmptyState `tone`

Three archetypes agreed in the spec: *create* (nothing exists yet) uses `default`, *clear* (empty means done) uses `success`, *filtered* (filter matched nothing) uses `muted`. Copy and CTAs stay at the call site — they are app-specific and must not be baked into the library.

**Files:**
- Modify: `src/components/empty-state/empty-state.variants.ts`
- Modify: `src/components/empty-state/empty-state.tsx`
- Modify: `src/components/empty-state/empty-state.stories.tsx`
- Create: `src/components/empty-state/empty-state.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/empty-state/empty-state.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState, EmptyMedia } from "./empty-state";

describe("<EmptyState />", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Belum ada kendaraan" description="Tambahkan satu." />);
    expect(screen.getByText("Belum ada kendaraan")).toBeInTheDocument();
    expect(screen.getByText("Tambahkan satu.")).toBeInTheDocument();
  });

  it("omits the media slot when no icon is given", () => {
    const { container } = render(<EmptyState title="x" />);
    expect(container.querySelector('[data-slot="empty-media"]')).toBeNull();
  });

  it("defaults the media tone to default", () => {
    const { container } = render(<EmptyState title="x" icon={<svg />} />);
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).toHaveAttribute("data-tone", "default");
    expect(media).toHaveClass("bg-muted");
    expect(media).toHaveClass("text-foreground");
  });

  it("applies the success tone for resolved-state emptiness", () => {
    const { container } = render(
      <EmptyState title="x" icon={<svg />} tone="success" />
    );
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).toHaveAttribute("data-tone", "success");
    expect(media).toHaveClass("bg-success-subtle");
    expect(media).toHaveClass("text-success-text");
  });

  it("applies the muted tone for filtered-to-nothing emptiness", () => {
    const { container } = render(
      <EmptyState title="x" icon={<svg />} tone="muted" />
    );
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).toHaveAttribute("data-tone", "muted");
    expect(media).toHaveClass("bg-muted");
    expect(media).toHaveClass("text-muted-foreground");
  });

  it("does not tone the default media variant", () => {
    const { container } = render(
      <EmptyMedia data-testid="m" tone="success">
        <svg />
      </EmptyMedia>
    );
    const media = container.querySelector('[data-slot="empty-media"]');
    expect(media).not.toHaveClass("bg-success-subtle");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- empty-state`
Expected: the first two pass, the rest fail — `tone` is not a valid prop and `data-tone` is not rendered.

- [ ] **Step 3: Add the tone axis**

Replace the whole `cva` call in `src/components/empty-state/empty-state.variants.ts`:

```ts
import { cva, type VariantProps } from "class-variance-authority";

export const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
      tone: {
        default: "",
        success: "",
        muted: "",
      },
    },
    compoundVariants: [
      { variant: "icon", tone: "default", class: "bg-muted text-foreground" },
      {
        variant: "icon",
        tone: "success",
        class: "bg-success-subtle text-success-text",
      },
      { variant: "icon", tone: "muted", class: "bg-muted text-muted-foreground" },
    ],
    defaultVariants: {
      variant: "default",
      tone: "default",
    },
  }
);

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;
```

`bg-muted text-foreground` moved out of the `icon` variant and into a compound entry. That keeps the rendering identical for existing callers while ensuring a toned background is never emitted alongside a competing one — the `twMerge` hazard called out in Task 3 cannot occur here.

- [ ] **Step 4: Thread tone through EmptyMedia and EmptyState**

In `src/components/empty-state/empty-state.tsx`, replace the `EmptyMedia` function:

```tsx
function EmptyMedia({
  className,
  variant = "default",
  tone = "default",
  ...props
}: React.ComponentProps<"div"> & EmptyMediaVariants) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      data-tone={tone}
      className={cn(emptyMediaVariants({ variant, tone, className }))}
      {...props}
    />
  );
}
```

Replace the `EmptyStateProps` type:

```tsx
export type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Optional leading media, typically a lucide icon. Rendered in the boxed `icon` media slot. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional call-to-action(s) rendered below the description. */
  action?: React.ReactNode;
  /**
   * Media tone. `default` for "nothing created yet", `success` for "empty
   * because everything is resolved", `muted` for "a filter matched nothing".
   */
  tone?: EmptyMediaVariants["tone"];
};
```

Replace the `EmptyState` function:

```tsx
function EmptyState({
  icon,
  title,
  description,
  action,
  tone,
  ...props
}: EmptyStateProps) {
  return (
    <Empty {...props}>
      <EmptyHeader>
        {icon != null && (
          <EmptyMedia variant="icon" tone={tone ?? "default"}>
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description != null && (
          <EmptyDescription>{description}</EmptyDescription>
        )}
      </EmptyHeader>
      {action != null && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test -- empty-state`
Expected: all six tests pass.

- [ ] **Step 6: Add stories for the three archetypes**

Append to `src/components/empty-state/empty-state.stories.tsx`. Extend the existing lucide import on line 2 to `import { CalendarX2, CheckCircle2, Inbox, SearchX, Truck } from "lucide-react";`, then add:

```tsx
export const ToneCreate: Story = {
  name: "Archetype: nothing created yet",
  render: () => (
    <div className="w-[28rem]">
      <EmptyState
        icon={<Truck />}
        title="Belum ada kendaraan"
        description="Kendaraan yang Anda tambahkan akan muncul sebagai pilihan saat karyawan mengajukan booking."
        action={<Button size="sm">Tambah Kendaraan</Button>}
      />
    </div>
  ),
};

export const ToneClear: Story = {
  name: "Archetype: empty is good news",
  render: () => (
    <div className="w-[28rem]">
      <EmptyState
        tone="success"
        icon={<CheckCircle2 />}
        title="Semua request sudah diproses"
        description="Tidak ada pengajuan yang menunggu persetujuan."
      />
    </div>
  ),
};

export const ToneFiltered: Story = {
  name: "Archetype: filter matched nothing",
  render: () => (
    <div className="w-[28rem]">
      <EmptyState
        tone="muted"
        icon={<SearchX />}
        title="Tidak ada hasil"
        description="Tidak ada booking berstatus Ditolak pada rentang tanggal ini."
        action={
          <Button size="sm" variant="outline">
            Reset filter
          </Button>
        }
      />
    </div>
  ),
};
```

- [ ] **Step 7: Verify the stories render in both themes**

Run: `bun run storybook`

Open http://localhost:6006 → Components/EmptyState. Confirm the three archetype stories in light and dark: the *clear* icon box is green-tinted with readable green glyph, the *filtered* box is neutral with a dimmer glyph, and the *create* box matches the pre-existing Default story. Stop the server when done.

- [ ] **Step 8: Commit**

```bash
git add src/components/empty-state/empty-state.variants.ts src/components/empty-state/empty-state.tsx src/components/empty-state/empty-state.test.tsx src/components/empty-state/empty-state.stories.tsx
git commit -m "feat(empty-state): add tone prop for the three emptiness archetypes

An empty approval queue means done, not missing — it should not look like a
failure. Adds default/success/muted media tones; copy and CTAs stay at the
call site."
```

---

### Task 5: Sidebar theming contract

An audit already ran: `grep -nE '\b(bg|text|border|ring|fill|stroke)-(gray|grey|slate|zinc|neutral|stone|white|black|red|green|blue|amber|yellow|orange)(-[0-9]+)?\b' src/components/sidebar/*.tsx src/components/sidebar/*.ts` returns nothing, and `sidebar.variants.ts` already consumes `--sidebar`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border` and `--sidebar-ring`. **There is no code to fix.** This task delivers only the demonstration and the written contract.

**Files:**
- Create or modify: `src/components/sidebar/sidebar.stories.tsx`
- Create: `docs/theming.md`

- [ ] **Step 1: Re-run the audit to confirm it is still clean**

Run:

```bash
grep -nE '\b(bg|text|border|ring|fill|stroke)-(gray|grey|slate|zinc|neutral|stone|white|black|red|green|blue|amber|yellow|orange)(-[0-9]+)?\b' src/components/sidebar/*.tsx src/components/sidebar/*.ts
```

Expected: no output, exit code 1. If anything is listed, replace it with the matching `--sidebar-*` token before continuing.

- [ ] **Step 2: Check whether a sidebar story already exists**

Run: `ls src/components/sidebar/`

If `sidebar.stories.tsx` exists, append the story below to it and keep its existing `meta`. If not, create the file with the full contents below.

- [ ] **Step 3: Write the retinting story**

Create (or append the `Retinted` export to) `src/components/sidebar/sidebar.stories.tsx`:

```tsx
import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

const ITEMS = ["Ketersediaan", "Booking Saya", "Approval", "Kendaraan", "Driver"];

function Nav({ active = "Kendaraan" }: { active?: string }) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((label) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={label === active}>
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Nav />
    </SidebarProvider>
  ),
};

/**
 * Retinting is done purely by overriding `--sidebar-*` in a scope that wraps
 * the sidebar. No component classes change. The active fill below is
 * oklch(0.55 0.18 265), the only value clearing both 3:1 against the panel
 * and 4.5:1 for its white label.
 */
export const Retinted: Story = {
  name: "Retinted via token override",
  render: () => (
    <SidebarProvider>
      <div
        style={
          {
            "--sidebar": "oklch(0.25 0.1 265)",
            "--sidebar-foreground": "oklch(0.97 0.01 265)",
            "--sidebar-accent": "oklch(0.55 0.18 265)",
            "--sidebar-accent-foreground": "oklch(1 0 0)",
            "--sidebar-border": "oklch(0.32 0.09 265)",
          } as CSSProperties
        }
      >
        <Nav />
      </div>
    </SidebarProvider>
  ),
};
```

If the sidebar's exported component names differ from those imported above, run `grep -n "^export" src/components/sidebar/index.ts` and use the real names — do not invent props.

- [ ] **Step 4: Verify both stories render**

Run: `bun run storybook`

Open http://localhost:6006 → Components/Sidebar. `Default` uses the library's neutral sidebar; `Retinted` is indigo with a clearly readable active item. Check dark mode too. Stop the server when done.

- [ ] **Step 5: Write the theming contract**

Create `docs/theming.md`:

```markdown
# Theming

Consuming apps override CSS variables; they never restyle components with raw
colour utilities. `dist/tokens.css` defines the defaults, `dist/styles.css`
maps them to Tailwind utilities.

## Semantic colour tokens

Each tone ships three usable pairs:

| Purpose | Background | Foreground |
|---|---|---|
| Solid fill | `--success` | `--success-foreground` |
| Tinted / subtle | `--success-subtle` | `--success-text` |

Same shape for `--warning`, `--info` and `--destructive`.

**Never use a solid tone as text on a tint of itself.** Measured in light mode
that lands between 2.30:1 and 3.96:1 — below AA. Use the `-text` token, which
is measured against its `-subtle` partner. `bun run contrast` gates all eight
pairs at 4.5:1 and fails the build if a token is edited below threshold.

In components, prefer `<Badge variant="success" appearance="subtle">` over
hand-written classes.

## Sidebar

The sidebar is retinted per app by overriding these in a scope that wraps it
(usually `:root` and `.dark` in the app's stylesheet):

| Token | Role |
|---|---|
| `--sidebar` | panel background |
| `--sidebar-foreground` | default label colour |
| `--sidebar-accent` | active/hover item fill |
| `--sidebar-accent-foreground` | active item label |
| `--sidebar-border` | panel edge and separators |
| `--sidebar-ring` | focus ring |

Two constraints when picking an accent, both measurable:

- the active fill must reach **3:1 against `--sidebar`**, so the selected item
  is discernible as a UI component (WCAG 1.4.11);
- its label must reach **4.5:1 against the fill**.

These pull in opposite directions and the usable window is narrow. For an
indigo panel at `oklch(0.25 0.1 265)`, `oklch(0.55 0.18 265)` is the only
accent satisfying both (3.24:1 and 5.02:1). See the
`Components/Sidebar → Retinted via token override` story.
```

- [ ] **Step 6: Commit**

```bash
git add src/components/sidebar/sidebar.stories.tsx docs/theming.md
git commit -m "docs(sidebar): document the token theming contract, add retinting story

Sidebar components were already token-clean; the gap was that nothing
documented --sidebar-* as the supported extension point, so apps reached for
raw utilities instead."
```

---

### Task 6: Release 0.29.0

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Run the whole suite**

Run each and confirm all pass before touching the version:

```bash
bun run contrast
bun run test
bun run lint
bun run typecheck
bun run build
```

Expected: `contrast` prints 8 PASS and exits 0; `test` reports zero failures; `lint` and `typecheck` produce no errors; `build` completes and writes `dist/`.

- [ ] **Step 2: Confirm the built CSS carries the new tokens**

Run: `grep -c "success-subtle\|success-text" dist/tokens.css dist/styles.css`

Expected: `dist/tokens.css:4` (two pairs × two themes) and `dist/styles.css:2`. If either is 0, the `onSuccess` copy in `tsup.config.ts` did not pick up the edit — re-run `bun run build`.

- [ ] **Step 3: Bump the version**

In `package.json`, change `"version": "0.28.0"` to `"version": "0.29.0"`.

- [ ] **Step 4: Commit and tag**

```bash
git add package.json
git commit -m "chore(release): 0.29.0

Adds semantic subtle/text token pairs, Badge success/warning/info variants
with a subtle appearance, EmptyState tones, and the documented sidebar
theming contract. All changes are additive; 0.28.0 consumers are unaffected."
git tag v0.29.0
```

- [ ] **Step 5: Hand off to the user for publishing**

Publishing is the user's step. Tell them:

> 0.29.0 is committed and tagged locally. Run `bun publish` in
> `sedjiwa-portal/ui` when ready. Once it is on the registry, the app can bump
> to `@qyubit/sedjiwa-ui@0.29.0` and Phase 1 can start.

Do not run `bun publish` yourself.

**Do not push the tag.** `.github/workflows/ci.yml` defines a `publish` job gated on
`refs/tags/v*` that runs `bun publish`. Whether it fires depends on a server-side runner that
cannot be checked from the clone. Creating a tag locally is inert; pushing it may publish
unattended. Leave the push to the user.

---

## Definition of done

- [ ] `bun run contrast` exits 0 with 8 PASS lines
- [ ] `bun run test`, `bun run lint`, `bun run typecheck`, `bun run build` all green
- [ ] Badge stories show solid and subtle in light and dark
- [ ] EmptyState stories show all three archetypes in light and dark
- [ ] Sidebar `Retinted` story renders indigo with a readable active item
- [ ] `docs/theming.md` exists and documents both the colour and sidebar contracts
- [ ] `package.json` is at 0.29.0, committed and tagged
- [ ] No existing variant value, prop or token changed meaning
