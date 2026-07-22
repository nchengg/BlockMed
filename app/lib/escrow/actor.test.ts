// Unit tests for the escrow route guards (requireHat / requireStaff /
// requireOperator) plus the actor-context helpers (readActor / partyRef).
//
// These are SOFT gates (see the header of actor.ts, TODO Q18): each guard returns
// `null` to allow, or a 403 NextResponse with the documented shape
// `{ ok: false, error, soft: true }` to reject. Anonymous callers (no actor / no
// type) are deliberately soft-allowed through. The tests pin exactly that contract.
import { describe, it, expect } from "vitest";
import {
  requireHat,
  requireStaff,
  requireOperator,
  readActor,
  partyRef,
  type Actor,
} from "./actor";

// A guard "passes" iff it returns null. Assert the allow contract.
async function expectAllow(res: Awaited<ReturnType<typeof requireHat>>) {
  expect(res).toBeNull();
}

// A guard "rejects" iff it returns the documented soft-403 shape.
async function expectSoftForbidden(res: Awaited<ReturnType<typeof requireHat>>) {
  expect(res).not.toBeNull();
  expect(res!.status).toBe(403);
  const body = (await res!.json()) as { ok: boolean; error: string; soft: boolean };
  expect(body.ok).toBe(false);
  expect(body.soft).toBe(true); // marked soft — demo gating, not real authz
  expect(typeof body.error).toBe("string");
  expect(body.error.length).toBeGreaterThan(0);
}

describe("requireHat — a client must be wearing the required hat", () => {
  interface Row {
    name: string;
    actor: Actor | null;
    hat: "buyer" | "seller" | "platform";
    allow: boolean;
  }

  const rows: Row[] = [
    // Anonymous / untyped → soft-allowed (best-effort until server auth lands).
    { name: "null actor is soft-allowed", actor: null, hat: "buyer", allow: true },
    { name: "actor with no type is soft-allowed", actor: { hat: "buyer" }, hat: "seller", allow: true },

    // Correct hat → allowed.
    { name: "client wearing buyer hat may do a buyer action", actor: { type: "client", hat: "buyer" }, hat: "buyer", allow: true },
    { name: "client wearing seller hat may do a seller action", actor: { type: "client", hat: "seller" }, hat: "seller", allow: true },

    // Wrong hat → rejected.
    { name: "client wearing seller hat may NOT do a buyer action", actor: { type: "client", hat: "seller" }, hat: "buyer", allow: false },
    { name: "client wearing platform hat may NOT do a buyer action", actor: { type: "client", hat: "platform" }, hat: "buyer", allow: false },

    // Dual-hat / unset-hat: a client that has not picked a hat (null) is
    // soft-allowed for EITHER party action — documented leniency of the soft gate.
    { name: "hatless client is allowed a buyer action", actor: { type: "client", hat: null }, hat: "buyer", allow: true },
    { name: "hatless client is allowed a seller action", actor: { type: "client", hat: null }, hat: "seller", allow: true },

    // Staff are not clients → a hat action is not theirs.
    { name: "admin may NOT perform a client hat action", actor: { type: "admin" }, hat: "buyer", allow: false },
    { name: "developer may NOT perform a client hat action", actor: { type: "developer", hat: "buyer" }, hat: "buyer", allow: false },
  ];

  it.each(rows)("$name", async ({ actor, hat, allow }) => {
    const res = requireHat(actor, hat);
    if (allow) await expectAllow(res);
    else await expectSoftForbidden(res);
  });
});

describe("requireStaff — admin or developer only (demo reset)", () => {
  interface Row {
    name: string;
    actor: Actor | null;
    allow: boolean;
  }

  const rows: Row[] = [
    { name: "null actor is soft-allowed", actor: null, allow: true },
    { name: "untyped actor is soft-allowed", actor: {}, allow: true },
    { name: "admin is allowed", actor: { type: "admin" }, allow: true },
    { name: "developer is allowed", actor: { type: "developer" }, allow: true },
    { name: "client (buyer hat) is rejected", actor: { type: "client", hat: "buyer" }, allow: false },
    { name: "client (platform hat) is rejected", actor: { type: "client", hat: "platform" }, allow: false },
  ];

  it.each(rows)("$name", async ({ actor, allow }) => {
    const res = requireStaff(actor);
    if (allow) await expectAllow(res);
    else await expectSoftForbidden(res);
  });
});

describe("requireOperator — staff OR a client on the platform hat", () => {
  interface Row {
    name: string;
    actor: Actor | null;
    allow: boolean;
  }

  const rows: Row[] = [
    { name: "null actor is soft-allowed", actor: null, allow: true },
    { name: "untyped actor is soft-allowed", actor: {}, allow: true },
    { name: "admin is allowed", actor: { type: "admin" }, allow: true },
    { name: "developer is allowed", actor: { type: "developer" }, allow: true },
    { name: "client wearing platform hat is allowed", actor: { type: "client", hat: "platform" }, allow: true },
    { name: "client wearing buyer hat is rejected", actor: { type: "client", hat: "buyer" }, allow: false },
    { name: "client wearing seller hat is rejected", actor: { type: "client", hat: "seller" }, allow: false },
    { name: "hatless client is rejected (needs the platform hat)", actor: { type: "client", hat: null }, allow: false },
  ];

  it.each(rows)("$name", async ({ actor, allow }) => {
    const res = requireOperator(actor);
    if (allow) await expectAllow(res);
    else await expectSoftForbidden(res);
  });
});

describe("readActor — parses the client-supplied actor context", () => {
  it("returns null for non-object / missing actor bodies", () => {
    expect(readActor(null)).toBeNull();
    expect(readActor("nope")).toBeNull();
    expect(readActor({})).toBeNull(); // no `actor` key
    expect(readActor({ actor: null })).toBeNull();
    expect(readActor({ actor: 42 })).toBeNull();
  });

  it("extracts the known fields and defaults hat to null", () => {
    const a = readActor({ actor: { accountId: "acc_1", displayName: "Dana", type: "client", hat: "buyer" } });
    expect(a).toEqual({ accountId: "acc_1", displayName: "Dana", type: "client", hat: "buyer" });
  });

  it("coerces a missing hat to null (not undefined)", () => {
    const a = readActor({ actor: { accountId: "acc_2", type: "client" } });
    expect(a?.hat).toBeNull();
  });

  it("drops non-string accountId / displayName", () => {
    const a = readActor({ actor: { accountId: 123, displayName: {}, type: "admin" } });
    expect(a?.accountId).toBeUndefined();
    expect(a?.displayName).toBeUndefined();
    expect(a?.type).toBe("admin");
  });

  it("round-trips through the guards: parsed client-buyer passes requireHat(buyer)", async () => {
    const a = readActor({ actor: { type: "client", hat: "buyer", accountId: "acc_3" } });
    await expectAllow(requireHat(a, "buyer"));
    await expectSoftForbidden(requireHat(a, "seller"));
  });
});

describe("partyRef — narrows an actor to an audit-trail PartyRef", () => {
  it("carries accountId + displayName and stamps the given hat", () => {
    const actor: Actor = { accountId: "acc_9", displayName: "Sam", type: "client", hat: "seller" };
    expect(partyRef(actor, "seller")).toEqual({ accountId: "acc_9", displayName: "Sam", hat: "seller" });
  });

  it("tolerates a null actor (anonymous) and still records the hat", () => {
    expect(partyRef(null, "buyer")).toEqual({ accountId: undefined, displayName: undefined, hat: "buyer" });
  });
});
