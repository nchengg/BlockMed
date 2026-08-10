// Tests for the demo sign-in gate.
//
// This route hands out a real session with no credential, so the properties
// below are the only thing standing between "convenient demo switcher" and
// "anyone can be any company". Both must hold independently: the mode must be
// off by default, AND even when on it must not reach a real account.
import { describe, it, expect, afterEach, vi } from "vitest";
import { demoLoginEnabled, isDemoAccount, DEMO_EMAIL_DOMAIN } from "./demoMode";

// NODE_ENV is typed readonly, so vary it through vitest's env stubbing rather
// than assigning to it.
afterEach(() => vi.unstubAllEnvs());

describe("demoLoginEnabled", () => {
  // The default matters more than the enabled case: a deployment that forgets
  // to set anything must be closed, not open.
  it("is off when the variable is absent", () => {
    vi.stubEnv("ESCROW_DEMO_LOGIN", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(demoLoginEnabled()).toBe(false);
  });

  it("is on only for an exact '1' in a non-production build", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ESCROW_DEMO_LOGIN", "1");
    expect(demoLoginEnabled()).toBe(true);
    for (const v of ["0", "true", "yes", "", "TRUE"]) {
      vi.stubEnv("ESCROW_DEMO_LOGIN", v);
      expect(demoLoginEnabled()).toBe(false);
    }
  });

  // Belt and braces: an env var set by mistake in production must not open it.
  it("stays off in production even when the variable is set", () => {
    vi.stubEnv("ESCROW_DEMO_LOGIN", "1");
    vi.stubEnv("NODE_ENV", "production");
    expect(demoLoginEnabled()).toBe(false);
  });
});

describe("isDemoAccount", () => {
  it("accepts the seeded demo identities", () => {
    for (const e of [
      "buyer@meridian.demo",
      "seller@solaris.demo",
      "trader@bridgetrade.demo",
      "ops@tradebridge.demo",
    ]) expect(isDemoAccount(e)).toBe(true);
  });

  // The case that matters: real accounts must never be reachable this way.
  it("rejects real addresses", () => {
    for (const e of [
      "dannyprice2003@gmail.com",
      "dap224@exeter.ac.uk",
      "buyer@sql.test",
      "someone@company.co.uk",
    ]) expect(isDemoAccount(e)).toBe(false);
  });

  it("is case- and whitespace-insensitive", () => {
    expect(isDemoAccount("  Buyer@Meridian.DEMO  ")).toBe(true);
  });

  // ".demo" must be the SUFFIX, not merely present — otherwise an attacker
  // could register something like "a@demo.evil.com" and walk in.
  it("requires the domain to end in .demo, not merely contain it", () => {
    expect(isDemoAccount("attacker@demo.evil.com")).toBe(false);
    expect(isDemoAccount("demo@gmail.com")).toBe(false);
  });

  it("exports the domain it matches on", () => {
    expect(DEMO_EMAIL_DOMAIN).toBe(".demo");
  });
});
