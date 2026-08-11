import { NextResponse } from "next/server";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import { CHAIN_LABELS, loadDeployment, publicClient, escrowAbi, usdcAbi } from "@/lib/escrow/chain";
import { getDeal, readDealId } from "@/lib/escrow/store";
import { readActor, requireAuth } from "@/lib/escrow/actor";
import { roleInDeal } from "@/lib/escrow/roles";
import { expectedSignerFor } from "@/lib/escrow/partyWallets";
import { platformFeesTotal, toMinor } from "@/lib/pricing/quote";
import { feeCollectionEnabled, treasury } from "@/lib/pricing/treasury";

// Prepare the two transactions the BUYER signs in their own wallet.
//
// The server does not sign here and holds no key for the buyer — that is the
// entire point. It builds the calldata, states what the transactions will do,
// and the browser hands them to MetaMask. Only the user's own wallet can turn
// them into transactions.
//
// Two transactions, not one, because ERC-20 requires it: approve() lets the
// escrow move exactly this amount, deposit() then moves it. The approval is for
// the exact amount rather than unlimited — allowance hygiene, since an unlimited
// approval outlives the deal.
//
// Authorisation still happens server-side (session → role on this deal). A
// caller who is not the buyer gets nothing to sign.
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

  const viewerRole = roleInDeal(deal, actor?.accountId);
  if (viewerRole !== "buyer") {
    return NextResponse.json(
      { error: "Only the buyer funds the escrow on this deal." },
      { status: 403 },
    );
  }

  const expected = await expectedSignerFor(deal, "buyer");
  if (!expected) {
    return NextResponse.json(
      { error: "Link a wallet before funding — the escrow needs an address to accept funds from." },
      { status: 409 },
    );
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const amountMinor = parseUnits(deal.terms.amountUsdc, 6);

  // Platform fees are a SEPARATE transfer to the treasury — never a slice of the
  // escrow. The contract pays the recorded seller the recorded amount, and
  // nothing here may quietly reduce that (lib/pricing/quote.ts).
  const t = treasury();
  const collectFees = feeCollectionEnabled() && !!deal.quote;
  const feeMinor = collectFees ? (toMinor(platformFeesTotal(deal.quote!)) ?? 0n) : 0n;
  const requiredMinor = amountMinor + feeMinor;

  // Same pre-flight as the server-signed path: a shortfall is predictable, and
  // saying so beats letting MetaMask show a failing transaction.
  const held = (await pc.readContract({
    address: dep.usdc,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: [expected as `0x${string}`],
  })) as bigint;

  if (held < requiredMinor) {
    return NextResponse.json(
      {
        error:
          `Not enough USDC in your wallet. This deal needs ${formatUnits(requiredMinor, 6)} USDC ` +
          (feeMinor > 0n ? `(${deal.terms.amountUsdc} escrow + ${formatUnits(feeMinor, 6)} platform fees) ` : "") +
          `but ${expected} holds ${formatUnits(held, 6)}.`,
        needed: formatUnits(requiredMinor, 6),
        held: formatUnits(held, 6),
      },
      { status: 409 },
    );
  }

  // An existing allowance from an earlier attempt can be reused — skipping a
  // redundant approve saves the user a wallet popup and a gas fee.
  const allowance = (await pc.readContract({
    address: dep.usdc,
    abi: usdcAbi,
    functionName: "allowance",
    args: [expected as `0x${string}`, dep.escrow],
  })) as bigint;

  const steps: {
    kind: "approve" | "deposit" | "fee";
    to: string;
    data: string;
    label: string;
  }[] = [];

  if (allowance < amountMinor) {
    steps.push({
      kind: "approve",
      to: dep.usdc,
      data: encodeFunctionData({
        abi: usdcAbi,
        functionName: "approve",
        args: [dep.escrow, amountMinor],
      }),
      label: `Allow the escrow to move ${deal.terms.amountUsdc} USDC`,
    });
  }

  steps.push({
    kind: "deposit",
    to: dep.escrow,
    data: encodeFunctionData({
      abi: escrowAbi,
      functionName: "deposit",
      args: [deal.onChainDealId as `0x${string}`],
    }),
    label: `Lock ${deal.terms.amountUsdc} USDC in escrow`,
  });

  // Fee transfer LAST: the escrow deposit is the transaction that matters, and
  // ordering it first means a failed fee payment leaves a funded deal rather
  // than a paid fee with no escrow behind it.
  if (collectFees && feeMinor > 0n && t.ok) {
    steps.push({
      kind: "fee",
      to: dep.usdc,
      data: encodeFunctionData({
        abi: usdcAbi,
        functionName: "transfer",
        args: [t.address, feeMinor],
      }),
      label: `Pay ${formatUnits(feeMinor, 6)} USDC platform fees`,
    });
  }

  return NextResponse.json({
    ok: true,
    from: expected,
    quote: deal.quote ?? null,
    feesUsdc: formatUnits(feeMinor, 6),
    totalUsdc: formatUnits(requiredMinor, 6),
    feeRecipient: collectFees && t.ok ? t.address : null,
    feeRecipientIsPlaceholder: t.ok ? t.isPlaceholder : null,
    chainId: dep.chainId,
    // The wallet may need to switch (or add) this network. Send the real RPC
    // and name rather than letting the client assume localhost.
    rpcUrl: dep.rpcUrl,
    chainLabel: CHAIN_LABELS[dep.chainId] ?? `Chain ${dep.chainId}`,
    amountUsdc: deal.terms.amountUsdc,
    steps,
  });
}
