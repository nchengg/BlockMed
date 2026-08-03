import { NextResponse } from "next/server";
import { getAllDeals } from "@/lib/escrow/store";
import { roleInDeal } from "@/lib/escrow/roles";
import { chainReader, toDealView } from "@/lib/escrow/dealView";

export const dynamic = "force-dynamic";

// Lists the deals the viewer is a party to, each with THEIR role on that deal
// (derived from the deal's recorded parties — never from an account type).
// A single account can appear as buyer on one row and seller on the next.
//
// TODO(integration: auth Q18) — accountId is a query param, not a verified
// identity; the filtering is demo-honest, not a security boundary.
export async function GET(req: Request) {
  const accountId = new URL(req.url).searchParams.get("accountId") ?? undefined;

  // Chain reads are best-effort: the list still renders with no local chain.
  const { readState, chainId } = chainReader();

  const mine = (await getAllDeals()).filter((d) => roleInDeal(d, accountId) !== null);
  const deals = await Promise.all(mine.map((d) => toDealView(d, accountId, readState)));

  // Newest first.
  deals.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ ok: true, chainId, deals });
}
