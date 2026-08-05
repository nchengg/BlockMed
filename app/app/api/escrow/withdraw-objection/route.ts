import { NextResponse } from "next/server";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { reviewStatus, groundLabel } from "@/lib/escrow/review";
import { readActor, requireHat, requireAuth } from "@/lib/escrow/actor";
import { denyIfWrongRole, roleInDeal } from "@/lib/escrow/roles";

// WITHDRAW AN OBJECTION (FR-13, resolution branch) — the buyer's way back from a
// mistaken or resolved objection, without making the seller resubmit documents
// that were already compliant.
//
// A standing objection blocks release. Until now the only route forward was the
// seller submitting a corrected B/L, which is wrong when nothing was actually
// wrong with the documents — the buyer objected in error, or the parties settled
// it between themselves.
//
// Withdrawing restores the ORIGINAL notice: the same graded verdict, the same
// window end. It does not re-open the window (the clock kept running), and it
// does not approve the release — the buyer still chooses to approve, or lets the
// window lapse. The objection stays on the audit trail; it is never erased.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 300) : "";

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });
  const deal = await getDeal(appDealId);
  if (!deal?.review) {
    return NextResponse.json({ error: "No notice of release on this deal." }, { status: 409 });
  }
  if (reviewStatus(deal.review) !== "objected") {
    return NextResponse.json({ error: "There is no standing objection to withdraw." }, { status: 409 });
  }

  // Objecting is the buyer's right, so withdrawing is too.
  const wrongRole = denyIfWrongRole(
    deal, actor?.accountId, "buyer",
    "You are the seller on this deal — only the buyer may withdraw an objection.",
  );
  if (wrongRole) return NextResponse.json({ error: wrongRole }, { status: 403 });
  if (!roleInDeal(deal, actor?.accountId)) {
    const denied = requireHat(actor, "buyer");
    if (denied) return denied;
  }

  const withdrawn = deal.review.objection!;
  delete deal.review.objection;

  appendAudit(deal, {
    actor: "buyer",
    action: `Objection withdrawn — ${groundLabel(withdrawn.ground)}`,
    detail: reason
      ? `${reason} (original objection: ${withdrawn.detail || "no detail given"})`
      : `Original objection: ${withdrawn.detail || "no detail given"}. The notice of release stands again.`,
    accountId: actor?.accountId,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true, status: reviewStatus(deal.review) });
}
