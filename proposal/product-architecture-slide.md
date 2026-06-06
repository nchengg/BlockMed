# Slide 5 — Product Architecture

**Transakt — Pitch Deck (Blockmediary)**

> Replaces the previous Slide 5 ("Product / Service" user-journey swimlane). Grounded in the
> **Business Requirements Document** ([docs/business-requirements.md](../docs/business-requirements.md) §11)
> and the **Technical Requirements Document** ([docs/technical-requirements.md](../docs/technical-requirements.md) §3).
> Purpose: show *how the product is built* — the three-tier trust split — in **30 seconds**.

---

## The one idea

> **Three trust tiers. The contract holds the money, off-chain decides, and one authorised hand bridges them.**
> *Verdict off-chain, enforcement on-chain (TRD AP-2).*

---

## On-slide content — three-tier architecture diagram

A vertical stack of three bands, top to bottom, with a single labelled "releaser" arrow
crossing from the off-chain band into the on-chain band.

```
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT TIER                                          accent: Blue │
│  Buyer · Seller · Reviewer  (Next.js + wagmi + RainbowKit)         │
│  Every read/write goes through ONE authenticated API.              │
└───────────────┬───────────────────────────────────┬───────────────┘
   wallet signs │ deposit / release                  │ HTTPS — all app
   straight to  │ (release is permissionless)        │ data via API
   the chain    │                                    ▼
                │            ┌───────────────────────────────────────┐
                │            │  OFF-CHAIN TIER          accent: Teal  │
                │            │  Orchestration + verification:         │
                │            │  deal-intake · KYC/sanctions ·         │
                │            │  document-checker + rules engine ·     │
                │            │  dispute · settlement                  │
                │            │                                        │
                │            │  AI reads → deterministic code computes│
                │            │  money → human signs off above the     │
                │            │  envelope.                             │
                │            │                                        │
                │            │  ┌──────────────────────────────────┐  │
                │            │  │  AUDIT LEDGER (append-only)       │  │
                │            │  │  regulator-facing source of truth │  │
                │            │  └──────────────────────────────────┘  │
                │            └──────────────────┬─────────────────────┘
                │         releaser key — the ONE bridge:
                │         off-chain verdict → recordVerdict on-chain
                ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  ON-CHAIN TIER                                       accent: Navy  │
│  Narrow Escrow contract on Base Sepolia (EVM L2)                   │
│  Holds USDC · enforces the state machine · emits events.           │
│  It never sees a trade document.                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Tier captions (one line each)

- **Client (Blue):** buyer, seller, reviewer. Wallets sign deposit/release to the chain; *all
  other* traffic goes through one authenticated API (full API integration, BRD §10, decided 2026-06-05).
- **Off-chain (Teal):** where the intelligence lives — AI extracts document fields, deterministic
  code does every calculation, a human signs off before money can move. The append-only **audit
  ledger** is the regulator-facing source of truth.
- **On-chain (Navy):** a deliberately *narrow* contract — it holds the stablecoin and enforces the
  state machine, nothing more. No document logic on-chain.

## The bridge line (beneath diagram)

> *One authorised **releaser key** is the only path from an off-chain decision to on-chain money.
> Release itself is **permissionless** — once a deal is cleared, no one can withhold the seller's payout.*

## Design decisions (the engineering depth — what Solution doesn't show)

A four-chip strip across the bottom. These are the *choices*, not the flow — they're why an
engineer or grader takes the build seriously.

| Decision | Why |
|----------|-----|
| **Narrow contract** (AP-1) | On-chain code holds funds + state only — no document logic, no money math. Smaller attack surface, chain-portable. |
| **Permissionless release** (AP-7) | Release isn't gated on our key — a cleared seller can *always* be paid. Liveness without trusting the operator. |
| **Audit around every action** (AP-4) | Intent logged *before* the tx, reconciliation *after*. The ledger — not the chain — is the regulator-facing truth. |
| **Money in code, human above the envelope** (AP-5/AP-7) | All arithmetic is deterministic code; anything outside the autonomy thresholds escalates to a human sign-off. |

## Closing line

> *Narrow on-chain, smart off-chain, audited around every action — LC-grade trust without the bank.*

<!--
Design notes for the team:
- This is an ARCHITECTURE slide, not a journey slide. The old Slide 5 swimlane (buyer/seller
  steps) is retired; the "Agree → Fund → Ship → Review → Release" journey already lives on the
  SOLUTION slide (pptx slide 3), so this slide must NOT repeat it — it shows the *build*, not the flow.
- Centrepiece = the 3-band stacked diagram. Top→bottom = Client / Off-chain / On-chain.
- The single most important visual is the "releaser key" arrow: ONE bridge from off-chain to on-chain.
  Draw it as a single bold line so the audience reads "only one way in."
- Map bands to the locked palette: Client = Blue #1F6FB2, Off-chain = Teal #0E8C7F (audit-ledger
  sub-card in Navy #0B1B3A), On-chain = Navy #0B1B3A with an Amber #C77D18 "Base Sepolia" chip.
- Keep wording to the captions above — the 30s narration carries the detail, the slide carries the shape.
- **Differentiation from the Solution slide (deliberate):** Solution shows the *flow* (Agree→Fund→Ship→
  Review→Release). This slide must NOT re-walk it — it shows the *tiers* + the four *design decisions*.
  If a sentence here could appear on Solution, cut it. The "design decisions" strip is what makes this
  slide unmistakably an engineering/depth slide rather than a second telling of the mechanism.
- Source of truth for every claim here: TRD §3 (AP-1…AP-9, component model) and BRD §11.
- PPTX render: house style (cream #F7F4EF, Aptos / Aptos Display), consistent with Slide 6.
-->

## 30-second narration (≈ 85 words)

> Under the hood, Blockmediary is **three trust tiers**. On-chain, a deliberately *narrow* escrow
> contract does one job — hold the buyer's stablecoin and enforce the state machine. It never sees
> a document. Off-chain is where the intelligence lives: AI reads the documents, deterministic code
> does every calculation, and a human signs off before money can move. **One authorised release key
> is the only bridge between them** — and every client reaches the platform through a single
> authenticated API. Verdict off-chain, enforcement on-chain.

---

## Sources

- Internal: Business Requirements Document — [docs/business-requirements.md](../docs/business-requirements.md) §11 (on-chain vs off-chain), §10 (full API integration, decided 2026-06-05).
- Internal: Technical Requirements Document — [docs/technical-requirements.md](../docs/technical-requirements.md) §3 (architectural principles AP-1…AP-9, component model, releaser seam).
- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.
