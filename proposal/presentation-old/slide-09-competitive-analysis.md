# Slide 9 — Competitive Analysis

*Subtitle: How we compare, and what nobody else does*

<!--
Design notes for team:
- Layout: comparison table on top (~55% of slide), six-layer verification stack diagram underneath (~45%).
- LC graveyard (Contour 2022, Marco Polo 2023, we.trade 2022) deliberately NOT on slide per user instruction — held for delivery only.
- Tick/cross calls in table:
  • XREX "Defined dispute path: partial" — buyer-discretion model means dispute resolution is informal.
  • Stablecoin rails "Gulf-native regulatory fit: partial" — Fasset has UAE ops; Circle Payments Network has UAE partners; neither is documentary credit specifically.
- Layer 3 carrier list (named only here, not on slide): DCSA full membership includes Maersk, MSC, CMA CGM, Hapag-Lloyd, ONE, Evergreen, COSCO, ZIM. Slide reads "DCSA API — major container carriers" to avoid overclaim of integrations not yet built.
- Six-layer stack is the operational moat reveal — deliberately held back from Slide 5 to land here as the competitive payoff.
- PPTX design spec pending (matching Slides 1–5, 7, 8).
-->

---

## Competitive comparison

| Capability | Incumbent banks | Programmable escrow (XREX) | Stablecoin rails (Fasset, CPN) | **Transakt** |
|---|---|---|---|---|
| Documentary release (UCP 600) | ✓ | ✗ | ✗ | **✓** |
| Stablecoin settlement | ✗ | ✓ | ✓ | **✓** |
| SME ticket sizes ($5K–$250K) | ✗ | ✓ | ✓ | **✓** |
| Document verification stack | ✓ | ✗ | ✗ | **✓** |
| Defined dispute path | ✓ | partial | ✗ | **✓** |
| Gulf-native regulatory fit | partial | ✗ | partial | **✓** |
| Speed (eBL tier) | ✗ (weeks) | ✓ (minutes) | ✓ (minutes) | **✓** (minutes) |

---

## Six-layer verification stack — the operational moat

| # | Layer | Mechanism | Timing |
|---|---|---|---|
| 1 | **Tiered intake** | Tier A (eBL) / Tier B (paper on DCSA carrier) / Tier C (paper elsewhere) — pricing reflects tier | Instant |
| 2 | **OCR + rules engine** | AI-assisted field extraction + cross-document consistency checks | Instant |
| 3 | **Carrier-source verification** | DCSA API — major container carriers | Minutes |
| 4 | **Human examiner** | Ex-bank trade ops staff in lower-cost jurisdictions, AI-augmented | Same day |
| 5 | **Cross-platform fraud database** | Every BoL hash recorded; re-use attempts flagged instantly | Passive |
| 6 | **Physical original + forensics** | Paper originals couriered to forensics partner (Traydstream / Cleareye) | 5–10 days |

---

## Closing line

> *No single competitor crosses all six layers — and no single competitor combines documentary release with stablecoin settlement.*

---

## Locked palette assignment (for PPTX, when design spec is added)

- Table — Transakt column accent: Teal `#0E8C7F`; competitor columns neutral
- Six-layer stack accent: Blue `#1F6FB2` (verification colour per locked palette mapping)
- Closing line: bold Navy `#0B1B3A`

## Sources

- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.
- Digital Container Shipping Association. (n.d.). *DCSA standards and member carriers.* https://dcsa.org
- XREX. (2025). *XREX Pay BitCheck — programmable escrow for cross-border B2B payments.* https://xrex.io
- Fintech Global. (2026, May 15). *Fasset closes $51M Series B to scale stablecoin banking.* https://fintech.global
- Internal product specification.
- Tony Wood facilitator deck (2024).
