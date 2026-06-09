# Slide 5 — Product Architecture

> **Revised 2026-06-06.** This slide was previously "Product / Service" — a buyer/seller
> user-journey swimlane. That journey now lives on the **Solution** slide (Agree → Fund →
> Ship → Review → Release), so Slide 5 has been **repurposed to show the product *architecture***:
> the three-tier trust split, narrated in **30 seconds**. Grounded in the new Business
> Requirements Document ([../../docs/business-requirements.md](../../docs/business-requirements.md) §11)
> and Technical Requirements Document ([../../docs/technical-requirements.md](../../docs/technical-requirements.md) §3).
>
> The full, render-ready version of this slide is **[proposal/product-architecture-slide.md](../product-architecture-slide.md)**.
> The retired swimlane content is preserved at the bottom of this file for reference.

---

## On-slide content — three-tier architecture diagram

Three vertical bands (top → bottom), with one labelled "releaser" arrow crossing from the
off-chain band into the on-chain band.

1. **CLIENT TIER** — Buyer · Seller · Reviewer. Every read/write goes through one authenticated API.
2. **OFF-CHAIN TIER** — deal-intake · KYC/sanctions · document-checker + rules engine · dispute ·
   settlement. AI reads → deterministic code computes money → human signs off. Append-only **audit
   ledger** = regulator-facing source of truth.
3. **ON-CHAIN TIER** — Narrow Escrow contract on Base Sepolia: holds USDC, enforces the state
   machine, emits events. Never sees a trade document.

## The bridge line (beneath diagram)

> *One authorised **releaser key** is the only path from an off-chain decision to on-chain money.
> Release itself is **permissionless** — once a deal is cleared, no one can withhold the seller's payout.*

## Closing line

> *Narrow on-chain, smart off-chain, audited around every action — LC-grade trust without the bank.*

## 30-second narration (≈ 85 words)

> Under the hood, Blockmediary is **three trust tiers**. On-chain, a deliberately *narrow* escrow
> contract does one job — hold the buyer's stablecoin and enforce the state machine. It never sees
> a document. Off-chain is where the intelligence lives: AI reads the documents, deterministic code
> does every calculation, and a human signs off before money can move. **One authorised release key
> is the only bridge between them** — and every client reaches the platform through a single
> authenticated API. Verdict off-chain, enforcement on-chain.

<!--
Design notes for the team:
- Slide 5 is now ARCHITECTURE, not journey. Do NOT repeat the Agree→Fund→Ship→Review→Release flow
  (that's the Solution slide). This slide shows the *build*: Client / Off-chain / On-chain.
- The hero visual is the single "releaser key" arrow — ONE bridge off-chain → on-chain.
- Palette: Client = Blue #1F6FB2, Off-chain = Teal #0E8C7F, On-chain = Navy #0B1B3A + Amber #C77D18
  "Base Sepolia" chip. Audit-ledger sub-card in Navy.
- Authoritative copy + full diagram: proposal/product-architecture-slide.md.
- Every claim traces to TRD §3 (AP-1…AP-9) and BRD §11 / §10 (full API integration).
-->

## Sources

- Internal: Business Requirements Document — [../../docs/business-requirements.md](../../docs/business-requirements.md) §11 (on-chain vs off-chain), §10 (full API integration, decided 2026-06-05).
- Internal: Technical Requirements Document — [../../docs/technical-requirements.md](../../docs/technical-requirements.md) §3 (architectural principles AP-1…AP-9, component model, releaser seam).
- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.

---

<!--
============================================================================
RETIRED CONTENT (pre-2026-06-06) — original "Product / Service" swimlane.
Kept for reference; superseded by the architecture content above.
============================================================================

## On-slide content — user-journey swimlane diagram

Five numbered steps, aligned vertically, with two swimlanes plus a central rail.

### Top swimlane — BUYER
1. Agree terms
2. Fund escrow
3. Watch shipment
4. Goods received

### Central rail — TRANSAKT
The rail visually connects all steps; persistent through the diagram.

### Bottom swimlane — SELLER
1. Agree terms
2. Ship goods
3. Submit documents
4. Receive payment

## Tier line (beneath diagram)
> Seller chooses tier at intake: Tier A (eBL — minutes), Tier B (carrier-verified — hours), Tier C (paper — days).

## Closing line
> Same legal logic as a bank LC. A fraction of the cost. Accessible at SME deal sizes.
============================================================================
-->
