// Unit tests for per-deal role derivation (roles.ts).
//
// This module decides WHO MAY DO WHAT on every deal — accept, fund, submit
// documents, approve release, refund all gate on it — so it gets the same
// exhaustive treatment as the grading engine. A bug here is an authorisation
// bug: the wrong party acting, or the right party locked out.
//
// The governing idea: buyer/seller is a position IN A DEAL, never a property of
// an account. The same account can be buyer on one deal and seller on the next.
import { describe, it, expect } from "vitest";
import {
  roleInDeal, roleLabel, counterpartyOf, denyIfWrongRole,
  pendingOnRole, pendingLabel,
} from "./roles";
import type { DealRecord } from "./store";

type Parties = DealRecord["parties"];

const SOLARIS = { accountId: "acc-seller", displayName: "Solaris Textiles Co.", hat: "seller" as const };
const MERIDIAN = { accountId: "acc-buyer", displayName: "Meridian Imports Ltd.", hat: "buyer" as const };

/** Solaris sells to Meridian. */
const deal = (over: Partial<Parties> = {}): { parties: Parties } => ({
  parties: { seller: SOLARIS, buyer: MERIDIAN, ...over },
});

describe("roleInDeal — the viewer's side of THIS deal", () => {
  it("identifies the seller by account id", () => {
    expect(roleInDeal(deal(), "acc-seller")).toBe("seller");
  });

  it("identifies the buyer by account id", () => {
    expect(roleInDeal(deal(), "acc-buyer")).toBe("buyer");
  });

  it("returns null for an account that is not a party", () => {
    expect(roleInDeal(deal(), "acc-both")).toBeNull();
  });

  it("returns null when no account id is supplied (anonymous)", () => {
    expect(roleInDeal(deal(), undefined)).toBeNull();
    expect(roleInDeal(deal(), "")).toBeNull();
  });

  it("does not match a party recorded without an account id", () => {
    // An invited counterparty who has not joined yet has a name but no id;
    // an anonymous caller must not be mistaken for them.
    const invited = deal({ buyer: { displayName: "Not Yet Joined", hat: "buyer" } });
    expect(roleInDeal(invited, undefined)).toBeNull();
    expect(roleInDeal(invited, "acc-buyer")).toBeNull();
    expect(roleInDeal(invited, "acc-seller")).toBe("seller");
  });

  it("THE SAME ACCOUNT gets different roles on different deals", () => {
    // The whole point of the model: Solaris sells here, buys there.
    const sells = deal();
    const buys = { parties: { seller: MERIDIAN, buyer: SOLARIS } };
    expect(roleInDeal(sells, "acc-seller")).toBe("seller");
    expect(roleInDeal(buys, "acc-seller")).toBe("buyer");
  });

  it("resolves buyer-first when one account is recorded on BOTH sides", () => {
    // A legacy/self-dealing record. Documented rather than endorsed: the check
    // order decides, and buyer wins. Callers should not create such deals —
    // create-deal rejects naming yourself as counterparty.
    const both = { parties: { seller: SOLARIS, buyer: { ...SOLARIS, hat: "buyer" as const } } };
    expect(roleInDeal(both, "acc-seller")).toBe("buyer");
  });

  it("tolerates a deal with no parties recorded at all", () => {
    expect(roleInDeal({ parties: {} }, "acc-seller")).toBeNull();
  });
});

describe("counterpartyOf — the other side, from the viewer's perspective", () => {
  it("shows the seller to the buyer and vice versa", () => {
    expect(counterpartyOf(deal(), "buyer")).toBe("Solaris Textiles Co.");
    expect(counterpartyOf(deal(), "seller")).toBe("Meridian Imports Ltd.");
  });

  it("falls back to a dash for a non-party viewer", () => {
    expect(counterpartyOf(deal(), null)).toBe("—");
  });

  it("falls back to a dash when the other side has no display name", () => {
    expect(counterpartyOf(deal({ seller: { hat: "seller" } }), "buyer")).toBe("—");
  });
});

describe("roleLabel", () => {
  it("labels each side and the non-party case", () => {
    expect(roleLabel("buyer")).toBe("You are the buyer");
    expect(roleLabel("seller")).toBe("You are the seller");
    expect(roleLabel(null)).toBe("Not a party");
  });
});

describe("denyIfWrongRole — the authorisation gate the routes call", () => {
  const REASON = "You are the seller on this deal — the buyer funds the escrow.";

  it("allows the required role", () => {
    expect(denyIfWrongRole(deal(), "acc-buyer", "buyer", REASON)).toBeNull();
    expect(denyIfWrongRole(deal(), "acc-seller", "seller", "x")).toBeNull();
  });

  it("denies the opposite party, returning the reason", () => {
    expect(denyIfWrongRole(deal(), "acc-seller", "buyer", REASON)).toBe(REASON);
  });

  it("ALLOWS a non-party so the caller can fall back to its hat check", () => {
    // Deliberate: routes are shared with the main dashboard, whose users are not
    // recorded parties. Returning null here means "no opinion", not "authorised" —
    // the route then applies requireHat.
    expect(denyIfWrongRole(deal(), "acc-both", "buyer", REASON)).toBeNull();
    expect(denyIfWrongRole(deal(), undefined, "buyer", REASON)).toBeNull();
  });

  it("denies consistently regardless of which side is required", () => {
    expect(denyIfWrongRole(deal(), "acc-buyer", "seller", "seller only")).toBe("seller only");
    expect(denyIfWrongRole(deal(), "acc-seller", "buyer", "buyer only")).toBe("buyer only");
  });
});

describe("pendingOnRole — who owes the acceptance", () => {
  it("is the counterparty of whoever created the deal", () => {
    expect(pendingOnRole({ createdByRole: "seller" })).toBe("buyer");
    expect(pendingOnRole({ createdByRole: "buyer" })).toBe("seller");
  });

  it("is null when the creator's side was never recorded", () => {
    // Legacy records predating createdByRole must not claim to await anyone.
    expect(pendingOnRole({})).toBeNull();
    expect(pendingOnRole({ createdByRole: undefined })).toBeNull();
  });
});

describe("pendingLabel — status written from the viewer's side", () => {
  const sellerCreated = { ...deal(), createdByRole: "seller" as const };
  const buyerCreated = { ...deal(), createdByRole: "buyer" as const };

  it("tells the party who must act that it awaits them", () => {
    expect(pendingLabel(sellerCreated, "buyer")).toBe("Awaiting your acceptance");
    expect(pendingLabel(buyerCreated, "seller")).toBe("Awaiting your acceptance");
  });

  it("tells the proposer whom it is pending on", () => {
    expect(pendingLabel(sellerCreated, "seller")).toBe("Pending Meridian Imports Ltd.");
    expect(pendingLabel(buyerCreated, "buyer")).toBe("Pending Solaris Textiles Co.");
  });

  it("degrades to a generic label for a viewer with no role", () => {
    expect(pendingLabel(sellerCreated, null)).toBe("Pending acceptance");
  });

  it("degrades to a generic label when the counterparty has no name", () => {
    // Seller created it, so it is pending the BUYER — and here the buyer (an
    // invited counterparty who has not joined) has no display name yet.
    const noName = { parties: { seller: SOLARIS, buyer: { hat: "buyer" as const } }, createdByRole: "seller" as const };
    expect(pendingLabel(noName, "seller")).toBe("Pending acceptance");
  });

  it("is Draft when no creator side is recorded", () => {
    expect(pendingLabel(deal(), "buyer")).toBe("Draft");
  });

  it("never claims to await a viewer who is not the pending party", () => {
    // The proposer must never see "Awaiting your acceptance" on their own deal.
    expect(pendingLabel(sellerCreated, "seller")).not.toContain("your acceptance");
    expect(pendingLabel(buyerCreated, "buyer")).not.toContain("your acceptance");
  });
});
