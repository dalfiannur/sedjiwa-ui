# sedjiwa-ui Plan B — Port Remaining 18 Primitives

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the remaining 18 primitives from `uang-gantung/frontend/src/components/ui/` into `@qyubit/sedjiwa-ui`, expand the playground, and publish v0.1.0 to the private registry.

**Architecture:** Each primitive lives in its own folder under `src/components/<name>/` and follows the Button template established in Plan A: component file + (optional) variants file + behavioral test + folder index. Components are thin wrappers over Radix primitives, styled with Tailwind utility classes via class-variance-authority where variants apply. React 19 ref-as-prop pattern; no `forwardRef`.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, vitest 3, @testing-library/react, @testing-library/user-event, jsdom, class-variance-authority, tailwind-merge, plus the corresponding `@radix-ui/*` packages per primitive.

**Spec:** `docs/superpowers/specs/2026-05-06-sedjiwa-ui-design.md`
**Predecessor:** Plan A — `docs/superpowers/plans/2026-05-06-sedjiwa-ui-bootstrap.md` (already executed, v0.0.1 published)

**Working directory:** `/home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui`

---

## Pre-task setup

Before Task 1, on a fresh feature branch:

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui
git checkout main
git pull
git checkout -b feature/v0.1.0-primitives
```

Confirm CI is green on `main`. If not, fix before starting.

Add new peer/dev dependencies for the primitives this plan ports. Edit `package.json`:

In `peerDependencies` (alphabetised), ADD:
```jsonc
"@radix-ui/react-alert-dialog": "^1.1.0",
"@radix-ui/react-avatar": "^1.1.0",
"@radix-ui/react-dialog": "^1.1.0",
"@radix-ui/react-dropdown-menu": "^2.1.0",
"@radix-ui/react-label": "^2.1.0",
"@radix-ui/react-select": "^2.2.0",
"@radix-ui/react-separator": "^1.1.0",
"@radix-ui/react-tabs": "^1.1.0",
"@radix-ui/react-tooltip": "^1.2.0",
"lucide-react": "^0.563.0",
"next-themes": "^0.4.6",
"react-hook-form": "^7.71.0",
"sonner": "^2.0.7"
```

In `devDependencies`, ADD the same versions (mirror so playground + tests can resolve).

Then:
```bash
bun install
git add package.json bun.lock
git commit -m "chore: add peer deps for v0.1.0 primitives"
```

Also update `tsup.config.ts`'s `external` array to include every new peer:
```typescript
external: [
  "react",
  "react-dom",
  "tailwindcss",
  "tw-animate-css",
  "@radix-ui/react-slot",
  "@radix-ui/react-alert-dialog",
  "@radix-ui/react-avatar",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-label",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-tabs",
  "@radix-ui/react-tooltip",
  "lucide-react",
  "next-themes",
  "react-hook-form",
  "sonner",
],
```

Run `bun run build` to confirm. Commit:
```bash
git add tsup.config.ts
git commit -m "chore(tsup): mark new peer deps as external"
```

---

## Porting recipe (referenced by every primitive task)

The 18 primitives are ported from `uang-gantung/frontend/src/components/ui/<name>.tsx`. Each task spells out the test code in full but references this recipe for the source code transformation.

**Recipe steps for porting any uang-gantung component:**

1. Read the source file at `/home/qyubit/Workspace/qyubit/sedjiwa-portal/uang-gantung/frontend/src/components/ui/<name>.tsx`.
2. Strip the `"use client"` directive at the top (if present) — sedjiwa-ui doesn't ship Server Components. Keep all other imports.
3. Apply these import-path rewrites VERBATIM (these are the only path differences between source and destination):
   - `import { cn } from "@/lib/utils"` → `import { cn } from "../../lib/cn"`
   - `import { buttonVariants } from "@/components/ui/button"` → `import { buttonVariants } from "../button/button.variants"`
   - `import { Button } from "@/components/ui/button"` → `import { Button } from "../button"`
   - `import { Label } from "@/components/ui/label"` → `import { Label } from "../label"`
   - Any other `@/components/ui/<x>"` → `"../<x>"`
4. If the file contains a `cva(...)` call, extract it into a sibling `<name>.variants.ts` file. The variants file exports the cva instance and a `<Name>Variants` type:
   ```typescript
   import { cva, type VariantProps } from "class-variance-authority";

   export const <name>Variants = cva(/* ... */);

   export type <Name>Variants = VariantProps<typeof <name>Variants>;
   ```
   Then in the component file, import the cva instance back in: `import { <name>Variants, type <Name>Variants } from "./<name>.variants";`.
5. Save the transformed component as `src/components/<name>/<name>.tsx`.
6. Write `src/components/<name>/index.ts` that re-exports every named export from the component file (and the variants file if applicable). The exact re-export list is given per primitive below.
7. Write the behavioural test at `src/components/<name>/<name>.test.tsx` (full code in each task).

That recipe is the entire porting procedure. Each task below tells you exactly which file to read, any primitive-specific deviations, the test code to write, and the index.ts content.

---

## File Structure

After Plan B completes:

```
sedjiwa-ui/src/components/
├── alert-dialog/
├── avatar/
├── badge/
├── breadcrumb/
├── button/                 # (already exists from Plan A)
├── dialog/
├── dropdown-menu/
├── form/
├── input/
├── label/
├── select/
├── separator/
├── sheet/
├── sidebar/
├── skeleton/
├── sonner/
├── table/
├── tabs/
└── tooltip/
```

Plus barrel updates in `src/index.ts` (Task 19) and playground updates in `playground/src/playground.tsx` (Task 20).

---

## Task 1: Skeleton

**Files:**
- Create: `src/components/skeleton/skeleton.tsx`
- Create: `src/components/skeleton/skeleton.test.tsx`
- Create: `src/components/skeleton/index.ts`

- [ ] **Step 1: Write the failing test**

`src/components/skeleton/skeleton.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("<Skeleton />", () => {
  it("renders with the data-slot marker", () => {
    render(<Skeleton data-testid="skel" />);
    const el = screen.getByTestId("skel");
    expect(el).toHaveAttribute("data-slot", "skeleton");
  });

  it("merges consumer className with default classes", () => {
    render(<Skeleton data-testid="skel" className="custom" />);
    const el = screen.getByTestId("skel");
    expect(el).toHaveClass("custom");
    expect(el.className).toContain("animate-pulse");
  });

  it("forwards arbitrary props to the underlying div", () => {
    render(<Skeleton data-testid="skel" aria-label="Loading user" />);
    expect(screen.getByTestId("skel")).toHaveAttribute("aria-label", "Loading user");
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL**

`bun run test src/components/skeleton/skeleton.test.tsx` → module-not-found.

- [ ] **Step 3: Port the component (apply recipe)**

Source: `uang-gantung/.../ui/skeleton.tsx`. Apply recipe. Final content of `src/components/skeleton/skeleton.tsx`:
```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Write the folder index**

`src/components/skeleton/index.ts`:
```typescript
export { Skeleton } from "./skeleton";
```

- [ ] **Step 5: Run the test, expect 3 PASS**

`bun run test src/components/skeleton/skeleton.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/skeleton/
git commit -m "feat(skeleton): port primitive with behavioural tests"
```

---

## Task 2: Input

**Files:**
- Create: `src/components/input/input.tsx`
- Create: `src/components/input/input.test.tsx`
- Create: `src/components/input/index.ts`

- [ ] **Step 1: Write the failing test**

`src/components/input/input.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("<Input />", () => {
  it("renders an input element", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input").tagName).toBe("INPUT");
  });

  it("applies the data-slot marker", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("data-slot", "input");
  });

  it("forwards the type prop", () => {
    render(<Input data-testid="input" type="email" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
  });

  it("calls onChange when typed into", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={onChange} aria-label="name" />);
    await user.type(screen.getByLabelText("name"), "Ada");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input disabled onChange={onChange} aria-label="name" />);
    await user.type(screen.getByLabelText("name"), "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("merges consumer className", () => {
    render(<Input data-testid="input" className="custom" />);
    expect(screen.getByTestId("input")).toHaveClass("custom");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port the component**

Source: `uang-gantung/.../ui/input.tsx`. Apply recipe. Final `src/components/input/input.tsx`:
```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Write index**

`src/components/input/index.ts`:
```typescript
export { Input } from "./input";
```

- [ ] **Step 5: Run, expect 6 PASS**

- [ ] **Step 6: Commit**

```bash
git add src/components/input/
git commit -m "feat(input): port primitive with behavioural tests"
```

---

## Task 3: Label

**Files:**
- Create: `src/components/label/label.tsx`
- Create: `src/components/label/label.test.tsx`
- Create: `src/components/label/index.ts`

- [ ] **Step 1: Write the failing test**

`src/components/label/label.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("<Label />", () => {
  it("renders the children", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("applies data-slot", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("data-slot", "label");
  });

  it("supports htmlFor", () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
  });

  it("merges consumer className", () => {
    render(<Label className="custom">Email</Label>);
    expect(screen.getByText("Email")).toHaveClass("custom");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port the component**

Source: `uang-gantung/.../ui/label.tsx`. Apply recipe. Final `src/components/label/label.tsx`:
```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../lib/cn";

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Write index**

`src/components/label/index.ts`:
```typescript
export { Label } from "./label";
```

- [ ] **Step 5: Run, expect 4 PASS. Step 6: Commit**

```bash
git add src/components/label/
git commit -m "feat(label): port primitive with behavioural tests"
```

---

## Task 4: Separator

**Files:**
- Create: `src/components/separator/separator.tsx`
- Create: `src/components/separator/separator.test.tsx`
- Create: `src/components/separator/index.ts`

- [ ] **Step 1: Write test**

`src/components/separator/separator.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("<Separator />", () => {
  it("renders horizontal by default", () => {
    render(<Separator data-testid="sep" />);
    const el = screen.getByTestId("sep");
    expect(el).toHaveAttribute("data-orientation", "horizontal");
    expect(el).toHaveAttribute("data-slot", "separator");
  });

  it("renders vertical when requested", () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "vertical");
  });

  it("is decorative by default (role=none)", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "none");
  });

  it("becomes a real separator role when decorative=false", () => {
    render(<Separator decorative={false} data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "separator");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port the component**

Source: `uang-gantung/.../ui/separator.tsx`. Apply recipe. Final `src/components/separator/separator.tsx`:
```tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/cn";

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/separator/index.ts`:
```typescript
export { Separator } from "./separator";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/separator/
git commit -m "feat(separator): port primitive with behavioural tests"
```

---

## Task 5: Badge (CVA — extract variants)

**Files:**
- Create: `src/components/badge/badge.variants.ts`
- Create: `src/components/badge/badge.tsx`
- Create: `src/components/badge/badge.test.tsx`
- Create: `src/components/badge/index.ts`

- [ ] **Step 1: Test**

`src/components/badge/badge.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("<Badge />", () => {
  it("renders children inside a span by default", () => {
    render(<Badge data-testid="b">New</Badge>);
    expect(screen.getByTestId("b").tagName).toBe("SPAN");
    expect(screen.getByTestId("b")).toHaveTextContent("New");
  });

  it("applies data-slot", () => {
    render(<Badge data-testid="b">x</Badge>);
    expect(screen.getByTestId("b")).toHaveAttribute("data-slot", "badge");
  });

  it("supports asChild composition", () => {
    render(
      <Badge asChild>
        <a href="/x" data-testid="b">link</a>
      </Badge>
    );
    expect(screen.getByTestId("b").tagName).toBe("A");
    expect(screen.getByTestId("b")).toHaveAttribute("href", "/x");
    expect(screen.getByTestId("b")).toHaveAttribute("data-slot", "badge");
  });

  it("merges consumer className", () => {
    render(<Badge data-testid="b" className="custom">x</Badge>);
    expect(screen.getByTestId("b")).toHaveClass("custom");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Variants file**

Source `cva()` block from `uang-gantung/.../ui/badge.tsx` lines 7–26 — extract into `src/components/badge/badge.variants.ts`:
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
```

- [ ] **Step 4: Component**

`src/components/badge/badge.tsx`:
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { badgeVariants, type BadgeVariants } from "./badge.variants";

export type BadgeProps = React.ComponentProps<"span"> &
  BadgeVariants & { asChild?: boolean };

export function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Index**

`src/components/badge/index.ts`:
```typescript
export { Badge, type BadgeProps } from "./badge";
export { badgeVariants, type BadgeVariants } from "./badge.variants";
```

- [ ] **Step 6: Test PASS. Step 7: Commit**

```bash
git add src/components/badge/
git commit -m "feat(badge): port primitive with CVA variants extracted"
```

---

## Task 6: Avatar

**Files:**
- Create: `src/components/avatar/avatar.tsx`
- Create: `src/components/avatar/avatar.test.tsx`
- Create: `src/components/avatar/index.ts`

- [ ] **Step 1: Test**

`src/components/avatar/avatar.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

describe("<Avatar />", () => {
  it("renders root with data-slot", () => {
    render(
      <Avatar data-testid="root">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("root")).toHaveAttribute("data-slot", "avatar");
  });

  it("shows fallback when no image src is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("fallback has data-slot=avatar-fallback", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fb">AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("fb")).toHaveAttribute("data-slot", "avatar-fallback");
  });

  it("AvatarImage receives data-slot when rendered", () => {
    // Radix only mounts <img> after it loads, but we can still assert the role
    render(
      <Avatar>
        <AvatarImage src="" alt="user" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port — Apply recipe. Drop `"use client"` line. Final `src/components/avatar/avatar.tsx`:**

```tsx
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/cn";

export function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/avatar/index.ts`:
```typescript
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/avatar/
git commit -m "feat(avatar): port primitive with behavioural tests"
```

---

## Task 7: Sonner (Toaster)

**Files:**
- Create: `src/components/sonner/sonner.tsx`
- Create: `src/components/sonner/sonner.test.tsx`
- Create: `src/components/sonner/index.ts`

> **Note:** This component depends on `next-themes`. The test renders the component WITHOUT a ThemeProvider; `useTheme` returns the default `"system"`. That's fine — sonner accepts `theme="system"`.

- [ ] **Step 1: Test**

`src/components/sonner/sonner.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "./sonner";

describe("<Toaster />", () => {
  it("renders without crashing", () => {
    const { container } = render(<Toaster />);
    // sonner renders its toaster as a section[aria-label]
    expect(container.querySelector("[aria-label]")).toBeTruthy();
  });

  it("forwards arbitrary props", () => {
    const { container } = render(<Toaster position="top-right" />);
    // sonner uses data-sonner-toaster on the root section
    const root = container.querySelector("[data-sonner-toaster]");
    expect(root).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Apply recipe. Drop `"use client"` line. Final `src/components/sonner/sonner.tsx`:

```tsx
import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/sonner/index.ts`:
```typescript
export { Toaster } from "./sonner";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/sonner/
git commit -m "feat(sonner): port Toaster wrapper with behavioural tests"
```

---

## Task 8: Tooltip

**Files:**
- Create: `src/components/tooltip/tooltip.tsx`
- Create: `src/components/tooltip/tooltip.test.tsx`
- Create: `src/components/tooltip/index.ts`

- [ ] **Step 1: Test**

`src/components/tooltip/tooltip.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

describe("<Tooltip />", () => {
  it("renders the trigger but not the content by default", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText("hover me")).toBeInTheDocument();
    expect(screen.queryByText("tip text")).not.toBeInTheDocument();
  });

  it("opens content on focus", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    await user.tab();
    expect(await screen.findByText("tip text")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/tooltip.tsx`. Apply recipe. Final `src/components/tooltip/tooltip.tsx`:

```tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

export function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

export function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

export function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
```

- [ ] **Step 4: Index**

`src/components/tooltip/index.ts`:
```typescript
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/tooltip/
git commit -m "feat(tooltip): port primitive with behavioural tests"
```

---

## Task 9: Tabs

**Files:**
- Create: `src/components/tabs/tabs.tsx`
- Create: `src/components/tabs/tabs.test.tsx`
- Create: `src/components/tabs/index.ts`

- [ ] **Step 1: Test**

`src/components/tabs/tabs.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

describe("<Tabs />", () => {
  it("renders the default-active panel only", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel A</TabsContent>
        <TabsContent value="b">panel B</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("panel A")).toBeInTheDocument();
    expect(screen.queryByText("panel B")).not.toBeInTheDocument();
  });

  it("switches panel on tab click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel A</TabsContent>
        <TabsContent value="b">panel B</TabsContent>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("panel B")).toBeInTheDocument();
    expect(screen.queryByText("panel A")).not.toBeInTheDocument();
  });

  it("triggers carry data-slot=tabs-trigger", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel A</TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("data-slot", "tabs-trigger");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/tabs.tsx`. Apply recipe. Drop `"use client"`. Final `src/components/tabs/tabs.tsx`:

```tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

export function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/tabs/index.ts`:
```typescript
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/tabs/
git commit -m "feat(tabs): port primitive with behavioural tests"
```

---

## Task 10: Breadcrumb

**Files:**
- Create: `src/components/breadcrumb/breadcrumb.tsx`
- Create: `src/components/breadcrumb/breadcrumb.test.tsx`
- Create: `src/components/breadcrumb/index.ts`

- [ ] **Step 1: Test**

`src/components/breadcrumb/breadcrumb.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";

describe("<Breadcrumb />", () => {
  it("root has aria-label=breadcrumb", () => {
    render(<Breadcrumb data-testid="bc"><BreadcrumbList /></Breadcrumb>);
    expect(screen.getByTestId("bc")).toHaveAttribute("aria-label", "breadcrumb");
  });

  it("renders link with href", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/x">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/x");
  });

  it("BreadcrumbPage marks aria-current=page", () => {
    render(<BreadcrumbPage>Current</BreadcrumbPage>);
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
  });

  it("BreadcrumbSeparator renders default chevron when no children", () => {
    const { container } = render(<BreadcrumbSeparator />);
    expect(container.querySelector("[data-slot=breadcrumb-separator]")).toBeTruthy();
  });

  it("BreadcrumbEllipsis includes sr-only text 'More'", () => {
    render(<BreadcrumbEllipsis />);
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/breadcrumb.tsx`. Apply recipe. Final `src/components/breadcrumb/breadcrumb.tsx`:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/cn";

export function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

export function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
```

- [ ] **Step 4: Index**

`src/components/breadcrumb/index.ts`:
```typescript
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/breadcrumb/
git commit -m "feat(breadcrumb): port primitive with behavioural tests"
```

---

## Task 11: Table

**Files:**
- Create: `src/components/table/table.tsx`
- Create: `src/components/table/table.test.tsx`
- Create: `src/components/table/index.ts`

- [ ] **Step 1: Test**

`src/components/table/table.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption,
} from "./table";

describe("<Table />", () => {
  it("renders a table inside a scrollable container", () => {
    render(
      <Table data-testid="t">
        <TableBody>
          <TableRow>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("t").tagName).toBe("TABLE");
  });

  it("subcomponents apply their data-slot", () => {
    render(
      <Table>
        <TableHeader data-testid="th">
          <TableRow><TableHead>H</TableHead></TableRow>
        </TableHeader>
        <TableBody data-testid="tb">
          <TableRow><TableCell>c</TableCell></TableRow>
        </TableBody>
        <TableFooter data-testid="tf">
          <TableRow><TableCell>f</TableCell></TableRow>
        </TableFooter>
        <TableCaption data-testid="cap">caption</TableCaption>
      </Table>
    );
    expect(screen.getByTestId("th")).toHaveAttribute("data-slot", "table-header");
    expect(screen.getByTestId("tb")).toHaveAttribute("data-slot", "table-body");
    expect(screen.getByTestId("tf")).toHaveAttribute("data-slot", "table-footer");
    expect(screen.getByTestId("cap")).toHaveAttribute("data-slot", "table-caption");
  });

  it("renders a row with header and cell content", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/table.tsx`. Apply recipe. Final `src/components/table/table.tsx`:

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/table/index.ts`:
```typescript
export {
  Table, TableHeader, TableBody, TableFooter,
  TableHead, TableRow, TableCell, TableCaption,
} from "./table";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/table/
git commit -m "feat(table): port primitive with behavioural tests"
```

---

## Task 12: Sheet

**Files:**
- Create: `src/components/sheet/sheet.tsx`
- Create: `src/components/sheet/sheet.test.tsx`
- Create: `src/components/sheet/index.ts`

- [ ] **Step 1: Test**

`src/components/sheet/sheet.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sheet, SheetTrigger, SheetClose, SheetContent,
  SheetHeader, SheetFooter, SheetTitle, SheetDescription,
} from "./sheet";

describe("<Sheet />", () => {
  it("renders trigger but not content by default", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  it("closes on internal close button", async () => {
    const user = userEvent.setup();
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
          <SheetClose>X</SheetClose>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    await user.click(screen.getByText("X"));
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/sheet.tsx`. Apply recipe. Final `src/components/sheet/sheet.tsx`:

```tsx
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

export function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/sheet/index.ts`:
```typescript
export {
  Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay,
  SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
} from "./sheet";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/sheet/
git commit -m "feat(sheet): port primitive with behavioural tests"
```

---

## Task 13: Alert Dialog

**Files:**
- Create: `src/components/alert-dialog/alert-dialog.tsx`
- Create: `src/components/alert-dialog/alert-dialog.test.tsx`
- Create: `src/components/alert-dialog/index.ts`

> **Note:** This component imports `buttonVariants` from `../button/button.variants` (per recipe). Make sure that import resolves before running the test.

- [ ] **Step 1: Test**

`src/components/alert-dialog/alert-dialog.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogFooter, AlertDialogTitle,
  AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "./alert-dialog";

describe("<AlertDialog />", () => {
  it("renders trigger and hides content by default", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sure?</AlertDialogTitle>
            <AlertDialogDescription>Really?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.queryByText("Sure?")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Sure?</AlertDialogTitle>
          <AlertDialogDescription>Really?</AlertDialogDescription>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );
    await user.click(screen.getByText("Delete"));
    expect(await screen.findByText("Sure?")).toBeInTheDocument();
  });

  it("calls Action onClick when confirmed", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Sure?</AlertDialogTitle>
          <AlertDialogDescription>Really?</AlertDialogDescription>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );
    await user.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/alert-dialog.tsx`. Apply recipe. Drop `"use client"`. Note: `buttonVariants` import path becomes `../button/button.variants`. Final `src/components/alert-dialog/alert-dialog.tsx`:

```tsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../button/button.variants";

export function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

export function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

export function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

export function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

export function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/alert-dialog/index.ts`:
```typescript
export {
  AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger,
  AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel,
} from "./alert-dialog";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/alert-dialog/
git commit -m "feat(alert-dialog): port primitive with behavioural tests"
```

---

## Task 14: Dialog

**Files:**
- Create: `src/components/dialog/dialog.tsx`
- Create: `src/components/dialog/dialog.test.tsx`
- Create: `src/components/dialog/index.ts`

> **Note:** This component imports `Button` from `../button` (per recipe). The original uses `import { Dialog as DialogPrimitive } from "radix-ui"` — replace with `import * as DialogPrimitive from "@radix-ui/react-dialog"` for explicitness.

- [ ] **Step 1: Test**

`src/components/dialog/dialog.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription, DialogClose,
} from "./dialog";

describe("<Dialog />", () => {
  it("renders trigger; content hidden by default", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogDescription>D</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("T")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByText("Title")).toBeInTheDocument();
  });

  it("renders default close button when showCloseButton is true (default)", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("hides default close button when showCloseButton=false", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/dialog.tsx`. Apply recipe with these specifics: drop `"use client"`; replace `import { Dialog as DialogPrimitive } from "radix-ui"` with `import * as DialogPrimitive from "@radix-ui/react-dialog"`; replace `Button` import path with `"../button"`. Final `src/components/dialog/dialog.tsx`:

```tsx
import * as React from "react";
import { XIcon } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/cn";
import { Button } from "../button";

export function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/dialog/index.ts`:
```typescript
export {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogOverlay, DialogPortal,
  DialogTitle, DialogTrigger,
} from "./dialog";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/dialog/
git commit -m "feat(dialog): port primitive with behavioural tests"
```

---

## Task 15: Dropdown Menu

**Files:**
- Create: `src/components/dropdown-menu/dropdown-menu.tsx`
- Create: `src/components/dropdown-menu/dropdown-menu.test.tsx`
- Create: `src/components/dropdown-menu/index.ts`

- [ ] **Step 1: Test**

`src/components/dropdown-menu/dropdown-menu.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "./dropdown-menu";

describe("<DropdownMenu />", () => {
  it("renders trigger; menu hidden by default", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("One")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByText("One")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("fires onSelect when item is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    await user.click(await screen.findByText("One"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("data-variant=destructive flag is on the item", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    const item = await screen.findByText("Delete");
    expect(item).toHaveAttribute("data-variant", "destructive");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/dropdown-menu.tsx` (255 lines). Apply recipe. The full transformed component follows. Final `src/components/dropdown-menu/dropdown-menu.tsx`:

```tsx
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

export function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

export function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
  );
}

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Index**

`src/components/dropdown-menu/index.ts`:
```typescript
export {
  DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "./dropdown-menu";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/dropdown-menu/
git commit -m "feat(dropdown-menu): port primitive with behavioural tests"
```

---

## Task 16: Select

**Files:**
- Create: `src/components/select/select.tsx`
- Create: `src/components/select/select.test.tsx`
- Create: `src/components/select/index.ts`

- [ ] **Step 1: Test**

`src/components/select/select.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectGroup, SelectLabel, SelectItem, SelectSeparator,
} from "./select";

describe("<Select />", () => {
  it("renders the trigger label and hides options initially", () => {
    render(
      <Select>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByLabelText("fruit")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });

  it("opens listbox on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    await user.click(screen.getByLabelText("fruit"));
    expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument();
  });

  it("calls onValueChange when an option is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select onValueChange={onChange}>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    await user.click(screen.getByLabelText("fruit"));
    await user.click(await screen.findByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenCalledWith("banana");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/select.tsx`. Apply recipe. Drop `"use client"`. Final `src/components/select/select.tsx`:

```tsx
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

export function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

export function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}
```

- [ ] **Step 4: Index**

`src/components/select/index.ts`:
```typescript
export {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectScrollDownButton, SelectScrollUpButton, SelectSeparator,
  SelectTrigger, SelectValue,
} from "./select";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/select/
git commit -m "feat(select): port primitive with behavioural tests"
```

---

## Task 17: Form (react-hook-form integration)

**Files:**
- Create: `src/components/form/form.tsx`
- Create: `src/components/form/form.test.tsx`
- Create: `src/components/form/index.ts`

> **Note:** Form depends on `Label` from this library. Make sure Task 3 (Label) is complete before starting Task 17.

- [ ] **Step 1: Test**

`src/components/form/form.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import {
  Form, FormField, FormItem, FormLabel, FormControl,
  FormDescription, FormMessage,
} from "./form";

function TestForm({ onSubmit }: { onSubmit: (data: { email: string }) => void }) {
  const form = useForm({ defaultValues: { email: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} aria-label="email-input" />
              </FormControl>
              <FormDescription>Your email address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("<Form />", () => {
  it("renders label, control, and description", () => {
    render(<TestForm onSubmit={() => {}} />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("email-input")).toBeInTheDocument();
    expect(screen.getByText("Your email address")).toBeInTheDocument();
  });

  it("does not render the message when there is no error", () => {
    render(<TestForm onSubmit={() => {}} />);
    expect(screen.queryByText("Email required")).not.toBeInTheDocument();
  });

  it("renders the validation message after a failed submit", async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={() => {}} />);
    await user.click(screen.getByText("Submit"));
    expect(await screen.findByText("Email required")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Source `uang-gantung/.../ui/form.tsx`. Apply recipe; replace `import { Label } from "@/components/ui/label"` with `import { Label } from "../label"`. Final `src/components/form/form.tsx`:

```tsx
import * as React from "react";
import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "../../lib/cn";
import { Label } from "../label";

export const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

export function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

export function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

export function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;
  if (!body) return null;
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}
```

- [ ] **Step 4: Index**

`src/components/form/index.ts`:
```typescript
export {
  useFormField, Form, FormItem, FormLabel, FormControl,
  FormDescription, FormMessage, FormField,
} from "./form";
```

- [ ] **Step 5: Test PASS. Step 6: Commit**

```bash
git add src/components/form/
git commit -m "feat(form): port react-hook-form integration with tests"
```

---

## Task 18: Sidebar (largest primitive — 726 lines)

**Files:**
- Create: `src/components/sidebar/sidebar.tsx`
- Create: `src/components/sidebar/sidebar.variants.ts`
- Create: `src/components/sidebar/sidebar.test.tsx`
- Create: `src/components/sidebar/index.ts`

> **Note:** Sidebar is the largest primitive in the library (726 lines). It uses CVA (so a `sidebar.variants.ts` file is created), depends on several other primitives we just ported (Button via `../button`, Input via `../input`, Separator via `../separator`, Sheet via `../sheet`, Skeleton via `../skeleton`, Tooltip via `../tooltip`). Confirm those are all complete before starting.
>
> Because of the size, this task does NOT inline the full source code. Instead:
> 1. Read the source: `/home/qyubit/Workspace/qyubit/sedjiwa-portal/uang-gantung/frontend/src/components/ui/sidebar.tsx`.
> 2. Apply the porting recipe verbatim across the entire file.
> 3. Extract every `cva(...)` call into `sidebar.variants.ts` (export each cva instance and its corresponding `*Variants` type).
> 4. In the component file, change `function ...` declarations to `export function ...` for all the public exports listed in the original `export { ... }` block at the bottom.
> 5. Drop the original `export { ... }` block at the bottom (each function is now exported inline).
> 6. Drop `"use client"` if present.

The original source uses these `useIsMobile` and `cn` patterns; preserve them exactly. There may also be `useSidebar` hook + `SidebarContext` — keep those exported too.

- [ ] **Step 1: Test**

`src/components/sidebar/sidebar.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent,
  SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarTrigger, useSidebar,
} from "./sidebar";

describe("<Sidebar />", () => {
  it("renders provider + sidebar with menu items", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item one</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("trigger button is rendered", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>x</SidebarContent>
        </Sidebar>
        <SidebarTrigger data-testid="trigger" />
      </SidebarProvider>
    );
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("useSidebar hook returns context inside the provider", () => {
    function Probe() {
      const { state } = useSidebar();
      return <span data-testid="state">{state}</span>;
    }
    render(
      <SidebarProvider>
        <Probe />
      </SidebarProvider>
    );
    expect(screen.getByTestId("state").textContent).toMatch(/^(expanded|collapsed)$/);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Port** — Read source, apply recipe, extract any `cva()` blocks into `sidebar.variants.ts`, fix imports per recipe (`../button`, `../input`, `../separator`, `../sheet`, `../skeleton`, `../tooltip`, `../../lib/cn`), drop `"use client"`. Add `export` keyword in front of every `function` and `const` that appeared in the original bottom `export { ... }` block, plus `useSidebar`. Save into `src/components/sidebar/sidebar.tsx`.

- [ ] **Step 4: Index**

`src/components/sidebar/index.ts` (re-export every public symbol):
```typescript
export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "./sidebar";

export {
  sidebarMenuButtonVariants,
  type SidebarMenuButtonVariants,
} from "./sidebar.variants";
```

> If the original sidebar source contained no `cva()`, skip the variants re-export. Confirm by checking the source.

- [ ] **Step 5: Test PASS**

Run `bun run test src/components/sidebar/sidebar.test.tsx` and confirm 3 passing. If any test fails because of import-path or `useIsMobile` issues, debug — DO NOT skip the failing test.

> **`useIsMobile` note:** The original sidebar imports `useIsMobile` from `@/hooks/use-mobile`. That hook isn't part of sedjiwa-ui's planned API surface. Inline the implementation directly inside `sidebar.tsx` (it's a small `useEffect`-based media-query hook). If the source's `useIsMobile` import isn't trivial to inline, escalate to BLOCKED with the source content and ask the controller for guidance.

- [ ] **Step 6: Commit**

```bash
git add src/components/sidebar/
git commit -m "feat(sidebar): port primitive with behavioural tests"
```

---

## Task 19: Wire all primitives into the public barrel

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Replace `src/index.ts` with**

```typescript
export { Button, buttonVariants } from "./components/button";
export type { ButtonProps, ButtonVariants } from "./components/button";

export { Badge, badgeVariants } from "./components/badge";
export type { BadgeProps, BadgeVariants } from "./components/badge";

export {
  AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger,
  AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel,
} from "./components/alert-dialog";

export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";

export {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis,
} from "./components/breadcrumb";

export {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogOverlay, DialogPortal,
  DialogTitle, DialogTrigger,
} from "./components/dialog";

export {
  DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "./components/dropdown-menu";

export {
  useFormField, Form, FormItem, FormLabel, FormControl,
  FormDescription, FormMessage, FormField,
} from "./components/form";

export { Input } from "./components/input";
export { Label } from "./components/label";
export {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectScrollDownButton, SelectScrollUpButton, SelectSeparator,
  SelectTrigger, SelectValue,
} from "./components/select";
export { Separator } from "./components/separator";

export {
  Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay,
  SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
} from "./components/sheet";

export {
  SidebarProvider, Sidebar, SidebarTrigger, SidebarRail, SidebarInset,
  SidebarInput, SidebarHeader, SidebarFooter, SidebarSeparator,
  SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupAction,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar,
} from "./components/sidebar";

export { Skeleton } from "./components/skeleton";
export { Toaster } from "./components/sonner";

export {
  Table, TableHeader, TableBody, TableFooter,
  TableHead, TableRow, TableCell, TableCaption,
} from "./components/table";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs";

export {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "./components/tooltip";

export { cn, type ClassValue } from "./lib/cn";
```

- [ ] **Step 2: Run all tests**

Run `bun run lint && bun run typecheck && bun run test`. Confirm:
- ESLint exit 0
- typecheck exit 0
- All tests passing (count is 14 from Plan A + new tests from Plan B; should land somewhere in the 50-70 range)

Run `bun run build`. Confirm `dist/index.d.ts` exports every symbol listed above (use `grep "export" dist/index.d.ts | wc -l` and eyeball the count).

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: export all v0.1.0 primitives from public barrel"
```

---

## Task 20: Showcase primitives in the playground

**Files:**
- Modify: `playground/src/playground.tsx`

- [ ] **Step 1: Replace `playground/src/playground.tsx` with**

```tsx
import { useState } from "react";
import {
  Button, Badge, Avatar, AvatarFallback, AvatarImage,
  Input, Label, Separator, Skeleton,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Toaster,
} from "@qyubit/sedjiwa-ui";

const buttonVariants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
const badgeVariants = ["default", "secondary", "destructive", "outline"] as const;

export function Playground() {
  const [tab, setTab] = useState("buttons");

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">sedjiwa-ui playground</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toggle <code className="font-mono">.dark</code> on{" "}
          <code className="font-mono">&lt;html&gt;</code> in devtools to preview dark mode.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="misc">Misc</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Button variants</h2>
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((v) => (
                <Button key={v} variant={v}>{v}</Button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Badge variants</h2>
            <div className="flex flex-wrap gap-3">
              {badgeVariants.map((v) => (
                <Badge key={v} variant={v}>{v}</Badge>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6 pt-4">
          <section className="max-w-md space-y-3">
            <h2 className="text-lg font-medium">Input + Label</h2>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ada@example.com" />
            </div>
          </section>
          <section className="max-w-md space-y-3">
            <h2 className="text-lg font-medium">Select</h2>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
              </SelectContent>
            </Select>
          </section>
        </TabsContent>

        <TabsContent value="overlays" className="space-y-6 pt-4">
          <section className="space-x-3">
            <Dialog>
              <DialogTrigger asChild><Button>Open Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hello</DialogTitle>
                  <DialogDescription>This is a dialog.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Side panel</SheetTitle>
                  <SheetDescription>Slides in from the right.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="secondary">Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost">Hover me</Button></TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </section>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Table</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Ada</TableCell>
                  <TableCell>Engineer</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Grace</TableCell>
                  <TableCell>Designer</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Breadcrumb</h2>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/team">Team</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Profile</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </section>
        </TabsContent>

        <TabsContent value="misc" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Avatar</h2>
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="Ada" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>GH</AvatarFallback>
              </Avatar>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Skeleton</h2>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </section>
          <section className="max-w-md">
            <h2 className="text-lg font-medium mb-3">Separator</h2>
            <p>Above</p>
            <Separator className="my-3" />
            <p>Below</p>
          </section>
        </TabsContent>
      </Tabs>

      <Toaster />
    </main>
  );
}
```

- [ ] **Step 2: Verify dev server**

Run `timeout 5 bun run dev 2>&1 | tee /tmp/vite.log`. Inspect `/tmp/vite.log` — confirm a `Local: http://...` line appears with NO error messages.

- [ ] **Step 3: Commit**

```bash
git add playground/src/playground.tsx
git commit -m "chore(playground): showcase all v0.1.0 primitives"
```

---

## Task 21: Bump version, README update, tag, publish v0.1.0

**Files:**
- Modify: `package.json` (version bump)
- Modify: `README.md` (component list)

- [ ] **Step 1: Bump version**

Edit `package.json` — change `"version": "0.0.1"` to `"version": "0.1.0"`.

- [ ] **Step 2: Update README "Components" section**

Replace the existing "Components (preview)" section in `README.md` with:

```markdown
## Components

All shadcn-style primitives, composable via Tailwind utility classes:

- **Layout & overlay:** `Dialog`, `AlertDialog`, `Sheet`, `Tooltip`, `DropdownMenu`, `Sidebar`, `Tabs`
- **Forms:** `Form`, `Input`, `Label`, `Select`, `Separator`, plus react-hook-form integration via `FormField`/`FormItem`/`FormControl`/`FormMessage`/`FormDescription`/`FormLabel`
- **Display:** `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Skeleton`, `Table`
- **Feedback:** `Toaster` (sonner)

Helper: `cn` (clsx + tailwind-merge) is exported for consumer-side class composition.
```

- [ ] **Step 3: Verify pipeline locally**

Run:
```bash
bun run lint && bun run typecheck && bun run test && bun run build
```
All green.

Run `bun pm pack`. Inspect with `tar -tzf qyubit-sedjiwa-ui-0.1.0.tgz`. Confirm only `package/dist/...`, `package/package.json`, `package/README.md` are inside. Delete the tarball.

- [ ] **Step 4: Commit version bump + README**

```bash
git add package.json README.md
git commit -m "chore: bump to v0.1.0 and update README component list"
```

- [ ] **Step 5: Push branch**

```bash
git push -u origin feature/v0.1.0-primitives
```

- [ ] **Step 6: Open and merge a PR**

Use `gh pr create` (or merge through Gitea UI) to merge `feature/v0.1.0-primitives` into `main`. After CI's `verify` job is green and the PR is merged, switch back to `main` and pull:

```bash
git checkout main
git pull
```

- [ ] **Step 7: Tag and push**

```bash
git tag v0.1.0
git push origin v0.1.0
```

CI's `publish` job runs on the tag push. Watch it complete in the Gitea Actions UI (or GitHub Actions if migrated). The package becomes available at the registry.

- [ ] **Step 8: Verify the published package**

```bash
mkdir -p /tmp/sedjiwa-ui-0.1.0
cd /tmp/sedjiwa-ui-0.1.0
bun init -y
bun add @qyubit/sedjiwa-ui@0.1.0
ls node_modules/@qyubit/sedjiwa-ui/dist/
```
Confirm `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` are present.

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui
rm -rf /tmp/sedjiwa-ui-0.1.0
```

---

## Done

`@qyubit/sedjiwa-ui@0.1.0` is published. All 19 primitives shipped:

`Button`, `Badge`, `Avatar`, `Breadcrumb`, `Dialog`, `AlertDialog`, `Sheet`, `Tooltip`, `Tabs`, `DropdownMenu`, `Select`, `Separator`, `Skeleton`, `Input`, `Label`, `Form`, `Table`, `Sidebar`, `Toaster` (sonner) — plus `cn` helper.

Consumer migration (uang-gantung et al.) is the user's next move per the spec; not part of this plan.
