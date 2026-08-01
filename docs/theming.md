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
indigo panel at `oklch(0.25 0.1 265)`, `oklch(0.55 0.18 265)` is the only
accent satisfying both (3.24:1 and 5.02:1). See the
`Components/Sidebar → Retinted via token override` story.
