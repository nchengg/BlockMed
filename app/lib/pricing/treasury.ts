import "server-only";
// Where platform fees are sent.
//
// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER — this currently points at a TEAM MEMBER'S PERSONAL WALLET, set
// via FEE_TREASURY_ADDRESS. That is acceptable for a testnet demo, where the
// tokens are worthless, and it is NOT acceptable for anything with real value:
// a customer paying platform fees would be paying an individual rather than
// Blockmediary. Before mainnet this must become an address the company controls,
// which is a team decision and not a config default.
// ─────────────────────────────────────────────────────────────────────────────
//
// The fee transfer is deliberately SEPARATE from the escrow. It never touches
// the escrow balance, so the contract's invariant holds untouched: release pays
// the recorded seller the recorded amount, and refund returns it. Fees are the
// buyer's second transfer, to a different address, and a failure to pay them
// cannot strand or reduce the trade amount.
import { isAddress, getAddress } from "viem";

export type TreasuryConfig =
  | { ok: true; address: `0x${string}`; isPlaceholder: boolean }
  | { ok: false; reason: string };

/**
 * Read and validate the treasury address.
 *
 * Returns a result rather than throwing: fee collection being unconfigured is a
 * normal state (quotes still work, they just are not collected on-chain), not
 * an error that should take down a deal.
 */
export function treasury(): TreasuryConfig {
  const raw = process.env.FEE_TREASURY_ADDRESS?.trim();
  if (!raw) {
    return { ok: false, reason: "FEE_TREASURY_ADDRESS is not set — fees are quoted but not collected." };
  }
  if (!isAddress(raw)) {
    return { ok: false, reason: `FEE_TREASURY_ADDRESS is not a valid address: ${raw}` };
  }
  return {
    ok: true,
    address: getAddress(raw),
    // Surfaced in the UI so a demo never silently implies a company treasury.
    isPlaceholder: process.env.FEE_TREASURY_IS_PLACEHOLDER !== "0",
  };
}

/** Whether on-chain fee collection is switched on at all. */
export function feeCollectionEnabled(): boolean {
  return process.env.COLLECT_FEES_ONCHAIN === "1" && treasury().ok;
}
