// Tests for the onboarding gate on deal acceptance.
//
// The rule: BOTH parties must have completed onboarding before a deal binds
// them. Checking only the accepter would let an onboarded company transact with
// one that never onboarded, which defeats the purpose.
import { describe, it, expect, vi, beforeEach } from "vitest";

const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ prisma: { account: { findMany: (a: unknown) => findMany(a) } } }));

const { assertPartiesCanTrade } = await import("./gate");

const deal = (buyerId?: string, sellerId?: string) =>
  ({
    parties: {
      buyer: buyerId ? { accountId: buyerId, hat: "buyer" } : undefined,
      seller: sellerId ? { accountId: sellerId, hat: "seller" } : undefined,
    },
  }) as never;

const account = (id: string, companyName: string, over: Record<string, unknown> = {}) => ({
  id,
  companyName,
  kybStatus: "attested",
  signatoryPassportExpiry: new Date("2030-01-01"),
  peopleOfControl: [{ id: "p1" }],
  registrationNumber: "123",
  companyType: "Private limited company",
  jurisdiction: "England and Wales",
  issuingAuthority: "Companies House",
  incorporationDate: new Date("2020-01-01"),
  signatoryName: "A",
  signatoryNationality: "British",
  signatoryDob: new Date("1990-01-01"),
  fundsSourceNature: "Trade",
  fundsSourceCountry: "UK",
  declaredNotCriminalFunds: true,
  declaredNoSanctions: true,
  ...over,
});

beforeEach(() => findMany.mockReset());

describe("assertPartiesCanTrade", () => {
  it("allows a deal when both parties are attested", async () => {
    findMany.mockResolvedValue([account("b", "Buyer Co"), account("s", "Seller Co")]);
    expect(await assertPartiesCanTrade(deal("b", "s"))).toEqual({ ok: true });
  });

  it("blocks when the accepter's counterparty is incomplete", async () => {
    findMany.mockResolvedValue([
      account("b", "Buyer Co"),
      account("s", "Seller Co", { kybStatus: "incomplete", peopleOfControl: [] }),
    ]);
    const r = await assertPartiesCanTrade(deal("b", "s"));
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.blocked).toEqual(["Seller Co"]);
    expect(r.error).toContain("onboarding incomplete");
  });

  it("blocks when both are incomplete and names both", async () => {
    findMany.mockResolvedValue([
      account("b", "Buyer Co", { kybStatus: "incomplete", peopleOfControl: [] }),
      account("s", "Seller Co", { kybStatus: "incomplete", peopleOfControl: [] }),
    ]);
    const r = await assertPartiesCanTrade(deal("b", "s"));
    if (r.ok) throw new Error("unreachable");
    expect(r.blocked).toEqual(["Buyer Co", "Seller Co"]);
  });

  // Attested but expired: a different problem needing a different fix, so it
  // must not be reported as "incomplete".
  it("blocks an expired passport with its own message", async () => {
    findMany.mockResolvedValue([
      account("b", "Buyer Co"),
      account("s", "Seller Co", { signatoryPassportExpiry: new Date("2020-01-01") }),
    ]);
    const r = await assertPartiesCanTrade(deal("b", "s"));
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toContain("passport has expired");
    expect(r.error).not.toContain("onboarding incomplete");
  });

  // Invited-by-name counterparties have no account to onboard yet.
  it("skips parties with no account rather than blocking the invite flow", async () => {
    expect(await assertPartiesCanTrade(deal(undefined, undefined))).toEqual({ ok: true });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("still checks the party that does have an account", async () => {
    findMany.mockResolvedValue([account("b", "Buyer Co", { kybStatus: "incomplete", peopleOfControl: [] })]);
    const r = await assertPartiesCanTrade(deal("b", undefined));
    expect(r.ok).toBe(false);
  });

  it("counts the outstanding items in the message", async () => {
    findMany.mockResolvedValue([
      account("b", "Buyer Co"),
      account("s", "Seller Co", {
        kybStatus: "incomplete",
        peopleOfControl: [],
        registrationNumber: null,
      }),
    ]);
    const r = await assertPartiesCanTrade(deal("b", "s"));
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/\d+ items? outstanding/);
  });
});
