import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "tailwindcss"],
  treeshake: true,
  splitting: false,
  async onSuccess() {
    mkdirSync("dist", { recursive: true });
    copyFileSync("src/styles/base.css", "dist/styles.css");
  },
});
