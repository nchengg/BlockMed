import { NextResponse } from "next/server";
import { loadDeployment, publicClient, escrowAbi, STATE_NAMES } from "@/lib/escrow/chain";
import { getStore } from "@/lib/escrow/store";
import { roleInDeal, counterpartyOf, pendingLabel, pendingOnRole } from "@/lib/escrow/roles";

export const dynamic = "force-dynamic";

// Lists the deals the viewer is a party to, each with THEIR role on that deal
// (derived from the deal's recorded parties — never from an account type).
// A single account can appear as buyer on one row and seller on the next.
//
// TODO(integration: auth Q18) — accountId is a query param, not a verified
// identity; the filtering is demo-honest, not a security boundary.
export async function GET(req: Request) {
  const accountId = new URL(req.url).searchParams.get("accountId") ?? undefined;
  const store = getStore();

  // Chain reads are best-effort: the list still renders with no local chain.
  let readState: ((onChainDealId: string) => Promise<string | null>) | null = null;
  try {
    const dep = loadDeployment();
    const pc = publicClient(dep);
    readState = async (onChainDealId: string) => {
      const s = (await pc.readContract({
        address: dep.escrow,
        abi: escrowAbi,
        functionName: "state",
        args: [onChainDealId],
      })) as number;
      return STATE_NAMES[s] ?? null;
    };
  } catch {
    readState = null;
  }

  const mine = Object.values(store.deals).filter((d) => roleInDeal(d, accountId) !== null);

  const deals = await Promise.all(
    mine.map(async (d) => {
      const role = roleInDeal(d, accountId);
      let state: string | null = null;
      if (d.onChainDealId && readState) {
        try {
          state = await readState(d.onChainDealId);
        } catch {
          state = null;
        }
      }
      // Before the deal reaches the chain it is pending the counterparty's
      // acceptance; the label is written from this viewer's side.
      const awaitingViewer = !state && !!d.terms && pendingOnRole(d) === role;
      return {
        dealId: d.appDealId,
        onChainDealId: d.onChainDealId,
        role,
        counterparty: counterpartyOf(d, role),
        terms: d.terms,
        state: state ?? (d.terms ? pendingLabel(d, role) : null),
        // True when THIS viewer is the one who must accept — drives the call to action.
        awaitingViewer,
        createdAt: d.audit[0]?.ts ?? null,
      };
    }),
  );

  // Newest first.
  deals.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ ok: true, deals });
}
