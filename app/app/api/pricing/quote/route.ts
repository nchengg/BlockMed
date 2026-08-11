import { NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth/session";
import { quoteDeal, PricingError } from "@/lib/pricing/quote";

export const dynamic = "force-dynamic";

// A live quote for terms not yet agreed, so a proposer sees the cost BEFORE
// committing. This is a preview only — the binding quote is the one snapshotted
// onto the deal at acceptance (app/api/escrow/accept-deal), which is what the
// parties are actually held to.
export async function POST(req: Request) {
  const account = await getSessionAccount();
  if (!account) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { amountUsdc?: string };
  try {
    return NextResponse.json({ ok: true, quote: quoteDeal(body.amountUsdc ?? "") });
  } catch (e) {
    if (e instanceof PricingError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    throw e;
  }
}
