// Client-side helpers for the escrow lifecycle API (app/api/escrow/*). Each mutating
// call attaches the ACTOR CONTEXT derived from the signed-in account (useAuth), which
// the server routes use for #27's soft party gating (lib/escrow/actor.ts).
//
// This is the seam between #27's account model and #25's on-chain wiring: the UI
// (components/dashboard/EscrowConsole.tsx) reads useAuth(), builds an ActorCtx, and
// passes it here — it never talks to the routes directly.
//
// PER-DEAL SCOPING (feat/store-reconciliation) — every call now also takes the
// `dealId`: the per-account active deal id from lib/dealStore.tsx (useDeal). The
// routes scope the off-chain record to that id, so an account drives ITS active
// deal instead of one shared global deal. Callers pass the id of a deal the viewer
// can see (dealStore's visibleDealsFor already enforces that), preserving isolation.
import type { Account, ClientHat } from "@/lib/authStore";
import type { BolFields, DocumentPack, Verdict } from "@/lib/escrow/rules";
import type { Review, ObjectionGround } from "@/lib/escrow/review";
import type { DealRole } from "@/lib/escrow/roles";
import type { DealTerms, AuditEntry } from "@/lib/escrow/store";

export type ActorCtx = {
  accountId?: string;
  displayName?: string;
  type?: "admin" | "developer" | "client";
  hat?: ClientHat | null;
};

// Actor payload from a real signed-in session (Dan's surface).
//
// TRANSITIONAL: the routes still read the actor from the request body. Now that
// a session cookie exists, the server should resolve identity itself and ignore
// this entirely — that is the next step, and it is what turns the soft gate into
// a real one. Until then this carries the true account id rather than a mock,
// so per-deal roles resolve against real accounts.
export function actorFromSession(
  account: { id: string; companyName: string; type: string; walletAddress?: string | null } | null,
): ActorCtx & { walletLinked: boolean } {
  if (!account) return { walletLinked: false };
  return {
    accountId: account.id,
    displayName: account.companyName,
    type: account.type === 'client' ? 'client' : (account.type as ActorCtx['type']),
    // No hat: role is derived per deal from the recorded parties (roles.ts).
    hat: null,
    // Drives whether funding goes through the user's own wallet or the server's
    // demo key. The server re-derives this; it is a UI routing hint only.
    walletLinked: Boolean(account.walletAddress),
  };
}

// Build the actor payload the routes expect from the current account + active hat.
export function actorFrom(account: Account | null, activeHat: ClientHat | null): ActorCtx {
  if (!account) return {};
  return {
    accountId: account.id,
    displayName: account.displayName,
    type: account.type,
    hat: account.type === "client" ? activeHat ?? account.hats[0] ?? null : null,
  };
}

export type StatusResponse = {
  ok: boolean;
  error?: string;
  addresses?: { escrow: string; usdc: string; releaser: string; buyer: string; seller: string };
  balances?: { buyer: string; seller: string; escrow: string };
  dealId?: string | null;
  dealAmount?: string | null;
  terms?: DealTerms | null;
  review?: Review | null;
  parties?: { seller?: { displayName?: string }; buyer?: { displayName?: string } };
  state?: string | null;
  audit?: { ts: string; actor: string; action: string; detail?: string; txHash?: string }[];
};

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok && json.ok === undefined) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

export function fetchStatus(dealId: string): Promise<StatusResponse> {
  return fetch(`/api/escrow/status?dealId=${encodeURIComponent(dealId)}`, { cache: "no-store" }).then(r => r.json());
}

// FR-1: create a deal from scratch — the creator states their side and names the
// counterparty; both parties are recorded on the deal (lib/escrow/roles.ts).
export type CreateDealInput = DealTerms & {
  creatorRole: DealRole;
  counterpartyAccountId: string;
};

// No email: the picker needs a name to show and an id to address a deal to.
// Publishing emails turned this endpoint into a harvestable contact list.
export type TradingCompany = { accountId: string; displayName: string };

// The companies a deal can be addressed to — each is a real, loggable account,
// so both sides of a deal can be tested by signing in as each in turn.
export function fetchCompanies(excludeAccountId: string | undefined): Promise<{ ok: boolean; companies: TradingCompany[] }> {
  const q = excludeAccountId ? `?exclude=${encodeURIComponent(excludeAccountId)}` : "";
  return fetch(`/api/escrow/companies${q}`, { cache: "no-store" }).then(r => r.json());
}

export function createDeal(input: CreateDealInput, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; dealId?: string; role?: DealRole }>(
    "/api/escrow/create-deal",
    { ...input, actor },
  );
}

export type DealListItem = {
  dealId: string;
  onChainDealId: string | null;
  role: DealRole | null;
  counterparty: string;
  terms: DealTerms | null;
  state: string | null;
  /** True when the signed-in viewer is the party who must accept the deal. */
  awaitingViewer?: boolean;
  /** Notice-of-release review, once a Compliant B/L has opened one (FR-10/11). */
  review?: Review | null;
  /** Every recorded action on this deal, oldest first (FR-14). */
  audit?: AuditEntry[];
  createdAt: string | null;
};

export type DealSummary = {
  ok: boolean;
  chainOk: boolean;
  /** Which chain the figures came from — null only when the chain is unreachable. */
  network: {
    name: string;
    chainId: number;
    label: string;
    explorer: string | null;
    escrow: string;
    realToken: boolean;
  } | null;
  money: {
    locked: string;
    awaitingFunding: string;
    released: string;
    escrowTotalAllAccounts: string | null;
    demoWallets: { buyer: string; seller: string } | null;
  };
  counts: {
    total: number; active: number; settled: number;
    asBuyer: number; asSeller: number; needsYou: number;
  };
};

// Per-account dashboard figures, derived from that account's own deals.
export function fetchSummary(accountId: string | undefined): Promise<DealSummary> {
  const q = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  return fetch(`/api/escrow/summary${q}`, { cache: "no-store" }).then(r => r.json());
}

// One deal for the deal page. Same shape as a list row.
export function fetchDeal(
  dealId: string, accountId: string | undefined,
): Promise<{ ok: boolean; error?: string; chainId?: number | null; escrow?: string | null; deal?: DealListItem }> {
  const q = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  return fetch(`/api/escrow/deals/${encodeURIComponent(dealId)}${q}`, { cache: "no-store" }).then(r => r.json());
}

export function fetchDeals(
  accountId: string | undefined,
): Promise<{ ok: boolean; chainId?: number | null; deals: DealListItem[] }> {
  const q = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  return fetch(`/api/escrow/deals${q}`, { cache: "no-store" }).then(r => r.json());
}

// FR-1 (counterparty half): accept a proposed deal — registers it on-chain
// (createDeal → Draft→Agreed) — or decline it, which is off-chain and terminal.
// Either side may be the accepter: whoever did not create the deal.
export function acceptDeal(dealId: string, actor: ActorCtx, opts?: { decline?: boolean }) {
  return post<{ ok: boolean; error?: string; txHash?: string; declined?: boolean }>(
    "/api/escrow/accept-deal",
    { dealId, actor, decline: opts?.decline === true },
  );
}

export function propose(dealId: string, terms: DealTerms, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/propose", { dealId, ...terms, actor });
}

export function agree(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; dealId?: string; txHash?: string }>("/api/escrow/agree", { dealId, actor });
}

export function fund(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; approveHash?: string; depositHash?: string }>("/api/escrow/fund", { dealId, actor });
}

export function submitDocuments(dealId: string, pack: DocumentPack, actor: ActorCtx) {
  return post<Verdict & {
    ok: boolean; error?: string; recordVerdictSkipped?: boolean;
    notice?: { noticeAt: string; windowEndsAt: string };
  }>("/api/escrow/submit-documents", { dealId, ...pack, actor });
}

/**
 * Legacy single-B/L submission (old /seller step flow). The engine now requires
 * the full pack, so this posts only the B/L and the server truthfully rejects
 * it with "all three documents are required" — surfaced in that UI as the
 * submission error rather than silently faking an invoice and packing list.
 */
export function submitBol(dealId: string, fields: BolFields, actor: ActorCtx) {
  return post<Verdict & {
    ok: boolean; error?: string;
    notice?: { noticeAt: string; windowEndsAt: string };
  }>("/api/escrow/submit-documents", { dealId, bol: fields, actor });
}

// FR-10: buyer approves the noticed release (waives the remaining window).
export function approveRelease(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/approve-release", { dealId, actor });
}

// FR-11: buyer objects within the window, on a closed valid ground.
export function objectToRelease(dealId: string, ground: ObjectionGround, detail: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/object", { dealId, ground, detail, actor });
}

// FR-13: the buyer withdraws a mistaken or resolved objection, restoring the
// original notice without making the seller resubmit compliant documents.
export function withdrawObjection(dealId: string, actor: ActorCtx, reason: string) {
  return post<{ ok: boolean; error?: string }>(
    "/api/escrow/withdraw-objection", { dealId, actor, reason },
  );
}

// FR-10: seller/platform finalises after the window expired with no objection.
export function finaliseRelease(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/finalise-release", { dealId, actor });
}

// FR-13: return locked funds to the buyer when a deal will not complete.
export function refund(dealId: string, actor: ActorCtx, reason: string) {
  return post<{ ok: boolean; error?: string; txHash?: string }>(
    "/api/escrow/refund", { dealId, actor, reason },
  );
}

export function release(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/release", { dealId, actor });
}

export function reset(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/reset", { dealId, actor });
}

// Clear every deal this account is a party to — a clean slate before a demo.
// Off-chain records only; anything already settled on-chain is untouched.
export function resetMyDeals(actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; cleared?: number }>(
    "/api/escrow/reset", { mine: true, actor },
  );
}
