import { NextResponse } from "next/server";
import { getDeal } from "@/lib/escrow/store";
import { roleInDeal } from "@/lib/escrow/roles";
import { chainReader, toDealView } from "@/lib/escrow/dealView";

export const dynamic = "force-dynamic";

// One deal, shaped for the viewer — backs the deal page (/dashboard/deals/[dealId]).
// Same shape as a row from the list route (both use toDealView), so the page and
// the list can never disagree about what a deal is.
//
// TODO(integration: auth Q18) — accountId is a query param, not a verified
// identity. The 403 below keeps the demo honest; it is not a security boundary.
export async function GET(req: Request, ctx: { params: Promise<{ dealId: string }> }) {
  const { dealId } = await ctx.params;
  const accountId = new URL(req.url).searchParams.get("accountId") ?? undefined;
  const deal = await getDeal(dealId);
  if (!deal) return NextResponse.json({ ok: false, error: "Deal not found." }, { status: 404 });

  // Only a party to the deal may view it — the same isolation the list applies.
  if (accountId && !roleInDeal(deal, accountId)) {
    return NextResponse.json({ ok: false, error: "You are not a party to this deal." }, { status: 403 });
  }

  const { readState, chainId } = chainReader();
  return NextResponse.json({ ok: true, chainId, deal: await toDealView(deal, accountId, readState) });
}
