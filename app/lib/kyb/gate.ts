import "server-only";
// The onboarding gate: may these two companies enter a deal together?
//
// Checked at ACCEPTANCE, which is the moment a deal becomes binding and goes
// on-chain. Both parties are checked, not just the accepter — a deal is a
// relationship, and letting an onboarded company transact with one that never
// completed onboarding defeats the point.
//
// PROOF OF CONCEPT — "attested" means the company filled in its own details.
// Nothing here screens anyone against a sanctions list. See lib/kyb/psc.ts.
import { prisma } from "@/lib/db";
import type { DealRecord } from "@/lib/escrow/store";
import { canTrade, kybGaps, passportExpired } from "./psc";

export type GateResult = { ok: true } | { ok: false; error: string; blocked: string[] };

/**
 * Both parties must have completed onboarding before a deal binds them.
 *
 * A party with no account (invited by name only) is skipped: there is nobody to
 * onboard yet, and blocking would break the invite flow. That is a real gap and
 * is why the check lives here rather than being treated as sufficient.
 */
export async function assertPartiesCanTrade(deal: DealRecord): Promise<GateResult> {
  const ids = [deal.parties.buyer?.accountId, deal.parties.seller?.accountId].filter(
    (v): v is string => typeof v === "string",
  );
  if (ids.length === 0) return { ok: true };

  const accounts = await prisma.account.findMany({
    where: { id: { in: ids } },
    include: { peopleOfControl: { select: { id: true } } },
  });

  const blocked: string[] = [];
  const reasons: string[] = [];

  for (const a of accounts) {
    if (canTrade(a.kybStatus, a.signatoryPassportExpiry)) continue;
    blocked.push(a.companyName);

    // Say WHICH problem it is: "complete your onboarding" and "your signatory's
    // passport expired" need different actions from the user.
    if (passportExpired(a.signatoryPassportExpiry)) {
      reasons.push(`${a.companyName}: the authorised signatory's passport has expired`);
    } else {
      const n = kybGaps(a, a.peopleOfControl.length).length;
      reasons.push(`${a.companyName}: onboarding incomplete (${n} item${n === 1 ? "" : "s"} outstanding)`);
    }
  }

  if (blocked.length === 0) return { ok: true };

  return {
    ok: false,
    blocked,
    error:
      `This deal cannot go on-chain until both companies have completed onboarding. ` +
      reasons.join("; ") +
      `. Complete it under the Company tab.`,
  };
}
