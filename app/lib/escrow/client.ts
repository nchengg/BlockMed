// Client-side helpers for the escrow lifecycle API (app/api/escrow/*). Each mutating
// call attaches the ACTOR CONTEXT derived from the signed-in account (useAuth), which
// the server routes use for #27's soft party gating (lib/escrow/actor.ts).
//
// This is the seam between #27's account model and #25's on-chain wiring: the UI
// (components/dashboard/EscrowConsole.tsx) reads useAuth(), builds an ActorCtx, and
// passes it here — it never talks to the routes directly.
import type { Account, ClientHat } from "@/lib/authStore";
import type { BolFields, Verdict } from "@/lib/escrow/rules";
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
  terms?: DealTerms | null;
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

export function fetchStatus(): Promise<StatusResponse> {
  return fetch("/api/escrow/status", { cache: "no-store" }).then(r => r.json());
}

export function propose(terms: DealTerms, actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/propose", { ...terms, actor });
}

export function agree(actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; dealId?: string; txHash?: string }>("/api/escrow/agree", { actor });
}

export function fund(actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; approveHash?: string; depositHash?: string }>("/api/escrow/fund", { actor });
}

export function submitBol(fields: BolFields, actor: ActorCtx) {
  return post<Verdict & { ok: boolean; error?: string; txHash?: string; recordVerdictSkipped?: boolean }>(
    "/api/escrow/submit-bol",
    { ...fields, actor },
  );
}

export function release(actor: ActorCtx) {
  return post<{ ok: boolean; error?: string; txHash?: string }>("/api/escrow/release", { actor });
}

export function reset(actor: ActorCtx) {
  return post<{ ok: boolean; error?: string }>("/api/escrow/reset", { actor });
}
