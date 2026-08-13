# Domain rules & context — Blockmediary

The business-rules layer that makes the agents behave like Blockmediary insiders,
not generic LLMs. Product overview lives in
[product-blockmediary.md](product-blockmediary.md); module-level academic facts
live in [hackathon-context.md](hackathon-context.md).

## Business context

- **Product:** Blockmediary — programmable documentary escrow for SME cross-border trade. Buyer prefunds stablecoin into escrow; seller ships goods and submits documents; smart contract releases funds when documents satisfy agreed release rules.
- **Team:** Transakt (hackathon group name).
- **Users:** Buyer (importer) and Seller (exporter) — primary. Document reviewer and dispute resolver — operational. Partner platforms / banks — post-MVP white-label.
- **Key decision the product helps make:** "Have the seller's submitted documents satisfied the agreed release rules for this escrow?" — *not* "should we lend to this SME?". Financing is explicitly out of scope.

## Standards & conventions

- **Currencies:** stablecoins (USDC, EURC) on the settlement chain. Buyer deposit currency = release currency = the escrow's specified `payment.currency`. No FX inside the MVP escrow — parties agree the stablecoin upfront.
- **Date / time:** ISO 8601 UTC for all on-chain timestamps and document fields. Trade shipment deadlines come from the agreed escrow specification, not from documents.
- **Rounding:** money calculated in minor units (cents / smallest token unit). Round only at display, not in intermediate math. **Do this in `tools/`, never in agent free-text.**
- **Escrow state model:** `Draft → Agreed → Funded → DocumentsSubmitted → ReviewInProgress → Compliant → ReleasePending → Released`. Branches: `Cancelled` (from Agreed), `Refunded` (from Funded or via Disputed), `Disputed` (from ReviewInProgress or ReleasePending). End states: `Released`, `Refunded`, `Cancelled`.
- **Document-verification outcomes:** `Compliant` (release) / `Discrepant` (cure or waive) / `Rejected` (refund or amend) / `Escalated` (freeze pending dispute — fraud, sanctions, unresolved objection).
- **Valid objection grounds** (buyer, during the objection window): missing required document; document field mismatch vs. escrow terms; shipment after deadline; suspected document fraud; sanctions / KYC / compliance issue; mutual amendment request. Anything else is invalid (e.g. "buyer changed their mind", "wants to renegotiate after shipment", subjective quality complaint when no inspection certificate was required).

## Decision & autonomy policy

Agents act automatically only inside these envelopes. Anything outside escalates to a human reviewer.

| Action | Auto threshold | Otherwise |
|--------|---------------|-----------|
| Term extraction from sale contract | High-confidence extraction (per-field confidence ≥ 0.9) on all mandatory fields | Escalate to deal-intake user for confirmation |
| KYC / sanctions pass-through | All checks green, no sanctions hit, KYB matched | Escalate to compliance officer; hold deal at Draft |
| Document field extraction | OCR/AI confidence ≥ 0.9 per checked field | Flag the specific field for human review |
| Document compliance verdict | All checks pass cleanly AND deal value ≤ MVP cap (£50k equivalent) | Mandatory human review console approval |
| Notice of release issuance | Verdict = Compliant, no open dispute, escrow `Funded` | Hold; surface discrepancy or escalation |
| Fund release transaction | Objection window expired with no valid objection, no active dispute | Hold release; route to dispute workflow |
| Refund transaction | Refund condition met (e.g. shipment deadline missed, mutual cancellation, dispute resolved for buyer) | Hold; require human reviewer sign-off |
| Regulatory / sanctions report | Standard AML/sanctions trigger | File and notify; do not auto-suppress |

## Do / Don't

- **DO** persist every state transition to the immutable audit ledger before the on-chain action. The audit trail is the regulator-facing primary record and the source of truth for who approved release and on what basis.
- **DO** treat the escrow specification (the structured JSON generated at deal intake) as authoritative for release rules. Document checks compare against the spec, not against the underlying sale contract.
- **DO** keep the smart contract narrow: escrow, state, release, refund, dispute. Anything that requires "understanding" a document happens off-chain.
- **DO** prefer buyer deposit into a smart contract or regulated custody partner. Never route buyer funds through a Blockmediary-controlled wallet.
- **DON'T** compute money figures in agent free-text. Use `tools/` for all arithmetic — invoice/escrow amount matching, currency comparison, fee calculation.
- **DON'T** release funds without all of: escrow Funded; documents submitted; compliance verdict; release notice issued; objection window expired; no active dispute.
- **DON'T** accept buyer objections outside the predefined valid grounds. The product's value depends on protecting the seller from post-shipment renegotiation.
- **DON'T** claim title or quality control over physical goods. Blockmediary releases on **document** compliance — not on actual receipt or condition of goods, unless an inspection certificate is in the release rules.
- **DON'T** ingest real customer PII during the build — sandbox / synthetic data only (see [AGENTS.md](../AGENTS.md)).
- **DON'T** make jurisdiction-specific regulatory claims without sourcing — cross-border AML/sanctions regimes differ.
- **DON'T** allow a deal to fund without an export controls check in addition to sanctions screening. Sanctions screen catches *who* — export controls catch *what*. Collect the goods HS code and origin country at deal intake; cross-reference against the UK/EU dual-use control lists; require the seller to confirm export licence status if goods fall in a controlled category. See [legal-risk.md §5.7](legal-risk.md).
- **DON'T** allow a platform/intermediary-initiated deal to fund until KYC of the underlying buyer and seller is confirmed — either directly by Blockmediary or via a written MLR 2017 Reg 39 third-party reliance agreement with an AML-regulated intermediary. An unregulated intermediary's assertion is not sufficient. See [legal-risk.md §5.8](legal-risk.md).
- **DON'T** invoke `pause()` as a routine operational gate. Permissible grounds only: (a) confirmed smart contract exploit; (b) regulatory direction or court order; (c) confirmed post-verdict sanctions hit. Invoking pause on a deal in `ReleasePending` without these grounds is a breach of contract with the seller. See [legal-risk.md §5.4.2](legal-risk.md).
- **DON'T** accept a PDF copy of a bill of lading emailed to multiple parties as an "original" — it does not satisfy the UK Electronic Trade Documents Act 2023 singularity-of-control requirement. For MVP, accept scanned paper originals only. See [UCP600.md](UCP600.md) and [legal-risk.md §1.8](legal-risk.md).

## Glossary

| Term | Definition |
|------|------------|
| **Beachhead** | The single buyer/seller corridor + goods type the MVP targets first (e.g. Shenzhen → LA, manufactured components). |
| **Compliance verdict** | Outcome of document verification: `Compliant` / `Discrepant` / `Rejected` / `Escalated`. |
| **Document reviewer** | Human role that approves release after the deterministic rules-engine check (OCR/AI-assisted extraction is a roadmap item, not yet delivered). |
| **Dispute resolver** | Named external forum / arbitrator / expert determination used when the workflow leaves the happy path. |
| **Escrow specification** | Structured JSON generated at deal intake; authoritative source for release rules and the schema documents are checked against. |
| **Notice of release** | Message issued when documents are compliant; starts the buyer's objection window. |
| **Objection window** | Fixed period (default 48h) during which the buyer can raise a *valid* objection to release. |
| **Settlement chain** | Blockchain hosting the escrow contract. Delivered on Base Sepolia (testnet, EVM L2); contract kept chain-portable, production mainnet is a later decision. |
| **Release rules** | The document-compliance conditions defined in the escrow specification that must be satisfied for funds to release. |
| **Smart contract escrow** | The on-chain contract holding stablecoin funds and enforcing state transitions. Narrow scope: hold, release, refund, dispute. |
| **Trade Escrow Agreement** | The legal agreement between buyer, seller and Blockmediary covering the escrow workflow (separate from the underlying sale contract). |
