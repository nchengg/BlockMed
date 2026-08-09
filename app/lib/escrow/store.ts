// The off-chain record for escrow deals — terms, parties, review state and the
// audit trail. Backed by SQLite via Prisma (lib/db.ts).
//
// WHAT THIS IS NOT: a deal's money and state machine live ON-CHAIN and are
// always read from the contract (lib/escrow/chain.ts). This store never
// duplicates them. It holds the rulebook the bill of lading is graded against,
// who the parties are, and the paper trail — which is what the TRD specs a
// durable store for.
//
// SHAPE PRESERVED ON PURPOSE. This replaced a JSON file, and the 17 lifecycle
// routes all used the same pattern: load, mutate a record, save. The same types
// and a near-identical function surface survive the migration so those routes
// changed by roughly one `await` each — the alternative was rewriting working
// code that Nick's dashboard also depends on.
//
// Concurrency: a route loads the deals it names, edits plain objects, then
// persists. Two writers on the SAME deal could interleave; at demo scale (two
// parties, one deal at a time) that is not a real risk, and the fix when it
// becomes one is a transaction around saveDeal.
//
// TODO(integration: auth Q18) — routes still take the acting account from the
// request body. The session cookie now exists (lib/auth/session.ts); resolving
// identity from it server-side is what turns the soft gate into a real one.
import "server-only";
import { prisma } from "@/lib/db";
import type { Review } from "./review";

export interface DealTerms {
  goods: string;
  amountUsdc: string; // decimal string, e.g. "2500.00" — parsed with parseUnits, never floats
  sellerName: string;
  buyerName: string;
  shipmentDeadline: string; // YYYY-MM-DD
  // Optional route/commercial terms (docs/document-templates.md grades documents
  // against these when agreed). Absent = the corresponding grade falls back to a
  // cross-document check only.
  portOfLoading?: string | null;
  portOfDischarge?: string | null;
  incoterm?: string | null; // e.g. "CIF" — drives the freight-payment check
}

// Which account performed a step. Optional throughout so anonymous calls still
// work — they produce a truthful (if unattributed) audit entry rather than failing.
export interface PartyRef {
  accountId?: string;
  displayName?: string;
  hat?: "buyer" | "seller" | "platform";
}

export interface AuditEntry {
  ts: string;
  actor: "seller" | "buyer" | "platform" | "anyone";
  action: string;
  detail?: string;
  txHash?: string;
  accountId?: string;
}

/** The off-chain record for ONE deal, keyed by its app deal id (e.g. "DEAL-1B0C-9A42"). */
export interface DealRecord {
  appDealId: string;
  onChainDealId: string | null; // bytes32 hex, set once createDeal runs on-chain
  terms: DealTerms | null;
  // Notice-of-release review (FR-10/11): set when a Compliant B/L opens the
  // buyer's objection window; replaced on a corrected resubmission.
  review?: Review | null;
  // Which side proposed the deal — the OTHER side owes the acceptance.
  createdByRole?: "buyer" | "seller";
  // Set when the counterparty declines. Terminal, off-chain only.
  declinedAt?: string | null;
  parties: { seller?: PartyRef; buyer?: PartyRef };
  audit: AuditEntry[];
}

/* ─────────────── row ⇄ record mapping ─────────────── */

const DEAL_INCLUDE = { review: true, audit: { orderBy: { ts: "asc" } } } as const;

type DealRow = NonNullable<Awaited<ReturnType<typeof findDealRow>>>;

function findDealRow(appDealId: string) {
  return prisma.deal.findUnique({ where: { appDealId }, include: DEAL_INCLUDE });
}

function toRecord(row: DealRow): DealRecord {
  // Terms are all-or-nothing: a deal has them from creation, or it is a bare
  // shell no route will act on.
  const terms: DealTerms | null =
    row.goods !== null && row.amountUsdc !== null
      ? {
          goods: row.goods,
          amountUsdc: row.amountUsdc,
          sellerName: row.sellerDisplayName ?? "",
          buyerName: row.buyerDisplayName ?? "",
          shipmentDeadline: row.shipmentDeadline ?? "",
          portOfLoading: row.portOfLoading,
          portOfDischarge: row.portOfDischarge,
          incoterm: row.incoterm,
        }
      : null;

  let review: Review | null = null;
  if (row.review) {
    const r = row.review;
    review = {
      fields: JSON.parse(r.fieldsJson),
      verdict: JSON.parse(r.verdictJson),
      noticeAt: r.noticeAt.toISOString(),
      windowEndsAt: r.windowEndsAt.toISOString(),
    };
    if (r.approvedAt) review.approvedAt = r.approvedAt.toISOString();
    if (r.objectionGround) {
      review.objection = {
        ground: r.objectionGround as NonNullable<Review["objection"]>["ground"],
        detail: r.objectionDetail ?? "",
        raisedAt: (r.objectionRaisedAt ?? r.noticeAt).toISOString(),
      };
    }
  }

  const parties: DealRecord["parties"] = {};
  if (row.sellerId || row.sellerDisplayName) {
    parties.seller = {
      accountId: row.sellerId ?? undefined,
      displayName: row.sellerDisplayName ?? undefined,
      hat: "seller",
    };
  }
  if (row.buyerId || row.buyerDisplayName) {
    parties.buyer = {
      accountId: row.buyerId ?? undefined,
      displayName: row.buyerDisplayName ?? undefined,
      hat: "buyer",
    };
  }

  return {
    appDealId: row.appDealId,
    onChainDealId: row.onChainDealId,
    terms,
    review,
    createdByRole: (row.createdByRole as "buyer" | "seller" | null) ?? undefined,
    declinedAt: row.declinedAt ? row.declinedAt.toISOString() : null,
    parties,
    audit: row.audit.map((a) => {
      const e: AuditEntry = {
        ts: a.ts.toISOString(),
        actor: a.actor as AuditEntry["actor"],
        action: a.action,
      };
      if (a.detail) e.detail = a.detail;
      if (a.txHash) e.txHash = a.txHash;
      if (a.accountId) e.accountId = a.accountId;
      return e;
    }),
  };
}

/* ─────────────── reads ─────────────── */

/** One deal, or undefined if it does not exist. */
export async function getDeal(appDealId: string): Promise<DealRecord | undefined> {
  const row = await findDealRow(appDealId);
  return row ? toRecord(row) : undefined;
}

/** Every deal. The list/summary routes filter these by party. */
export async function getAllDeals(): Promise<DealRecord[]> {
  const rows = await prisma.deal.findMany({ include: DEAL_INCLUDE, orderBy: { createdAt: "desc" } });
  return rows.map(toRecord);
}

/** A fresh, unsaved record — the caller fills it in and calls saveDeal. */
export function emptyDeal(appDealId: string): DealRecord {
  return { appDealId, onChainDealId: null, terms: null, parties: {}, audit: [] };
}

/** The record for a deal, or a fresh one if absent. Does not write. */
export async function ensureDeal(appDealId: string): Promise<DealRecord> {
  return (await getDeal(appDealId)) ?? emptyDeal(appDealId);
}

/* ─────────────── writes ─────────────── */

/**
 * Persist a record.
 *
 * Audit entries are APPEND-ONLY: stored rows are never rewritten, and only
 * entries beyond what is already persisted get inserted — so a stale in-memory
 * copy can never truncate or edit the trail (FR-14).
 */
export async function saveDeal(record: DealRecord): Promise<void> {
  const dealData = {
    onChainDealId: record.onChainDealId,
    goods: record.terms?.goods ?? null,
    amountUsdc: record.terms?.amountUsdc ?? null,
    shipmentDeadline: record.terms?.shipmentDeadline ?? null,
    portOfLoading: record.terms?.portOfLoading ?? null,
    portOfDischarge: record.terms?.portOfDischarge ?? null,
    incoterm: record.terms?.incoterm ?? null,
    sellerDisplayName: record.parties.seller?.displayName ?? record.terms?.sellerName ?? null,
    buyerDisplayName: record.parties.buyer?.displayName ?? record.terms?.buyerName ?? null,
    sellerId: record.parties.seller?.accountId ?? null,
    buyerId: record.parties.buyer?.accountId ?? null,
    createdByRole: record.createdByRole ?? null,
    declinedAt: record.declinedAt ? new Date(record.declinedAt) : null,
  };

  await prisma.deal.upsert({
    where: { appDealId: record.appDealId },
    create: { appDealId: record.appDealId, ...dealData },
    update: dealData,
  });

  // Review: one per deal, replaced wholesale when a corrected B/L opens a fresh
  // notice. No review means the notice was never issued, or was cleared.
  if (record.review) {
    const r = record.review;
    const reviewData = {
      fieldsJson: JSON.stringify(r.fields),
      verdictJson: JSON.stringify(r.verdict),
      noticeAt: new Date(r.noticeAt),
      windowEndsAt: new Date(r.windowEndsAt),
      approvedAt: r.approvedAt ? new Date(r.approvedAt) : null,
      objectionGround: r.objection?.ground ?? null,
      objectionDetail: r.objection?.detail ?? null,
      objectionRaisedAt: r.objection ? new Date(r.objection.raisedAt) : null,
    };
    await prisma.review.upsert({
      where: { dealId: record.appDealId },
      create: { dealId: record.appDealId, ...reviewData },
      update: reviewData,
    });
  } else {
    await prisma.review.deleteMany({ where: { dealId: record.appDealId } });
  }

  const stored = await prisma.auditEntry.count({ where: { dealId: record.appDealId } });
  const fresh = record.audit.slice(stored);
  if (fresh.length > 0) {
    await prisma.auditEntry.createMany({
      data: fresh.map((a) => ({
        dealId: record.appDealId,
        ts: new Date(a.ts),
        actor: a.actor,
        action: a.action,
        detail: a.detail ?? null,
        txHash: a.txHash ?? null,
        accountId: a.accountId ?? null,
      })),
    });
  }
}

/** Drop one deal's off-chain record. Its audit and review cascade. */
export async function removeDeal(appDealId: string): Promise<void> {
  await prisma.deal.deleteMany({ where: { appDealId } });
}

/** Drop every deal. Used by the staff-only full reset. Returns how many went. */
export async function removeAllDeals(): Promise<number> {
  const { count } = await prisma.deal.deleteMany({});
  return count;
}

/** Append to the in-memory record; saveDeal persists it. */
export function appendAudit(record: DealRecord, entry: Omit<AuditEntry, "ts">): void {
  record.audit.push({ ts: new Date().toISOString(), ...entry });
}

/* ─────────────── on-chain id counter ─────────────── */

/**
 * Reserve the next counter value. This salts the derived on-chain deal id so
 * re-running an app deal after a reset never collides with a prior on-chain
 * deal — the contract rejects a duplicate dealId outright. Survives deals being
 * deleted, which is the whole reason it is not just a row count.
 */
export async function nextDealCounter(): Promise<number> {
  const row = await prisma.counter.upsert({
    where: { id: 1 },
    create: { id: 1, dealCounter: 1 },
    update: { dealCounter: { increment: 1 } },
    select: { dealCounter: true },
  });
  return row.dealCounter;
}

/* ─────────────── request helpers ─────────────── */

/**
 * Pull the scoped app deal id out of a request body/query. Returns null when
 * absent so routes can 400 with a clear message.
 */
export function readDealId(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  const raw = (source as { dealId?: unknown }).dealId;
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
}
