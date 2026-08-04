import { NextResponse } from "next/server";
import { getStore, saveStore, removeDeal, readDealId } from "@/lib/escrow/store";
import { readActor, requireStaff } from "@/lib/escrow/actor";
import { roleInDeal } from "@/lib/escrow/roles";

// Start a fresh demo run. The old on-chain deal stays on-chain (terminal state);
// the next run derives a new on-chain id from the app deal id + incremented counter,
// so it never collides. The counter is always preserved.
//
// Scopes, narrowest first:
//   • dealId          — clear that one deal's off-chain record
//   • mine=true       — clear every deal THIS account is a party to (Dan's surface:
//                       a company clearing its own demo data, no staff account needed)
//   • neither         — clear everything (staff only)
//
// This only ever drops OFF-CHAIN records; funds already released or refunded on
// chain are unaffected, and a still-Funded deal's money stays in the contract.
//
// TODO(integration: auth Q18) — the account is client-supplied, so "mine" is
// demo-honest scoping, not a security boundary.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = readActor(body);
  const store = getStore();

  const appDealId = readDealId(body);
  if (appDealId) {
    removeDeal(store, appDealId);
    saveStore(store);
    return NextResponse.json({ ok: true, cleared: 1 });
  }

  if (body?.mine === true) {
    if (!actor?.accountId) {
      return NextResponse.json({ error: "Sign in to clear your deals." }, { status: 400 });
    }
    const mine = Object.values(store.deals).filter((d) => roleInDeal(d, actor.accountId) !== null);
    for (const d of mine) removeDeal(store, d.appDealId);
    saveStore(store);
    return NextResponse.json({ ok: true, cleared: mine.length });
  }

  // Full wipe stays a staff capability.
  const denied = requireStaff(actor);
  if (denied) return denied;
  const cleared = Object.keys(store.deals).length;
  saveStore({ dealCounter: store.dealCounter, deals: {} });
  return NextResponse.json({ ok: true, cleared });
}
