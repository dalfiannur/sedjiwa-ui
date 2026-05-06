import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "tailwindcss", "@radix-ui/react-slot", "tw-animate-css"],
  treeshake: true,
  splitting: false,
  async onSuccess() {
    mkdirSync("dist", { recursive: true });
    copyFileSync("src/styles/base.css", "dist/styles.css");
  },
});
