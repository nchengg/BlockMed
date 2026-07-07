import { NextResponse } from "next/server";
import { loadDeployment, publicClient, walletFor, escrowAbi } from "@/lib/chain";
import { getStore, saveStore, appendAudit } from "@/lib/store";
import { gradeBol, type BolFields } from "@/lib/rules";

// Step 4 — SELLER submits the bill-of-lading details. The deterministic rules engine
// grades them against the agreed terms; on Compliant the platform (releaser) records
// the verdict on-chain: Funded → ReleasePending. Discrepant = no chain write.
export async function POST(req: Request) {
  const fields = (await req.json()) as BolFields;
  const store = getStore();
  if (!store.dealId || !store.terms) {
    return NextResponse.json({ error: "No funded deal." }, { status: 409 });
  }

  const dep = loadDeployment();
  const pc = publicClient(dep);

  // Idempotency / state guard: only grade while the deal is Funded (mirrors on-chain InvalidState)
  const state = (await pc.readContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "state",
    args: [store.dealId],
  })) as number;
  if (state !== 2 /* Funded */) {
    return NextResponse.json({ error: "Deal is not in Funded state." }, { status: 409 });
  }

  const verdict = gradeBol(fields, store.terms);
  appendAudit(store, {
    actor: "seller",
    action: `Submitted B/L ${fields.blNumber || "(no number)"} — verdict: ${verdict.verdict}`,
    detail: verdict.rules.map((r) => `${r.pass ? "✓" : "✗"} ${r.rule}`).join(" · "),
  });

  if (verdict.verdict !== "Compliant") {
    saveStore(store);
    return NextResponse.json({ ok: true, ...verdict });
  }

  const releaser = walletFor("releaser", dep);
  const hash = await releaser.writeContract({
    address: dep.escrow,
    abi: escrowAbi,
    functionName: "recordVerdict",
    args: [store.dealId],
  });
  await pc.waitForTransactionReceipt({ hash });
  appendAudit(store, {
    actor: "platform",
    action: "Verdict recorded on-chain (recordVerdict)",
    detail: "State: Funded → ReleasePending — release is now permissionless",
    txHash: hash,
  });
  saveStore(store);
  return NextResponse.json({ ok: true, ...verdict, txHash: hash });
}
