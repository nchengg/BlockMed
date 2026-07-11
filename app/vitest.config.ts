import { defineConfig } from "vitest/config";

// Minimal unit-test config. Node environment (these are pure server-side modules —
// the rules engine and the route guards; no DOM). Only picks up co-located unit
// tests under lib/ so it never scans .next/ or the app router.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.{test,spec}.ts"],
  },
});
