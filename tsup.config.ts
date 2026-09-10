import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "tailwindcss",
    "tw-animate-css",
    "@radix-ui/react-slot",
    "@radix-ui/react-alert-dialog",
    "@radix-ui/react-avatar",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-label",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@radix-ui/react-slider",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "@radix-ui/react-toggle-group",
    "@radix-ui/react-tooltip",
    "lucide-react",
    "recharts",
    "embla-carousel-react",
    "next-themes",
    "react-hook-form",
    "sonner",
  ],
  treeshake: true,
  splitting: false,
  async onSuccess() {
    mkdirSync("dist", { recursive: true });
    copyFileSync("src/styles/base.css", "dist/styles.css");
    copyFileSync("src/styles/tokens.css", "dist/tokens.css");
  },
});
