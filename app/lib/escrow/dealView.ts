// Server-side: shape a stored deal into the view the client renders, from a
// given viewer's perspective. Shared by the list route (/api/escrow/deals) and
// the single-deal route (/api/escrow/deals/[dealId]) so both surfaces agree on
// what a deal "is" — role, status label, and who owes an action.
import { loadDeployment, publicClient, escrowAbi, STATE_NAMES } from "./chain";
import type { DealRecord } from "./store";
import { roleInDeal, counterpartyOf, pendingLabel, pendingOnRole } from "./roles";

/** Reads on-chain state per deal; null when no chain is reachable. */
export type StateReader = ((onChainDealId: string) => Promise<string | null>) | null;

export function chainReader(): { readState: StateReader; chainId: number | null } {
  try {
    const dep = loadDeployment();
    const pc = publicClient(dep);
    return {
      chainId: dep.chainId,
      readState: async (id: string) => {
        const s = (await pc.readContract({
          address: dep.escrow, abi: escrowAbi, functionName: "state", args: [id],
        })) as number;
        return STATE_NAMES[s] ?? null;
      },
    };
  } catch {
    return { readState: null, chainId: null };
  }
}

export async function toDealView(d: DealRecord, accountId: string | undefined, readState: StateReader) {
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
  // acceptance; the label is written from this viewer's side. A declined
  // proposal is terminal and never awaits anyone.
  const declined = !!d.declinedAt;

  return {
    dealId: d.appDealId,
    onChainDealId: d.onChainDealId,
    role,
    counterparty: counterpartyOf(d, role),
    terms: d.terms,
    state: state ?? (declined ? "Declined" : d.terms ? pendingLabel(d, role) : null),
    // Notice-of-release review (FR-10/11) — drives the approve/object panel.
    review: d.review ?? null,
    // Full history: who did what, when, and the on-chain proof (FR-14).
    audit: d.audit,
    // True when THIS viewer is the one who must accept — drives the call to action.
    awaitingViewer: !state && !declined && !!d.terms && pendingOnRole(d) === role,
    createdAt: d.audit[0]?.ts ?? null,
  };
}
