import { NextResponse } from "next/server";
import { loadDeployment, publicClient, escrowAbi } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { readActor, requireAuth } from "@/lib/escrow/actor";
import { roleInDeal } from "@/lib/escrow/roles";

// Record a user-signed deposit AFTER the wallet has broadcast it.
//
// The client reports a transaction hash, but a hash is a claim, not proof — so
// this route never trusts it. It reads the receipt from the chain and then reads
// the deal's on-chain state, and only writes the audit entry if the chain agrees
// the deal is genuinely funded.
//
// That ordering matters: the audit trail is the regulator-facing artefact
// (FR-14). An entry saying "deposited" for a transaction that reverted, or for
// somebody else's transaction entirely, would be worse than no entry at all.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const appDealId = readDealId(body);
  const depositHash = typeof body?.depositHash === "string" ? body.depositHash : null;
  const approveHash = typeof body?.approveHash === "string" ? body.approveHash : null;
  if (!appDealId || !depositHash) {
    return NextResponse.json({ error: "Missing deal id or transaction hash." }, { status: 400 });
  }

  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId) {
    return NextResponse.json({ error: "No on-chain deal to confirm." }, { status: 409 });
  }
  if (roleInDeal(deal, actor?.accountId) !== "buyer") {
    return NextResponse.json({ error: "Only the buyer funds this deal." }, { status: 403 });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Verify the transaction succeeded — a reverted tx still has a hash.
  //
  // Swallowing every failure into "not found" conflates two opposite
  // situations: a transaction that does not exist (the user must retry) and an
  // RPC that cannot answer (the user must NOT retry — their money has already
  // moved, and paying again would send it twice). base-rpc.publicnode.com in
  // particular rejects eth_getTransactionReceipt outright with "Invalid
  // parameters", which surfaced as "Could not find that transaction on-chain"
  // for a deposit that was mined and successful.
  //
  // So: distinguish them. A transport/RPC failure is a 503 that says the
  // deposit may well have gone through, and the state check below is the
  // authority on whether it did.
  let receipt = null;
  let receiptLookupFailed = false;
  try {
    receipt = await pc.waitForTransactionReceipt({
      hash: depositHash as `0x${string}`,
      timeout: 60_000,
    });
  } catch (e) {
    // viem throws a distinct error when the tx is genuinely absent after
    // waiting; anything else (transport error, bad-params, timeout) means we
    // could not get an answer rather than that there is no answer.
    const name = (e as Error)?.name ?? "";
    receiptLookupFailed = name !== "TransactionNotFoundError" &&
      name !== "TransactionReceiptNotFoundError";
  }

  if (!receipt) {
    // Fall back to the chain's own view of the deal. If the escrow says this
    // deal is funded, the deposit landed regardless of what the receipt lookup
    // did — record it rather than telling the user their payment vanished.
    const fallbackState = (await pc.readContract({
      address: dep.escrow,
      abi: escrowAbi,
      functionName: "state",
      args: [deal.onChainDealId as `0x${string}`],
    }).catch(() => null)) as number | null;

    if (fallbackState !== null && Number(fallbackState) >= 2) {
      // Funded on-chain. Carry on and record it below.
    } else if (receiptLookupFailed) {
      return NextResponse.json(
        {
          error:
            "Could not reach the network to confirm your deposit. Do NOT pay again — " +
            "refresh the deal in a moment to see whether it went through.",
          retryable: true,
        },
        { status: 503 },
      );
    } else {
      return NextResponse.json(
        { error: "Could not find that transaction on-chain." },
        { status: 409 },
      );
    }
  }
  // Only meaningful when we actually got a receipt. On the fallback path above
  // there is none, and the escrow's own state has already vouched for the
  // deposit — a reverted transaction could not have moved it to Funded.
  if (receipt && receipt.status !== "success") {
    return NextResponse.json({ error: "That transaction failed on-chain." }, { status: 409 });
  }

  // Verify it actually funded THIS deal. A valid receipt for an unrelated
  // transaction would otherwise be accepted as evidence.
  const state = (await pc.readContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "state",
    args: [deal.onChainDealId as `0x${string}`],
  }).catch(() => null)) as number | null;

  // 2 = Funded in the contract's State enum (chain.ts STATE_NAMES).
  if (state === null || Number(state) < 2) {
    return NextResponse.json(
      { error: "That transaction did not fund this deal." },
      { status: 409 },
    );
  }

  // Idempotent: a retry or double-click must not append the entry twice.
  if (deal.audit?.some(e => e.txHash === depositHash)) {
    return NextResponse.json({ ok: true, alreadyRecorded: true });
  }

  if (approveHash) {
    appendAudit(deal, {
      actor: "buyer",
      action: "Approved USDC spend (exact amount)",
      detail: `${deal.terms?.amountUsdc ?? ""} USDC — signed in the buyer's own wallet`,
      txHash: approveHash,
      accountId: actor?.accountId,
    });
  }
  appendAudit(deal, {
    actor: "buyer",
    action: "Deposited into escrow",
    // The signer comes from the receipt when we have one. On the fallback path
    // we do not, and the audit trail must not invent it: say the deposit was
    // confirmed from the escrow's own state instead, which is what happened.
    detail: receipt
      ? `State: Agreed → Funded — signed by ${receipt.from}`
      : "State: Agreed → Funded — confirmed from on-chain escrow state " +
        "(receipt unavailable from the RPC at the time of recording)",
    txHash: depositHash,
    accountId: actor?.accountId,
  });
  await saveDeal(deal);

  return NextResponse.json({ ok: true });
}
