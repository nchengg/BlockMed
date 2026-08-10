import { NextResponse } from "next/server";
import { loadDeployment, publicClient, escrowAbi } from "@/lib/escrow/chain";
import { getDeal, appendAudit, readDealId, saveDeal } from "@/lib/escrow/store";
import { gradeDocuments, type DocumentPack } from "@/lib/escrow/rules";
import { openReview, reviewStatus } from "@/lib/escrow/review";
import { readActor, requireHat, requireAuth } from "@/lib/escrow/actor";
import { denyIfWrongRole, roleInDeal } from "@/lib/escrow/roles";

// SELLER submits the document pack — commercial invoice, packing list, and bill
// of lading (docs/document-templates.md DOC-01/02/03). The deterministic rules
// engine grades the pack against the agreed terms AND across the documents:
// cross-checks are the anti-fraud mechanism, since faking three documents
// consistently is much harder than faking one.
//
// Three outcomes (FR-10/11 flow):
//   Compliant  → notice of release + objection window. Quiet expiry can release.
//   Held       → a 🚩 flag fired (claused B/L, on-deck cargo, hazardous goods).
//                Notice still issues so the buyer sees it, but quiet expiry can
//                NOT release — silence is not consent while a hold stands, so
//                only the buyer's explicit approval moves it forward.
//   Discrepant → no notice, no chain write; the seller corrects and resubmits.
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<DocumentPack> & { dealId?: unknown; actor?: unknown };
  const actor = await readActor(body);
  const unauth = requireAuth(actor);
  if (unauth) return unauth;

  const appDealId = readDealId(body);
  if (!appDealId) return NextResponse.json({ error: "Missing deal id." }, { status: 400 });

  if (!body.invoice || !body.packingList || !body.bol) {
    return NextResponse.json(
      { error: "All three documents are required: commercial invoice, packing list, bill of lading." },
      { status: 400 },
    );
  }
  const pack: DocumentPack = { invoice: body.invoice, packingList: body.packingList, bol: body.bol };

  const deal = await getDeal(appDealId);
  if (!deal?.onChainDealId || !deal.terms) {
    return NextResponse.json({ error: "No funded deal." }, { status: 409 });
  }

  // Submitting documents is the seller's action. Prefer the caller's recorded role
  // on THIS deal; fall back to the hat check when they aren't a recorded party.
  const wrongRole = denyIfWrongRole(
    deal, actor?.accountId, "seller",
    "You are the buyer on this deal — the seller submits the shipping documents.",
  );
  if (wrongRole) return NextResponse.json({ error: wrongRole }, { status: 403 });
  if (!roleInDeal(deal, actor?.accountId)) {
    const denied = requireHat(actor, "seller");
    if (denied) return denied;
  }

  // Resubmission policy: while a clean notice is pending (or quietly expired),
  // the seller cannot replace it. A HELD notice stays open to resubmission —
  // the seller may be able to clear the hold (e.g. a corrected clean B/L), and
  // blocking that would leave "wait for buyer" as the only path out.
  if (deal.review) {
    const rs = reviewStatus(deal.review);
    const held = deal.review.verdict.verdict === "Held";
    if (rs === "pending" && !held) {
      return NextResponse.json(
        { error: "A notice of release is pending buyer review — resubmission is only possible after an objection." },
        { status: 409 },
      );
    }
    if (rs === "expired" && !held) {
      return NextResponse.json(
        { error: "The objection window expired with no objection — finalise the release instead of resubmitting." },
        { status: 409 },
      );
    }
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

  const verdict = gradeDocuments(pack, deal.terms);
  const failed = verdict.rules.filter((r) => !r.pass);
  appendAudit(deal, {
    actor: "seller",
    action:
      `Submitted document pack (invoice ${pack.invoice.invoiceNumber || "(no number)"}, ` +
      `packing list, B/L ${pack.bol.blNumber || "(no number)"}) — verdict: ${verdict.verdict}`,
    detail:
      failed.length === 0
        ? `All ${verdict.rules.length} checks passed`
        : failed.map((r) => `✗ ${r.kind === "flag" ? "🚩 " : ""}${r.rule} (expected ${r.expected}, got ${r.actual})`).join(" · "),
    accountId: actor?.accountId,
  });

  if (verdict.verdict === "Discrepant") {
    await saveDeal(deal);
    return NextResponse.json({ ok: true, ...verdict });
  }

  // Compliant or Held → open (or replace) the buyer's review window. For Held,
  // the notice tells the buyer a hold stands and why quiet expiry won't release.
  deal.review = openReview(pack, verdict);
  appendAudit(deal, {
    actor: "platform",
    action:
      verdict.verdict === "Held"
        ? "Notice of release issued — HELD for review"
        : "Notice of release issued to buyer",
    detail:
      verdict.verdict === "Held"
        ? `A document flag requires human review (${verdict.rules.filter((r) => r.kind === "flag" && !r.pass).map((r) => r.rule).join("; ")}). ` +
          `The objection window will NOT auto-release; the buyer must explicitly approve.`
        : `Documents graded Compliant. Buyer may approve now or object on valid grounds until ${deal.review.windowEndsAt}. recordVerdict is held until then.`,
  });
  await saveDeal(deal);
  return NextResponse.json({
    ok: true,
    ...verdict,
    notice: { noticeAt: deal.review.noticeAt, windowEndsAt: deal.review.windowEndsAt },
  });
}
