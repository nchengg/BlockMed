import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { assertLocalReleaser } from "@/lib/escrow/settlement";
import { readActor, requireAuth } from "@/lib/escrow/actor";
import { roleInDeal } from "@/lib/escrow/roles";
import { reviewStatus } from "@/lib/escrow/review";

// REFUND — return locked funds to the buyer (FR-13). The escape hatch for a deal
// that will not complete: the seller never shipped, the deadline passed, or both
// sides walked away. Without this a Funded deal has no exit and sits forever.
//
// On-chain the contract only allows refund from Funded, and only from the
// releaser/admin key — so the platform signs it, exactly like recordVerdict.
//
// Who may ASK for it here:
//   • the buyer  — it is their money coming back
//   • the seller — releasing their claim (a mutual unwind)
// Blocked once a release is already authorised (ReleasePending onwards): after
// recordVerdict the contract's own state guard rejects it anyway, and a standing
// notice means the documents passed — the buyer's route then is to object, not
// to pull the funds.
//
// TODO(integration: auth Q18) — in production a refund is a human-gated decision
// (BRD §9.2 requires reviewer sign-off), not a self-service button. Local-only
// until the releaser key sits behind verified operator identity.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 300) : "";

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });
  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId) {
    return NextResponse.json({ error: "No on-chain deal to refund." }, { status: 409 });
  }

  // Must be a party to the deal.
  const viewerRole = roleInDeal(deal, actor?.accountId);
  if (actor?.accountId && !viewerRole) {
    return NextResponse.json({ error: "You are not a party to this deal." }, { status: 403 });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Mirror the contract's guard so the user gets a readable error, not a revert.
  const state = (await pc.readContract({
    address: dep.escrow, abi: escrowAbi, functionName: "state", args: [deal.onChainDealId],
  })) as number;
  if (state !== 2 /* Funded */) {
    return NextResponse.json(
      { error: "Only a funded deal can be refunded — the funds are not (or no longer) held." },
      { status: 409 },
    );
  }

  // A clean notice of release means the documents passed. Objecting is the buyer's
  // route then; pulling the funds out from under it is not.
  if (deal.review && !deal.review.objection && reviewStatus(deal.review) !== "objected") {
    return NextResponse.json(
      { error: "A notice of release is open — object to it rather than refunding." },
      { status: 409 },
    );
  }

  const localGuard = assertLocalReleaser(dep);
  if (localGuard) return localGuard;

  appendAudit(deal, {
    actor: viewerRole ?? "anyone",
    action: `Refund requested by the ${viewerRole ?? "party"}`,
    detail: reason || "(no reason given)",
    accountId: actor?.accountId,
  });

  const releaser = walletFor("releaser", dep);
  const hash = await releaser.writeContract({
    address: dep.escrow, abi: escrowAbi, functionName: "refund", args: [deal.onChainDealId],
  });
  await pc.waitForTransactionReceipt({ hash });

  appendAudit(deal, {
    actor: "platform",
    action: "Refund executed on-chain (refund)",
    detail: "State: Funded → Refunded — the escrow returned the funds to the buyer",
    txHash: hash,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true, txHash: hash });
}
