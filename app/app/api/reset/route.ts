import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/store";

// Start a fresh demo run. The old deal stays on-chain (terminal state); the next
// run derives a new dealId from the incremented counter.
export async function POST() {
  const store = getStore();
  saveStore({ dealCounter: store.dealCounter, dealId: null, terms: null, audit: [] });
  return NextResponse.json({ ok: true });
}
