// Server-side ACTOR CONTEXT + role gating for the escrow lifecycle routes.
//
// THE ACTOR IS NOW RESOLVED FROM THE SESSION COOKIE, NEVER FROM THE REQUEST
// BODY. This closes Q18: previously each route trusted an `actor` object the
// client posted, so a bare curl with {"actor":{"accountId":"..."}} could act as
// any company — create deals, accept them, move money on-chain. The identity
// here is now whatever the httpOnly cookie resolves to server-side, and the
// client cannot read or forge it (lib/auth/session.ts).
//
// The per-deal role model is unchanged: which side you are on is still derived
// from the deal's recorded parties (roles.ts). Only the SOURCE of the account id
// changed — from "what the caller claimed" to "who the server says you are".
//
// Anonymous callers (no cookie) resolve to null. Routes treat that as
// unauthenticated: the deal-role checks in roles.ts deny anyone who is not a
// recorded party, so an unauthenticated caller can no longer act on a deal.
import { NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth/session";
import type { PartyRef } from "./store";

export type ActorType = "admin" | "developer" | "client";
export type ActorHat = "buyer" | "seller" | "platform";

export interface Actor {
  accountId?: string;
  displayName?: string;
  type?: ActorType;
  hat?: ActorHat | null;
}

/**
 * The acting account, resolved from the session cookie. Returns null when there
 * is no valid session.
 *
 * The `_body` parameter is ignored — it exists so the 17 call sites did not all
 * have to change shape in the same commit that closed the impersonation hole.
 * Anything the client sends about its own identity is discarded.
 */
export async function readActor(_body?: unknown): Promise<Actor | null> {
  const account = await getSessionAccount();
  if (!account) return null;
  return {
    accountId: account.id,
    displayName: account.companyName,
    type: account.type === "admin" || account.type === "developer" ? account.type : "client",
    // No hat: which side you are on is derived per deal (roles.ts).
    hat: null,
  };
}

/**
 * Every mutating route must have a signed-in caller. Returns a 401 when there
 * is no session, so an unauthenticated request cannot create records, move money
 * or write to the audit trail — it is the single gate that makes the others
 * meaningful, since a null actor would otherwise slip past checks that only
 * reject the WRONG identity rather than a missing one.
 */
export function requireAuth(actor: Actor | null): NextResponse | null {
  if (!actor?.accountId) {
    return NextResponse.json(
      { ok: false, error: "Sign in to do that." },
      { status: 401 },
    );
  }
  return null;
}

// Narrows an Actor to a PartyRef for the audit trail / store.
export function partyRef(actor: Actor | null, hat: PartyRef["hat"]): PartyRef {
  return { accountId: actor?.accountId, displayName: actor?.displayName, hat };
}

// A client account (not staff) may take party actions. The per-deal role check
// in roles.ts is what decides WHICH side — this only rejects staff accounts.
// A null actor is unauthenticated; roles.ts denies it from acting on any deal.
export function requireHat(actor: Actor | null, hat: ActorHat): NextResponse | null {
  if (!actor) return null; // unauthenticated — roles.ts denies deal actions
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
  if (!actor) return forbidden("Sign in to reset the demo.");
  if (actor.type !== "admin" && actor.type !== "developer") {
    return forbidden("Only an administrator or developer may reset the demo.");
  }
  return null;
}

// The operator/platform side that fronts the releaser key. Admin OR a client
// wearing the platform hat. (The actual releaser SIGNING stays server-side and
// localhost-only — see submit-bol/route.ts — this only gates who may trigger it.)
export function requireOperator(actor: Actor | null): NextResponse | null {
  if (!actor) return forbidden("Sign in to perform this operator action.");
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
