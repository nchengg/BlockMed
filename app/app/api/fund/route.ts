import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi, usdcAbi } from "@/lib/chain";
import { getStore, saveStore, appendAudit } from "@/lib/store";

// Step 3 — BUYER locks the funds: exact-amount USDC approve, then deposit.
// Agreed → Funded. Two real transactions, signed by the buyer account.
export async function POST() {
  const store = getStore();
  if (!store.dealId || !store.terms) {
    return NextResponse.json({ error: "No agreed deal to fund." }, { status: 409 });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const buyer = walletFor("buyer", dep);
  const amountMinor = parseUnits(store.terms.amountUsdc, 6);

  const approveHash = await buyer.writeContract({
    address: dep.usdc,
    abi: usdcAbi,
    functionName: "approve",
    args: [dep.escrow, amountMinor], // exact amount, never unlimited (threat model: allowance hygiene)
  });
  await pc.waitForTransactionReceipt({ hash: approveHash });
  appendAudit(store, {
    actor: "buyer",
    action: "Approved USDC spend (exact amount)",
    detail: `${store.terms.amountUsdc} USDC`,
    txHash: approveHash,
  });

  const depositHash = await buyer.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "deposit",
    args: [store.dealId],
  });
  await pc.waitForTransactionReceipt({ hash: depositHash });
  appendAudit(store, {
    actor: "buyer",
    action: "Deposited into escrow",
    detail: "State: Agreed → Funded — funds are now locked",
    txHash: depositHash,
  });

  saveStore(store);
  return NextResponse.json({ ok: true, approveHash, depositHash });
}
