import { NextResponse } from "next/server";
import { keccak256, parseUnits, toHex } from "viem";
import { loadDeployment, publicClient, walletFor, escrowAbi, type Deployment } from "@/lib/escrow/chain";
import { getStore, saveStore, getDeal, appendAudit, readDealId } from "@/lib/escrow/store";
import { readActor, requireHat, partyRef } from "@/lib/escrow/actor";

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
// unless it is talking to the local dev chain (see assertLocalReleaser below).
// It must never be exposed on a public deployment with a real releaser key.
//
// TODO(integration: auth Q18) — before this can run outside localhost the releaser
// key must be a server secret behind verified operator identity. Until Q18 is
// settled this endpoint stays local-only. (Mirrors submit-bol/route.ts.)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = readActor(body);
  const denied = requireHat(actor, "buyer");
  if (denied) return denied;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  const store = getStore();
  const deal = getDeal(store, appDealId);
  if (!deal?.terms) return NextResponse.json({ error: "No proposal to agree to." }, { status: 409 });
  if (deal.onChainDealId) return NextResponse.json({ error: "Deal already created." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);
  const releaser = walletFor("releaser", dep);

  // Derive the on-chain id from the app deal id + counter salt (unique per run).
  const onChainDealId = keccak256(toHex(`${appDealId}#${store.dealCounter + 1}`));
  const amountMinor = parseUnits(deal.terms.amountUsdc, 6);

  deal.parties.buyer = partyRef(actor, "buyer");
  appendAudit(deal, { actor: "buyer", action: "Agreed to proposed terms", accountId: actor?.accountId });

  // Refuse to sign the releaser call anywhere but the local dev chain.
  const localGuard = assertLocalReleaser(dep);
  if (localGuard) {
    saveStore(store); // keep the agreement in the audit trail; just don't sign
    return localGuard;
  }

  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "createDeal",
    args: [onChainDealId, dep.accounts.buyer, dep.accounts.seller, amountMinor],
  });
  await pc.waitForTransactionReceipt({ hash });

  store.dealCounter += 1;
  deal.onChainDealId = onChainDealId;
  appendAudit(deal, {
    actor: "platform",
    action: "Deal registered on-chain (createDeal)",
    detail: "State: Draft → Agreed",
    txHash: hash,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, dealId: onChainDealId, txHash: hash });
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
      createDealSkipped: true,
    },
    { status: 501 },
  );
}
