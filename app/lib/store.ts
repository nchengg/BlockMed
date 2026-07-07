// Tiny JSON-file store for the demo's off-chain side: the proposed terms (the demo's
// stand-in for the escrow specification) and a simple audit trail. Lives in app/data/
// (gitignored). The full product replaces this with the spec store + audit ledger.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

export interface DealTerms {
  goods: string;
  amountUsdc: string; // decimal string, e.g. "2500.00" — parsed with parseUnits, never floats
  sellerName: string;
  buyerName: string;
  shipmentDeadline: string; // YYYY-MM-DD
}

export interface AuditEntry {
  ts: string;
  actor: "seller" | "buyer" | "platform" | "anyone";
  action: string;
  detail?: string;
  txHash?: string;
}

export interface DemoStore {
  dealCounter: number;
  dealId: string | null; // bytes32 hex once created on-chain
  terms: DealTerms | null;
  audit: AuditEntry[];
}

const FILE = path.join(process.cwd(), "data", "demo-store.json");

const EMPTY: DemoStore = { dealCounter: 0, dealId: null, terms: null, audit: [] };

export function getStore(): DemoStore {
  if (!existsSync(FILE)) return { ...EMPTY };
  return JSON.parse(readFileSync(FILE, "utf8")) as DemoStore;
}

export function saveStore(store: DemoStore): void {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2) + "\n");
}

export function appendAudit(store: DemoStore, entry: Omit<AuditEntry, "ts">): void {
  store.audit.push({ ts: new Date().toISOString(), ...entry });
}
