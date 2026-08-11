import { NextResponse } from "next/server";
import { formatUnits, parseUnits } from "viem";
import { CHAIN_LABELS, loadDeployment, networkName, publicClient, usdcAbi, escrowAbi, STATE_NAMES } from "@/lib/escrow/chain";
import { getAllDeals } from "@/lib/escrow/store";
import { roleInDeal, pendingOnRole } from "@/lib/escrow/roles";

export const dynamic = "force-dynamic";

// Dashboard summary for ONE account, computed from the deals that account is a
// party to. Money figures are derived per deal (each deal's own amount, summed by
// state) rather than read off a wallet: in this demo every buyer shares one dev
// wallet and every seller another, so a raw wallet balance would be the whole
// chain's, not this company's. The wallet balance is still returned, clearly
// labelled as the shared demo wallet.
//
// TODO(integration: auth Q18) — accountId is a query param, not a verified
// identity; demo-honest, not a security boundary.
export async function GET(req: Request) {
  const accountId = new URL(req.url).searchParams.get("accountId") ?? undefined;

  let readState: ((id: string) => Promise<string | null>) | null = null;
  let demoWallets: { buyer: string; seller: string } | null = null;
  let escrowTotal: string | null = null;
  let chainOk = true;
  // Which chain these figures came from, so the UI can name it rather than
  // assuming localhost.
  let network: {
    name: string; chainId: number; label: string;
    explorer: string | null; escrow: string; realToken: boolean;
  } | null = null;

  try {
    const dep = loadDeployment();
    const pc = publicClient(dep);
    readState = async (id: string) => {
      const s = (await pc.readContract({
        address: dep.escrow, abi: escrowAbi, functionName: "state", args: [id],
      })) as number;
      return STATE_NAMES[s] ?? null;
    };

    // The chain is "ok" if the escrow itself is readable. Nothing below this
    // point may flip that: a public deployment has no demo wallets, and their
    // absence is not a connectivity failure. (It previously was — the reads for
    // dep.accounts.buyer/seller threw on undefined and the shared catch reported
    // the chain as down, on a chain that was working perfectly.)
    const escrowBal = (await pc.readContract({
      address: dep.usdc, abi: usdcAbi, functionName: "balanceOf", args: [dep.escrow],
    })) as bigint;
    escrowTotal = formatUnits(escrowBal, 6);

    network = {
      name: networkName(),
      chainId: dep.chainId,
      label: CHAIN_LABELS[dep.chainId] ?? `Chain ${dep.chainId}`,
      explorer: dep.chainId === 84532 ? "https://sepolia.basescan.org" : null,
      escrow: dep.escrow,
      realToken: dep.realToken === true,
    };

    // Shared demo wallets exist only on the local chain, where every buyer signs
    // from one address and every seller from another. On a public deployment the
    // parties use their own linked wallets, so there is nothing to report.
    if (dep.accounts.buyer && dep.accounts.seller) {
      const [buyerBal, sellerBal] = await Promise.all([
        pc.readContract({ address: dep.usdc, abi: usdcAbi, functionName: "balanceOf", args: [dep.accounts.buyer] }) as Promise<bigint>,
        pc.readContract({ address: dep.usdc, abi: usdcAbi, functionName: "balanceOf", args: [dep.accounts.seller] }) as Promise<bigint>,
      ]);
      demoWallets = { buyer: formatUnits(buyerBal, 6), seller: formatUnits(sellerBal, 6) };
    }
  } catch {
    chainOk = false;
  }

  const mine = (await getAllDeals()).filter((d) => roleInDeal(d, accountId) !== null);

  let lockedMinor = 0n;   // this account's money currently held by the contract
  let releasedMinor = 0n; // value settled to/from this account
  let awaitingMinor = 0n; // agreed but not yet funded
  let asBuyer = 0;
  let asSeller = 0;
  let needsYou = 0;
  let active = 0;
  let settled = 0;

  for (const d of mine) {
    const role = roleInDeal(d, accountId);
    if (role === "buyer") asBuyer += 1;
    else if (role === "seller") asSeller += 1;

    const amount = d.terms?.amountUsdc ? parseUnits(d.terms.amountUsdc, 6) : 0n;
    let state: string | null = null;
    if (d.onChainDealId && readState) {
      try { state = await readState(d.onChainDealId); } catch { state = null; }
    }

    if (d.declinedAt) continue;

    if (state === "Funded" || state === "ReleasePending") {
      lockedMinor += amount;
      active += 1;
    } else if (state === "Released") {
      releasedMinor += amount;
      settled += 1;
    } else if (state === "Agreed") {
      awaitingMinor += amount;
      active += 1;
    } else if (!state) {
      active += 1; // proposed, not yet on-chain
    }

    // Does this account owe an action right now?
    const reviewOpen = d.review && !d.review.approvedAt;
    if (!state && pendingOnRole(d) === role) needsYou += 1;
    else if (state === "Agreed" && role === "buyer") needsYou += 1;
    else if (state === "Funded" && role === "seller" && (!d.review || d.review.objection)) needsYou += 1;
    else if (state === "Funded" && role === "buyer" && reviewOpen && !d.review?.objection) needsYou += 1;
    else if (state === "ReleasePending") needsYou += 1;
  }

  return NextResponse.json({
    ok: true,
    chainOk,
    network,
    money: {
      locked: formatUnits(lockedMinor, 6),
      awaitingFunding: formatUnits(awaitingMinor, 6),
      released: formatUnits(releasedMinor, 6),
      escrowTotalAllAccounts: escrowTotal,
      demoWallets,
    },
    counts: {
      total: mine.length,
      active,
      settled,
      asBuyer,
      asSeller,
      needsYou,
    },
  });
}
