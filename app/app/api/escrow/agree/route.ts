import { NextResponse } from "next/server";
import { keccak256, parseUnits, toHex } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/escrow/chain";
import { getStore, saveStore, appendAudit } from "@/lib/escrow/store";
import { readActor, requireHat, partyRef } from "@/lib/escrow/actor";

// Step 2 — BUYER agrees to the proposal; the platform (releaser key) registers the
// deal on-chain: createDeal → Draft→Agreed. (TRD: createDeal is RELEASER_ROLE-gated.)
// #27 adaptation: gated to the buyer hat; the buyer account is recorded.
export async function POST(req: Request) {
  const actor = readActor(await req.json().catch(() => ({})));
  const denied = requireHat(actor, "buyer");
  if (denied) return denied;

  const store = getStore();
  if (!store.terms) return NextResponse.json({ error: "No proposal to agree to." }, { status: 409 });
  if (store.dealId) return NextResponse.json({ error: "Deal already created." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const releaser = walletFor("releaser", dep);

  const dealId = keccak256(toHex(`demo-deal-${store.dealCounter + 1}`));
  const amountMinor = parseUnits(store.terms.amountUsdc, 6);

  store.parties.buyer = partyRef(actor, "buyer");
  appendAudit(store, { actor: "buyer", action: "Agreed to proposed terms", accountId: actor?.accountId });

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
