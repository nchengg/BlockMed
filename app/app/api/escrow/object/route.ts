import { NextResponse } from "next/server";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { reviewStatus, isValidGround, groundLabel } from "@/lib/escrow/review";
import { readActor, requireHat, requireAuth } from "@/lib/escrow/actor";
import { denyIfWrongRole, roleInDeal } from "@/lib/escrow/roles";

// BUYER objects to the noticed release (FR-11) — only within the window, and only
// on the CLOSED set of valid grounds (BRD §9.1). A standing objection blocks
// recordVerdict; the seller may resubmit corrected documents, which reopens a
// fresh notice. Anything outside the valid grounds is rejected here — the seller
// is protected from post-shipment renegotiation.
export async function POST(req: Request) {
  const body = (await req.json()) as { dealId?: unknown; actor?: unknown; ground?: unknown; detail?: unknown };
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  if (!isValidGround(body.ground)) {
    return NextResponse.json(
      { error: "Not a valid objection ground. Valid grounds: missing document, field mismatch, late shipment, suspected fraud, sanctions/KYC, mutual amendment." },
      { status: 400 },
    );
  }
  const detail = typeof body.detail === "string" ? body.detail.trim().slice(0, 500) : "";
  const deal = await getDeal(appDealId);
  if (!deal?.review) {
    return NextResponse.json({ error: "No notice of release to object to." }, { status: 409 });
  }

  // Objecting is the buyer's right. Prefer the recorded role on THIS deal.
  const wrongRole = denyIfWrongRole(
    deal, actor?.accountId, "buyer",
    "You are the seller on this deal — only the buyer may object.",
  );
  if (wrongRole) return NextResponse.json({ error: wrongRole }, { status: 403 });
  if (!roleInDeal(deal, actor?.accountId)) {
    const denied = requireHat(actor, "buyer");
    if (denied) return denied;
  }

  const rs = reviewStatus(deal.review);
  if (rs !== "pending") {
    const why =
      rs === "expired"
        ? "the objection window has expired"
        : rs === "objected"
          ? "an objection is already standing"
          : "the release was already approved";
    return NextResponse.json({ error: `Cannot object — ${why}.` }, { status: 409 });
  }

  deal.review.objection = {
    ground: body.ground,
    detail,
    raisedAt: new Date().toISOString(),
  };
  appendAudit(deal, {
    actor: "buyer",
    action: `Objection raised — ${groundLabel(body.ground)}`,
    detail: detail || "(no further detail given)",
    accountId: actor?.accountId,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true });
}
