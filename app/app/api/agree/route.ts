import { NextResponse } from "next/server";
import { keccak256, parseUnits, toHex } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/chain";
import { getStore, saveStore, appendAudit } from "@/lib/store";

// Step 2 — BUYER agrees to the proposal; the platform (releaser key) registers the
// deal on-chain: createDeal → Draft→Agreed. (TRD: createDeal is RELEASER_ROLE-gated.)
export async function POST() {
  const store = getStore();
  if (!store.terms) return NextResponse.json({ error: "No proposal to agree to." }, { status: 409 });
  if (store.dealId) return NextResponse.json({ error: "Deal already created." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const releaser = walletFor("releaser", dep);

  const dealId = keccak256(toHex(`demo-deal-${store.dealCounter + 1}`));
  const amountMinor = parseUnits(store.terms.amountUsdc, 6);

  appendAudit(store, { actor: "buyer", action: "Agreed to proposed terms" });

  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "createDeal",
    args: [dealId, dep.accounts.buyer, dep.accounts.seller, amountMinor],
  });
  await pc.waitForTransactionReceipt({ hash });

  store.dealCounter += 1;
  store.dealId = dealId;
  appendAudit(store, {
    actor: "platform",
    action: "Deal registered on-chain (createDeal)",
    detail: "State: Draft → Agreed",
    txHash: hash,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, dealId, txHash: hash });
}
