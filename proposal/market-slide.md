# Slide 5 — Market

**Transakt — Pitch Deck (Blockmediary)**

> Replaces the June-8 Slide 5 ("MARKET — the wedge is narrow, but the gap behind it is enormous").
> Purpose: size the opportunity in **20 seconds** without implying we provide trade finance.

**Figures as at 13 August 2026.** TAM/SAM are published trade statistics; SOM is model-derived —
live source `financial-projections/Blockmediary_Financial_Model_Submission_Ready_2026-08-13.xlsx`.

<!--
Design notes for team:
- WHY THIS SLIDE WAS REBUILT — the June version sized TAM as the "$2.5T global SME trade
  finance gap" and SAM as the "UAE SME trade finance gap". Both are FINANCING gaps. We do
  not lend and do not provide working capital, so sizing ourselves against a financing gap
  claims a market we do not serve — and it directly contradicts the scope line now carried
  on the Business Model Canvas ("documentary trust and payment-assurance gap, not
  working-capital finance"). A marker hearing both in the same deck sees the boundary
  statement as a disclaimer the team does not believe.
- THE FIX — every tier is now measured in the SAME unit: trade value we could settle
  against. TAM/SAM/SOM are all trade flow. Nothing on this slide is a financing figure.
- The $2.5T ADB number does NOT disappear from the deck — it stays on the Business Model
  Canvas as PROBLEM context (why SMEs are underserved), which is a legitimate use. It is
  only barred from being our TAM. Do not reinstate it here.
- TÜRKIYE REMOVED from the beachhead line. CBRT Regulation 2021/14 bans crypto-assets as a
  means of payment for goods and services — exactly our settlement model — so Turkish
  counterparties are excluded entirely (docs/legal-risk.md §3.2). The June slide said
  "Indian and Turkish textiles". Do not reinstate the corridor.
- KSA stays out of SAM: no published corridor figure we can cite without overclaiming.
- SOM was $100M-$250M in June. No scenario in the current model reaches $250M by Y3 —
  the high case tops out near $187M. Corrected to the actual modelled range.
- Tony's deck slide 35 convention: concentric circles, TAM outermost.
-->

---

## The one idea

> **We are not sizing a financing gap. We are sizing the trade we can settle against.**

---

## On-slide content — concentric circles

| Tier | Value | Description |
|------|-------|-------------|
| **TAM** (outer) | **$1.03T** | UAE non-oil foreign trade, 2025 |
| **SAM** (middle) | **~$65B** | UAE–India CEPA non-oil corridor — the launch market |
| **SOM** (inner) | **~$110M** | Trade value processed, Y1–Y3 cumulative (base case) |

### Beachhead logic (three lines beside the circles)

1. UAE importers of Indian textiles, garments and consumer goods.
2. $10K–$50K shipments — the **LC dead zone**: too small for a bank to issue against, too large to pay on trust.
3. Repeat trade pattern creates a retention surface.

### Supporting line (beneath circles)

> *Where the gap bites hardest, and where the regulators are most ready.*

### Scope line (small, beneath supporting line — REQUIRED, do not cut)

> *Trade value we settle against — not a financing gap we fund.*

---

## PPTX Design Specification

Same house style as the Business Model Canvas (slide 6) and Product Architecture (slide 4):
white page, cream cards, navy type, one accent per element.

### Slide setup
- 16:9, 13.333" × 7.5" — matches the June-8 deck exactly
- Background: white `#FFFFFF`
- Kicker "MARKET" top-left, 11pt bold Amber `#C77D18`, 0.2em tracking, ALL CAPS
- Page number "05" bottom-right, 9pt Soft grey `#6B7280`

### Locked palette (identical to the canvas)

| Role | Hex | Used for |
|------|-----|----------|
| Navy | `#0B1B3A` | Titles, TAM ring, primary text |
| Blue | `#1F6FB2` | SAM ring |
| Teal | `#0E8C7F` | SOM ring — the innermost, our actual footprint |
| Amber | `#C77D18` | Kicker, beachhead numerals |
| Charcoal | `#1B2430` | Body |
| Soft grey | `#6B7280` | Captions, sources, scope line |
| Cream | `#F7F4EF` | Beachhead card fill |
| Warm grey | `#EAE6DE` | Card border, 0.75pt |

### Layout
- **Title**: `x=0.55, y=0.72`, 26pt bold Navy — "The wedge is narrow. The trade behind it is not."
- **Circles**: concentric, left-of-centre, common centre at `x=4.05, y=4.05`
  - TAM ring Ø 4.30", 2.5pt Navy outline, no fill
  - SAM ring Ø 2.85", 2.5pt Blue outline, no fill
  - SOM disc Ø 1.45", solid Teal, white type inside
- **Ring labels**: value in 20pt bold on the ring's own colour, descriptor in 8.5pt grey
  directly beneath. TAM/SAM labels sit on the ring's upper arc; SOM label sits inside the disc.
- **Beachhead card**: `x=7.30, y=2.05, w=5.45, h=3.10` — cream, 0.75pt warm-grey border,
  3pt Amber top accent bar. Three numbered lines, numerals in 13pt bold Amber, body 10.5pt Charcoal.
- **Supporting line**: `y=6.05`, 12pt italic Navy, centred under the circles
- **Scope line**: `y=6.45`, 8.5pt italic Soft grey — visually quieter than the supporting line,
  because it is a boundary statement, not a selling point
- **Source line**: bottom-left, 6.5pt Soft grey

### Visual discipline
- No drop shadows, gradients, icons or build sequences
- The rings must read outer→inner as a genuine narrowing: nothing else on the slide competes
- SOM is the only *filled* shape — the eye should land on the smallest circle, which is the honest one

---

## 20-second narration (≈ 50 words)

> The UAE moved just over a trillion dollars of non-oil trade last year. Our launch corridor,
> UAE–India, is sixty-five billion of that. We are going after roughly a hundred and ten million
> in years one to three — ten-to-fifty-thousand-dollar shipments, too small for a bank to issue
> against, too large to pay on trust.

---

## Figure provenance

| Figure | Source |
|---|---|
| TAM $1.03T | UAE non-oil foreign trade 2025 = AED 3.8tn ≈ $1.03tn, announced 31 Jan 2026. Published trade statistic, not an estimate |
| SAM ~$65B | UAE–India bilateral trade $101.25bn (FY 2025-26, CEPA); non-oil ≈ two-thirds → ~$67bn, stated as ~$65B to avoid false precision. H1-2025 non-oil ran ~$38bn, consistent with a ~$70bn full year |
| SOM ~$110M | `Scenario Engine!H10:J10` base GMV, Y1+Y2+Y3 = £92,250 + £8,161,200 + £76,031,100 = **£84.3m**. Converted at a stated presentation rate of 1.30 USD/GBP → ≈$110m. Scenario range £46.8m–£143.8m ≈ **$61m–$187m** |
| $10K–$50K dead zone | `docs/Competitor-analysis.md` §1 — segment definition |
| Türkiye exclusion | CBRT Regulation 2021/14; `docs/legal-risk.md` §3.2 |

> **Currency note:** TAM and SAM are published in USD; the financial model is GBP-denominated.
> SOM is converted at a stated 1.30 USD/GBP purely so the funnel reads in one unit. If the deck
> moves to GBP throughout, SOM is £84.3m and TAM/SAM must be converted at the same stated rate.

## Sources

- UAE Ministry of Foreign Trade. (2026). *UAE non-oil foreign trade exceeds AED 3.8 trillion in 2025.* https://www.trade.gov.ae/trade-data
- Government of India, Ministry of Commerce and Industry. (2026). *India–UAE CEPA: bilateral trade crosses $100 billion for a second year.*
- Blockmediary. (2026). *Financial model, submission-ready build, 13 August 2026.* `financial-projections/`
- Blockmediary. (2026). *Competitor analysis.* `docs/Competitor-analysis.md`
- Central Bank of the Republic of Türkiye. (2021). *Regulation on the disuse of crypto-assets in payments, No. 2021/14.*
- Asian Development Bank. (2025). *Global trade finance gap survey.* ADB. *(Context on the Business Model Canvas only — explicitly NOT this slide's TAM.)*
