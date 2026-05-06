import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts", "./src/test/setup.pointer-events.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
