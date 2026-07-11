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
// TODO(integration: per-account isolation) — this is still a SINGLE global deal
// keyed to one JSON file, matching #25. #27 / feat/portal-data-isolation move to a
// per-account MULTI-DEAL store (lib/dealStore.tsx) so an account only sees its own
// deals. When that store becomes the source of truth, key this off-chain record by
// dealId + participating accountIds and drop the single-deal assumption below.
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

export interface DemoStore {
  dealCounter: number;
  dealId: string | null; // bytes32 hex once created on-chain
  terms: DealTerms | null;
  // #27 adaptation: the accounts participating in this deal, captured as they act.
  parties: { seller?: PartyRef; buyer?: PartyRef };
  audit: AuditEntry[];
}

const FILE = path.join(process.cwd(), "data", "escrow-store.json");

const EMPTY: DemoStore = {
  dealCounter: 0,
  dealId: null,
  terms: null,
  parties: {},
  audit: [],
};

export function getStore(): DemoStore {
  if (!existsSync(FILE)) return { ...EMPTY, parties: {}, audit: [] };
  const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Partial<DemoStore>;
  // Tolerate stores written before the `parties` field existed.
  return { ...EMPTY, ...parsed, parties: parsed.parties ?? {}, audit: parsed.audit ?? [] };
}

export function saveStore(store: DemoStore): void {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2) + "\n");
}

export function appendAudit(store: DemoStore, entry: Omit<AuditEntry, "ts">): void {
  store.audit.push({ ts: new Date().toISOString(), ...entry });
}
