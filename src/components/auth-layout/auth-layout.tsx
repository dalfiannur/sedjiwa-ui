import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export type AuthLayoutProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Product mark and name, top of the brand panel. */
  brand: React.ReactNode;
  /** The panel's one statement, e.g. what the product is for. */
  headline: React.ReactNode;
  /** A few short reasons to sign in, each ticked. */
  highlights?: React.ReactNode[];
  /** Small print at the bottom of the panel, e.g. the domain. */
  note?: React.ReactNode;
  /** The form's heading ("Masuk", "Buat workspace"). Rendered as the page's
   *  `<h1>`. */
  title: React.ReactNode;
  /** Under the heading: usually the link to the other form. */
  description?: React.ReactNode;
  /** Retint the brand panel. It defaults to the theme's primary fill. */
  panelClassName?: string;
  /** The form. */
  children: React.ReactNode;
};

/**
 * Sign-in, sign-up and invitation pages: a brand panel on the left, the form
 * on the right. Below `lg` the panel is dropped and the brand moves above the
 * form, so the form is never pushed below the fold on a phone.
 *
 * The panel is `--primary` with `--primary-foreground`, the pair the
 * contrast gate already measures; pass `panelClassName` to retint it.
 */
export function AuthLayout({
  brand,
  headline,
  highlights,
  note,
  title,
  description,
  panelClassName,
  className,
  children,
  ...props
}: AuthLayoutProps) {
  return (
    <div data-slot="auth-layout" className={cn("flex min-h-full", className)} {...props}>
      <section
        data-slot="auth-layout-panel"
        className={cn(
          "bg-primary text-primary-foreground hidden w-1/2 max-w-[640px] flex-col justify-between gap-12 p-14 lg:flex",
          panelClassName,
        )}
      >
        <div data-slot="auth-layout-brand" className="flex items-center gap-3 text-lg font-bold">
          {brand}
        </div>
        <div className="flex max-w-[480px] flex-col gap-6">
          <p className="text-[40px] leading-[1.15] font-bold tracking-tight">{headline}</p>
          {highlights && highlights.length > 0 && (
            <ul className="flex flex-col gap-3.5 text-[15px]">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={2.4} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {note != null ? <p className="text-sm">{note}</p> : <span />}
      </section>

      <section data-slot="auth-layout-form" className="grid flex-1 place-items-center px-6 py-12">
        <div className="flex w-full max-w-[400px] flex-col gap-6">
          <div className="flex items-center gap-2.5 font-bold lg:hidden">{brand}</div>
          <div>
            <h1 className="mb-1.5 text-[26px] font-bold tracking-tight">{title}</h1>
            {description != null && <div className="text-muted-foreground">{description}</div>}
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
