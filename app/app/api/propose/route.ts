import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { getStore, saveStore, appendAudit, type DealTerms } from "@/lib/store";

// Step 1 — SELLER proposes the escrow terms (off-chain; nothing on-chain yet).
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<DealTerms>;
  const { goods, amountUsdc, sellerName, buyerName, shipmentDeadline } = body;

  if (!goods?.trim() || !sellerName?.trim() || !buyerName?.trim() || !shipmentDeadline) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  try {
    if (parseUnits(amountUsdc ?? "", 6) <= 0n) throw new Error();
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
  appendAudit(store, {
    actor: "seller",
    action: "Proposed escrow terms",
    detail: `${store.terms.goods} — ${store.terms.amountUsdc} USDC, ship by ${shipmentDeadline}`,
  });
  saveStore(store);
  return NextResponse.json({ ok: true });
}
