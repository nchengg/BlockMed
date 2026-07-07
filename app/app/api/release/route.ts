import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/chain";
import { getStore, saveStore, appendAudit } from "@/lib/store";

// Step 5 — Release. Deliberately signed by the SELLER here to demonstrate that
// release is permissionless: once ReleasePending, anyone can trigger settlement.
export async function POST() {
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
  });
  saveStore(store);
  return NextResponse.json({ ok: true, txHash: hash });
}
