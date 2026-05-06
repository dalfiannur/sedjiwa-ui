import { Button } from "@qyubit/sedjiwa-ui";

const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
const sizes = ["sm", "default", "lg"] as const;

export function Playground() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">sedjiwa-ui playground</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toggle <code className="font-mono">.dark</code> on{" "}
          <code className="font-mono">&lt;html&gt;</code> in devtools to preview dark mode.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button — variants</h2>
        <div className="flex flex-wrap gap-3">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button — sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((s) => (
            <Button key={s} size={s}>
              size={s}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Button — disabled</h2>
        <Button disabled>Disabled</Button>
      </section>
    </main>
  );
}
