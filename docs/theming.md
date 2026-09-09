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

A `-foreground` is **near-white, or neutral ink — never a darkened copy of its
own tone.** Hue-matched text on a coloured fill scores well and reads badly:
dark amber on amber registers as shading, not as words. If you retint, keep the
foreground neutral.

Same shape for `--warning`, `--info` and `--destructive`.

**Solid fills take near-white text; `warning` is the exception.** Three of the
four tones are dark enough to carry `--<tone>-foreground` as near-white.
`--warning` cannot be: white on an amber that still reads as amber tops out
around 1.6:1. It takes dark ink instead, and that asymmetry is deliberate —
matching the other three would mean either an unreadable badge or an amber
dark enough to read as brown.

**Never use a solid tone as text on a tint of itself.** Measured in light mode
that lands between 1.36:1 and 4.02:1 — below AA, and worst by far for
`warning`, where a light amber on a lighter amber is barely visible at all.
Use the `-text` token, which is measured against its `-subtle` partner.

**The `-text` token is also the right choice for coloured text on an ordinary
surface** — `--card`, `--background`, or anything else. The solid tone is a
*fill*; as body text it is marginal at best. For example `--destructive` as text
measures 4.85:1 on a white card and 4.72:1 on a slightly sunken background —
passing, but with no room to spare — while `--destructive-text` is 11.5–11.9:1
on both. Reach for `--<tone>-text` whenever you want coloured words, and reserve
`--<tone>` for filled shapes.

`bun run contrast` gates 28 pairs at 4.5:1 — 8 solid, 8 subtle, and 12
one-offs that follow no naming convention (`--calendar-outside` on its three
possible surfaces, the two `primary` pairs, and the pill pair) — parsing
`src/styles/tokens.css` directly. It fails the build if a token is edited below
threshold.

In components, prefer `<Badge variant="success" appearance="subtle">` over
hand-written classes.

## Sidebar

The sidebar is retinted per app by overriding these in a scope that wraps it
(usually `:root` and `.dark` in the app's stylesheet):

| Token | Role |
|---|---|
| `--sidebar` | panel background |
| `--sidebar-foreground` | default label colour |
| `--sidebar-primary` | active item fill, and the tick at the panel edge |
| `--sidebar-primary-foreground` | active item label |
| `--sidebar-accent` | hover and open-submenu fill |
| `--sidebar-accent-foreground` | hover label |
| `--sidebar-border` | panel edge and separators |
| `--sidebar-ring` | focus ring |

Two constraints when picking the **active** fill (`--sidebar-primary`), both
measurable:

- the active fill must reach **3:1 against `--sidebar`**, so the selected item
  is discernible as a UI component (WCAG 1.4.11);
- its label must reach **4.5:1 against the fill**. The second of these is
  gated: `scripts/contrast.mjs` checks `--sidebar-primary-foreground` on
  `--sidebar-primary` in both themes.

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
setting only `:root` leaves dark mode on the library defaults.

Note that `--sidebar-primary` changed role in 0.40.0. It used to be declared
but unread, and the active item was filled with `--sidebar-accent`; now
`--sidebar-primary` fills the active item and `--sidebar-accent` is hover only.
An app that retinted its sidebar by overriding `--sidebar-accent` alone will
find its active item falling back to the library's blue — override
`--sidebar-primary` and `--sidebar-primary-foreground` as well.

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
