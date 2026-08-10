// Tests for KYB completeness and the passport-expiry hold.
//
// The rules being pinned down: every required field must be present, both AML
// declarations must be positively affirmed (never defaulted), at least one
// beneficial owner must be named, and an expired signatory passport blocks
// trading even when everything else is complete.
import { describe, it, expect } from "vitest";
import {
  kybGaps, isKybComplete, passportExpired, canTrade,
  isControlCondition, controlConditionLabel, CONTROL_CONDITIONS,
} from "./psc";

const complete = {
  registrationNumber: "12345678",
  companyType: "Private limited company",
  jurisdiction: "England and Wales",
  issuingAuthority: "Companies House",
  incorporationDate: new Date("2020-01-15"),
  signatoryName: "Jane Smith",
  signatoryNationality: "British",
  signatoryDob: new Date("1985-03-20"),
  signatoryPassportExpiry: new Date("2030-06-01"),
  fundsSourceNature: "Textile wholesale",
  fundsSourceCountry: "United Kingdom",
  declaredNotCriminalFunds: true,
  declaredNoSanctions: true,
};

describe("kybGaps", () => {
  it("reports no gaps when everything is supplied", () => {
    expect(kybGaps(complete, 1)).toEqual([]);
    expect(isKybComplete(complete, 1)).toBe(true);
  });

  it("lists every missing field on an empty account", () => {
    const gaps = kybGaps({}, 0);
    // 11 required fields + 2 declarations + 1 PSC
    expect(gaps).toHaveLength(14);
    expect(gaps.map(g => g.field)).toContain("registrationNumber");
    expect(gaps.map(g => g.field)).toContain("peopleOfControl");
  });

  it("treats whitespace and empty strings as missing", () => {
    const gaps = kybGaps({ ...complete, registrationNumber: "   " }, 1);
    expect(gaps.map(g => g.field)).toEqual(["registrationNumber"]);
  });

  // The declarations are POCA 2002 / MLR 2017 obligations — they must be
  // affirmed, so `false` and `undefined` are both incomplete.
  it("requires both AML declarations to be affirmed", () => {
    expect(kybGaps({ ...complete, declaredNotCriminalFunds: false }, 1))
      .toEqual([{ field: "declaredNotCriminalFunds", label: expect.any(String) }]);
    expect(kybGaps({ ...complete, declaredNoSanctions: false }, 1))
      .toEqual([{ field: "declaredNoSanctions", label: expect.any(String) }]);
    expect(kybGaps({ ...complete, declaredNoSanctions: undefined }, 1)).toHaveLength(1);
  });

  it("requires at least one person of significant control", () => {
    const gaps = kybGaps(complete, 0);
    expect(gaps.map(g => g.field)).toEqual(["peopleOfControl"]);
  });

  it("accepts several people of control", () => {
    expect(isKybComplete(complete, 3)).toBe(true);
  });
});

describe("passportExpired", () => {
  const now = new Date("2026-08-05");

  it("is false for a future expiry", () => {
    expect(passportExpired(new Date("2030-01-01"), now)).toBe(false);
  });

  it("is true for a past expiry", () => {
    expect(passportExpired(new Date("2026-08-04"), now)).toBe(true);
  });

  it("is false when not supplied — that is a completeness gap, not a hold", () => {
    expect(passportExpired(null, now)).toBe(false);
    expect(passportExpired(undefined, now)).toBe(false);
    expect(passportExpired("", now)).toBe(false);
  });

  it("ignores an unparseable date rather than throwing", () => {
    expect(passportExpired("not-a-date", now)).toBe(false);
  });

  it("accepts an ISO string as well as a Date", () => {
    expect(passportExpired("2026-08-04", now)).toBe(true);
  });
});

describe("canTrade", () => {
  it("allows an attested company with a valid passport", () => {
    expect(canTrade("attested", new Date("2030-01-01"))).toBe(true);
  });

  it("blocks an incomplete company", () => {
    expect(canTrade("incomplete", new Date("2030-01-01"))).toBe(false);
  });

  // Attested but expired: complete on paper, still not valid KYC evidence.
  it("blocks an attested company whose passport has expired", () => {
    expect(canTrade("attested", new Date("2020-01-01"))).toBe(false);
  });
});

describe("control conditions", () => {
  it("recognises the five statutory conditions", () => {
    expect(CONTROL_CONDITIONS).toHaveLength(5);
    for (const c of CONTROL_CONDITIONS) expect(isControlCondition(c.key)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isControlCondition("owns_a_bit")).toBe(false);
    expect(isControlCondition(undefined)).toBe(false);
  });

  it("labels a known key and falls back to the raw value", () => {
    expect(controlConditionLabel("shares_over_25")).toContain("25%");
    expect(controlConditionLabel("unknown")).toBe("unknown");
  });
});
