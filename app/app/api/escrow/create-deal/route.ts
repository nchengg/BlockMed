import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { ensureDeal, appendAudit, saveDeal, nextDealCounter, type DealTerms } from "@/lib/escrow/store";
import { readActor, requireAuth } from "@/lib/escrow/actor";
import { prisma } from "@/lib/db";
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
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const creatorRole = body.creatorRole;
  if (creatorRole !== "buyer" && creatorRole !== "seller") {
    return NextResponse.json(
      { error: "Say which side you are on: creatorRole must be \"buyer\" or \"seller\"." },
      { status: 400 },
    );
  }
  const role = creatorRole as DealRole;

  // The counterparty must be a REAL account, not free text — otherwise the deal is
  // addressed to nobody and never appears in anyone's list but the creator's.
  const counterpartyAccountId =
    typeof body.counterpartyAccountId === "string" ? body.counterpartyAccountId.trim() : "";
  const found = counterpartyAccountId
    ? await prisma.account.findUnique({
        where: { id: counterpartyAccountId },
        select: { id: true, companyName: true },
      })
    : null;
  if (!found) {
    return NextResponse.json({ error: "Pick a counterparty company." }, { status: 400 });
  }
  const counterparty = { accountId: found.id, displayName: found.companyName };
  if (actor?.accountId && counterparty.accountId === actor.accountId) {
    return NextResponse.json({ error: "You cannot be your own counterparty." }, { status: 400 });
  }
  const counterpartyName = counterparty.displayName;

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

  // Mint an app deal id. The counter is reserved atomically and never reused,
  // even across deletions, so the id cannot collide with an existing record.
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const n = await nextDealCounter();
  const appDealId = `DEAL-${stamp}-${n.toString().padStart(4, "0")}`;

  const deal = await ensureDeal(appDealId);
  deal.terms = {
    goods: goods.trim(),
    amountUsdc: amountUsdc!.trim(),
    sellerName,
    buyerName,
    shipmentDeadline,
  };
  // Both parties recorded up front, each with a REAL account id — this is what
  // roleInDeal() reads later, and it is why the deal shows up in the
  // counterparty's own list the moment it is created.
  deal.parties[role] = { accountId: actor?.accountId, displayName: creatorName, hat: role };
  deal.parties[role === "buyer" ? "seller" : "buyer"] = {
    accountId: counterparty.accountId,
    displayName: counterpartyName,
    hat: role === "buyer" ? "seller" : "buyer",
  };

  // The other side's acceptance is what's pending — see roles.ts/pendingOn.
  deal.createdByRole = role;
  appendAudit(deal, {
    actor: role,
    action: `Deal created by the ${role}`,
    detail: `${deal.terms.goods} — ${deal.terms.amountUsdc} USDC, ship by ${shipmentDeadline}. Counterparty: ${counterpartyName}.`,
    accountId: actor?.accountId,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true, dealId: appDealId, terms: deal.terms, role });
}
