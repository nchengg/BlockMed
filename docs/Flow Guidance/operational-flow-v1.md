# Blockmediary — Operational Flow (one page)

> **Status:** Draft for team review · **Session:** 8 · **Date:** 2026-06-24
> **Owner:** Tamer · **For:** Team discussion (Nick, Mo, Badhri, Dan, Conrad)
> **Scope:** Happy path only. Unhappy paths (dispute / refund / amendment / cure) are separate documents.

**Assumptions to discuss:** release based on document compliance with the escrow spec; verification as a layered check (automated + examiner); scope is origination → release.

| # | Step | Who acts | Key inputs / docs | State |
|---|---|---|---|---|
| 1 | **Deal origination** — sale contract already signed off-platform; parties enter trade terms | Buyer and/or seller | Sale contract / pro forma; structured trade terms | `Draft` |
| 2 | **Compliance gate** — KYB/KYC, sanctions, goods/corridor checks, wallet binding | Platform + compliance review | KYB/KYC docs; wallet signatures | `Draft` → eligible or blocked |
| 3 | **Escrow terms generated & approved** — escrow spec, Trade Escrow Agreement, smart contract initialised | Platform generates; both parties approve | Escrow spec (JSON); Trade Escrow Agreement | `Agreed` |
| 4 | **Buyer funds escrow** — stablecoin deposit directly to smart contract; seller notified | Buyer (on-chain) | Stablecoin deposit | `Funded` |
| 5 | **Seller ships + uploads BoL** — first trigger document (custody passed to carrier) | Seller | Bill of Lading (eBoL or paper) | `DocumentsSubmitted` (partial) |
| 6 | **BoL verification** — extract fields, match against escrow spec, source corroboration where available, examiner sign-off | Platform + examiner | BoL + escrow spec | `Compliant` or routed to discrepancy |
| 7 | **First release** — fires per the release rule in the escrow spec (single-shot or staged — *TBD*) | Release authority → smart contract | Compliant verdict | `ReleasePending` → partial/full `Released` |
| 8 | **Remaining docs submitted** — invoice, packing list, weight list, certificate of origin, inspection cert, insurance cert (as required) | Seller | Remaining MVP doc set | Tracked against required set |
| 9 | **Full verification** — same checks as Step 6, plus cross-document consistency | Platform + examiner | Full doc set | `Compliant` |
| 10 | **Notice of release + objection window** — buyer has fixed window to raise a *valid* objection (default 48h *TBD*) | Buyer (objects or silent) | Valid grounds only: missing doc, mismatch, late shipment, fraud, sanctions, mutual amendment | `ReleasePending` |
| 11 | **Final release** — window closes with no valid objection; remaining funds release | Release authority → smart contract | Closed window | `Released` (final) |
| 12 | **(Optional) Delivery confirmation** — only if a tranche is reserved for it | Buyer confirms | Proof of delivery | Final tranche released |

**Out of scope here:** dispute / refund / amendment / cure paths — separate flow.

**Open decisions (lock before sizing):**

1. Release model — single-shot / staged / contract-configurable *(affects 7, 11)*
2. Verification depth — receipt-only / full / tiered *(see CEO decision memo; affects 6, 9)*
3. MVP doc set — full six or minimal core *(BRD open #12; affects 8)*
4. Objection window — confirm 48h *(BRD open #9; affects 10)*
5. Who initiates the deal — buyer / seller / platform *(BRD open #11; affects 1)*
6. Sale-contract intake — structured form only, or term-extraction from uploads *(BRD open #7; affects 1)*

**Reads with:** `verification-model-v2.md` (the layers inside Steps 2, 6, 9) · CEO decision memo on confirm-vs-verify.
