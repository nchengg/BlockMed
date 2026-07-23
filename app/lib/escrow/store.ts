// Tiny JSON-file store for the demo's off-chain side of the escrow: the proposed
// terms (the demo's stand-in for the escrow specification), the party context and
// a simple audit trail. Server-only. Lives in app/data/ (gitignored). The full
// product replaces this with the spec store + audit ledger.
//
// Ported from the closed PR #25 (feat/escrow-web-ui). ADAPTED to #27's
// account-first model: each lifecycle step now records WHICH ACCOUNT (and which
// client "hat") drove it, so the audit trail reflects the signed-in party rather
// than the anonymous single-actor flow #25 had. See lib/escrow/actor.ts.
//
// PER-DEAL RECONCILIATION (feat/store-reconciliation) — this store is now KEYED BY
// the per-account deal id from lib/dealStore.tsx (the `DEAL-XXXX-XXXX` reference an
// account sees in its dashboard) instead of holding one global singleton. Each app
// deal gets its own off-chain record (terms / parties / audit / on-chain id), so
// when a buyer drives "deposit" from THEIR active deal the routes act on THAT deal
// — not on one shared demo deal. Isolation itself still lives in dealStore
// (visibleDealsFor): the client only ever sends ids for deals the viewer can see,
// and the soft actor gate (lib/escrow/actor.ts) stays as-is.
//
// TODO(integration: auth Q18) — this scoping is still driven by a CLIENT-SUPPLIED
// dealId + actor, not a verified identity, so it is not yet a security boundary.
// Real enforcement resolves both the account AND its visible deal set server-side
// from a verified credential before trusting either. Until then this keeps the
// demo's deals separated and the audit trail truthful, matching the existing soft
// gate — it must NOT be relied on for authorisation.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

export interface DealTerms {
  goods: string;
  amountUsdc: string; // decimal string, e.g. "2500.00" — parsed with parseUnits, never floats
  sellerName: string;
  buyerName: string;
  shipmentDeadline: string; // YYYY-MM-DD
}

// Which account/hat performed a step. Recorded from the actor context the client
// sends (lib/escrow/actor.ts). Optional so anonymous/legacy calls still work.
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
  accountId?: string; // #27 adaptation: the account behind this entry, when known
}

// The off-chain record for ONE deal. Keyed in DemoStore.deals by its appDealId —
// the per-account deal id from lib/dealStore.tsx (e.g. "DEAL-1B0C-9A42").
export interface DealRecord {
  appDealId: string; // the per-account deal id this record is scoped to
  onChainDealId: string | null; // bytes32 hex, set once createDeal runs on-chain
  terms: DealTerms | null;
  // Notice-of-release review (FR-10/11): set when a Compliant B/L opens the buyer's
  // objection window; cleared/replaced on a corrected resubmission. See review.ts.
  review?: import("./review").Review | null;
  // #27 adaptation: the accounts participating in this deal, captured as they act.
  parties: { seller?: PartyRef; buyer?: PartyRef };
  audit: AuditEntry[];
}

export interface DemoStore {
  // Monotonic across the WHOLE demo. It salts the derived on-chain dealId so that
  // re-running the same app deal after a reset never collides with a prior on-chain
  // deal of the same id (the contract rejects a duplicate dealId).
  dealCounter: number;
  // All off-chain deal records, keyed by appDealId.
  deals: Record<string, DealRecord>;
}

const FILE = path.join(process.cwd(), "data", "escrow-store.json");

const EMPTY: DemoStore = {
  dealCounter: 0,
  deals: {},
};

export function getStore(): DemoStore {
  if (!existsSync(FILE)) return { dealCounter: 0, deals: {} };
  const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Partial<DemoStore> & {
    // Tolerate the pre-reconciliation singleton shape so a stale demo file (data/
    // is gitignored) doesn't crash the routes — it's simply read as "no deals yet".
    dealId?: unknown;
    terms?: unknown;
  };
  return {
    dealCounter: typeof parsed.dealCounter === "number" ? parsed.dealCounter : 0,
    deals: parsed.deals && typeof parsed.deals === "object" ? parsed.deals : {},
  };
}

export function saveStore(store: DemoStore): void {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2) + "\n");
}

// A fresh, empty record for a given app deal id.
export function emptyDeal(appDealId: string): DealRecord {
  return { appDealId, onChainDealId: null, terms: null, parties: {}, audit: [] };
}

// The record for an app deal, or undefined if this deal has no off-chain state yet.
export function getDeal(store: DemoStore, appDealId: string): DealRecord | undefined {
  return store.deals[appDealId];
}

// The record for an app deal, creating (and attaching) an empty one if absent.
// Used by the first write in a deal's lifecycle (propose).
export function ensureDeal(store: DemoStore, appDealId: string): DealRecord {
  const existing = store.deals[appDealId];
  if (existing) return existing;
  const created = emptyDeal(appDealId);
  store.deals[appDealId] = created;
  return created;
}

// Drop a single deal's off-chain record (staff reset of that deal). No-op if absent.
export function removeDeal(store: DemoStore, appDealId: string): void {
  delete store.deals[appDealId];
}

export function appendAudit(record: DealRecord, entry: Omit<AuditEntry, "ts">): void {
  record.audit.push({ ts: new Date().toISOString(), ...entry });
}

// Pulls the scoped app deal id out of a request body/query. Returns null when
// absent so routes can 400 with a clear message — the id is required now that the
// store is per-deal.
export function readDealId(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  const raw = (source as { dealId?: unknown }).dealId;
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
}
