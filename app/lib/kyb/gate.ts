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
 * May this one company propose a deal?
 *
 * Checked at CREATION so a company learns it needs to onboard before it writes
 * out terms and names a counterparty — not after, when the counterparty tries to
 * accept and the deal fails for reasons the accepter cannot fix.
 *
 * Only the creator is checked here. The counterparty may legitimately not have
 * onboarded yet (they may not even have signed in since being invited), and
 * blocking on them would make one company's inaction look like the proposer's
 * error. Both sides are checked at acceptance, which is where it binds.
 */
export async function assertCanPropose(accountId: string | undefined): Promise<GateResult> {
  if (!accountId) return { ok: true };

  const a = await prisma.account.findUnique({
    where: { id: accountId },
    include: { peopleOfControl: { select: { id: true } } },
  });
  if (!a) return { ok: true };

  if (canTrade(a.kybStatus, a.signatoryPassportExpiry)) return { ok: true };

  if (passportExpired(a.signatoryPassportExpiry)) {
    return {
      ok: false,
      blocked: [a.companyName],
      error:
        "Your authorised signatory's passport has expired, so this company cannot " +
        "enter deals. Update it under the Company tab.",
    };
  }

  const n = kybGaps(a, a.peopleOfControl.length).length;
  return {
    ok: false,
    blocked: [a.companyName],
    error:
      `Complete company onboarding before creating a deal — ${n} item${n === 1 ? "" : "s"} ` +
      `outstanding. A trade escrow has to know who it is moving money for. ` +
      `Fill it in under the Company tab.`,
  };
}

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
