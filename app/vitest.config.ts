import { defineConfig } from "vitest/config";
import path from "node:path";

// Minimal unit-test config. Node environment (these are pure server-side modules —
// the rules engine and the route guards; no DOM). Only picks up co-located unit
// tests under lib/ so it never scans .next/ or the app router.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.{test,spec}.ts"],
  },
  resolve: {
    alias: {
      // The app imports by "@/..." alias; vitest does not read tsconfig paths,
      // so any module under test using one would fail to resolve without this.
      "@": path.resolve(__dirname, "."),
      // "server-only" is a Next.js build-time guard that throws if a module is
      // pulled into a client bundle. It has no runtime outside Next, so tests
      // stub it out — the guard still does its job in the real build.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
    },
  },
});
