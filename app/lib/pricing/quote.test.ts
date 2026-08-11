// Tests for fee quoting.
//
// The property that matters most, and the one every other test is really
// protecting: THE SELLER RECEIVES THE FULL ESCROW AMOUNT. Fees are added on top
// for the buyer, never netted from the seller's proceeds. If that ever stops
// holding, a seller is short-paid, so it is asserted on every scenario rather
// than once.
import { describe, it, expect } from "vitest";
import {
  quoteDeal, toMinor, fromMinor, platformFeesTotal, quoteExpired,
  PRICE_BOOK_V1, PricingError, QUOTE_TTL_DAYS, type PriceBook,
} from "./quote";

const T0 = new Date("2026-08-11T12:00:00.000Z");

describe("minor-unit conversion (no floats)", () => {
  it("round-trips whole and fractional amounts", () => {
    for (const v of ["0.01", "1.00", "250.00", "2500.00", "999999.99"]) {
      expect(fromMinor(toMinor(v)!)).toBe(v);
    }
  });

  it("accepts up to 6dp, as USDC allows", () => {
    expect(toMinor("1.000001")).toBe(1_000_001n);
  });

  it("rejects malformed input rather than coercing it", () => {
    for (const v of ["", "abc", "1.2345678", "1,000", "-5", "1e3", " "]) {
      expect(toMinor(v)).toBeNull();
    }
  });

  // 0.1 + 0.2 !== 0.3 in binary floating point. This is why the module uses
  // bigint throughout, and this test is the reminder.
  it("adds fractional amounts exactly", () => {
    const sum = toMinor("0.10")! + toMinor("0.20")!;
    expect(fromMinor(sum)).toBe("0.30");
  });
});

describe("service fee", () => {
  it("is 0.9% on a large deal", () => {
    const q = quoteDeal("100000.00", {}, PRICE_BOOK_V1, T0);
    expect(q.serviceFeeUsdc).toBe("900.00"); // 0.9% of 100,000
  });

  // The minimum is what makes small deals viable to service at all.
  it("floors at the 250 minimum when the percentage is smaller", () => {
    const q = quoteDeal("1000.00", {}, PRICE_BOOK_V1, T0);
    expect(q.serviceFeeUsdc).toBe("250.00"); // 0.9% would be 9.00
  });

  it("crosses from minimum to percentage at the break-even point", () => {
    // 250 / 0.009 = 27,777.78 — below it the minimum wins, above it the percentage.
    expect(quoteDeal("27000.00", {}, PRICE_BOOK_V1, T0).serviceFeeUsdc).toBe("250.00");
    expect(quoteDeal("28000.00", {}, PRICE_BOOK_V1, T0).serviceFeeUsdc).toBe("252.00");
  });

  it("rounds half-up to the cent", () => {
    // 0.9% of 1,234.56 = 11.11104 → 11.11
    const q = quoteDeal("1234.56", {}, { ...PRICE_BOOK_V1, serviceFeeMinimum: "0.00" }, T0);
    expect(q.serviceFeeUsdc).toBe("11.11");
  });
});

describe("optional, event-driven charges", () => {
  const book: PriceBook = { ...PRICE_BOOK_V1, serviceFeeMinimum: "0.00" };

  it("are absent unless the event happened", () => {
    const q = quoteDeal("100000.00", {}, book, T0);
    expect(q.manualReviewFeeUsdc).toBe("0.00");
    expect(q.expeditedFeeUsdc).toBe("0.00");
    expect(q.disputeFeeUsdc).toBe("0.00");
    expect(q.lines.map(l => l.code)).not.toContain("manual_review");
  });

  it("are added when they do", () => {
    const q = quoteDeal("100000.00", { manualReview: true, expedited: true, dispute: true }, book, T0);
    expect(q.manualReviewFeeUsdc).toBe("300.00");
    expect(q.expeditedFeeUsdc).toBe("150.00");
    expect(q.disputeFeeUsdc).toBe("200.00");
    // 100,000 escrow + 900 service + 300 + 150 + 200 + 0 tax
    expect(q.totalCustomerPaysUsdc).toBe("101550.00");
  });
});

describe("first-deal discount", () => {
  it("halves the service fee and nothing else", () => {
    const q = quoteDeal("100000.00", { firstDeal: true, manualReview: true }, PRICE_BOOK_V1, T0);
    expect(q.serviceFeeUsdc).toBe("900.00"); // the fee itself is unchanged…
    expect(q.discountUsdc).toBe("450.00"); // …and the discount is shown separately
    expect(q.manualReviewFeeUsdc).toBe("300.00"); // optional charges are NOT discounted
    // 100,000 + 900 + 300 − 450
    expect(q.totalCustomerPaysUsdc).toBe("100750.00");
  });

  it("applies to the minimum fee too", () => {
    const q = quoteDeal("1000.00", { firstDeal: true }, PRICE_BOOK_V1, T0);
    expect(q.discountUsdc).toBe("125.00"); // half of the 250 minimum
  });

  it("does not appear as a line when not applicable", () => {
    const q = quoteDeal("1000.00", {}, PRICE_BOOK_V1, T0);
    expect(q.lines.map(l => l.code)).not.toContain("discount");
  });
});

describe("tax", () => {
  // "We did not charge tax" and "we have not considered tax" are different
  // statements, and a buyer deserves the first.
  it("is always a line, even at zero", () => {
    const q = quoteDeal("1000.00", {}, PRICE_BOOK_V1, T0);
    expect(q.taxUsdc).toBe("0.00");
    expect(q.lines.map(l => l.code)).toContain("tax");
    expect(q.taxStatus).toBe("not_assessed");
  });

  it("adds to the buyer's total and records its jurisdiction", () => {
    const q = quoteDeal("1000.00", { taxUsdc: "50.00", taxStatus: "assessed", taxJurisdiction: "GB" }, PRICE_BOOK_V1, T0);
    expect(q.totalCustomerPaysUsdc).toBe("1300.00"); // 1000 + 250 + 50
    expect(q.taxJurisdiction).toBe("GB");
  });
});

// ── the invariant ───────────────────────────────────────────────────────────
describe("the seller always receives the full escrow amount", () => {
  const scenarios: [string, Parameters<typeof quoteDeal>[1]][] = [
    ["no extras", {}],
    ["every optional charge", { manualReview: true, expedited: true, dispute: true }],
    ["first-deal discount", { firstDeal: true }],
    ["tax applied", { taxUsdc: "99.99", taxStatus: "assessed" }],
    ["everything at once", { manualReview: true, expedited: true, dispute: true, firstDeal: true, taxUsdc: "12.34" }],
  ];

  for (const [label, opts] of scenarios) {
    it(`holds with ${label}`, () => {
      for (const amount of ["5.00", "1000.00", "27777.78", "100000.00"]) {
        const q = quoteDeal(amount, opts, PRICE_BOOK_V1, T0);
        expect(q.sellerReceivesUsdc).toBe(q.escrowAmountUsdc);
        // And the buyer always pays at least the escrow amount — fees add, never subtract.
        expect(toMinor(q.totalCustomerPaysUsdc)!).toBeGreaterThanOrEqual(toMinor(q.escrowAmountUsdc)!);
      }
    });
  }

  it("means platform fees are exactly the difference the buyer pays", () => {
    const q = quoteDeal("100000.00", { manualReview: true }, PRICE_BOOK_V1, T0);
    expect(platformFeesTotal(q)).toBe("1200.00"); // 900 service + 300 manual
  });
});

describe("the arithmetic ties out", () => {
  it("total = escrow + fees + tax − discount, line by line", () => {
    const q = quoteDeal("50000.00", {
      manualReview: true, expedited: true, dispute: true, firstDeal: true, taxUsdc: "25.00",
    }, PRICE_BOOK_V1, T0);

    const sum =
      toMinor(q.escrowAmountUsdc)! +
      toMinor(q.serviceFeeUsdc)! +
      toMinor(q.manualReviewFeeUsdc)! +
      toMinor(q.expeditedFeeUsdc)! +
      toMinor(q.disputeFeeUsdc)! +
      toMinor(q.taxUsdc)! -
      toMinor(q.discountUsdc)!;

    expect(fromMinor(sum)).toBe(q.totalCustomerPaysUsdc);
  });

  it("the displayed lines sum to the displayed total", () => {
    const q = quoteDeal("2500.00", { manualReview: true, firstDeal: true, taxUsdc: "10.00" }, PRICE_BOOK_V1, T0);
    const sum = q.lines.reduce((acc, l) => acc + toMinor(l.amountUsdc.replace("-", ""))! * (l.amountUsdc.startsWith("-") ? -1n : 1n), 0n);
    expect(fromMinor(sum)).toBe(q.totalCustomerPaysUsdc);
  });
});

describe("quote validity", () => {
  it("stamps the pricing version so historical deals are never re-priced", () => {
    expect(quoteDeal("1000.00", {}, PRICE_BOOK_V1, T0).pricingVersion).toBe("2026-08-v1");
  });

  it("expires after the TTL", () => {
    const q = quoteDeal("1000.00", {}, PRICE_BOOK_V1, T0);
    const justInside = new Date(T0.getTime() + (QUOTE_TTL_DAYS * 86_400_000) - 1000);
    const justOutside = new Date(T0.getTime() + (QUOTE_TTL_DAYS * 86_400_000) + 1000);
    expect(quoteExpired(q, justInside)).toBe(false);
    expect(quoteExpired(q, justOutside)).toBe(true);
  });

  it("is deterministic — same inputs, identical quote", () => {
    const a = quoteDeal("1234.56", { manualReview: true, firstDeal: true }, PRICE_BOOK_V1, T0);
    const b = quoteDeal("1234.56", { manualReview: true, firstDeal: true }, PRICE_BOOK_V1, T0);
    expect(a).toEqual(b);
  });

  it("prices from the book it is given, not the current default", () => {
    const oldBook: PriceBook = { ...PRICE_BOOK_V1, version: "2026-01-v0", serviceFeeBps: 50, serviceFeeMinimum: "100.00" };
    const q = quoteDeal("100000.00", {}, oldBook, T0);
    expect(q.serviceFeeUsdc).toBe("500.00");
    expect(q.pricingVersion).toBe("2026-01-v0");
  });
});

describe("rejects nonsense rather than guessing", () => {
  it("refuses a malformed amount", () => {
    expect(() => quoteDeal("not-money", {}, PRICE_BOOK_V1, T0)).toThrow(PricingError);
  });

  it("refuses zero and negative amounts", () => {
    expect(() => quoteDeal("0.00", {}, PRICE_BOOK_V1, T0)).toThrow(PricingError);
    expect(() => quoteDeal("-100.00", {}, PRICE_BOOK_V1, T0)).toThrow(PricingError);
  });
});
