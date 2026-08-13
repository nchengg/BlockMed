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
- Türkiye was removed. CBRT Regulation 2021/14 bans crypto-assets as a means of payment
  for goods and services — precisely our settlement model. Turkish residents and entities
  are excluded entirely (docs/legal-risk.md §3.2). Do not reinstate the corridor.
- CLAIM DISCIPLINE — these wordings are legally constrained, do not "improve" them:
  * "UCP 600-inspired", never "UCP 600 documentary credit". The Trade Escrow Agreement
    is a separate instrument and is not a letter of credit (legal-risk §5.5).
  * Blockmediary is NOT itself regulated during the pilot. The DFSA-authorised partner
    is the regulated principal. Never write "DFSA authorised" or "regulated operator"
    (legal-risk §4.2).
  * Do NOT claim "non-custodial". The server-side release key means the custody
    perimeter is unresolved pending a written control analysis (Readiness Report §2).
- Block 1 leads with the FIXED-COST argument, not the rejection rate. ADB Dec 2025 found
  SME rejection (41%) has fallen to near-parity with large/mid-cap corporates (40%), so
  "SMEs are uniquely rejected" is no longer a safe hero claim. The per-deal fixed-cost
  economics are unaffected by that finding and are the stronger, defensible lead.
- "Rejected SMEs fall back on trust, prepayment, or drop the trade" replaced "Most SME
  cross-border trade still on trust, in cash, or not at all" — the old line read as a
  statistic but traced only to a June slide with no source behind it.
- SOURCED FIGURES — verified against primary publications, not internal docs:
  * $2.5tn = GLOBAL trade finance gap, not the SME-only gap. Do not relabel it.
  * 41% = SME rejection rate, ADB Dec 2025. The old "~45%" is the 2023 figure.
  * The "4-6 week LC wait" claim was removed: unsourced, and industry sources put
    issuance at 3-7 business days (existing relationship) to 1-2 weeks (first-time).
- KNOWN Q&A RISK: Block 1 cites a "$10K trade" to illustrate the bank's fixed-cost
  problem, while our own launch ticket is GBP 30-35K. That is deliberate — the $10K
  example describes the BANK's economics, not our target deal. If asked, say so; do not
  claim we serve $10K trades, because the tier minimum fees make them uneconomic.
- All figures are base case unless stated. GMV is trade value processed, not revenue.
-->

---

## Content — 8 Blocks

### Block 1 — The Business Opportunity
*Where is the gap in the market, and how do you intend to fill it?*

**The Problem**
- Same fixed compliance cost on a $10K trade as a $5M trade
- SME ticket sizes uneconomic for banks at scale
- $2.5T global trade finance gap (ADB, 2025); 41% of SME applications rejected
- Rejected SMEs fall back on trust, prepayment, or drop the trade

**Our Solution**
- UCP 600-inspired documentary release, stablecoin settlement, no issuing bank
- Buyer escrow → seller documents → release on compliant presentation
- Four verification layers plus an invoked escalation route

### Block 2 — Business Description
*Brief outline of your business model*

- Documentary escrow operator: verification, release rules, settlement
- Smart-contract escrow holds stablecoins against documentary release rules
- UCP 600-inspired Article 14 release logic — a Trade Escrow Agreement, not an LC
- Settlement on stablecoin rails (USDC), not bank correspondent networks
- Not a bank: no deposits, no lending, no token issuance
- Not DeFi: centralised trust and compliance layer by design
- Pilot runs under a DFSA-authorised partner's permissions — first paid deal Month 12
- Full VARA licence targeted Month 18 — the gate for UAE-wide scale

### Block 3 — Target Market

**Sector & geography**
- SME importers/exporters; UAE launch market
- Corridor: UAE–India (CEPA); further low-risk corridors per pilot envelope
- Sectors: manufacturing, consumer goods, electronics, textiles
- Ticket: £30K–£35K at launch → £36K–£51K by Year 5

**Strategic goals**
- Payment without LC cost or bank issuance delay
- Counterparty access without bank gatekeeping
- Verified trade reputation that travels across deals

**Pain points & risks**
- LC pricing and access barrier at SME tickets
- Pre-shipment payment-trust gap
- Document fraud and discrepancy risk
- Corridor FX and regulatory friction

### Block 4 — USPs
*How does your product/service compare? What makes you unique?*

- UCP 600-inspired documentary release on stablecoin rails
- Four-layer verification: screening → extraction → source corroboration → contracted examiner
- Self-pricing tiered model — customers trade speed against cost of trust
- Two-track UAE route: DIFC partner pilot now, own VARA licence for scale
- Cheaper all-in than an LC on the deals that matter most
- Compliance-first by design: not a bank, not DeFi

### Block 5 — Revenue

**Streams**
- A. Tiered escrow fee: 0.8% / 1.5% / 3.0% by verification tier
- B. Document review, dispute, expedited and onboarding fees
- C. Partner/API setup and committed-volume fees

**Projected revenue — base case**
- Year 3: £1.37m revenue on 2,000 deals and £76m GMV
- Blended take rate falls 2.0% → 1.0% as Tier A grows 15% → 70%
- Gross margin 71–79%; ancillary fees 31% of Y3 revenue, 18% by Y5
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
- **Truzo** — narrow UK–South Africa corridor; manual KYC, fiat rails
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

> *Sources: ADB (2025); ICC UCP 600 (2007); VARA Rulebook (2026); Blockmediary financial model and legal & compliance risk register, 13 Aug 2026. UCP 600-inspired release logic; not a letter of credit. Pilot operates under a DFSA-authorised partner. GMV is trade value processed, not revenue.*

---

## Figure provenance

Every figure on the canvas traces to a stated source — a model cell or a primary publication. Nothing here is inferred. Check these before re-recording if the model is revised.

| Figure on canvas | Source |
|---|---|
| $2.5tn global trade finance gap | ADB Global Trade Finance Gap Survey, Dec 2025 (see Sources). **Global**, not SME-only. |
| 41% SME applications rejected | Same ADB survey. Supersedes the 45% figure, which is 2023. |
| 0.8% / 1.5% / 3.0% take rates | `Assumptions!F63:F65` (0.008 / 0.015 / 0.03) |
| Blended 2.0% → 1.0% | `Tier Economics` escrow fee ÷ GMV (Y1 1.97%, Y5 1.033%), cross-checked against the workbook's own `Pitch Deck References` row, which states 2% / 1.3% / 1% independently. |
| Tier A mix 15% → 70% | `Assumptions!D54, D139` |
| Y3 £1.37m revenue, 2,000 deals, £76m GMV | `P&L 5yr!E7:E18` |
| Gross margin 71–79% | `Scenario Engine!H49:L49` |
| Ancillary 31% Y3 / 18% Y5 | `P&L 5yr!E16:E17` over `E18` — *Document review and exception-handling fees* plus *Partner / API and ancillary services*, over *Total revenue*. Do NOT derive as `1 − escrow ÷ total`: that nets the *Less: launch discounts and credits* contra-revenue line against ancillary and understates it. Full Y1–Y5: 38 / 48 / 31 / 22 / 18%. |
| Break-even Y4 M8 | `Cash Flow Statement!B45:B47` |
| £3.06m operating funding | `Launch Readiness!E12` |
| £319k VARA restricted capital | `Launch Readiness!E17` — broad three-activity placeholder. `docs/legal-risk.md` §4.3 notes Broker-Dealer is *not* established by the current model; a Transfer-and-Settlement-only scope drops the floor to ~AED 500k (~£106k). The model is deliberately conservative. |
| 8 → 24 FTE | `P&L 5yr!C36:G36` |
| Ticket £30K–£35K → £36K–£51K | `Sensitivity` deal-value table, **Base case only** (A £35,000→£51,244; B £30,000→£40,815; C £30,000→£36,465). Do NOT mix cases: the full Low–High span is £20K–£50K → £22K–£87K, and quoting a Low-case floor beside a Base-case floor is an error. Blended P&L average is £30,750 → £47,897 (`P&L 5yr!C8:G8`). |
| Pilot M12 / receipts M13 / licence M18 | `Launch Readiness!E6, E11, E14` |
| Enhanced review above £50K | `Revenue Risk Add-Ons` |

## Sources

- Asian Development Bank. (2025, December). *ADB global trade finance gap survey.* ADB Briefs. https://www.adb.org/publications/adb-global-trade-finance-gap-survey
  — 9th iteration; data collected 2023–2025 from 110+ providers. Global gap **$2.5tn**, unchanged from 2023, ~10% of global trade (down from 10.6%). SME rejection rate **41%** (2023: 45%); large/mid-cap corporates 40%.
- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.
- Central Bank of the UAE. (2024). *Payment Token Services Regulation.*
- Virtual Assets Regulatory Authority. (2026). *VARA Rulebook — Schedule 2: supervision and authorisation fees; Part B: paid capital.* https://rulebooks.vara.ae
- Blockmediary. (2026). *Financial model, submission-ready build, 13 August 2026.* `financial-projections/`
- Blockmediary. (2026). *Competitor analysis.* `docs/Competitor-analysis.md`
- Blockmediary. (2026). *Verification model v2.* `docs/verification-model-v2.md`
- Blockmediary. (2026). *Legal & compliance risk register.* `docs/legal-risk.md`
- Blockmediary. (2026). *DIFC partner-led pilot and VARA scale readiness report.* `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md`
- Central Bank of the Republic of Türkiye. (2021). *Regulation on the disuse of crypto-assets in payments, No. 2021/14.* (Basis for Türkiye exclusion.)
