# Slide 6 — Business Model Canvas (superseded — do not use)

**Transakt — Pitch Deck**
Template: Tony Wood facilitator deck, slides 50 and 53 (BMC, 8 blocks).

> **SUPERSEDED (2026-08-13).** The current canvas is
> [`proposal/business-model-canvas.md`](../business-model-canvas.md) (+ `.pdf`).
> Do not pull any number or claim from this file. Kept for drafting history only.
>
> **Regulatory — not just stale:**
> - **UAE–Türkiye is named as a corridor below. Türkiye is fully excluded.** CBRT
>   Regulation 2021/14 bans crypto-assets as a means of payment for goods and services —
>   precisely this product's settlement model. See `docs/legal-risk.md` §3.2.
> - **KSA** is not in the plan: the financial model is a single-track UAE route with no
>   second regulator costed. See `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md`.
> - **"UCP 600 documentary credit"** must not be used — the Trade Escrow Agreement is not
>   a letter of credit. Correct wording is "UCP 600-inspired" (`docs/legal-risk.md` §5.5).
> - **"regulator-ready"** overstates status: Blockmediary is not itself regulated during
>   the DIFC partner-led pilot (`docs/legal-risk.md` §4.2).
>
> **Superseded figures:** 0.5–1.0% flat fee → tiered **0.8% / 1.5% / 3.0%**, blended 2.0%
> → 1.0% · Year 3 $400K–$1.0M → **£1.37m** on 2,000 deals and £76m GMV · 60–70% blended
> margin → **71–79%** · Tier C ~36% margin → **~72%** · six-layer verification → **four
> layers plus an invoked escalation route** (`docs/verification-model-v2.md`) · "~45%
> rejection rate" is the ADB **2023** figure; the Dec 2025 survey reports **41%**.

<!--
Design notes for team:
- Faithful 4x2 BMC grid matching Tony's slide 50.
- Density is by design — canvas is a working artefact, not a hero slide.
- UAE (primary launch) + KSA (parallel operating market) per locked framing.
- Palette per locked Transakt deck (navy, teal, purple, blue, amber, green).
- First bullet under each header is the hero line.
- Year 3 ARR is editable pending Slide 10 financial projection review.
-->

---

## Content — 8 Blocks

### Block 1 — The Business Opportunity
*Where is the gap in the market, and how do you intend to fill it?*

**The Problem**
- $2.5T global SME trade finance gap (ADB, 2025); ~45% rejection rate
- Same fixed compliance cost on a $10K trade as a $5M trade
- SME ticket sizes uneconomic for banks at scale
- Most SME cross-border trade still on trust, in cash, or not at all

**Your Solution**
- UCP 600 documentary credit, stablecoin settlement, without the issuing bank
- Buyer escrow → seller documents → release on compliant presentation
- Six-layer document verification stack as operational moat

### Block 2 — Business Description
*Brief outline of your business model*

- Regulated centralised operator: escrow + verification + settlement orchestration
- Smart-contract escrow holds stablecoins against documentary release rules
- Mirrors UCP 600 Article 14 strict-compliance logic
- Settlement on stablecoin rails (USDC), not bank correspondent networks
- Not a bank: no deposits, no lending, no token issuance
- Not DeFi: centralised trust + compliance layer by design
- Phase 1: escrow + KYB/KYC + dispute + 6-layer verification
- Phase 2: matching + reputation + bank white-label rail + yield share

### Block 3 — Target Market

**Sector & geography**
- SME importers/exporters: UAE (primary) + KSA (parallel)
- Corridors: UAE–India (CEPA), UAE–Türkiye (stablecoin-native textiles), KSA–Pakistan
- Sectors: manufacturing, consumer goods, electronics, textiles
- Ticket size: $5K–$250K (repeatable, low-to-medium value)

**Strategic goals**
- Cross-border payment without LC cost or 4–6 week wait
- Counterparty access without bank gatekeeping
- Verified trade reputation that travels across deals
- Settle in days, not weeks

**Pain points & risks**
- LC pricing + access barrier at SME tickets
- Pre-shipment payment-trust gap
- Document fraud / discrepancy risk
- Manual, paper-heavy, opaque processes
- Corridor FX + regulatory friction

### Block 4 — Revenue

**Streams**
- A. Settlement fee: 0.5–1.0% per trade (tier-dependent)
- B. SaaS / API licensing: verification API (P1); bank white-label rail (P2)
- C. Yield share on idle escrow (P2; tokenised T-bills, BUIDL, Ondo)

**Projected revenue**
- Year 3 revenue: **$400K–$1.0M** *(revised 29 May 2026 from honest customer-volume math — see Slide 10)*
- Gross margin: ~94% Tier A / ~36% Tier C / **60–70% blended**

### Block 5 — Costs

**Fixed**
- Engineering (contracts, review console, intake UI)
- Compliance retainers (KYB/KYC, sanctions, counsel — DIFC/ADGM)
- Custody + security infrastructure
- Document forensics partner retainer
- Carrier API integrations (DCSA: Maersk, MSC, CMA CGM, Hapag-Lloyd, ONE, Evergreen, COSCO, ZIM)

**Variable (per deal)**
- Document examiner time
- Courier for paper BoLs (Tier C)
- Forensics per-document fee (Tier C)
- On-chain gas / settlement cost
- KYB/KYC per-onboarding cost

### Block 6 — Channels
*How will you promote your product or service?*

**Direct**
- Gulf chambers: Dubai, Sharjah, Saudi Chambers Federation
- Freight forwarder referrals
- DIFC FinTech Hive / ADGM RegLab accelerators
- Trade events: Gulfood, GITEX, Dubai FinTech Summit

**Indirect**
- Fintech wallet integrations (white-label verification API)
- VARA-licensed exchange merchant programmes
- Logistics platform API partnerships

### Block 7 — Competition
*Who are your competitors and what are their USPs?*

**Competitor 1 — Incumbent banks issuing LCs**
*e.g., HSBC, Emirates NBD, Standard Chartered*
- USPs: trust, regulation, correspondent networks

**Competitor 2 — Programmable escrow platforms**
*e.g., XREX BitCheck (MAS-licensed, Tether-backed, $400M+ escrowed)*
- USPs: stablecoin escrow + KYC, fast release, contract attachment

**Competitor 3 — Stablecoin payment rails**
*e.g., Fasset ($51M Series B, May 2026), Circle Payments Network*
- USPs: scale, regulatory clarity, settlement speed

### Block 8 — USPs
*How does your product/service compare? What makes you unique?*

- Only UCP 600-aligned documentary credit on stablecoin rails
- Six-layer verification moat (intake → OCR → carrier → human → fraud DB → forensics)
- Self-pricing tiered model (speed vs cost-of-trust)
- Gulf-native: UAE/KSA regulator-ready (VARA, ADGM, DIFC, PTSR 2024)
- SME-first pricing: $5K–$250K, not $1M+ bank LCs
- Regulated CeFi: not a bank, not DeFi

---

## PPTX Design Specification

### Slide setup
- Format: 16:9 widescreen
- Dimensions: 13.333" × 7.5" (standard PPTX)
- Background: pure white `#FFFFFF`
- File: `transakt-slide-06-bmc.pptx`

### Locked colour palette

| Role | Name | Hex | Used for |
|------|------|-----|----------|
| Primary anchor | Navy | `#0B1B3A` | Title bar, primary text, Block 1 + 8 accents |
| Highlight / money | Teal | `#0E8C7F` | Sub-section labels, Block 4 (USPs) accent, brand |
| Contract framing | Purple | `#5A4FBF` | Block 2 (Business Description) accent |
| Verification / identity | Blue | `#1F6FB2` | Block 3 (Target Market) + Block 7 (Channels) accents |
| External / settlement | Amber | `#C77D18` | Block 6 (Costs) accent |
| Revenue | Green | `#2C7A33` | Block 5 (Revenue) accent |
| Body text | Charcoal | `#333333` | Body bullets |
| Subtitle / footer | Soft grey | `#6B7280` | Tony's italic subtitle lines, sources |
| Block fill | Light cream | `#F5F3EE` | Block backgrounds |

### Typography
- **Family**: Inter (fallback: Helvetica Neue, Arial)
- **Slide title**: 18pt bold, Navy `#0B1B3A`
- **Slide subtitle**: 10pt regular, Soft grey `#6B7280`
- **Block header**: 11pt bold, Navy `#0B1B3A`
- **Block subtitle (Tony's question)**: 7pt italic, Soft grey `#6B7280`
- **Sub-section label** (e.g., "The Problem", "Streams"): 8pt bold, block accent colour
- **Body bullets**: 8pt regular, Charcoal `#333333`, line-spacing 1.15
- **Source line (footer)**: 6pt regular, Soft grey `#6B7280`

### Layout grid (4 columns × 2 rows)

**Margins**: 0.30" all sides.

**Title bar zone**: `x=0.30, y=0.30, w=12.73, h=0.60`
**Grid zone**: `x=0.30, y=1.00, w=12.73, h=5.90`
**Footer zone**: `x=0.30, y=6.90, w=12.73, h=0.30`

**Block dimensions**:
- Block width: 3.11" `(12.73 − 3×0.10) / 4`
- Block height: 2.90" `(5.90 − 1×0.10) / 2`
- Block gap: 0.10" horizontal and vertical

### Per-block placement

| # | Block | x | y | w | h | Accent |
|---|-------|---|---|---|---|--------|
| 1 | Business Opportunity | 0.30 | 1.00 | 3.11 | 2.90 | Navy `#0B1B3A` |
| 2 | Business Description | 3.51 | 1.00 | 3.11 | 2.90 | Purple `#5A4FBF` |
| 3 | Target Market | 6.72 | 1.00 | 3.11 | 2.90 | Blue `#1F6FB2` |
| 4 | USPs | 9.92 | 1.00 | 3.11 | 2.90 | Teal `#0E8C7F` |
| 5 | Revenue | 0.30 | 4.00 | 3.11 | 2.90 | Green `#2C7A33` |
| 6 | Costs | 3.51 | 4.00 | 3.11 | 2.90 | Amber `#C77D18` |
| 7 | Channels | 6.72 | 4.00 | 3.11 | 2.90 | Blue `#1F6FB2` |
| 8 | Competition | 9.92 | 4.00 | 3.11 | 2.90 | Navy `#0B1B3A` |

### Per-block treatment
- Block background: Light cream `#F5F3EE`
- Top accent bar: 3pt height, full block width, in block's accent colour
- Block padding: 0.12" all sides
- Block header in 11pt bold navy
- Block subtitle (Tony's question, where present) in 7pt italic grey beneath header
- Body as bulleted list, 8pt charcoal, tight line-spacing
- Sub-section labels (bold lead-ins) in block's accent colour, 8pt bold

### Title bar (top of slide)
- Left text: "**Business Model Canvas**" — 18pt bold Navy
- Right text: "*Transakt — Pitch Deck*" — 10pt italic Soft grey
- 1pt Navy bottom border under title bar

### Footer (sources line)
- Single line, 6pt Soft grey, left-aligned
- Text: *"Sources: ADB (2025); ICC UCP 600 (2007); ICC UAE Trade Finance Gap Report (2020); CBUAE Payment Token Services Regulation (2024); XREX (2025); Fintech Global (2026)."*

### Visual discipline
- No drop shadows, gradients, decorative icons, or animations
- No build sequences — static slide
- Top accent bars colour-code each block at a glance
- Sub-section bold-coloured labels break each block into scannable zones
- First bullet under each header is the hero line — must be readable at projection distance

---

## Sources

- Asian Development Bank. (2025). *Trade finance gaps, growth, and jobs survey 2025.* ADB.
- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.
- International Chamber of Commerce UAE. (2020). *UAE trade finance gap report.* (Figure scaled forward to current trade volumes.)
- Central Bank of the UAE. (2024). *Payment Token Services Regulation.*
- Abu Dhabi Global Market. (2023). *Stablecoin regulatory framework.*
- XREX. (2025). *XREX Pay BitCheck — programmable escrow for cross-border B2B payments.* https://xrex.io
- Fintech Global. (2026, May 15). *Fasset closes $51M Series B to scale stablecoin banking.* https://fintech.global
