// Server-side: shape a stored deal into the view the client renders, from a
// given viewer's perspective. Shared by the list route (/api/escrow/deals) and
// the single-deal route (/api/escrow/deals/[dealId]) so both surfaces agree on
// what a deal "is" — role, status label, and who owes an action.
import { loadDeployment, publicClient, escrowAbi, STATE_NAMES } from "./chain";
import type { DealRecord } from "./store";
import { roleInDeal, counterpartyOf, pendingLabel, pendingOnRole } from "./roles";

/** Reads on-chain state per deal; null when no chain is reachable. */
export type StateReader = ((onChainDealId: string) => Promise<string | null>) | null;

/**
 * Last known state per deal, with the time it was read.
 *
 * The dashboard polls every 4s from two components at once, and each poll reads
 * every deal's state — so a handful of deals is enough to exceed a public RPC's
 * rate limit within seconds. Measured against Base mainnet: 5 reads succeeded,
 * the next 7 in the same burst failed.
 *
 * Two jobs, and both matter:
 *   • Serve repeat reads inside the TTL from memory, so polling does not
 *     generate chain traffic proportional to deals × components × pollers.
 *   • Keep the last good value indefinitely, so a throttled read returns what
 *     the state WAS rather than nothing. Escrow states only move when someone
 *     sends a transaction, so a few seconds stale is honest; "unknown" is not.
 *
 * Module scope means this is per server process — fine for a cache whose worst
 * case is a slightly stale label, and it is dropped on restart.
 */
const stateCache = new Map<string, { value: string | null; at: number }>();
const STATE_TTL_MS = 3_000;

export function chainReader(): {
  readState: StateReader;
  chainId: number | null;
  /** The escrow contract address — lets the UI link the contract on an explorer. */
  escrow: string | null;
} {
  try {
    const dep = loadDeployment();
    const pc = publicClient(dep);
    return {
      chainId: dep.chainId,
      escrow: dep.escrow,
      readState: async (id: string) => {
        const hit = stateCache.get(id);
        if (hit && Date.now() - hit.at < STATE_TTL_MS) return hit.value;
        try {
          const s = (await pc.readContract({
            address: dep.escrow, abi: escrowAbi, functionName: "state", args: [id],
          })) as number;
          const value = STATE_NAMES[s] ?? null;
          stateCache.set(id, { value, at: Date.now() });
          return value;
        } catch (e) {
          // Serve the last good value rather than reporting failure. Without
          // this, a throttled poll makes an accepted deal look unaccepted.
          if (hit) return hit.value;
          throw e;
        }
      },
    };
  } catch {
    return { readState: null, chainId: null, escrow: null };
  }
}

export async function toDealView(d: DealRecord, accountId: string | undefined, readState: StateReader) {
  const role = roleInDeal(d, accountId);

  // Whether the chain read SUCCEEDED must be tracked separately from what it
  // returned. Collapsing both into `state = null` makes a rate-limited RPC look
  // identical to a deal that was never accepted — and since the dashboard polls
  // every 4s against a public endpoint that throttles, that produced a visible
  // flicker: the deal alternated between "Agreed" and "awaiting acceptance",
  // with the accept button appearing and vanishing between polls.
  let state: string | null = null;
  let stateUnavailable = false;
  if (d.onChainDealId && readState) {
    try {
      state = await readState(d.onChainDealId);
      if (state === null) stateUnavailable = true;
    } catch {
      stateUnavailable = true;
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
    // An unreachable chain must not be reported as a pending acceptance. The
    // presence of onChainDealId is itself proof the deal WAS accepted — it is
    // only ever set after createDeal succeeded — so fall back to the last thing
    // we know to be true rather than to a state the deal has already left.
    state: state ??
      (declined
        ? "Declined"
        : stateUnavailable && d.onChainDealId
          ? "On-chain"
          : d.terms
            ? pendingLabel(d, role)
            : null),
    // Notice-of-release review (FR-10/11) — drives the approve/object panel.
    review: d.review ?? null,
    // Full history: who did what, when, and the on-chain proof (FR-14).
    audit: d.audit,
    // True when THIS viewer is the one who must accept — drives the call to action.
    // Drives the accept call-to-action, so it must be FALSE whenever the deal is
    // already on-chain — including when we could not read its state. Offering
    // "accept" for an accepted deal is worse than offering nothing: the action
    // would revert on-chain (createDeal rejects a duplicate dealId).
    awaitingViewer:
      !state && !declined && !d.onChainDealId && !!d.terms && pendingOnRole(d) === role,
    /** True when the chain could not be reached — the UI can say so rather than
     *  silently showing a stale or guessed state. */
    stateUnavailable,
    createdAt: d.audit[0]?.ts ?? null,
  };
}
