import { NextResponse } from "next/server";
import { getStore, saveStore, removeDeal, readDealId } from "@/lib/escrow/store";
import { readActor, requireStaff } from "@/lib/escrow/actor";

// Start a fresh demo run. The old on-chain deal stays on-chain (terminal state);
// the next run derives a new on-chain id from the app deal id + incremented counter,
// so it never collides. #27 adaptation: reset is a staff (admin/developer) capability.
// Reconciliation: with a dealId, resets just THAT deal's off-chain record; without
// one, clears all records (a full demo reset). The counter is always preserved.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = readActor(body);
  const denied = requireStaff(actor);
  if (denied) return denied;

  const store = getStore();
  const appDealId = readDealId(body);
  if (appDealId) {
    removeDeal(store, appDealId);
    saveStore(store);
  } else {
    saveStore({ dealCounter: store.dealCounter, deals: {} });
  }
  return NextResponse.json({ ok: true });
}
