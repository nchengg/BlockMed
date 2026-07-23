// Unit tests for the notice-of-release / objection-window logic (review.ts).
// Pure functions with an injectable clock — the window maths and status
// derivation gate whether recordVerdict may be signed, so they get the same
// exhaustive treatment as the grading engine.
import { describe, it, expect, afterEach } from "vitest";
import {
  reviewStatus,
  openReview,
  windowMs,
  isValidGround,
  groundLabel,
  OBJECTION_GROUNDS,
  DEFAULT_WINDOW_HOURS,
  type Review,
} from "./review";
import type { BolFields, Verdict } from "./rules";

const FIELDS = {} as BolFields; // contents irrelevant to review logic
const VERDICT: Verdict = { verdict: "Compliant", rules: [] };

const T0 = new Date("2026-07-23T12:00:00.000Z");
const baseReview = (over: Partial<Review> = {}): Review => ({
  ...openReview(FIELDS, VERDICT, T0),
  ...over,
});

describe("openReview", () => {
  it("stamps notice time and a window end 48h later by default", () => {
    const r = openReview(FIELDS, VERDICT, T0);
    expect(r.noticeAt).toBe("2026-07-23T12:00:00.000Z");
    expect(r.windowEndsAt).toBe(
      new Date(T0.getTime() + DEFAULT_WINDOW_HOURS * 3_600_000).toISOString(),
    );
    expect(r.approvedAt).toBeUndefined();
    expect(r.objection).toBeUndefined();
  });
});

describe("windowMs", () => {
  it("defaults to 48 hours", () => {
    expect(windowMs({})).toBe(48 * 3_600_000);
  });
  it("honours the demo env override in minutes", () => {
    expect(windowMs({ ESCROW_OBJECTION_WINDOW_MINUTES: "5" })).toBe(5 * 60_000);
  });
  it("ignores zero, negative, and junk overrides", () => {
    expect(windowMs({ ESCROW_OBJECTION_WINDOW_MINUTES: "0" })).toBe(48 * 3_600_000);
    expect(windowMs({ ESCROW_OBJECTION_WINDOW_MINUTES: "-3" })).toBe(48 * 3_600_000);
    expect(windowMs({ ESCROW_OBJECTION_WINDOW_MINUTES: "soon" })).toBe(48 * 3_600_000);
  });
});

describe("reviewStatus", () => {
  it("is pending inside the window", () => {
    expect(reviewStatus(baseReview(), new Date(T0.getTime() + 1000))).toBe("pending");
  });
  it("is pending exactly at the boundary (≤ windowEndsAt)", () => {
    const r = baseReview();
    expect(reviewStatus(r, new Date(r.windowEndsAt))).toBe("pending");
  });
  it("is expired one millisecond after the window closes", () => {
    const r = baseReview();
    expect(reviewStatus(r, new Date(new Date(r.windowEndsAt).getTime() + 1))).toBe("expired");
  });
  it("objection wins over the clock — objected inside and outside the window", () => {
    const r = baseReview({
      objection: { ground: "field_mismatch", detail: "wrong port", raisedAt: T0.toISOString() },
    });
    expect(reviewStatus(r, new Date(T0.getTime() + 1000))).toBe("objected");
    expect(reviewStatus(r, new Date(T0.getTime() + 100 * 3_600_000))).toBe("objected");
  });
  it("approval wins over everything", () => {
    const r = baseReview({
      approvedAt: T0.toISOString(),
      objection: { ground: "field_mismatch", detail: "", raisedAt: T0.toISOString() },
    });
    expect(reviewStatus(r, new Date(T0.getTime() + 100 * 3_600_000))).toBe("approved");
  });
});

describe("objection grounds (closed set, BRD §9.1)", () => {
  it("accepts every listed ground", () => {
    for (const g of OBJECTION_GROUNDS) expect(isValidGround(g.value)).toBe(true);
  });
  it("rejects anything outside the closed set", () => {
    for (const bad of ["changed_my_mind", "", "FRAUD", 42, null, undefined]) {
      expect(isValidGround(bad)).toBe(false);
    }
  });
  it("labels every ground", () => {
    for (const g of OBJECTION_GROUNDS) {
      expect(groundLabel(g.value).length).toBeGreaterThan(3);
    }
  });
});
