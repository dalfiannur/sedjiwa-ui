# Theming

Consuming apps override CSS variables; they never restyle components with raw
colour utilities. `dist/tokens.css` defines the defaults, `dist/styles.css`
maps them to Tailwind utilities.

## Semantic colour tokens

Each tone ships two usable pairs:

| Purpose | Background | Foreground |
|---|---|---|
| Solid fill | `--success` | `--success-foreground` |
| Tinted / subtle | `--success-subtle` | `--success-text` |

Same shape for `--warning`, `--info` and `--destructive`.

**Never use a solid tone as text on a tint of itself.** Measured in light mode
that lands between 2.02:1 and 3.77:1 — below AA. Use the `-text` token, which
is measured against its `-subtle` partner.

`bun run contrast` gates all 16 pairs (8 solid, 8 subtle) at 4.5:1, parses
`src/styles/tokens.css` directly, and runs in CI. It fails the build if a token
is edited below threshold.

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
indigo panel at `oklch(0.25 0.1 265)`, `oklch(0.55 0.18 265)` clears both
(3.24:1 against the panel, 5.02:1 for its white label). The usable window at
that chroma and hue is L 0.54–0.57 — narrow, and both constraints are minimums,
so verify your own accent against both numbers rather than interpolating from
this example. (L 0.53 misses the panel floor at 2.97:1; L 0.58 misses the label
floor at 4.42:1.) See the
`Components/Sidebar → Retinted via token override` story.

`--sidebar-*` is independent of `--background` and `--card` — retinting the
sidebar does not follow from retinting the rest of the app, and vice versa.
Both the `:root` and `.dark` blocks need their own `--sidebar-*` overrides;
setting only `:root` leaves dark mode on the library defaults. Note also that
`--sidebar-primary` and `--sidebar-primary-foreground` exist in `tokens.css`
but are consumed by no component in this version — overriding them currently
has no visible effect.

### Known exceptions

Two elements that render inside the sidebar panel intentionally follow
`--background`, not `--sidebar`, and are not retinted by the tokens above:

- `SidebarInput`
- `SidebarMenuButton variant="outline"`

This is existing behaviour, unchanged to avoid altering appearance for
current consumers. If your `--sidebar` and `--background` diverge sharply
(e.g. a dark indigo panel on a light app), these two will visibly stand out
against the panel. `SidebarInset` is not in this list — it is the main
content area, not the panel, so `bg-background` is correct there.

**Changed in 0.29.0:** `SidebarMenuButton variant="outline"` now draws its 1px
`--sidebar-border` ring. It previously wrapped the token in `hsl(...)`, which
is invalid for an `oklch()` value, so the ring silently never rendered. Expect
it to become visible in light mode; in dark mode `--sidebar-border` is
`oklch(1 0 0 / 8%)` and stays subtle.
