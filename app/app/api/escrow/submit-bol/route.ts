import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi, type Deployment } from "@/lib/escrow/chain";
import { getStore, saveStore, getDeal, appendAudit, readDealId } from "@/lib/escrow/store";
import { gradeBol, type BolFields } from "@/lib/escrow/rules";
import { readActor, requireHat } from "@/lib/escrow/actor";

// Step 4 — SELLER submits the bill-of-lading details. The deterministic rules engine
// grades them against the agreed terms; on Compliant the platform (releaser) records
// the verdict on-chain: Funded → ReleasePending. Discrepant = no chain write.
//
// #27 adaptation: submission is gated to the seller hat.
// Reconciliation: scoped to the caller's active app deal id (lib/dealStore) — the
// B/L is graded against THAT deal's terms and the verdict recorded on its on-chain id.
//
// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL — RELEASER SIGNS HERE, SERVER-SIDE, WITHOUT VERIFIED AUTH.
// On a Compliant verdict this route makes the platform's RELEASER_ROLE call
// (recordVerdict) using the server-held key. In this port that key is ONLY the
// public Hardhat dev key (lib/escrow/chain.ts) and this route REFUSES TO SIGN
// unless it is talking to the local dev chain (see assertLocalReleaser below).
// It must never be exposed on a public deployment with a real releaser key.
//
// TODO(integration: auth Q18) — before this can run outside localhost:
//   1. The verdict must be produced/authorised by the trusted operator path, not
//      by an unauthenticated POST from whoever submits the B/L.
//   2. The releaser key must be a server secret, and the recordVerdict trigger
//      must sit behind verified operator identity (requireOperator + real auth).
//   Until Q18 is settled this endpoint stays local-only.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = (await req.json()) as BolFields & { dealId?: unknown; actor?: unknown };
  const actor = readActor(body);
  const denied = requireHat(actor, "seller");
  if (denied) return denied;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const fields = body as BolFields;
  const store = getStore();
  const deal = getDeal(store, appDealId);
  if (!deal?.onChainDealId || !deal.terms) {
    return NextResponse.json({ error: "No funded deal." }, { status: 409 });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Idempotency / state guard: only grade while the deal is Funded (mirrors on-chain InvalidState)
  const state = (await pc.readContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "state",
    args: [deal.onChainDealId],
  })) as number;
  if (state !== 2 /* Funded */) {
    return NextResponse.json({ error: "Deal is not in Funded state." }, { status: 409 });
  }

  const verdict = gradeBol(fields, deal.terms);
  appendAudit(deal, {
    actor: "seller",
    action: `Submitted B/L ${fields.blNumber || "(no number)"} — verdict: ${verdict.verdict}`,
    detail: verdict.rules.map((r) => `${r.pass ? "✓" : "✗"} ${r.rule}`).join(" · "),
    accountId: actor?.accountId,
  });

  if (verdict.verdict !== "Compliant") {
    saveStore(store);
    return NextResponse.json({ ok: true, ...verdict });
  }

  // Refuse to sign the releaser call anywhere but the local dev chain.
  const localGuard = assertLocalReleaser(dep);
  if (localGuard) {
    saveStore(store); // keep the verdict in the audit trail; just don't sign
    return localGuard;
  }

  const releaser = walletFor("releaser", dep);
  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "recordVerdict",
    args: [deal.onChainDealId],
  });
  await pc.waitForTransactionReceipt({ hash });
  appendAudit(deal, {
    actor: "platform",
    action: "Verdict recorded on-chain (recordVerdict)",
    detail: "State: Funded → ReleasePending — release is now permissionless",
    txHash: hash,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, ...verdict, txHash: hash });
}

// Hard stop: the server-held releaser key may only sign against the local Hardhat
// dev chain (chainId 31337). On any other network, or in a production build, this
// route returns 501 instead of signing — the real releaser path is TODO(auth Q18).
function assertLocalReleaser(dep: Deployment): NextResponse | null {
  const isLocalChain = dep.chainId === 31337;
  const isProd = process.env.NODE_ENV === "production";
  if (isLocalChain && !isProd) return null;
  return NextResponse.json(
    {
      ok: false,
      error:
        "Releaser signing is disabled outside the local dev chain. Wire the trusted " +
        "operator + real releaser key first (TODO integration: auth Q18).",
      recordVerdictSkipped: true,
    },
    { status: 501 },
  );
}
