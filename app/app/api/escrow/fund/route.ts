import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi, usdcAbi } from "@/lib/escrow/chain";
import { getStore, saveStore, getDeal, appendAudit, readDealId } from "@/lib/escrow/store";
import { readActor, requireHat } from "@/lib/escrow/actor";

// Step 3 — BUYER locks the funds: exact-amount USDC approve, then deposit.
// Agreed → Funded. Two real transactions, signed by the buyer account.
// #27 adaptation: gated to the buyer hat (deposit is a buyer action).
// Reconciliation: scoped to the caller's active app deal id (lib/dealStore) — the
// deposit hits THAT deal's on-chain id, not one shared global deal.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = readActor(body);
  const denied = requireHat(actor, "buyer");
  if (denied) return denied;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const store = getStore();
  const deal = getDeal(store, appDealId);
  if (!deal?.onChainDealId || !deal.terms) {
    return NextResponse.json({ error: "No agreed deal to fund." }, { status: 409 });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const buyer = walletFor("buyer", dep);
  const amountMinor = parseUnits(deal.terms.amountUsdc, 6);

  const approveHash = await buyer.writeContract({
    address: dep.usdc,
    abi: usdcAbi,
    functionName: "approve",
    args: [dep.escrow, amountMinor], // exact amount, never unlimited (threat model: allowance hygiene)
  });
  await pc.waitForTransactionReceipt({ hash: approveHash });
  appendAudit(deal, {
    actor: "buyer",
    action: "Approved USDC spend (exact amount)",
    detail: `${deal.terms.amountUsdc} USDC`,
    txHash: approveHash,
    accountId: actor?.accountId,
  });

  const depositHash = await buyer.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "deposit",
    args: [deal.onChainDealId],
  });
  await pc.waitForTransactionReceipt({ hash: depositHash });
  appendAudit(deal, {
    actor: "buyer",
    action: "Deposited into escrow",
    detail: "State: Agreed → Funded — funds are now locked",
    txHash: depositHash,
    accountId: actor?.accountId,
  });

  saveStore(store);
  return NextResponse.json({ ok: true, approveHash, depositHash });
}
