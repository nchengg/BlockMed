import { NextResponse } from "next/server";
import { loadDeployment } from "@/lib/escrow/chain";
import { getStore, saveStore, getDeal, appendAudit, readDealId } from "@/lib/escrow/store";
import { reviewStatus } from "@/lib/escrow/review";
import { assertLocalReleaser, recordVerdictOnChain } from "@/lib/escrow/settlement";
import { readActor, requireHat } from "@/lib/escrow/actor";
import { denyIfWrongRole, roleInDeal } from "@/lib/escrow/roles";

// BUYER approves the release after reviewing the noticed documents (FR-10): an
// explicit waiver of the remaining objection window. Only then does the platform
// sign recordVerdict (Funded → ReleasePending). Blocked while an objection stands.
export async function POST(req: Request) {
  const body = (await req.json()) as { dealId?: unknown; actor?: unknown };
  const actor = readActor(body);

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const store = getStore();
  const deal = getDeal(store, appDealId);
  if (!deal?.onChainDealId || !deal.review) {
    return NextResponse.json({ error: "No notice of release to approve." }, { status: 409 });
  }

  // Approving release is the buyer's call. Prefer the recorded role on THIS deal.
  const wrongRole = denyIfWrongRole(
    deal, actor?.accountId, "buyer",
    "You are the seller on this deal — the buyer approves the release.",
  );
  if (wrongRole) return NextResponse.json({ error: wrongRole }, { status: 403 });
  if (!roleInDeal(deal, actor?.accountId)) {
    const denied = requireHat(actor, "buyer");
    if (denied) return denied;
  }

  const rs = reviewStatus(deal.review);
  if (rs === "objected") {
    return NextResponse.json(
      { error: "An objection is standing — withdrawal/resolution happens via the seller's corrected resubmission." },
      { status: 409 },
    );
  }
  if (rs === "approved") {
    return NextResponse.json({ error: "Release already approved." }, { status: 409 });
  }
  // pending or (harmlessly) expired: buyer approval is valid either way.

  const dep = loadDeployment();
  const localGuard = assertLocalReleaser(dep);
  if (localGuard) return localGuard;

  deal.review.approvedAt = new Date().toISOString();
  appendAudit(deal, {
    actor: "buyer",
    action: "Approved release after document review",
    detail: "Buyer waived the remaining objection window.",
    accountId: actor?.accountId,
  });

  const hash = await recordVerdictOnChain(dep, deal.onChainDealId);
  appendAudit(deal, {
    actor: "platform",
    action: "Verdict recorded on-chain (recordVerdict)",
    detail: "Buyer-approved. State: Funded → ReleasePending — release is now permissionless",
    txHash: hash,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, txHash: hash });
}
