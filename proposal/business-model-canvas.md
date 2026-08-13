# Business Model Canvas

**Transakt — Blockmediary**
Template: Tony Wood facilitator deck, slides 50 and 53 (BMC, 8 blocks).

**Figures as at 13 August 2026.** Live source: `financial-projections/Blockmediary_Financial_Model_Submission_Ready_2026-08-13.xlsx`, tab `Pitch Deck References`. Update that tab and this date together — do not hard-edit figures here.

<!--
Design notes for team:
- Faithful 4x2 BMC grid matching Tony's slide 50.
- Density is by design — the canvas is a working artefact, not a hero slide.
- Block order below MATCHES the layout grid. The June version numbered Revenue as
  Block 4 in its content but placed USPs at position 4 in its layout table; that
  contradiction is fixed here. Content order == placement order.
- UAE only. KSA was removed: the financial model is a single-track UAE plan with no
  second regulator costed anywhere.
- All figures are base case unless stated. GMV is trade value processed, not revenue.
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

**Our Solution**
- UCP 600 documentary credit, stablecoin settlement, without the issuing bank
- Buyer escrow → seller documents → release on compliant presentation
- Four verification layers plus an invoked escalation route

### Block 2 — Business Description
*Brief outline of your business model*

- Regulated operator: escrow, verification, settlement orchestration
- Smart-contract escrow holds stablecoins against documentary release rules
- Mirrors UCP 600 Article 14 strict-compliance logic
- Settlement on stablecoin rails (USDC), not bank correspondent networks
- Not a bank: no deposits, no lending, no token issuance
- Not DeFi: centralised trust and compliance layer by design
- Launch route: DIFC regulated-partner pilot Month 12, first receipts Month 13
- Full VARA licence targeted Month 18 — the gate for UAE-wide scale

### Block 3 — Target Market

**Sector & geography**
- SME importers/exporters; UAE launch market
- Corridors: UAE–India (CEPA), UAE–Türkiye (textiles)
- Sectors: manufacturing, consumer goods, electronics, textiles
- Ticket: £20K–£50K at launch → £36K–£87K by Year 5

**Strategic goals**
- Payment without LC cost or the 4–6 week wait
- Counterparty access without bank gatekeeping
- Verified trade reputation that travels across deals

**Pain points & risks**
- LC pricing and access barrier at SME tickets
- Pre-shipment payment-trust gap
- Document fraud and discrepancy risk
- Corridor FX and regulatory friction

### Block 4 — USPs
*How does your product/service compare? What makes you unique?*

- Only UCP 600-aligned documentary credit on stablecoin rails
- Four-layer verification: screening → extraction → source corroboration → contracted examiner
- Self-pricing tiered model — customers trade speed against cost of trust
- Gulf-native: UAE regulator-ready (VARA, DIFC, CBUAE PTSR 2024)
- Cheaper all-in than an LC on the deals that matter most
- Regulated operator, non-custodial by design: not a bank, not DeFi

### Block 5 — Revenue

**Streams**
- A. Tiered escrow fee: 0.8% / 1.5% / 3.0% by verification tier
- B. Document review, dispute, expedited and onboarding fees
- C. Partner/API setup and committed-volume fees

**Projected revenue — base case**
- Year 3: £1.37m revenue on 2,000 deals and £76m GMV
- Blended take rate falls 2.0% → 1.0% as Tier A grows 15% → 70%
- Gross margin 71–79%; ancillary fees are 17–26% of revenue
- Monthly cash-flow break-even in Year 4, Month 8

### Block 6 — Costs

**Funding requirement**
- £3.06m operating funding to break-even; £319k VARA capital separate

**Fixed**
- Payroll — 8 FTE at launch to 24 by Year 5; dominant cost
- Compliance, MLRO, VARA supervision and operational resilience
- Engineering, cloud, monitoring and security tooling
- Insurance (PI, cyber, D&O) and legal retainer

**Variable (per deal)**
- eBL/carrier API lookup, or paper collection
- Contracted documentary examiner time
- KYB/KYC screening per new counterparty
- On-chain gas and settlement cost
- Dispute handling and enhanced review above £50K

### Block 7 — Channels
*How will you promote your product or service?*

**Direct**
- Dubai and Sharjah chambers of commerce
- Freight forwarder referrals
- DIFC FinTech Hive; Gulfood, GITEX, Dubai FinTech Summit

**Indirect**
- Regulated-partner distribution — the base case's primary scale route
- Fintech wallet integrations (white-label verification API)
- Logistics platform API partnerships

### Block 8 — Competition
*Who are your competitors and what are their USPs?*

- **Bank-issued LCs** — trust and networks; 1–3% commission before the fee stack
- **Tazapay** — escrow-as-a-service; manual review, custodial fiat rails
- **Truzo** — narrow UK–SA corridor; manual KYC
- **XREX** — licensed custodial escrow; releases on agreement, not documents
- **Komgo / Contour** — bank-consortium LC digitisation; Contour shut in 2023

---

## PPTX Design Specification

### Slide setup
- Format: 16:9 widescreen
- Dimensions: 13.333" × 7.5" (12192000 × 6858000 EMU — matches the Aug 2026 deck)
- Background: pure white `#FFFFFF`
- File: `transakt-business-model-canvas.pptx`

### Locked colour palette

Extracted from `financial-projections/Financial-Projections-Slides-Submission-Ready-2026-08-13.pptx`. These are the values in live use — not the June draft values.

| Role | Name | Hex | Used for |
|------|------|-----|----------|
| Primary anchor | Navy | `#0B1B3A` | Title bar, primary text, Block 1 + 8 accents |
| Highlight / brand | Teal | `#0E8C7F` | Sub-section labels, Block 4 (USPs) accent |
| Contract framing | Purple | `#5A4FBF` | Block 2 (Business Description) accent |
| Verification / identity | Blue | `#1F6FB2` | Block 3 (Target Market) + Block 7 (Channels) accents |
| Revenue | Green | `#2C7A33` | Block 5 (Revenue) accent |
| External / settlement | Amber | `#C77D18` | Block 6 (Costs) accent |
| Body text | Charcoal | `#1B2430` | Body bullets |
| Subtitle / footer | Soft grey | `#6B7280` | Italic subtitle lines, sources |
| Block fill | Light cream | `#F7F4EF` | Block backgrounds |
| Block border | Warm grey | `#EAE6DE` | 0.75pt block outline |
| Rule / divider | Deep cream | `#D8D2C7` | Title-bar underline |

### Typography

- **Family**: Aptos (headings: Aptos Display) — fallback Inter, Helvetica Neue, Arial
- **Slide title**: 18pt bold, Navy `#0B1B3A`
- **Slide subtitle**: 10pt regular, Soft grey `#6B7280`
- **Block header**: 11pt bold, Navy `#0B1B3A`
- **Block subtitle (facilitator question)**: 7pt italic, Soft grey `#6B7280`
- **Sub-section label** (e.g. "The Problem", "Streams"): 8pt bold, block accent colour
- **Body bullets**: 8pt regular, Charcoal `#1B2430`, line-spacing 1.15
- **Source line (footer)**: 6pt regular, Soft grey `#6B7280`

### Layout grid (4 columns × 2 rows)

**Margins**: 0.30" all sides.

- **Title bar zone**: `x=0.30, y=0.30, w=12.73, h=0.60`
- **Grid zone**: `x=0.30, y=1.00, w=12.73, h=5.90`
- **Footer zone**: `x=0.30, y=6.90, w=12.73, h=0.30`

**Block dimensions**
- Block width: 3.11" — `(12.73 − 3×0.10) / 4`
- Block height: 2.90" — `(5.90 − 1×0.10) / 2`
- Block gap: 0.10" horizontal and vertical

### Per-block placement

Content order above is identical to this table. Build top-left to bottom-right.

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
- Block background: Light cream `#F7F4EF`, 0.75pt border `#EAE6DE`
- Top accent bar: 3pt height, full block width, in the block's accent colour
- Block padding: 0.12" all sides
- Block header in 11pt bold Navy, directly under the accent bar
- Block subtitle (facilitator question, where present) in 7pt italic grey beneath the header
- Body as a bulleted list, 8pt Charcoal, tight line-spacing
- Sub-section labels (bold lead-ins) in the block's accent colour, 8pt bold

### Title bar (top of slide)
- Left text: "**Business Model Canvas**" — 18pt bold Navy
- Right text: "*Transakt — Blockmediary*" — 10pt italic Soft grey
- 1pt `#D8D2C7` bottom border under the title bar

### Visual discipline
- No drop shadows, gradients, decorative icons, or animations
- No build sequences — static slide
- Top accent bars colour-code each block at a glance
- Bold coloured sub-section labels break each block into scannable zones
- First bullet under each header is the hero line — must be readable at projection distance

---

## Footer (sources line)

Single line, 6pt Soft grey, left-aligned:

> *Sources: ADB (2025); ICC UCP 600 (2007); CBUAE Payment Token Services Regulation (2024); VARA Rulebook (2026); Blockmediary financial model, 13 Aug 2026; `docs/Competitor-analysis.md`.*

---

## Figure provenance

Every number in Blocks 5 and 6 traces to the financial model. Check these before re-recording if the model is revised.

| Figure on canvas | Model source |
|---|---|
| 0.8% / 1.5% / 3.0% take rates | `Assumptions!F63:F65` |
| Blended 2.0% → 1.0% | `Tier Economics` escrow fee ÷ GMV, Y1 / Y5 |
| Tier A mix 15% → 70% | `Assumptions!D54, D139` |
| Y3 £1.37m revenue, 2,000 deals, £76m GMV | `P&L 5yr!E7:E18` |
| Gross margin 71–79% | `Scenario Engine!H49:L49` |
| Ancillary 17–26% of revenue | `Revenue Risk Add-Ons` vs `P&L 5yr` total revenue |
| Break-even Y4 M8 | `Cash Flow Statement!B45:B47` |
| £3.06m operating funding | `Launch Readiness!E12` |
| £319k VARA restricted capital | `Launch Readiness!E17` |
| 8 → 24 FTE | `P&L 5yr!C36:G36` |
| Ticket £20K–£50K → £36K–£87K | `Sensitivity` deal-value cases (Low/Base/High by tier) |
| Pilot M12 / receipts M13 / licence M18 | `Launch Readiness!E6, E11, E14` |
| Enhanced review above £50K | `Revenue Risk Add-Ons` |

## Sources

- Asian Development Bank. (2025). *Trade finance gaps, growth, and jobs survey 2025.* ADB.
- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.
- Central Bank of the UAE. (2024). *Payment Token Services Regulation.*
- Virtual Assets Regulatory Authority. (2026). *VARA Rulebook — Schedule 2: supervision and authorisation fees; Part B: paid capital.* https://rulebooks.vara.ae
- Blockmediary. (2026). *Financial model, submission-ready build, 13 August 2026.* `financial-projections/`
- Blockmediary. (2026). *Competitor analysis.* `docs/Competitor-analysis.md`
- Blockmediary. (2026). *Verification model v2.* `docs/verification-model-v2.md`
