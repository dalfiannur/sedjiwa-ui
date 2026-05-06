# @qyubit/sedjiwa-ui

Shared React + Tailwind CSS UI primitives for the sedjiwa-portal apps.

## Status

`v0.0.x` is a pipeline-validation preview. The full v0.1.0 ships ~19 primitives — see Plan B.

## Requirements

- React 19+
- Tailwind CSS 4+
- A consumer app set up to use Tailwind v4's `@source` directive.

## Install

```bash
bun add @qyubit/sedjiwa-ui
```

## Setup

In your app's main stylesheet (e.g., `src/index.css`):

```css
@import "tailwindcss";
@import "@qyubit/sedjiwa-ui/styles.css";

@source "../node_modules/@qyubit/sedjiwa-ui";
```

The `@source` directive tells Tailwind to scan the library's compiled JSX so utility classes used inside our components are emitted into your final CSS.

## Theming

The library exposes shadcn-shaped CSS variables: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--success`, `--warning`, `--info`, `--border`, `--input`, `--ring`, `--radius`, plus `--sidebar-*` and `--chart-*`.

Override any token in your own `:root { ... }` and `.dark { ... }` blocks **after** importing the library stylesheet.

## Dark mode

Toggle the `.dark` class on `<html>` (or any ancestor of your app):

```ts
document.documentElement.classList.toggle("dark");
```

## Components (preview)

- `<Button />` — variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`. Supports `asChild` for composition.

## Development

```bash
bun install
bun run dev       # vite playground
bun run test      # vitest
bun run build     # tsup
bun run lint
```

## Publishing

Publish is gated by tag pushes (`v*`) in CI. See `.github/workflows/ci.yml`.
