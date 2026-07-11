import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/escrow/chain";
import { getStore, saveStore, appendAudit } from "@/lib/escrow/store";
import { readActor } from "@/lib/escrow/actor";

// Step 5 — Release. Deliberately signed by the SELLER key here to demonstrate that
// release is PERMISSIONLESS: once ReleasePending, anyone can trigger settlement, so
// there is intentionally NO party gate on this route. The actor is recorded only for
// the audit trail.
export async function POST(req: Request) {
  const actor = readActor(await req.json().catch(() => ({})));

  const store = getStore();
  if (!store.dealId) return NextResponse.json({ error: "No deal." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const seller = walletFor("seller", dep);

  const hash = await seller.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "release",
    args: [store.dealId],
  });
  await pc.waitForTransactionReceipt({ hash });
  appendAudit(store, {
    actor: "anyone",
    action: "Release executed (permissionless)",
    detail: "State: ReleasePending → Released — escrow paid the seller",
    txHash: hash,
    accountId: actor?.accountId,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, txHash: hash });
}
