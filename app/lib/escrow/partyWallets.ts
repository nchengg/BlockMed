import "server-only";
// Resolving a deal's parties to the addresses that go on-chain.
//
// WHY THIS EXISTS: the Escrow contract records a buyer and a seller per deal and
// checks msg.sender against them (deposit is buyer-only). So whatever address is
// recorded at createDeal is the ONLY address that can later fund the deal. If we
// register the shared dev wallet, the buyer's own MetaMask signature is rejected
// by the contract — correctly, since it is not the recorded buyer.
//
// Registering real linked addresses is therefore a precondition for user-signed
// deposits, not a separate nicety.
import { prisma } from "@/lib/db";
import type { DealRecord } from "./store";
import type { Deployment } from "./chain";

export type PartyAddresses = {
  buyer: `0x${string}`;
  seller: `0x${string}`;
  /** True when both sides signed for their own address (rather than dev keys). */
  real: boolean;
};

export type PartyResolution =
  | { ok: true; addresses: PartyAddresses }
  | { ok: false; error: string; unlinked: ("buyer" | "seller")[] };

/**
 * Work out which addresses to record for a deal.
 *
 * Both parties must have linked a wallet. We deliberately do NOT silently fall
 * back to the dev wallets when one side hasn't: that would produce a deal which
 * looks funded-by-the-company but is actually funded by a shared key, and the
 * party who did link would find their own deposit rejected with no explanation.
 * Failing here, with the names of who still needs to link, is far kinder.
 */
export async function resolvePartyAddresses(
  deal: DealRecord,
  dep: Deployment,
): Promise<PartyResolution> {
  const buyerId = deal.parties.buyer?.accountId;
  const sellerId = deal.parties.seller?.accountId;

  // A deal whose counterparty was never a real account (invited by name only)
  // cannot use real wallets — fall back to dev keys on the local chain so the
  // existing demo flow keeps working.
  if (!buyerId || !sellerId) {
    return {
      ok: true,
      addresses: {
        buyer: dep.accounts.buyer as `0x${string}`,
        seller: dep.accounts.seller as `0x${string}`,
        real: false,
      },
    };
  }

  const accounts = await prisma.account.findMany({
    where: { id: { in: [buyerId, sellerId] } },
    select: { id: true, companyName: true, walletAddress: true },
  });
  const buyer = accounts.find(a => a.id === buyerId);
  const seller = accounts.find(a => a.id === sellerId);

  const unlinked: ("buyer" | "seller")[] = [];
  if (!buyer?.walletAddress) unlinked.push("buyer");
  if (!seller?.walletAddress) unlinked.push("seller");

  if (unlinked.length > 0) {
    const who = unlinked
      .map(r => `${r === "buyer" ? buyer?.companyName ?? "the buyer" : seller?.companyName ?? "the seller"} (${r})`)
      .join(" and ");
    return {
      ok: false,
      unlinked,
      error:
        `${who} must link a wallet before this deal can go on-chain. ` +
        `The escrow records each party's address and only that address can fund or be paid.`,
    };
  }

  return {
    ok: true,
    addresses: {
      buyer: buyer!.walletAddress as `0x${string}`,
      seller: seller!.walletAddress as `0x${string}`,
      real: true,
    },
  };
}

/**
 * The address a given account must sign from for a deal, or null if the deal
 * predates wallet linking. Used to check the connected wallet is the right one
 * BEFORE asking it to sign — a mismatch fails on-chain with a bare revert.
 */
export async function expectedSignerFor(
  deal: DealRecord,
  role: "buyer" | "seller",
): Promise<string | null> {
  const accountId = deal.parties[role]?.accountId;
  if (!accountId) return null;
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { walletAddress: true },
  });
  return account?.walletAddress ?? null;
}
