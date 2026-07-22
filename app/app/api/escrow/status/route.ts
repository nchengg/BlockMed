import { NextResponse } from "next/server";
import { formatUnits } from "viem";
import { loadDeployment, publicClient, usdcAbi, escrowAbi, STATE_NAMES } from "@/lib/escrow/chain";
import { getStore, getDeal } from "@/lib/escrow/store";

export const dynamic = "force-dynamic";

// Read-only snapshot of the live chain + off-chain store. No party gate (read).
// Reconciliation: scoped to ?dealId= (the caller's active app deal id) — the deal
// fields (on-chain id, terms, parties, state, audit) come from THAT deal's record.
// The USDC balances are per-address and chain-global, so they stay as-is.
export async function GET(req: Request) {
  try {
    const dep = loadDeployment();
    const pc = publicClient(dep);
    const store = getStore();

    const appDealId = new URL(req.url).searchParams.get("dealId");
    const deal = appDealId ? getDeal(store, appDealId) : undefined;

    const balanceOf = (addr: string) =>
      pc.readContract({
        address: dep.usdc,
        abi: usdcAbi,
        functionName: "balanceOf",
        args: [addr],
      }) as Promise<bigint>;

    const [buyerBal, sellerBal, escrowBal] = await Promise.all([
      balanceOf(dep.accounts.buyer),
      balanceOf(dep.accounts.seller),
      balanceOf(dep.escrow),
    ]);

    let stateName: string | null = null;
    if (deal?.onChainDealId) {
      const s = (await pc.readContract({
        address: dep.escrow,
        abi: escrowAbi,
        functionName: "state",
        args: [deal.onChainDealId],
      })) as number;
      stateName = STATE_NAMES[s];
    }

    return NextResponse.json({
      ok: true,
      addresses: { escrow: dep.escrow, usdc: dep.usdc, ...dep.accounts },
      balances: {
        buyer: formatUnits(buyerBal, 6),
        seller: formatUnits(sellerBal, 6),
        escrow: formatUnits(escrowBal, 6),
      },
      dealId: deal?.onChainDealId ?? null,
      terms: deal?.terms ?? null,
      parties: deal?.parties ?? {},
      state: stateName,
      audit: deal?.audit ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Chain or deployment unavailable: ${(err as Error).message}` },
      { status: 503 },
    );
  }
}
