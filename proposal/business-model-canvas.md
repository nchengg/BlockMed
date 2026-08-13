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
    Note docs/Competitor-analysis.md §2 still prints "Non-custodial (smart contract)"
    in its comparison table — that is the looser claim, do not copy it onto the canvas.
  * The $2.5T ADB figure is the GLOBAL trade finance gap, not an SME-only gap. The SME
    rejection rate is 41% (2025 survey); 45% is the superseded 2023 number. Both
    corrections were applied 13 Aug 2026 — do not revert to the older wording.
  * The ADB gap is a FINANCING gap and we do not fill it. Blockmediary lends nothing and
    provides no working capital. The scope line in Block 1 and the matching footer
    sentence exist to stop the $2.5T stat implying a trade-finance offering — if you cut
    the stat, you may cut the scope line; if you keep the stat, both stay.
  * Partner status is PROSPECTIVE, not agreed. No DFSA-authorised partner is signed and
    "DIFC partner-led pilot" is not a named DFSA licence category (Readiness Report §3.1).
    Always "planned through a suitably DFSA-authorised partner, subject to confirmed
    permissions and executed agreements". Never "runs under", never "operates under",
    never "now". This claim appears in THREE places — Block 2, Block 4, and the footer —
    keep them in step.
  * LC cost comparison is MODELLED and partial: "modelled to undercut traditional LC
    FEES on Tier A and selected Tier B". Tier C does not undercut. Never a flat
    "cheaper than an LC". "Fees" not "pricing" is deliberate — the Deal Value Research
    report warns the LC is not a like-for-like substitute (it bundles a bank undertaking,
    collateral, confirmation, financing and FX that we do not provide), so the claim is
    scoped to the fee line we actually beat, not to the whole instrument.
  * "Customer-selected verification tiers", not "self-pricing" — the latter reads as if
    the customer names their own price.
- All figures are base case unless stated. GMV is trade value processed, not revenue.
- Ticket sizes on this canvas are the MODELLED AVERAGE deal value (Scenario Engine row 9),
  not the target segment band. The $10K–$50K "LC dead zone" is the segment; £31K → £48K
  is what the base case actually processes. Keep both lines — they answer different questions.

BUILD: this markdown is the source of truth. `business-model-canvas.html` is its slide
rendering and must be kept in step; `business-model-canvas.pdf` is generated from the HTML.
See "Rebuilding the PDF" at the foot of this file.
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
- Blockmediary addresses the documentary trust and payment-assurance gap, not working-capital finance

### Block 2 — Business Description
*Brief outline of your business model*

- Documentary escrow operator: verification, release rules, settlement
- Smart-contract escrow holds stablecoins against documentary release rules
- UCP 600-inspired Article 14 release logic — a Trade Escrow Agreement, not an LC
- Settlement on stablecoin rails (USDC), not bank correspondent networks
- Not a bank: no deposits, no lending, no token issuance
- Not DeFi: centralised trust and compliance layer by design
- Pilot planned through a suitably DFSA-authorised partner, subject to confirmed permissions and executed agreements
- First paid deal targeted Month 12; full VARA licence Month 18 — the gate for UAE-wide scale

### Block 3 — Target Market

**Sector & geography**
- SME importers/exporters; UAE launch market
- Corridor: UAE–India (CEPA); more added per pilot envelope
- Sectors: manufacturing, consumer goods, electronics, textiles
- Ticket: the $10K–$50K "LC dead zone"; average deal £31K → £48K by Y5

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
- Customer-selected verification tiers — speed traded against cost of trust
- Two-track UAE route: DIFC partner pilot, then own VARA licence for scale
- Modelled to undercut traditional LC fees on Tier A and selected Tier B transactions
- Compliance-first by design: not a bank, not DeFi

### Block 5 — Revenue

**Streams**
- A. Tiered escrow fee: 0.8% / 1.5% / 3.0% by verification tier
- B. Dispute, expedited and onboarding fees
- C. Partner/API setup and committed-volume fees

**Projected revenue — base case**
- Year 3: £1.37m revenue on 2,000 deals and £76m GMV
- Blended take rate falls 2.0% → 1.0% as Tier A grows 15% → 70%
- Gross margin 71–79%; ancillary fees 25% of Y3 revenue, 17% by Y5
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
- **Truzo** — narrow UK–South Africa corridor; escrow wallet, no document layer
- **XREX** — licensed custodial escrow; releases on agreement, not documents
- **Komgo / Contour** — bank-consortium LC digitisation; Contour shut in 2023

---

## PPTX Design Specification

### Slide setup
- Format: 16:9 widescreen
- Dimensions: 13.333" × 7.5" (12192000 × 6858000 EMU — matches the Aug 2026 deck)
- Background: pure white `#FFFFFF`
- Two renderings exist, both generated — never hand-edited:
  - `business-model-canvas.html` → `business-model-canvas.pdf`, a full-bleed 16:9 page for
    standalone circulation and for dropping in as an image.
  - **Slide 6 of `business-model-canvas.pptx`**, built natively by `build_slides_4_5_6.py`,
    for editing inside the deck alongside slides 4 and 5.
    **That .pptx holds THREE slides — 4 (Product Architecture), 5 (Market) and 6 (this
    canvas).** It is named for slide 6 because the canvas is the submitted artefact, but
    do not assume from the filename that it is canvas-only. `business-model-canvas.pdf`
    is the canvas on its own; the .pptx is the submission bundle.
- Keeping both means the figures live in two renderers. This markdown remains the single
  source of truth: change it first, then mirror into BOTH the HTML and the build script,
  then regenerate. If they ever disagree, this file wins.

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

> *Sources: ADB (2025); ICC UCP 600 (2007); VARA Rulebook (2026); Blockmediary financial model and legal & compliance risk register, 13 Aug 2026. UCP 600-inspired release logic; not a letter of credit. Pilot planned through a suitably DFSA-authorised partner, subject to confirmed permissions and executed agreements. Blockmediary provides documentary escrow and payment assurance, not working-capital finance. GMV is trade value processed, not revenue.*

---

## Figure provenance

Every number in Blocks 5 and 6 traces to the financial model. Check these before re-recording if the model is revised.

| Figure on canvas | Model source |
|---|---|
| 0.8% / 1.5% / 3.0% take rates | `Assumptions!F63:F65` |
| Blended 2.0% → 1.0% | `Tier Economics` escrow fee ÷ GMV, Y1 / Y5. Cross-check: `Pitch Deck References` prints 2% / 1.3% / 1% for Y1 / Y3 / Y5 |
| Tier A mix 15% → 70% | `Assumptions!D54, D139` |
| Y3 £1.37m revenue, 2,000 deals, £76m GMV | `P&L 5yr!E7:E18`. Base £1,371,288 on 2,000 deals and £76,031,100 GMV (`Scenario Engine!J8:J10, J30`). Scenario range for Y3 revenue is £1.0m–1.9m |
| Gross margin 71–79% | `Scenario Engine!H49:L49` |
| Ancillary 25% of Y3 revenue, 17% by Y5 | `Scenario Engine`: (total revenue − escrow transaction fees) ÷ total revenue. Y3 = (1,371,288 − 1,022,499) ÷ 1,371,288 = 25.4%; Y5 = 16.8%. **Net of the first-deal discount drag (row 22).** Computing it gross of the drag gives 31% / 18% — that is the wrong basis, do not use it |
| Break-even Y4 M8 | `Cash Flow Statement!B45:B47` |
| £3.06m operating funding | `Launch Readiness!E12` |
| £319k VARA restricted capital | `Launch Readiness!E17` — broad three-activity placeholder. `docs/legal-risk.md` §4.3 notes Broker-Dealer is *not* established by the current model; a Transfer-and-Settlement-only scope drops the floor to ~AED 500k (~£106k). The model is deliberately conservative. |
| 8 → 24 FTE | `P&L 5yr!C37:G37` — total FTE 7.67 (Y1) to 24 (Y5); 7.67 rounds to 8 |
| Average ticket £31K → £48K | `Scenario Engine!H9:L9` base row: £30,750 (Y1) → £47,897 (Y5). Matches the approved `Pitch Deck References` copy ("GBP 31K → GBP 38K, Y1 to Y3; GBP 48K by Y5") |
| $10K–$50K "LC dead zone" segment | `docs/Competitor-analysis.md` §1 — segment definition, not a model output. Deliberately in $ because the source and the corridor research are in $ |
| Pilot M12 / receipts M13 / licence M18 | `Launch Readiness!E6, E11, E14` — base timing case (row 22) |
| Enhanced review above £50K | `Revenue Risk Add-Ons` |
| $2.5T gap; 41% SME rejection | ADB (2025) *Global Trade Finance Gap Survey* — gap held at $2.5T, ≈10% of global trade; SME rejection rate fell to 41% from 45% in 2023 |
| Truzo UK–South Africa; no document layer | `docs/Competitor-analysis.md` §4.2 — FCA/FSCA regulated escrow wallet on Currencycloud fiat rails, manual KYC only, no document verification |

## Rebuilding the PDF

`business-model-canvas.html` implements the design spec above. The PDF is generated from it —
never hand-edited — at the exact 13.333in × 7.5in page size, so it drops into the deck as a
full-bleed 16:9 slide.

```bash
"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=proposal/business-model-canvas.pdf \
  proposal/business-model-canvas.html
```

Any Chromium build (Chrome, Brave, Edge) works. Order of edits: markdown → HTML → PDF.
The blocks are set at a fixed height with `overflow: hidden`, so after adding a bullet
open the PDF and check nothing has been clipped at the foot of a block.

## Sources

- Asian Development Bank. (2025). *Global trade finance gap survey.* ADB. (Gap held at $2.5T, ≈10% of global trade; SME rejection rate 41%, down from 45% in the 2023 survey.)
- International Chamber of Commerce. (2007). *Uniform customs and practice for documentary credits (UCP 600), ICC Publication No. 600.* ICC.
- Central Bank of the UAE. (2024). *Payment Token Services Regulation.*
- Virtual Assets Regulatory Authority. (2026). *VARA Rulebook — Schedule 2: supervision and authorisation fees; Part B: paid capital.* https://rulebooks.vara.ae
- Blockmediary. (2026). *Financial model, submission-ready build, 13 August 2026.* `financial-projections/`
- Blockmediary. (2026). *Competitor analysis.* `docs/Competitor-analysis.md`
- Blockmediary. (2026). *Verification model v2.* `docs/verification-model-v2.md`
- Blockmediary. (2026). *Legal & compliance risk register.* `docs/legal-risk.md`
- Blockmediary. (2026). *DIFC partner-led pilot and VARA scale readiness report.* `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md`
- Central Bank of the Republic of Türkiye. (2021). *Regulation on the disuse of crypto-assets in payments, No. 2021/14.* (Basis for Türkiye exclusion.)
