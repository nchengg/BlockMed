// ROLE DERIVATION — buyer/seller is a position IN A DEAL, not a property of an
// account (a real trading company buys on Monday and sells on Tuesday).
//
// The contract already models it this way: createDeal(dealId, buyer, seller, ...)
// records the two parties per deal. This module is the off-chain mirror: given a
// deal record and who is looking at it, say which side they are on. Nothing here
// reads an account "type" or "hat" — those don't exist on this surface.
//
// Demo caveat: the local chain signs with fixed dev wallets (every buyer shares one
// address, every seller another), so identity is matched on ACCOUNT ID, which the
// deal record already stores per party. When real wallets land, this upgrades to
// comparing the connected address against the deal's recorded buyer/seller.
import type { DealRecord } from "./store";

export type DealRole = "buyer" | "seller";
/** What a given viewer is on a given deal — or null if they aren't a party to it. */
export type ViewerRole = DealRole | null;

export function roleInDeal(deal: Pick<DealRecord, "parties">, accountId: string | undefined): ViewerRole {
  if (!accountId) return null;
  if (deal.parties.buyer?.accountId === accountId) return "buyer";
  if (deal.parties.seller?.accountId === accountId) return "seller";
  return null;
}

/** Human label for the viewer's side, e.g. for a deal list row. */
export function roleLabel(role: ViewerRole): string {
  if (role === "buyer") return "You are the buyer";
  if (role === "seller") return "You are the seller";
  return "Not a party";
}

/** The other side of a deal from the viewer's perspective. */
export function counterpartyOf(deal: Pick<DealRecord, "parties">, role: ViewerRole): string {
  if (role === "buyer") return deal.parties.seller?.displayName ?? "—";
  if (role === "seller") return deal.parties.buyer?.displayName ?? "—";
  return "—";
}

/**
 * A freshly created deal is PENDING the counterparty's acceptance: the creator
 * proposed it, the other side has not agreed yet. Once agreement puts the deal
 * on-chain, the chain's own state takes over and this no longer applies.
 */
export function pendingOnRole(deal: Pick<DealRecord, "createdByRole">): DealRole | null {
  if (!deal.createdByRole) return null;
  return deal.createdByRole === "buyer" ? "seller" : "buyer";
}

/**
 * Status label for a not-yet-on-chain deal, written from the VIEWER's side:
 * the party who must act sees "Awaiting your acceptance", the proposer sees
 * "Pending <counterparty>".
 */
export function pendingLabel(
  deal: Pick<DealRecord, "createdByRole" | "parties">,
  viewerRole: ViewerRole,
): string {
  const waitingOn = pendingOnRole(deal);
  if (!waitingOn) return "Draft";
  if (viewerRole && waitingOn === viewerRole) return "Awaiting your acceptance";
  const them = counterpartyOf(deal, viewerRole);
  return them === "—" ? "Pending acceptance" : `Pending ${them}`;
}
