import { NextResponse } from "next/server";
import { formatUnits, parseUnits } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi, usdcAbi } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { readActor, requireHat, requireAuth } from "@/lib/escrow/actor";
import { roleInDeal } from "@/lib/escrow/roles";

// Step 3 — BUYER locks the funds: exact-amount USDC approve, then deposit.
// Agreed → Funded. Two real transactions, signed by the buyer account.
// #27 adaptation: gated to the buyer hat (deposit is a buyer action).
// Reconciliation: scoped to the caller's active app deal id (lib/dealStore) — the
// deposit hits THAT deal's on-chain id, not one shared global deal.
//
// Role source (Dan's Dashboard): when the caller is a recorded party on this deal,
// authorisation comes from their position IN THE DEAL (roles.ts) rather than an
// account hat — an account is neither buyer nor seller, only a party per deal.
// The hat check remains the fallback for callers with no recorded party (the main
// dashboard's flow), so both surfaces keep working.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });
  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId || !deal.terms) {
    return NextResponse.json({ error: "No agreed deal to fund." }, { status: 409 });
  }

  // Depositing is the buyer's action. Prefer the caller's recorded role on THIS
  // deal; fall back to the hat check when they aren't a recorded party.
  const viewerRole = roleInDeal(deal, actor?.accountId);
  if (viewerRole) {
    if (viewerRole !== "buyer") {
      return NextResponse.json(
        { error: "You are the seller on this deal — the buyer funds the escrow." },
        { status: 403 },
      );
    }
  } else {
    const denied = requireHat(actor, "buyer");
    if (denied) return denied;
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // The server holds no buyer key outside the local demo — the buyer's money is
  // moved by the buyer's own wallet (fund/prepare + fund/confirm). Refusing here
  // is deliberate: a "convenient" server-side fallback would mean the platform
  // signing a spend of someone else's funds.
  if (dep.chainId !== 31337) {
    return NextResponse.json(
      {
        error:
          "Funding must be signed in your own wallet on this network. " +
          "Link a wallet and use the deal's Fund action.",
        needsWallet: true,
      },
      { status: 409 },
    );
  }

  const buyer = walletFor("buyer", dep);
  const amountMinor = parseUnits(deal.terms.amountUsdc, 6);

  // Pre-flight: check the balance BEFORE sending anything. Without this, a deal
  // priced above the wallet's holdings still fires the approve, then reverts on
  // deposit with a raw ERC20InsufficientBalance selector — which reaches the UI
  // as an unexplained "request failed". A shortfall is predictable and worth
  // saying out loud, and checking first also avoids leaving a stray allowance
  // behind from an approve that was never going to be used.
  const held = (await pc.readContract({
    address: dep.usdc,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: [buyer.account.address],
  })) as bigint;

  if (held < amountMinor) {
    return NextResponse.json(
      {
        error:
          `Not enough USDC to fund this deal. It needs ${deal.terms.amountUsdc} USDC ` +
          `but the buyer wallet holds ${formatUnits(held, 6)}.`,
        needed: deal.terms.amountUsdc,
        held: formatUnits(held, 6),
      },
      { status: 409 },
    );
  }

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

  await saveDeal(deal);
  return NextResponse.json({ ok: true, approveHash, depositHash });
}
