import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/escrow/store";
import { readActor, requireStaff } from "@/lib/escrow/actor";

// Start a fresh demo run. The old deal stays on-chain (terminal state); the next
// run derives a new dealId from the incremented counter.
// #27 adaptation: reset is a staff (admin/developer) capability.
export async function POST(req: Request) {
  const actor = readActor(await req.json().catch(() => ({})));
  const denied = requireStaff(actor);
  if (denied) return denied;

  const store = getStore();
  saveStore({ dealCounter: store.dealCounter, dealId: null, terms: null, parties: {}, audit: [] });
  return NextResponse.json({ ok: true });
}
