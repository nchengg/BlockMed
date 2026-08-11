// Notice-of-release + objection-window logic (BRD FR-10/FR-11), pure and
// client-safe: no fs, no chain. A Compliant B/L grading no longer records the
// verdict on-chain directly — it opens a REVIEW: the buyer is notified and may
// approve early (waiving the window) or object on one of the CLOSED grounds
// below. Only buyer approval or quiet window expiry leads to recordVerdict;
// a standing objection blocks it. All of this happens BEFORE recordVerdict
// because after it release is permissionless and unstoppable (contract AP-7).
import type { DocumentPack, Verdict } from "./rules";

// The closed set of valid objection grounds (BRD §9.1). Anything else is not a
// valid objection — protecting the seller from post-shipment renegotiation.
export const OBJECTION_GROUNDS = [
  { value: "missing_document", label: "Missing required document" },
  { value: "field_mismatch", label: "Field mismatch vs agreed terms" },
  { value: "late_shipment", label: "Shipment after the agreed deadline" },
  { value: "suspected_fraud", label: "Suspected document fraud" },
  { value: "sanctions_kyc", label: "Sanctions / KYC / compliance issue" },
  { value: "mutual_amendment", label: "Mutual amendment request" },
] as const;

export type ObjectionGround = (typeof OBJECTION_GROUNDS)[number]["value"];

export function isValidGround(g: unknown): g is ObjectionGround {
  return typeof g === "string" && OBJECTION_GROUNDS.some((o) => o.value === g);
}

export function groundLabel(g: ObjectionGround): string {
  return OBJECTION_GROUNDS.find((o) => o.value === g)?.label ?? g;
}

export interface Objection {
  ground: ObjectionGround;
  detail: string;
  raisedAt: string; // ISO
}

export interface Review {
  fields: DocumentPack; // the submitted document pack exactly as graded
  verdict: Verdict;
  noticeAt: string; // ISO — when the notice of release was issued
  windowEndsAt: string; // ISO — objection window close
  approvedAt?: string; // ISO — buyer approved (waives remaining window)
  objection?: Objection;
}

// 48h default (BRD §9.2 default, still an open [DISCUSS] — config, not constant).
// Demo override: ESCROW_OBJECTION_WINDOW_MINUTES (server env).
export const DEFAULT_WINDOW_HOURS = 48;

export function windowMs(env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): number {
  const mins = Number(env.ESCROW_OBJECTION_WINDOW_MINUTES);
  if (Number.isFinite(mins) && mins > 0) return mins * 60_000;
  return DEFAULT_WINDOW_HOURS * 3_600_000;
}

export type ReviewStatus = "pending" | "expired" | "objected" | "approved";

// ISO-8601 strings of equal format compare correctly as strings.
export function reviewStatus(r: Review, now: Date = new Date()): ReviewStatus {
  if (r.approvedAt) return "approved";
  if (r.objection) return "objected";
  return now.toISOString() > r.windowEndsAt ? "expired" : "pending";
}

export function openReview(fields: DocumentPack, verdict: Verdict, now: Date = new Date()): Review {
  return {
    fields,
    verdict,
    noticeAt: now.toISOString(),
    windowEndsAt: new Date(now.getTime() + windowMs()).toISOString(),
  };
}
