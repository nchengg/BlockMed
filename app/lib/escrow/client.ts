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
import type { BolFields, Verdict } from "@/lib/escrow/rules";
import type { Review, ObjectionGround } from "@/lib/escrow/review";
import type { DealRole } from "@/lib/escrow/roles";
import type { DealTerms } from "@/lib/escrow/store";

export type ActorCtx = {
  accountId?: string;
  displayName?: string;
  type?: "admin" | "developer" | "client";
  hat?: ClientHat | null;
};

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

export type TradingCompany = { accountId: string; displayName: string; email: string };

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
  createdAt: string | null;
};

export function fetchDeals(accountId: string | undefined): Promise<{ ok: boolean; deals: DealListItem[] }> {
  const q = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  return fetch(`/api/escrow/deals${q}`, { cache: "no-store" }).then(r => r.json());
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

export function submitBol(dealId: string, fields: BolFields, actor: ActorCtx) {
  return post<Verdict & {
    ok: boolean; error?: string; recordVerdictSkipped?: boolean;
    notice?: { noticeAt: string; windowEndsAt: string };
  }>("/api/escrow/submit-bol", { dealId, ...fields, actor });
}

// FR-10: buyer approves the noticed release (waives the remaining window).
export function approveRelease(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/approve-release", { dealId, actor });
}

// FR-11: buyer objects within the window, on a closed valid ground.
export function objectToRelease(dealId: string, ground: ObjectionGround, detail: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/object", { dealId, ground, detail, actor });
}

// FR-10: seller/platform finalises after the window expired with no objection.
export function finaliseRelease(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/finalise-release", { dealId, actor });
}

export function release(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/release", { dealId, actor });
}

export function reset(dealId: string, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/reset", { dealId, actor });
}
