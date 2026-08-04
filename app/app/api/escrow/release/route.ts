import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { readActor, requireAuth } from "@/lib/escrow/actor";
import { assertLocalReleaser } from "@/lib/escrow/settlement";

// Step 5 — Release. Deliberately signed by the SELLER key here to demonstrate that
// release is PERMISSIONLESS: once ReleasePending, anyone can trigger settlement, so
// there is intentionally NO party gate on this route. The actor is recorded only for
// the audit trail.
// Reconciliation: still scoped to the caller's active app deal id (lib/dealStore) —
// permissionless means no PARTY gate, but the call still targets a specific deal.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });
  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId) return NextResponse.json({ error: "No deal." }, { status: 409 });

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Whoever pays the gas, the money still goes to the recorded seller — release
  // takes no recipient argument, so the signer cannot redirect it. On the local
  // chain the seller dev key signs, which demonstrates that a party can trigger
  // it; on a public network there is no seller key on the server, so the
  // platform pays the gas instead. Neither can change the outcome.
  const signerRole = dep.chainId === 31337 ? "seller" : "releaser";
  const guard = signerRole === "releaser" ? assertLocalReleaser(dep) : null;
  if (guard) return guard;

  const signer = walletFor(signerRole, dep);

  const hash = await signer.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "release",
    args: [deal.onChainDealId],
  });
  await pc.waitForTransactionReceipt({ hash });
  appendAudit(deal, {
    actor: "anyone",
    action: "Release executed (permissionless)",
    detail:
      `State: ReleasePending → Released — escrow paid the seller. ` +
      `Gas paid by the ${signerRole}; release is permissionless, so anyone could have called it.`,
    txHash: hash,
    accountId: actor?.accountId,
  });
  await saveDeal(deal);
  return NextResponse.json({ ok: true, txHash: hash });
}
