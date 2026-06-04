# Slide 6 — Business Model Canvas

**Transakt — Pitch Deck (Blockmediary)**

Template: Tony Wood facilitator deck, slides 50 and 53 (Business Model Canvas, 8 blocks).

> Rendered into the deck's house style (cream `#F7F4EF` background, Aptos / Aptos Display)
> rather than the white/Inter spec, so the slide sits consistently with the rest of the
> official deck. Per-block accent colours are preserved.

---

## The 8 Blocks

### 1 — The Business Opportunity  · accent: Navy
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

### 2 — Business Description  · accent: Purple
*Brief outline of your business model*
- Regulated centralised operator: escrow + verification + settlement orchestration
- Smart-contract escrow holds stablecoins against documentary release rules
- Mirrors UCP 600 Article 14 strict-compliance logic
- Settlement on stablecoin rails (USDC), not bank correspondent networks
- Not a bank: no deposits, no lending, no token issuance
- Not DeFi: centralised trust + compliance layer by design
- Phase 1: escrow + KYB/KYC + dispute + 6-layer verification
- Phase 2: matching + reputation + bank white-label rail + yield share

### 3 — Target Market  · accent: Blue
**Sector & geography**
- SME importers/exporters: UAE (primary) + KSA (parallel)
- Corridors: UAE–India (CEPA), UAE–Türkiye (textiles), KSA–Pakistan
- Sectors: manufacturing, consumer goods, electronics, textiles
- Ticket size: $5K–$250K (repeatable, low-to-medium value)

**Strategic goals**
- Cross-border payment without LC cost or 4–6 week wait
- Counterparty access without bank gatekeeping
- Verified trade reputation that travels across deals

**Pain points & risks**
- LC pricing + access barrier at SME tickets
- Pre-shipment payment-trust gap
- Document fraud / discrepancy risk
- Manual, paper-heavy, opaque processes
- Corridor FX + regulatory friction

### 4 — USPs  · accent: Teal
*How does your product compare? What makes you unique?*
- Only UCP 600-aligned documentary credit on stablecoin rails
- Six-layer verification moat (intake → OCR → carrier → human → fraud DB → forensics)
- Self-pricing tiered model (speed vs cost-of-trust)
- Gulf-native: UAE/KSA regulator-ready (VARA, ADGM, DIFC, PTSR 2024)
- SME-first pricing: $5K–$250K, not $1M+ bank LCs
- Regulated CeFi: not a bank, not DeFi

### 5 — Revenue  · accent: Green
**Streams**
- A. Settlement fee: 0.5–1.0% per trade (tier-dependent)
- B. SaaS / API licensing: verification API (P1); bank white-label rail (P2)
- C. Yield share on idle escrow (P2; tokenised T-bills, BUIDL, Ondo)

**Projected revenue**
- Year 3 revenue: **$400K–$1.0M** *(revised 29 May 2026 from customer-volume math — see Slide 10)*
- Gross margin: ~94% Tier A / ~36% Tier C / **60–70% blended**

### 6 — Costs  · accent: Amber
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

### 7 — Channels  · accent: Blue
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

### 8 — Competition  · accent: Navy
*Who are your competitors and what are their USPs?*

**1 — Incumbent banks issuing LCs** *(HSBC, Emirates NBD, Standard Chartered)*
- USPs: trust, regulation, correspondent networks

**2 — Programmable escrow platforms** *(XREX BitCheck — MAS-licensed, $400M+ escrowed)*
- USPs: stablecoin escrow + KYC, fast release, contract attachment

**3 — Stablecoin payment rails** *(Fasset $51M Series B; Circle Payments Network)*
- USPs: scale, regulatory clarity, settlement speed

---

## Grid layout (4 columns × 2 rows)

| Pos | Block | Accent |
|-----|-------|--------|
| Top-left | 1 · Business Opportunity | Navy `#0B1B3A` |
| Top-mid-left | 2 · Business Description | Purple `#5A4FBF` |
| Top-mid-right | 3 · Target Market | Blue `#1F6FB2` |
| Top-right | 4 · USPs | Teal `#0E8C7F` |
| Bottom-left | 5 · Revenue | Green `#2C7A33` |
| Bottom-mid-left | 6 · Costs | Amber `#C77D18` |
| Bottom-mid-right | 7 · Channels | Blue `#1F6FB2` |
| Bottom-right | 8 · Competition | Navy `#0B1B3A` |

Each block: cream/white card, a top accent bar in the block colour, bold accent-coloured
sub-section labels, and tight body bullets. First bullet under each header is the hero line.

---

## Sources

- Asian Development Bank. (2025). *Trade finance gaps, growth, and jobs survey 2025.*
- International Chamber of Commerce. (2007). *UCP 600, ICC Publication No. 600.*
- International Chamber of Commerce UAE. (2020). *UAE trade finance gap report.*
- Central Bank of the UAE. (2024). *Payment Token Services Regulation.*
- Abu Dhabi Global Market. (2023). *Stablecoin regulatory framework.*
- XREX. (2025). *XREX Pay BitCheck — programmable escrow for cross-border B2B payments.* https://xrex.io
- Fintech Global. (2026, May 15). *Fasset closes $51M Series B to scale stablecoin banking.* https://fintech.global
