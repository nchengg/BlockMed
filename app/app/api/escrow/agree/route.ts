import { NextResponse } from "next/server";
import { keccak256, parseUnits, toHex } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi, type Deployment } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal, nextDealCounter } from "@/lib/escrow/store";
import { readActor, requireHat, partyRef, requireAuth } from "@/lib/escrow/actor";
import { assertLocalReleaser } from "@/lib/escrow/settlement";

// Step 2 — BUYER agrees to the proposal; the platform (releaser key) registers the
// deal on-chain: createDeal → Draft→Agreed. (TRD: createDeal is RELEASER_ROLE-gated.)
// #27 adaptation: gated to the buyer hat; the buyer account is recorded.
//
// Reconciliation: scoped to the caller's active app deal id (lib/dealStore); the
// on-chain bytes32 id is derived from it, salted by the monotonic counter so a
// re-run of the same app deal never collides with a prior on-chain deal.
//
// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL — RELEASER SIGNS HERE, SERVER-SIDE, WITHOUT VERIFIED AUTH.
// createDeal is RELEASER_ROLE-gated on-chain, so this route makes the platform's
// releaser call using the server-held key. In this port that key is ONLY the
// public Hardhat dev key (lib/escrow/chain.ts) and this route REFUSES TO SIGN
// unless a real releaser key is configured (see lib/escrow/settlement.ts).
// It must never be exposed on a public deployment with a real releaser key.
//
// TODO(integration: auth Q18) — before this can run outside localhost the releaser
// key must be a server secret behind verified operator identity. Until Q18 is
// settled this endpoint stays local-only. (Mirrors submit-bol/route.ts.)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;
  const denied = requireHat(actor, "buyer");
  if (denied) return denied;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });
  const deal = await getDeal(appDealId);
  if (!deal?.terms) return NextResponse.json({ error: "No proposal to agree to." }, { status: 409 });
  if (deal.onChainDealId) return NextResponse.json({ error: "Deal already created." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const releaser = walletFor("releaser", dep);

  // Derive the on-chain id from the app deal id + counter salt (unique per run).
  const counter = await nextDealCounter();
  const onChainDealId = keccak256(toHex(`${appDealId}#${counter}`));
  const amountMinor = parseUnits(deal.terms.amountUsdc, 6);

  deal.parties.buyer = partyRef(actor, "buyer");
  appendAudit(deal, { actor: "buyer", action: "Agreed to proposed terms", accountId: actor?.accountId });

  // Refuse to sign the releaser call anywhere but the local dev chain.
  const localGuard = assertLocalReleaser(dep);
  if (localGuard) {
    await saveDeal(deal); // keep the agreement in the audit trail; just don't sign
    return localGuard;
  }

  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "createDeal",
    args: [onChainDealId, dep.accounts.buyer, dep.accounts.seller, amountMinor],
  });
  await pc.waitForTransactionReceipt({ hash });
  deal.onChainDealId = onChainDealId;
  appendAudit(deal, {
    actor: "platform",
    action: "Deal registered on-chain (createDeal)",
    detail: "State: Draft → Agreed",
    txHash: hash,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true, dealId: onChainDealId, txHash: hash });
}

