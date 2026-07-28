import { NextResponse } from "next/server";
import { keccak256, parseUnits, toHex } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/escrow/chain";
import { getStore, saveStore, getDeal, appendAudit, readDealId } from "@/lib/escrow/store";
import { assertLocalReleaser } from "@/lib/escrow/settlement";
import { readActor } from "@/lib/escrow/actor";
import { roleInDeal, pendingOnRole } from "@/lib/escrow/roles";

// ACCEPT (or DECLINE) a proposed deal — the counterparty's half of FR-1.
//
// Differs from /api/escrow/agree, which is hardcoded to the buyer hat: here EITHER
// side may be the accepter, because whoever did NOT create the deal is the one who
// must accept it (roles.ts/pendingOnRole). The accepter is authorised by their
// recorded position in THIS deal, not by an account type.
//
// Accepting registers the deal on-chain (createDeal → Draft→Agreed) — the first
// moment the chain is involved. Declining is purely off-chain.
//
// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL — RELEASER SIGNS HERE (createDeal is RELEASER_ROLE-gated on-chain).
// The key is the public Hardhat dev key and this route REFUSES TO SIGN off the
// local dev chain. TODO(integration: auth Q18) — real releaser key behind
// verified operator identity before this can run anywhere else.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = readActor(body);
  const decline = body?.decline === true;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const store = getStore();
  const deal = getDeal(store, appDealId);
  if (!deal?.terms) return NextResponse.json({ error: "No proposal to accept." }, { status: 409 });
  if (deal.onChainDealId) return NextResponse.json({ error: "This deal has already been accepted." }, { status: 409 });
  if (deal.declinedAt) return NextResponse.json({ error: "This deal was declined." }, { status: 409 });

  // Only the party the deal is pending on may accept it — derived per deal.
  const viewerRole = roleInDeal(deal, actor?.accountId);
  const mustAccept = pendingOnRole(deal);
  if (actor?.accountId) {
    if (!viewerRole) {
      return NextResponse.json({ error: "You are not a party to this deal." }, { status: 403 });
    }
    if (mustAccept && viewerRole !== mustAccept) {
      return NextResponse.json(
        { error: "You proposed this deal — it is the counterparty's to accept." },
        { status: 403 },
      );
    }
  }

  if (decline) {
    deal.declinedAt = new Date().toISOString();
    appendAudit(deal, {
      actor: viewerRole ?? "anyone",
      action: "Declined the proposed deal",
      detail: "No on-chain deal was created.",
      accountId: actor?.accountId,
    });
    saveStore(store);
    return NextResponse.json({ ok: true, declined: true });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Derive the on-chain id from the app deal id + counter salt (unique per run).
  const onChainDealId = keccak256(toHex(`${appDealId}#${store.dealCounter + 1}`));
  const amountMinor = parseUnits(deal.terms.amountUsdc, 6);

  appendAudit(deal, {
    actor: viewerRole ?? "anyone",
    action: `Accepted the proposed terms as the ${viewerRole ?? "counterparty"}`,
    accountId: actor?.accountId,
  });

  const localGuard = assertLocalReleaser(dep);
  if (localGuard) {
    saveStore(store); // keep the acceptance in the audit trail; just don't sign
    return localGuard;
  }

  const releaser = walletFor("releaser", dep);
  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "createDeal",
    args: [onChainDealId, dep.accounts.buyer, dep.accounts.seller, amountMinor],
  });
  await pc.waitForTransactionReceipt({ hash });

  store.dealCounter += 1;
  deal.onChainDealId = onChainDealId;
  appendAudit(deal, {
    actor: "platform",
    action: "Deal registered on-chain (createDeal)",
    detail: "State: Draft → Agreed — both parties are now bound to these terms",
    txHash: hash,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, dealId: appDealId, onChainDealId, txHash: hash });
}
