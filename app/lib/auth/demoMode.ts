import "server-only";
// Whether passwordless demo sign-in is available, and for whom.
//
// The demo switcher is genuinely useful — flipping between buyer and seller
// mid-presentation without logging out — but it hands out a real session with
// no credential, so it needs two hard limits:
//
//   1. It must be OFF unless explicitly switched on. Not "on unless disabled":
//      a deployment that forgets to set a variable must be safe, not open.
//   2. Even when on, it must only reach accounts that were created FOR the
//      demo. A real company's account is never signable-into without its
//      password, whatever mode the server is in.
//
// Demo accounts are identified by their email domain rather than a flag column,
// so the seed script defines the set and nothing else can opt in by accident.
//
// ".demo" matches the convention in prisma/seed-demo.mjs (buyer@meridian.demo,
// seller@solaris.demo, …). It is a reserved-style suffix that cannot be a real
// deliverable address, so a genuine company signing up can never land in this
// set by accident.
export const DEMO_EMAIL_DOMAIN = ".demo";

/**
 * Demo sign-in is enabled whenever ESCROW_DEMO_LOGIN=1.
 *
 * PROTOTYPE DECISION: this previously also required a non-production build, so
 * the passwordless switcher could never run on a deployed (Vercel) build. For
 * the hosted prototype we deliberately drop that limit so the demo buyer and
 * seller can be switched between without credentials during a walkthrough.
 *
 * The two limits that actually contain the risk still hold:
 *   • Off by default — it only opens when ESCROW_DEMO_LOGIN=1 is explicitly set.
 *   • Demo accounts only — isDemoAccount()/DEMO_EMAIL_DOMAIN mean a real company
 *     can never be signed into without its password (enforced in
 *     api/auth/demo-login and api/escrow/companies).
 *
 * Before any real-money / production launch, restore the NODE_ENV guard.
 */
export function demoLoginEnabled(): boolean {
  return process.env.ESCROW_DEMO_LOGIN === "1";
}

/** Only seeded demo accounts may be signed into without a password. */
export function isDemoAccount(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DEMO_EMAIL_DOMAIN);
}
