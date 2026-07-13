import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/escrow/chain";
import { getStore, saveStore, getDeal, appendAudit, readDealId } from "@/lib/escrow/store";
import { readActor } from "@/lib/escrow/actor";

// Step 5 — Release. Deliberately signed by the SELLER key here to demonstrate that
// release is PERMISSIONLESS: once ReleasePending, anyone can trigger settlement, so
// there is intentionally NO party gate on this route. The actor is recorded only for
// the audit trail.
// Reconciliation: still scoped to the caller's active app deal id (lib/dealStore) —
// permissionless means no PARTY gate, but the call still targets a specific deal.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = readActor(body);

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const store = getStore();
  const deal = getDeal(store, appDealId);
  if (!deal?.onChainDealId) return NextResponse.json({ error: "No deal." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const seller = walletFor("seller", dep);

  const hash = await seller.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "release",
    args: [deal.onChainDealId],
  });
  await pc.waitForTransactionReceipt({ hash });
  appendAudit(deal, {
    actor: "anyone",
    action: "Release executed (permissionless)",
    detail: "State: ReleasePending → Released — escrow paid the seller",
    txHash: hash,
    accountId: actor?.accountId,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, txHash: hash });
}
