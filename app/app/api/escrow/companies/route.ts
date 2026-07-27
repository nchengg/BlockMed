import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The trading companies a deal can be addressed to. These mirror the seeded
// client accounts in lib/authStore.tsx, so every counterparty you can pick is
// an account that can actually SIGN IN and act on the deal — which is what
// makes the two-sided flow testable (be Solaris in one window, Meridian in
// another).
//
// Deliberately no buyer/seller split: an account is neither. The role is chosen
// per deal at creation (lib/escrow/roles.ts).
//
// TODO(integration) — this is a static mirror of the auth seed. Real accounts
// come from the user directory once server auth lands (Q18), and the invite
// path (counterparty not yet on the platform) is the full product's FR-1 flow.
export const TRADING_COMPANIES = [
  { accountId: "acc-buyer", displayName: "Meridian Imports Ltd.", email: "buyer@meridian.demo" },
  { accountId: "acc-seller", displayName: "Solaris Textiles Co.", email: "seller@solaris.demo" },
  { accountId: "acc-both", displayName: "BridgeTrade Co.", email: "trader@bridgetrade.demo" },
  { accountId: "acc-platform", displayName: "TradeBridge Platform", email: "ops@tradebridge.demo" },
] as const;

export async function GET(req: Request) {
  // Exclude the caller — you cannot be your own counterparty.
  const exclude = new URL(req.url).searchParams.get("exclude");
  const companies = TRADING_COMPANIES.filter((c) => c.accountId !== exclude);
  return NextResponse.json({ ok: true, companies });
}
