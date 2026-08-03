import { NextResponse } from "next/server";
import { loadDeployment, publicClient, escrowAbi } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { gradeBol, RECORDED_FIELDS, type BolFields } from "@/lib/escrow/rules";
import { openReview, reviewStatus } from "@/lib/escrow/review";
import { readActor, requireHat, requireAuth } from "@/lib/escrow/actor";
import { denyIfWrongRole, roleInDeal } from "@/lib/escrow/roles";

// SELLER submits the bill-of-lading details. The deterministic rules engine grades
// them against the agreed terms. A Compliant grading NO LONGER records the verdict
// on-chain directly (FR-10/11): it issues a NOTICE OF RELEASE to the buyer and opens
// the objection window (see lib/escrow/review.ts). recordVerdict happens later via
// approve-release (buyer waives the window) or finalise-release (window expired
// quietly) — never while an objection stands. Discrepant = no notice, no chain write.
//
// #27 adaptation: submission is gated to the seller hat.
// Reconciliation: scoped to the caller's active app deal id (lib/dealStore) — the
// B/L is graded against THAT deal's terms.
export async function POST(req: Request) {
  const body = (await req.json()) as BolFields & { dealId?: unknown; actor?: unknown };
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const fields = body as BolFields;
  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId || !deal.terms) {
    return NextResponse.json({ error: "No funded deal." }, { status: 409 });
  }

  // Submitting documents is the seller's action. Prefer the caller's recorded role
  // on THIS deal; fall back to the hat check when they aren't a recorded party.
  const wrongRole = denyIfWrongRole(
    deal, actor?.accountId, "seller",
    "You are the buyer on this deal — the seller submits the bill of lading.",
  );
  if (wrongRole) return NextResponse.json({ error: wrongRole }, { status: 403 });
  if (!roleInDeal(deal, actor?.accountId)) {
    const denied = requireHat(actor, "seller");
    if (denied) return denied;
  }

  // Resubmission policy: while a clean notice is pending (or quietly expired),
  // the seller cannot replace it — the path forward is buyer approval or
  // finalise-release. Only a raised objection reopens submission.
  if (deal.review) {
    const rs = reviewStatus(deal.review);
    if (rs === "pending") {
      return NextResponse.json(
        { error: "A notice of release is pending buyer review — resubmission is only possible after an objection." },
        { status: 409 },
      );
    }
    if (rs === "expired") {
      return NextResponse.json(
        { error: "The objection window expired with no objection — finalise the release instead of resubmitting." },
        { status: 409 },
      );
    }
    // rs === "objected": corrected resubmission allowed (the objection stays on the
    // audit trail; the review record is replaced below on a Compliant grading).
    // rs === "approved" is unreachable here: approval implies recordVerdict, so the
    // on-chain state guard below (must be Funded) already rejects.
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Idempotency / state guard: only grade while the deal is Funded (mirrors on-chain InvalidState)
  const state = (await pc.readContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "state",
    args: [deal.onChainDealId],
  })) as number;
  if (state !== 2 /* Funded */) {
    return NextResponse.json({ error: "Deal is not in Funded state." }, { status: 409 });
  }

  const verdict = gradeBol(fields, deal.terms);
  // Graded rules + the recorded-only B/L particulars (vessel, ports, container…) —
  // the latter aren't machine-checked but belong on the record for documentary review.
  const recorded = RECORDED_FIELDS
    .map(({ key, label }) => `${label}: ${(fields[key] ?? "").toString().trim() || "—"}`)
    .join(" · ");
  appendAudit(deal, {
    actor: "seller",
    action: `Submitted B/L ${fields.blNumber || "(no number)"} — verdict: ${verdict.verdict}`,
    detail: `${verdict.rules.map((r) => `${r.pass ? "✓" : "✗"} ${r.rule}`).join(" · ")} | ${recorded}`,
    accountId: actor?.accountId,
  });

  if (verdict.verdict !== "Compliant") {
    await saveDeal(deal);
    return NextResponse.json({ ok: true, ...verdict });
  }

  // Compliant → open (or replace, after an objection) the buyer's review window.
  deal.review = openReview(fields, verdict);
  appendAudit(deal, {
    actor: "platform",
    action: "Notice of release issued to buyer",
    detail: `Documents graded Compliant. Buyer may approve now or object on valid grounds until ${deal.review.windowEndsAt}. recordVerdict is held until then.`,
  });
  await saveDeal(deal);
  return NextResponse.json({
    ok: true,
    ...verdict,
    notice: { noticeAt: deal.review.noticeAt, windowEndsAt: deal.review.windowEndsAt },
  });
}
