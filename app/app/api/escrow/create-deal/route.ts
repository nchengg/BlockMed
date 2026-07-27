import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { getStore, saveStore, getDeal, ensureDeal, appendAudit, type DealTerms } from "@/lib/escrow/store";
import { readActor } from "@/lib/escrow/actor";
import type { DealRole } from "@/lib/escrow/roles";

// CREATE A DEAL FROM SCRATCH (BRD FR-1) — the step the main dashboard never had.
//
// Proposing the terms IS what brings a deal into existence: the creator says which
// side they are on ("I am the buyer" / "I am the seller"), names the counterparty,
// and fills in the terms. Both parties are recorded on the deal record at this
// moment, which is what every later role check derives from (lib/escrow/roles.ts).
// Roles belong to the DEAL, never to the account.
//
// Nothing touches the chain here: createDeal on-chain happens when the counterparty
// agrees (the existing /api/escrow/agree route). This is the off-chain proposal.
//
// TODO(integration: auth Q18) — the creator's identity is client-supplied, exactly
// like the other lifecycle routes. Not a security boundary until server auth lands.
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<DealTerms> & {
    creatorRole?: unknown;
    counterpartyName?: unknown;
    counterpartyAccountId?: unknown;
    reference?: unknown;
    actor?: unknown;
  };
  const actor = readActor(body);

  const creatorRole = body.creatorRole;
  if (creatorRole !== "buyer" && creatorRole !== "seller") {
    return NextResponse.json(
      { error: "Say which side you are on: creatorRole must be \"buyer\" or \"seller\"." },
      { status: 400 },
    );
  }
  const role = creatorRole as DealRole;

  const counterpartyName = typeof body.counterpartyName === "string" ? body.counterpartyName.trim() : "";
  if (!counterpartyName) {
    return NextResponse.json({ error: "Name the counterparty." }, { status: 400 });
  }

  const { goods, amountUsdc, shipmentDeadline } = body;
  if (!goods?.trim()) return NextResponse.json({ error: "Describe the goods." }, { status: 400 });
  if (!shipmentDeadline || !/^\d{4}-\d{2}-\d{2}$/.test(shipmentDeadline)) {
    return NextResponse.json({ error: "Shipment deadline must be YYYY-MM-DD." }, { status: 400 });
  }
  try {
    if (parseUnits((amountUsdc ?? "").trim(), 6) <= 0n) throw new Error();
  } catch {
    return NextResponse.json({ error: "Amount must be a positive USDC value, e.g. 2500.00" }, { status: 400 });
  }

  const creatorName = actor?.displayName ?? "You";
  // The creator's side determines which name lands in which party slot.
  const sellerName = role === "seller" ? creatorName : counterpartyName;
  const buyerName = role === "buyer" ? creatorName : counterpartyName;

  const store = getStore();

  // Mint an app deal id that cannot collide with an existing record.
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  let appDealId = `DEAL-${stamp}-${(store.dealCounter + 1).toString().padStart(4, "0")}`;
  let n = store.dealCounter + 1;
  while (getDeal(store, appDealId)) {
    n += 1;
    appDealId = `DEAL-${stamp}-${n.toString().padStart(4, "0")}`;
  }

  const deal = ensureDeal(store, appDealId);
  deal.terms = {
    goods: goods.trim(),
    amountUsdc: amountUsdc!.trim(),
    sellerName,
    buyerName,
    shipmentDeadline,
  };
  // Both parties recorded up front — this is what roleInDeal() reads later.
  // The counterparty has no accountId until they join; the name is the demo's
  // stand-in for the invite the full product would send.
  const counterpartyAccountId =
    typeof body.counterpartyAccountId === "string" && body.counterpartyAccountId.trim()
      ? body.counterpartyAccountId.trim()
      : undefined;
  deal.parties[role] = { accountId: actor?.accountId, displayName: creatorName, hat: role };
  deal.parties[role === "buyer" ? "seller" : "buyer"] = {
    accountId: counterpartyAccountId,
    displayName: counterpartyName,
    hat: role === "buyer" ? "seller" : "buyer",
  };

  appendAudit(deal, {
    actor: role,
    action: `Deal created by the ${role}`,
    detail: `${deal.terms.goods} — ${deal.terms.amountUsdc} USDC, ship by ${shipmentDeadline}. Counterparty: ${counterpartyName}.`,
    accountId: actor?.accountId,
  });

  store.dealCounter = n;
  saveStore(store);
  return NextResponse.json({ ok: true, dealId: appDealId, terms: deal.terms, role });
}
