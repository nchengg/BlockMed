// Server-side ACTOR CONTEXT + role gating for the escrow lifecycle routes.
//
// This is the #27 (account-first auth) adaptation of #25's anonymous single-actor
// flow. Each lifecycle route now expects the client to attach an `actor` describing
// the signed-in account and its active client "hat" (see lib/escrow/client.ts,
// which reads it from useAuth()). The route then checks the action is appropriate
// for that party: propose = seller, agree/fund = buyer, verdict/release = the
// operator/platform side, reset = staff.
//
// ─────────────────────────────────────────────────────────────────────────────
// TODO(integration: auth Q18) — THIS IS A SOFT, CLIENT-SUPPLIED GUARD, NOT A
// SECURITY BOUNDARY. Exactly like #27's RequireParty (view separation for a demo),
// the actor is whatever the client sends — it is NOT a verified identity. Real
// enforcement must resolve the account server-side from a verified credential /
// signature (SIWE vs JWT — TRD Q18, still open) before it can be trusted. Until
// then these checks only keep the demo's parties honest and produce a truthful
// audit trail; they must NOT be relied on for authorisation.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import type { PartyRef } from "./store";

export type ActorType = "admin" | "developer" | "client";
export type ActorHat = "buyer" | "seller" | "platform";

export interface Actor {
  accountId?: string;
  displayName?: string;
  type?: ActorType;
  hat?: ActorHat | null;
}

// Pulls the actor context out of a request body. Anonymous calls (no actor) are
// tolerated so the routes still work without the client wiring — they just skip
// the party check and record an anonymous audit entry.
export function readActor(body: unknown): Actor | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { actor?: unknown }).actor;
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Actor;
  return {
    accountId: typeof a.accountId === "string" ? a.accountId : undefined,
    displayName: typeof a.displayName === "string" ? a.displayName : undefined,
    type: a.type,
    hat: a.hat ?? null,
  };
}

// Narrows an Actor to a PartyRef for the audit trail / store.
export function partyRef(actor: Actor | null, hat: PartyRef["hat"]): PartyRef {
  return { accountId: actor?.accountId, displayName: actor?.displayName, hat };
}

// A client account must be wearing the given hat. `null` actor (anonymous) is
// allowed through — the check is best-effort until server auth lands (Q18).
export function requireHat(actor: Actor | null, hat: ActorHat): NextResponse | null {
  if (!actor || actor.type === undefined) return null; // anonymous — soft-allow
  if (actor.type !== "client") {
    return forbidden(`This action is a ${hat} action — sign in as a client with the ${hat} hat.`);
  }
  if (actor.hat && actor.hat !== hat) {
    return forbidden(`You are acting as "${actor.hat}". Switch to the ${hat} hat to do this.`);
  }
  return null;
}

// A staff account (admin or developer). Used for the demo reset control.
export function requireStaff(actor: Actor | null): NextResponse | null {
  if (!actor || actor.type === undefined) return null; // anonymous — soft-allow
  if (actor.type !== "admin" && actor.type !== "developer") {
    return forbidden("Only an administrator or developer may reset the demo.");
  }
  return null;
}

// The operator/platform side that fronts the releaser key. Admin OR a client
// wearing the platform hat. (The actual releaser SIGNING stays server-side and
// localhost-only — see submit-bol/route.ts — this only gates who may trigger it.)
export function requireOperator(actor: Actor | null): NextResponse | null {
  if (!actor || actor.type === undefined) return null; // anonymous — soft-allow
  const isStaff = actor.type === "admin" || actor.type === "developer";
  const isPlatform = actor.type === "client" && actor.hat === "platform";
  if (!isStaff && !isPlatform) {
    return forbidden("Recording the verdict is an operator/platform capability.");
  }
  return null;
}

function forbidden(error: string): NextResponse {
  // 403 with a clear, party-facing message. Marked soft so the caller/UI knows
  // this is demo-level gating, not real authorization (Q18).
  return NextResponse.json({ ok: false, error, soft: true }, { status: 403 });
}
