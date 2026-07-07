import { NextResponse } from "next/server";
import { formatUnits } from "viem";
import { loadDeployment, publicClient, usdcAbi, escrowAbi, STATE_NAMES } from "@/lib/chain";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dep = loadDeployment();
    const pc = publicClient(dep);
    const store = getStore();

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
    if (store.dealId) {
      const s = (await pc.readContract({
        address: dep.escrow,
        abi: escrowAbi,
        functionName: "state",
        args: [store.dealId],
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
      dealId: store.dealId,
      terms: store.terms,
      state: stateName,
      audit: store.audit,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Chain or deployment unavailable: ${(err as Error).message}` },
      { status: 503 },
    );
  }
}
