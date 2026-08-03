import { NextResponse } from "next/server";
import { loadDeployment } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { reviewStatus } from "@/lib/escrow/review";
import { assertLocalReleaser, recordVerdictOnChain } from "@/lib/escrow/settlement";
import { readActor } from "@/lib/escrow/actor";

// SELLER or PLATFORM finalises the release once the objection window has expired
// with no objection (FR-10): the quiet-expiry path to recordVerdict. Strictly
// gated on status === "expired" — never early, never past an objection.
export async function POST(req: Request) {
  const body = (await req.json()) as { dealId?: unknown; actor?: unknown };
  const actor = readActor(body);
  // Two hats may finalise: the seller (whose payment it is) or the platform.
  // Anonymous actors soft-allow, matching the other routes' demo posture.
  if (actor?.type === "client" && actor.hat && actor.hat !== "seller" && actor.hat !== "platform") {
    return NextResponse.json(
      { error: `You are acting as "${actor.hat}". Finalising is a seller/platform action.` },
      { status: 403 },
    );
  }

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });
  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId || !deal.review) {
    return NextResponse.json({ error: "No notice of release to finalise." }, { status: 409 });
  }

  const rs = reviewStatus(deal.review);
  if (rs !== "expired") {
    const why =
      rs === "pending"
        ? "the objection window is still open — the buyer may approve early instead"
        : rs === "objected"
          ? "an objection is standing"
          : "the release was already approved";
    return NextResponse.json({ error: `Cannot finalise — ${why}.` }, { status: 409 });
  }

  const dep = loadDeployment();
  const localGuard = assertLocalReleaser(dep);
  if (localGuard) return localGuard;

  deal.review.approvedAt = new Date().toISOString();
  appendAudit(deal, {
    actor: "platform",
    action: "Objection window expired with no objection — release finalised",
    detail: `Window closed ${deal.review.windowEndsAt}; no valid objection was raised.`,
    accountId: actor?.accountId,
  });

  const hash = await recordVerdictOnChain(dep, deal.onChainDealId);
  appendAudit(deal, {
    actor: "platform",
    action: "Verdict recorded on-chain (recordVerdict)",
    detail: "Window expired quietly. State: Funded → ReleasePending — release is now permissionless",
    txHash: hash,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true, txHash: hash });
}
