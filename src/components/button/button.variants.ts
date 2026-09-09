import { cva, type VariantProps } from "class-variance-authority";

// Solid fills DARKEN for hover/active/pressed; they do not thin out.
//
// The old convention was an alpha step — bg-primary/90 and friends. Alpha
// composites against whatever sits behind, so on a light card it LIGHTENS the
// fill, which is the wrong direction for white label text. Measured on the
// 0.42.1 palette: primary hover 3.38:1, pressed 2.97:1, active 2.65:1, all
// under the 4.5:1 floor. It only worked while --primary was dark enough to
// have headroom; re-cutting it around DashStack's hue in 0.40.0 spent that
// headroom and turned a latent flaw into a live one.
//
// Mixing toward black is surface-independent and moves the right way: light
// mode gains contrast (4.66 -> 6.18 when pressed), dark mode loses a little
// but stays clear (7.36 -> 5.37). scripts/contrast.mjs now gates all three
// steps, so a retint cannot quietly reintroduce this.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=loading]:pointer-events-none data-[state=loading]:opacity-90 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_92%,black)] active:bg-[color-mix(in_oklab,var(--primary)_85%,black)] active:scale-[0.98] data-[state=on]:bg-[color-mix(in_oklab,var(--primary)_88%,black)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive)_92%,black)] active:bg-[color-mix(in_oklab,var(--destructive)_85%,black)] active:scale-[0.98] data-[state=on]:bg-[color-mix(in_oklab,var(--destructive)_88%,black)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent active:border-accent-foreground/20 active:scale-[0.98] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_92%,black)] active:bg-[color-mix(in_oklab,var(--secondary)_85%,black)] active:scale-[0.98] data-[state=on]:bg-[color-mix(in_oklab,var(--secondary)_88%,black)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground active:scale-[0.98] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:translate-y-[1px] data-[state=on]:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
