# tools/

Deterministic code the agents call — and any MCP servers/connectors. Agents orchestrate
and explain; **tools compute**. All amount-matching, document-rule evaluation, and
external API calls go here.

## Blockmediary tool surface

Grouped by the documentary-escrow lifecycle (see [docs/product-blockmediary.md](../docs/product-blockmediary.md) and the canonical MVP doc at `Hackathon/MVP_FLOW.md` in Drive):

- **Deal intake & term extraction:**
  - `parse_sale_contract()` — OCR + structured extraction from an uploaded contract PDF.
  - `build_escrow_spec()` — produce the canonical escrow JSON (buyer, seller, payment, tradeTerms, requiredDocuments, releaseRules).
- **KYC + sanctions:** `screen_sanctions()`, `verify_kyb()` — sandbox endpoints only during Build.
- **Smart-contract escrow:** `deploy_escrow()`, `fund_escrow()`, `release_funds()`, `refund_escrow()`, `cancel_escrow()` — wrappers around the on-chain contract; deterministic side of every state transition.
- **Document upload + extraction:** `store_document()`, `extract_fields(document, schema)` — OCR/AI extraction returning per-field confidences.
- **Rules engine (the core verification layer):** `check_compliance(extracted_fields, escrow_spec)` — returns `Compliant | Discrepant | Rejected | Escalated` plus a per-rule audit object (required-document present, names match, amount matches, currency matches, shipment date ≤ deadline, etc.).
- **Notification:** `notify_party(party, event)` — funding confirmed, documents submitted, release notice, dispute opened.
- **Objection / dispute workflow:** `open_objection_window()`, `grade_objection()` (valid grounds vs. invalid), `escalate_to_dispute()`.
- **Audit ledger:** `append_audit(event)` — immutable record of every state change + reviewer decision (regulator-facing primary record).

## Connectors (MCP) to consider

- **Stablecoin / chain RPC** for the escrow contract (USDC on Base Sepolia, delivered; EURC and mainnet on the roadmap).
- **Sanctions / KYC providers** — sandbox endpoints only.
- **OCR / document-extraction provider** — for the document-checker pipeline.
- **Audit ledger DB** — immutable append-only store.
- **Notification channels** — Slack / email for escalations the orchestrator surfaces.

## Convention

Each tool is independently testable with sample inputs — this is what the week-8 evaluation
harness exercises. Money math and document-rule evaluation live here, never in agent
free-text (see [docs/domain-rules.md](../docs/domain-rules.md) "Do / Don't").
