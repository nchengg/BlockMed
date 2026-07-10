import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { getStore, saveStore, appendAudit, type DealTerms } from "@/lib/escrow/store";
import { readActor, requireHat, partyRef } from "@/lib/escrow/actor";

// Step 1 — SELLER proposes the escrow terms (off-chain; nothing on-chain yet).
// #27 adaptation: gated to the seller hat, and the seller account is recorded.
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<DealTerms> & { actor?: unknown };
  const actor = readActor(body);
  const denied = requireHat(actor, "seller");
  if (denied) return denied;

  const { goods, amountUsdc, sellerName, buyerName, shipmentDeadline } = body;

  if (!goods?.trim() || !sellerName?.trim() || !buyerName?.trim() || !shipmentDeadline) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  try {
    // BigInt(0), not 0n literal — the app tsconfig targets ES2017 (TS2737).
    if (parseUnits(amountUsdc ?? "", 6) <= BigInt(0)) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Amount must be a positive USDC value, e.g. 2500.00" },
      { status: 400 },
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shipmentDeadline)) {
    return NextResponse.json({ error: "Deadline must be YYYY-MM-DD." }, { status: 400 });
  }

  const store = getStore();
  if (store.terms) {
    return NextResponse.json({ error: "A proposal already exists — reset to start over." }, { status: 409 });
  }

  store.terms = {
    goods: goods.trim(),
    amountUsdc: amountUsdc!.trim(),
    sellerName: sellerName.trim(),
    buyerName: buyerName.trim(),
    shipmentDeadline,
  };
  store.parties.seller = partyRef(actor, "seller");
  appendAudit(store, {
    actor: "seller",
    action: "Proposed escrow terms",
    detail: `${store.terms.goods} — ${store.terms.amountUsdc} USDC, ship by ${shipmentDeadline}`,
    accountId: actor?.accountId,
  });
  saveStore(store);
  return NextResponse.json({ ok: true });
}
