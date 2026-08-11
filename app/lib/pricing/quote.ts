// Deterministic fee quoting.
//
// One module computes every fee, and the result is SNAPSHOTTED onto the deal at
// acceptance. Historical deals are never re-priced from the current price book:
// what the parties agreed is what they pay, even after the defaults change.
// That is why quotes carry a pricingVersion — it is the receipt for which book
// was in force.
//
// ─────────────────────────────────────────────────────────────────────────────
// The commercial invariant, from which everything else follows:
//
//     the seller receives the full escrow amount, always.
//
// Fees are added ON TOP for the buyer; they are never netted from the seller's
// proceeds. A seller who agreed 2,500 USDC receives 2,500 USDC. This is also
// why fees are a SEPARATE transfer rather than a slice of the escrow balance —
// the contract's release path pays the recorded seller the recorded amount, and
// nothing here may quietly reduce that.
// ─────────────────────────────────────────────────────────────────────────────
//
// All money is bigint in USDC minor units (6 dp). No floats anywhere: 0.9% of
// an odd amount is exactly the kind of arithmetic that silently loses a cent to
// binary floating point, and a cent that vanishes from a fee is a cent someone
// has to reconcile later.

/** USDC has 6 decimal places, so 1 USDC = 1_000_000 minor units. */
const MINOR = 1_000_000n;

/** Parse a decimal string to minor units. Returns null for anything malformed. */
export function toMinor(value: string): bigint | null {
  const m = /^\s*(\d+)(?:\.(\d{1,6}))?\s*$/.exec(value ?? "");
  if (!m) return null;
  return BigInt(m[1]) * MINOR + BigInt((m[2] ?? "").padEnd(6, "0") || "0");
}

/** Format minor units back to a 2dp decimal string for display and storage. */
export function fromMinor(minor: bigint): string {
  const neg = minor < 0n;
  const abs = neg ? -minor : minor;
  const whole = abs / MINOR;
  // Two decimal places, rounded half-up — USDC supports six, but money shown to
  // a user and totalled on an invoice is conventionally two.
  const remainder = abs % MINOR;
  const hundredths = (remainder * 100n + MINOR / 2n) / MINOR;
  const carry = hundredths / 100n;
  const frac = hundredths % 100n;
  return `${neg ? "-" : ""}${whole + carry}.${frac.toString().padStart(2, "0")}`;
}

/**
 * The price book. Deliberately data, not code: adjusting prices must not need a
 * schema change, a migration, or a contract redeploy.
 *
 * Every value is a decimal string in USDC, matching how amounts are written
 * everywhere else in the codebase.
 */
export type PriceBook = {
  version: string;
  serviceFeeBps: number; // basis points — 90 = 0.9%
  serviceFeeMinimum: string;
  manualReviewFee: string;
  expeditedReviewFee: string;
  disputeFee: string;
  firstDealDiscountBps: number; // applied to the SERVICE FEE only
};

/**
 * DEMO price book — the same structure with the decimal point moved.
 *
 * The real minimum (250 USDC) is proportionate to the $10K–$50K deals the
 * product targets, but Circle's testnet faucet gives 20 USDC every two hours,
 * so a real-priced fee makes any demo deal unaffordable. Scaling by 1000 keeps
 * every RULE identical — percentage, minimum, discount, rounding — while making
 * the numbers fit a faucet. The mechanism on show is the same one; only the
 * scale differs, which is the honest way to demo pricing without pretending the
 * production numbers are smaller than they are.
 */
export const PRICE_BOOK_DEMO: PriceBook = {
  version: "2026-08-demo",
  serviceFeeBps: 90, // 0.9%, unchanged
  serviceFeeMinimum: "0.25",
  manualReviewFee: "0.30",
  expeditedReviewFee: "0.15",
  disputeFee: "0.20",
  firstDealDiscountBps: 5000,
};

export const PRICE_BOOK_V1: PriceBook = {
  version: "2026-08-v1",
  serviceFeeBps: 90, // 0.9%
  serviceFeeMinimum: "250.00",
  manualReviewFee: "300.00",
  expeditedReviewFee: "150.00",
  disputeFee: "200.00",
  firstDealDiscountBps: 5000, // 50% off the service fee
};

/**
 * Charges that are event-driven rather than always applied.
 *
 * Manual review, expedited handling and disputes are things that HAPPEN to a
 * deal, so they are quoted only when they occur — not bundled into every deal
 * at creation and then argued about later.
 */
export type QuoteOptions = {
  manualReview?: boolean;
  expedited?: boolean;
  dispute?: boolean;
  /** 50% off the service fee, once per company. */
  firstDeal?: boolean;
  /** Explicit even when zero — tax is never silently absent. */
  taxUsdc?: string;
  taxJurisdiction?: string | null;
  taxStatus?: TaxStatus;
};

export type TaxStatus = "not_assessed" | "zero_rated" | "assessed";

export type FeeLine = {
  code: string;
  label: string;
  amountUsdc: string;
};

export type FeeQuote = {
  pricingVersion: string;
  quotedAt: string;
  quoteExpiresAt: string;

  escrowAmountUsdc: string;
  serviceFeeUsdc: string;
  manualReviewFeeUsdc: string;
  expeditedFeeUsdc: string;
  disputeFeeUsdc: string;
  discountUsdc: string;
  taxUsdc: string;

  /** What the buyer pays in total: escrow + fees + tax − discount. */
  totalCustomerPaysUsdc: string;
  /** Always exactly the escrow amount. The invariant, made explicit. */
  sellerReceivesUsdc: string;

  /** Itemised, in display order — the breakdown a buyer sees before signing. */
  lines: FeeLine[];

  feePayerRole: "buyer";
  taxStatus: TaxStatus;
  taxJurisdiction: string | null;
};

/** A quote is good for 7 days; past that the deal must be re-quoted. */
export const QUOTE_TTL_DAYS = 7;

export class PricingError extends Error {}

/**
 * Which price book is in force.
 *
 * PRICING_BOOK=demo scales the fees for faucet-funded testnet deals. The
 * default is the real book, so forgetting the variable bills at production
 * rates rather than silently under-charging.
 */
export function activeBook(): PriceBook {
  return process.env.PRICING_BOOK === "demo" ? PRICE_BOOK_DEMO : PRICE_BOOK_V1;
}

/**
 * Compute a quote. Pure: same inputs, same output, no clock or config reads
 * beyond what is passed in — which is what makes it testable and what makes a
 * stored quote reproducible.
 */
export function quoteDeal(
  escrowAmountUsdc: string,
  options: QuoteOptions = {},
  book: PriceBook = activeBook(),
  now: Date = new Date(),
): FeeQuote {
  const escrow = toMinor(escrowAmountUsdc);
  if (escrow === null) throw new PricingError(`Not a valid USDC amount: "${escrowAmountUsdc}"`);
  if (escrow <= 0n) throw new PricingError("Escrow amount must be greater than zero.");

  const minimum = toMinor(book.serviceFeeMinimum) ?? 0n;

  // Percentage fee, rounded half-up to the cent, then floored at the minimum.
  // The minimum is what makes small deals viable to service at all — 0.9% of a
  // 100 USDC deal would not cover the work.
  const pct = (escrow * BigInt(book.serviceFeeBps) + 5_000n) / 10_000n;
  const serviceFee = pct < minimum ? minimum : pct;

  const manual = options.manualReview ? (toMinor(book.manualReviewFee) ?? 0n) : 0n;
  const expedited = options.expedited ? (toMinor(book.expeditedReviewFee) ?? 0n) : 0n;
  const dispute = options.dispute ? (toMinor(book.disputeFee) ?? 0n) : 0n;

  // The discount applies to the SERVICE FEE only — never to the optional
  // charges, and never to tax.
  const discount = options.firstDeal
    ? (serviceFee * BigInt(book.firstDealDiscountBps) + 5_000n) / 10_000n
    : 0n;

  const tax = options.taxUsdc ? (toMinor(options.taxUsdc) ?? 0n) : 0n;

  const total = escrow + serviceFee + manual + expedited + dispute + tax - discount;

  const lines: FeeLine[] = [
    { code: "escrow", label: "Escrow amount (to seller)", amountUsdc: fromMinor(escrow) },
    { code: "service_fee", label: `Service fee (${(book.serviceFeeBps / 100).toFixed(2)}%${pct < minimum ? `, ${book.serviceFeeMinimum} minimum` : ""})`, amountUsdc: fromMinor(serviceFee) },
  ];
  if (manual > 0n) lines.push({ code: "manual_review", label: "Manual document review", amountUsdc: fromMinor(manual) });
  if (expedited > 0n) lines.push({ code: "expedited", label: "Expedited review", amountUsdc: fromMinor(expedited) });
  if (dispute > 0n) lines.push({ code: "dispute", label: "Dispute / amendment handling", amountUsdc: fromMinor(dispute) });
  if (discount > 0n) lines.push({ code: "discount", label: "First-deal discount (service fee)", amountUsdc: `-${fromMinor(discount)}` });
  // Tax is listed even at zero: "we did not charge tax" and "we have not
  // considered tax" are different statements, and a buyer deserves the first.
  lines.push({ code: "tax", label: "Tax", amountUsdc: fromMinor(tax) });

  return {
    pricingVersion: book.version,
    quotedAt: now.toISOString(),
    quoteExpiresAt: new Date(now.getTime() + QUOTE_TTL_DAYS * 86_400_000).toISOString(),

    escrowAmountUsdc: fromMinor(escrow),
    serviceFeeUsdc: fromMinor(serviceFee),
    manualReviewFeeUsdc: fromMinor(manual),
    expeditedFeeUsdc: fromMinor(expedited),
    disputeFeeUsdc: fromMinor(dispute),
    discountUsdc: fromMinor(discount),
    taxUsdc: fromMinor(tax),

    totalCustomerPaysUsdc: fromMinor(total),
    // The invariant, computed from the same source as everything else rather
    // than copied — if this ever stops equalling the escrow amount, the tests
    // fail rather than a seller being short-paid.
    sellerReceivesUsdc: fromMinor(escrow),

    lines,
    feePayerRole: "buyer",
    taxStatus: options.taxStatus ?? "not_assessed",
    taxJurisdiction: options.taxJurisdiction ?? null,
  };
}

/** Total platform fees only — what leaves the buyer beyond the escrow amount. */
export function platformFeesTotal(q: FeeQuote): string {
  const t = toMinor(q.totalCustomerPaysUsdc) ?? 0n;
  const e = toMinor(q.escrowAmountUsdc) ?? 0n;
  return fromMinor(t - e);
}

export function quoteExpired(q: FeeQuote, now: Date = new Date()): boolean {
  return now.toISOString() > q.quoteExpiresAt;
}
