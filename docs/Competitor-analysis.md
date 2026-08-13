# Competitor Analysis — Blockmediary

> Research compiled 2026-08-04 for the Main Group Video pitch (due **2026-08-14**) and the Individual Report (due 2026-08-28). Tony Wood's funding-deck template lists **Competitive Analysis** as its own slide — this doc is the source material for that slide plus the "why we win" narrative threaded through Problem/Solution/Market sections.
>
> All figures are sourced from public web research (see per-section Sources); flag anything used in the pitch deck as "as of Aug 2026" since funding/status figures move fast in this space.

---

## 1. Market context

- Cross-border trade finance for SMEs is projected to grow from **~$50.9B (2026) to ~$89.5B by 2034** (7.3% CAGR) — a large, underserved market since traditional Letters of Credit are built for large corporates, not SMEs.
- Two structurally different approaches compete for this market:
  1. **Bank-consortium blockchain networks** (Komgo, Contour, we.trade, Marco Polo Network) — digitize the *existing* LC/bank workflow, banks stay in the loop.
  2. **Fintech escrow platforms** (Tazapay, Truzo) — remove the LC entirely but keep a *centralized, custodial* intermediary (the fintech itself) plus manual document review.
- **Blockmediary's bet**: neither camp has combined (a) full bank removal, (b) non-custodial on-chain settlement, and (c) a deterministic document verification engine (AI extraction and a human review console are on the near-term roadmap, not yet delivered). That combination is the open lane.

---

## 2. Head-to-head comparison

| | **Blockmediary** | Tazapay | Truzo | XREX | Komgo | Contour *(defunct)* |
|---|---|---|---|---|---|---|
| **Founded** | 2026 | 2020 | 2017 | 2018 | 2018 | 2020 (shut down 2023) |
| **HQ** | — | Singapore | Johannesburg / London | Taipei | Geneva | Singapore |
| **Removes banks from flow?** | ✅ Yes | ❌ No (bank/EMI rails) | ❌ No (bank/EMI rails) | ⚠️ Partial (licensed intermediary) | ❌ No (digitizes bank workflow) | ❌ No (bank-issued LC, just faster) |
| **Custody model** | Non-custodial (smart contract) | Custodial | Custodial | Custodial | N/A (software only) | Custodial (via banks) |
| **Settlement rail** | On-chain, Base + USDC | SWIFT/local rails (+ stablecoin add-on) | Fiat via Currencycloud | Multi-asset (BTC/ETH/SOL/stables), custodial | Traditional bank settlement | Bank settlement (LC), Corda for docs only |
| **Document/trust verification** | **Deterministic rules engine** (AI extraction + human console: roadmap) | Manual back-office review | Manual KYC/compliance | Manual KYC + wallet risk scoring | Bank underwriting (Komgo just moves paperwork) | Bank underwriting |
| **Open-source contracts** | ✅ Yes | No | No | No | No | No |
| **Target customer** | SME buyer/seller, direct | B2B marketplaces (embedded) | UK↔SA trade corridor | Emerging-market SMEs (APAC focus) | Banks & large commodity traders | Banks & their corporate clients |
| **Fees** | Tiered 0.8% / 1.5% / 3.0% (Tier A/B/C), blended ~2% in Y1 falling toward ~1% by Y5 as Tier A mix grows | 0.8–3.8% + fixed fees | 0.8–3.1% tiered + FX | <1% transfers; 10 USDT/escrow | Not disclosed (enterprise licensing) | N/A (bank LC fees, ~1–3%) |
| **Funding raised** | — (hackathon/pre-seed) | ~$57.9M | ~$0.64M (stale, last raise 2020) | ~$42.7M (+ $18.75M Tether strategic) | ~CHF 26M+ from bank shareholders | ~$18.3M (shut down anyway) |
| **Current status** | In development | Active, expanding | Active, narrow corridor | Active, growing | Active, growing (400+ clients) | **Shut down Nov 2023** |

---

## 3. PESTLE analysis — Blockmediary's operating environment

> PESTLE analyzes the *macro-environment* Blockmediary operates in — these factors are largely external and shared across the market, unlike SWOT (which is company-specific). This is done **once, for Blockmediary**, not once per competitor: Political/Economic/Social/Environmental factors barely differ company-to-company in the same corridor, and the one axis that genuinely varies by company — **regulatory regime** — is folded into Political/Legal below as a short comparison instead of five duplicate PESTLEs. This section directly answers the module's "Consideration of FinTech environment" grading criterion (20% of the Proposal Video).

### Political

- **Favourable trade agreements underpin the beachhead corridor:** UAE–India CEPA (active since 2022) and UAE–Türkiye CEPA (in force since September 2023) give the chosen $10K–$50K textiles/garments corridor political tailwind — high trade volume, low tariff friction.
- **Corridor exclusions are politically driven, not just commercial:** China was struck from the corridor mix because of the PBoC's 2021 ban on crypto-asset speculation, which prevents Chinese SME sellers from legally holding or receiving USDC. Turkey's stablecoin-payments ban (CBRT Regulation 2021/14) is a similar political constraint — it's why Turkey is excluded as a target *market* even though the UAE–Türkiye trade corridor itself is in scope (Turkish counterparties on the other side of a UAE deal are not Blockmediary customers).
- **Regulators are actively building on-ramps for firms like Blockmediary**, not just gatekeeping: DIFC's FinTech Hive is politically motivated to attract crypto/fintech innovation to the free zone, and VARA has been building out a licensing track for exactly this kind of activity since 2025 — this is why the confirmed route is a DIFC partner-led pilot run in parallel with an independent VARA licence application, rather than the stricter UAE mainland (CBUAE) regime. ADGM was considered earlier and is no longer part of the plan.
- **Divergent political postures across target jurisdictions matter for market entry sequencing:** UK/EU regulators (FCA, ESMA) are mid-transition toward comprehensive crypto regimes (still politically contested, timelines slipping); UAE free-zone regulators are more overtly courting fintech entrants. This favours UAE-first market entry, which is exactly the beachhead already chosen.
- **Sanctions regimes are a live political variable per deal**, not a one-off: OFAC, UN Security Council, HM Treasury, and UAE sanctions lists can change between deal creation and fund release, and geopolitical shifts (e.g. new sanctions on a corridor) can eliminate a market segment overnight.
- **Competitor regulatory-regime comparison (folded in here rather than repeated per company):** Truzo operates under UK FCA + South Africa FSCA; XREX under Singapore MAS + Taiwan VASP registration; Komgo under EU/Swiss banking-consortium oversight. None of the five researched competitors are pursuing the DIFC-pilot-plus-VARA-licence strategy Blockmediary is — this is a distinct, and arguably underexploited, political positioning choice.

### Economic

- **The core economic opportunity is a market gap, not just a market size:** the global SME cross-border trade finance market is projected to grow from ~$50.9B (2026) to ~$89.5B by 2034 (7.3% CAGR) (Source: https://www.intelmarketresearch.com/cross-border-trade-finance-for-smes-market-44536), but the $10K–$50K deal size is what the team calls the "LC dead zone" — too small for banks to serve economically under a traditional Letter of Credit, too large to be handled on trust alone. Every researched competitor (Tazapay, Truzo, XREX, Komgo) is priced or structured for larger or different segments; none targets this exact dead zone.
- **Currency instability is a direct economic driver of adoption in the beachhead corridor:** Türkish lira inflation has already pushed Türkish SMEs toward stablecoin-native behaviour, meaning less user education is needed to get counterparties comfortable with USDC settlement — an economic tailwind specific to the UAE–Türkiye leg.
- **Fee economics are the headline competitive lever:** traditional LC fees run 1–3%; researched competitors cluster in a similar 0.8–3.8% range (Tazapay), 0.22–3.1% (Truzo), <1% (XREX transfers, though its escrow product charges a flat 10 USDT). Blockmediary prices by verification tier rather than a flat rate: 0.8% (Tier A, eBL-verified), 1.5% (Tier B, API-verified), 3.0% (Tier C, manual paper), validated in `docs/Blockmediary_Deal_Value_Research_Report.pdf` and the financial model. Removing the bank still removes the largest cost line on Tier A/B, undercutting the LC range at the low end; the blended take rate starts near 2% in Year 1 and falls toward 1% by Year 5 as Tier A adoption grows from 15% to 70% — a structural cost advantage on the deals that matter most, not a flat "~0%" claim.
- **SME cash-flow economics are the underlying pain point:** the ~90-day payment delay pattern in traditional cross-border trade (seller ships, waits for LC processing/payment) directly damages SME working capital — Blockmediary's near-instant, rules-based release changes the economics of running an SME trading business, not just the cost of a single transaction.
- **Macro rate environment affects willingness to prefund:** higher global interest rates increase the opportunity cost of a buyer locking capital in escrow before goods arrive — this is a genuine economic headwind for any prefunded-escrow model (Blockmediary included) that a report should acknowledge rather than gloss over.

### Social

- **Trust is a social, not just technical, problem** — SME owners in the target corridors have historically low trust in both crypto ("scam" perception) and in trusting an unfamiliar counterparty in a new country. Blockmediary competes on the same social trust gap that Truzo's "anti-scam" branding and Tazapay's "no hidden fees" messaging are also trying to solve, but through automated/on-chain proof rather than brand reassurance.
- **Diaspora networks are a social distribution channel, not just a demographic fact:** the large Indian diaspora resident in the UAE is the basis for the warm-intro go-to-market motion in the beachhead corridor — social trust travels faster through existing community networks than through cold outreach or advertising.
- **Generational and digital-literacy shifts favour adoption:** younger SME owners and operations staff are more comfortable transacting in stablecoins and using app-based workflows than the generation that built trust relationships with relationship bankers — this shift is what makes a non-bank, app-first alternative to an LC socially plausible now in a way it wasn't a decade ago.
- **Founder-led BD depends on social capital with freight forwarders**, who see the SME trust-gap problem earlier than banks do and have no commercial reason not to refer deals — this is a social/relationship dynamic the GTM plan deliberately leans on rather than paid channels.

### Technological

- **Two specific technology maturations make Blockmediary possible now that weren't feasible a few years ago:** (1) low-cost, fast-finality L2 blockchains (Base) make micro-value on-chain escrow economically viable — this would have been cost-prohibitive on Ethereum L1; (2) LLM-based document understanding (Claude) now makes automated verification of commercial invoices, bills of lading, and packing lists against a rules engine accurate enough to reduce (not eliminate) human review — earlier OCR-only approaches couldn't handle the judgement calls UCP 600-style document checking requires. **Status check:** the delivered prototype currently runs on the deterministic rules engine alone; this LLM extraction layer is a near-term roadmap item, not yet built.
- **Legal recognition of electronic trade documents is catching up to the technology:** the UK's Electronic Trade Documents Act 2023 and UNCITRAL's Model Law on Electronic Transferable Records (adopted in DIFC, Singapore, Bahrain) are what will eventually let Blockmediary move beyond scanned-PDF bills of lading to fully electronic, title-conferring eBLs — this is a near-term roadmap item gated by legal-tech convergence, not pure engineering.
- **The prior generation of blockchain trade-finance technology failed for organisational reasons, not technical ones** — Komgo, Contour, we.trade, and Marco Polo Network all had working DLT (Corda, Quorum, Hyperledger Fabric); they failed on adoption economics and consortium governance (see §4.5). The lesson for Blockmediary's technology strategy: technical sophistication is necessary but not sufficient — the architecture also has to avoid requiring closed-network, both-sides-onboarded infrastructure.
- **Key technology risk, not just enabler:** the releaser private key is a single point of failure (flagged in `docs/legal-risk.md` §5.4.1 as the platform's top security risk) — production deployment requires an HSM or threshold signature scheme, not a hot wallet. This is a live technological constraint on scaling past MVP.
- **Cloud/vendor infrastructure (KYB providers, Claude API, blockchain RPC nodes) is now mature and API-accessible enough for a small team to assemble a compliant stack quickly** — this lowers the technical barrier to entry, which cuts both ways: it's also available to future copycat competitors.

### Legal

- **The regulatory picture is a genuine patchwork, not a single hurdle:** UK (FCA CP25/14 stablecoin custody rules, CP25/40 CASP licensing), EU (MiCA Title V CASP authorisation, mandatory from July 2026, plus DORA operational-resilience obligations), and UAE (CBUAE Payment Token Services Regulation on the mainland, versus the confirmed DIFC partner-led pilot and parallel VARA licence route) each impose different licensing thresholds — see `docs/legal-risk.md` for the full 31-item risk register.
- **AML/KYC/sanctions compliance is a mandatory gate on every deal, not a one-time cost:** MLR 2017, 6AMLD, and the FATF Travel Rule (revised June 2025) require customer due diligence and screening before funding, and sanctions lists (OFAC, UN, HMT, UAE) must be re-checked at both funding and release — this is an ongoing operational/legal cost baked into the unit economics.
- **Smart contract enforceability is still legally unsettled in the UK** (per the Law Commission's 2021 report) — Blockmediary mitigates this with a separate, signed Trade Escrow Agreement that governs legal rights, with the smart contract as the execution layer only. None of the researched blockchain-trade-finance competitors that failed (Contour, we.trade, Marco Polo) solved this differently; it's an industry-wide open question, not a Blockmediary-specific gap.
- **Data protection law directly shapes the architecture:** GDPR's right to erasure (Art. 17) is fundamentally incompatible with writing personal data on an immutable public chain, which is why the confirmed architecture keeps all PII off-chain and only commits hashes/wallet addresses on-chain — a legal constraint that became a core design decision, not an afterthought.
- **Legal recognition gaps directly limit product scope today:** without ETDA/MLETR-qualifying electronic bill-of-lading systems fully integrated, Blockmediary's MVP accepts scanned PDF documents only — a legal-maturity ceiling on how far the "no paper courier" pitch can go until eBL infrastructure and law mature together.
- **Legal exclusions define the addressable market as much as economics do:** Turkey and mainland China are excluded primarily because their stablecoin-payment bans make Blockmediary's core product illegal there, not because the market opportunity is unattractive.

### Environmental

- **Chain choice has an ESG angle worth using in the pitch:** Base runs on Ethereum's proof-of-stake consensus, so Blockmediary's on-chain settlement layer has a materially smaller energy footprint than proof-of-work alternatives (Bitcoin-style chains) — a minor but genuine differentiator for judges or investors screening for ESG-aware infrastructure choices.
- **Digitising trade documentation reduces physical logistics overhead:** replacing courier-driven paper document exchange (a real cost and emissions source in traditional LC/documentary trade) with digital upload and verification is a modest environmental positive, secondary to the cost/speed pitch but usable as supporting colour.
- **Climate-linked supply chain disruption is an indirect but real risk factor:** extreme weather affecting shipping routes/ports (e.g. Red Sea/Suez disruptions, port congestion from storms) affects the underlying trade volumes and shipment timelines Blockmediary's document-release logic depends on — not a factor Blockmediary controls, but worth a one-line acknowledgement in a Reflection-section risk discussion.
- **Not currently a regulatory driver for Blockmediary's target markets** — unlike the Political/Legal/Economic factors above, environmental regulation (carbon reporting mandates, green trade finance requirements) is not yet a binding constraint on the beachhead corridor, so this axis is the lightest of the six for the MVP stage. Flag it as a forward-looking consideration rather than a current risk.

---

## 4. Company profiles

### 4.1 Tazapay
**Singapore · founded 2020 · ~$57.9M raised (Series A led by Sequoia SEA, extended Series B ~$36M)**

Started as a payment gateway, now runs a flagship **Escrow-as-a-Service** product embedded via API into B2B marketplaces (freight, gaming, travel, SME import/export). Accepts payments in 173+ countries, payouts to 70+ markets. Recently bolted on stablecoin on/off-ramps but core rails remain **traditional banking (SWIFT/local), MAS-licensed, fully custodial**. Document/trust verification is **manual** — Tazapay staff check shipping documents before releasing funds, ~48-hour turnaround. Fees run 0.8–3.8% + fixed charges.

**Weaknesses:** Trustpilot ~2/5 (495 reviews) — recurring complaints about refund friction, arbitrary account suspensions, multi-day payment freezes during fraud review, and (most damaging for an escrow brand) allegations that funds were sometimes released to suppliers *before* goods arrived.

**Contrast:** Tazapay is the clearest "same problem, old architecture" foil — centralized, custodial, human-reviewed. Blockmediary directly targets its weakest points: opacity and slow/arbitrary release become instant, rules-based, on-chain release.

---

### 4.2 Truzo
**Johannesburg / London · founded 2017 · ~$640K raised (seed, last disclosed round 2020)**

Pure escrow-as-a-service wallet, originally built for South African peer-to-peer/business anti-fraud use cases, expanded to the UK in 2023 (FCA-approved) specifically to serve the **UK↔South Africa trade corridor** (~£10bn/year). Fees are tiered by currency and transaction size (0.22–3.1%), with an extra £25 intermediary-bank surcharge for non-UK buyers. Runs on **traditional fiat rails** via Currencycloud — no blockchain, no stablecoins. Verification is manual KYC/AML compliance, not document-driven trust.

**Weaknesses:** Thin funding/traction history for a 9-year-old company (last raise reported 2020, ~6 Trustpilot reviews); narrow geographic corridor; fees at low transaction tiers (up to 3.1%) are comparable to or worse than the LC fees Blockmediary is trying to undercut.

**Contrast:** Truzo is a regulated fintech escrow wallet, not a trade-finance product — no document verification layer at all. Blockmediary's "remove banks entirely, price by verification tier" pitch is a direct rebuttal to Truzo's still-bank-routed, flat percentage-fee model — Truzo's absolute floor (0.22%, only at >£10m equivalent) can undercut Blockmediary's Tier A, but Blockmediary's 0.8%/1.5%/3.0% structure beats Truzo's typical small-deal pricing (up to 3.1%, plus a £25 non-UK intermediary-bank surcharge Blockmediary doesn't carry).

---

### 4.3 XREX
**Taipei · founded 2018 · ~$42.7M raised, incl. $18.75M strategic investment from Tether (2024)**

A full blockchain-enabled financial institution: crypto-fiat exchange, custody, cross-border payments, and a B2B escrow product called **BitCheck** (holds crypto/fiat until both parties confirm fulfillment; ~10 USDT fee). **XREX Pay** offers sub-1% cross-border transfers using USDT/USDC settlement, explicitly targeting emerging-market SMEs facing USD-liquidity shortages. Strong APAC/emerging-market focus, backed by heavy regulatory licensing (Singapore MPI, Taiwan VASP, US/Canada MSB) as its trust signal.

**Weaknesses:** Fundamentally **custodial** — XREX holds funds/keys, the opposite of non-custodial. Verification is manual KYC + automated wallet risk-scoring (via Sumsub/CipherTrace/TRM Labs), not document-based trust — no evidence of invoice/bill-of-lading verification, AI or otherwise. No open-source contracts.

**Contrast:** Closest in ethos (stablecoin-first, SME/emerging-market focus) but architecturally opposite on custody and trust model. Blockmediary: non-custodial smart contracts + deterministic rules-engine document verification (AI extraction on the roadmap) vs. XREX: custodial licensed intermediary + KYC/wallet-risk scoring.

---

### 4.4 Komgo
**Geneva · founded 2018 · ~CHF 26M+ raised from 20–25 bank/corporate shareholders (ABN AMRO, BNP Paribas, Citi, HSBC*, Shell, TotalEnergies, etc.)**

*Not a payments/escrow company at all* — Komgo sells enterprise SaaS to **banks and commodity traders** to digitize LCs, guarantees, KYC, and document exchange. Never touches funds directly. Notably, **Komgo abandoned its own blockchain** (originally Quorum) for the core LC product, moving to a centralized database — its CEO called dropping blockchain "one of the best decisions" the company made. Still fundamentally bank-intermediated: banks underwrite and hold funds, Komgo just moves the paperwork faster.

**Status:** Still active and growing in 2026 — 400+ corporate/institutional clients, 60+ connected banks, recent wins with Standard Chartered, Crédit Agricole ("Optimtrade"), National Bank of Greece.

**Contrast:** The clearest "old guard" foil. Komgo's trajectory — retreating *from* blockchain back to centralized infrastructure — is the opposite of Blockmediary's, and it never removes banks or serves SMEs directly (SMEs only reach Komgo through their bank).

---

### 4.5 Contour — shut down 2023 (case study)
**Singapore · founded 2020, spun out of the "Voltron" R3 Corda pilot · ~$18.3M raised from 9 bank shareholders (HSBC, Citi, Standard Chartered, BNP Paribas, SMBC, etc.) + R3, Bain, CryptoBLK**

Digitized Letters of Credit on **R3 Corda** (permissioned bank DLT), cutting LC processing from 5–10 days to under 24 hours in pilots. By 2023 it had grown to 9 investor-banks + 22 member banks across 17+ countries and onboarded corporates like Posco International — yet actual usage was only **~60–70 transactions/month network-wide**, far too low to cover enterprise infrastructure costs.

**Why it shut down (Oct–Nov 2023):**
1. **No lead investor** — a coalition of competing banks with no single accountable funder struggled to align on a fresh capital raise.
2. **Closed-network chicken-and-egg problem** — value only materialized when *both* counterparty banks were onboarded to Corda; adoption stayed patchy and most real trades fell back to paper/SWIFT.
3. **Revenue depended on bank goodwill**, not a self-serve customer base — unsustainable at ~60-70 tx/month.
4. **Expensive permissioned infrastructure** (per-node Corda licensing) vs. cheap public-chain rails.

Note: Contour's brand/IP was acquired by fintech Xalts in Feb 2024, then by XDC Ventures in 2025 to "re-energise" it — the brand persists but the original bank-consortium model failed.

**Lessons directly applied to Blockmediary's design:**
- No consortium governance — a single accountable product, not a coalition of competing banks.
- No closed-network onboarding requirement — buyer + seller just need USDC on Base; no counterparty-bank integration needed.
- Trust layer removes banks entirely (deterministic rules engine + smart contract, with AI extraction on the roadmap) rather than routing trust through issuing/advising banks faster.
- Self-serve fee model, not dependent on bank subsidy or goodwill.
- Public L2 (Base) + standard USDC rails instead of expensive permissioned enterprise DLT.

**Other bank-consortium blockchain networks that failed the same way** (useful supporting evidence for the pitch — this is a *pattern*, not a one-off):
- **we.trade** (EU bank consortium, Hyperledger Fabric) — entered liquidation June 2022.
- **Marco Polo Network** (~45 banks, R3 Corda) — filed for insolvency Feb 2023 after a reported Bank of America funding deal fell through.
- **TradeLens** (IBM + Maersk, shipping logistics blockchain) — discontinued Nov 2022, citing failure to achieve "full global industry collaboration."

---

## 5. Other adjacent players (brief, lower priority)

Surfaced during research but not core to the five requested — worth a footnote or one comparison-table row if slide space allows:

| Company | What it is | Relevance |
|---|---|---|
| **dltledgers** | Blockchain SME trade/supply-chain finance platform | Direct SME-trade-finance overlap; not deeply researched |
| **Damisa** | Blockchain/stablecoin B2B escrow, claims ~80% cost reduction vs. traditional trade finance | Close conceptual peer to Blockmediary |
| **Castler** | India-based smart-contract escrow infrastructure (enterprise/compliance angle) | Regional (India) enterprise-escrow peer |
| **Vaultion** | Claimed non-custodial multi-chain (incl. Base) escrow protocol | ⚠️ **Unverifiable** — sole source is a startup directory listing; no working site, GitHub, team, or funding data found. Likely pre-launch or directory filler. Do not present as a substantiated competitor without a caveat. |
| **WorldFirst / WorldTrade** | Smart-contract B2B sourcing payment protection for SME buyers | Adjacent SME-buyer-protection product |
| **EscrowLayer**, **Uniscrow**, **Escrowly**, **Tscrow** | Generic crypto/stablecoin escrow APIs, not trade-finance-specific | Lower priority — P2P/OTC tooling, not LC replacements |
| **Bridge (Stripe), BVNK (being acquired by Mastercard), Zero Hash, Conduit** | Stablecoin cross-border payment infrastructure | Overlapping rails, not escrow/trust products |
| **Ripple** | Cross-border settlement network, 300+ financial institutions | Payments-focused, not escrow |
| **Vakt** | Blockchain post-trade platform for physical commodities (Komgo's sister project) | Adjacent to Komgo, commodity-specific |

---

## 6. Positioning takeaways for the pitch deck / report

1. **The market has tried two failed/limited approaches** — bank consortiums (Komgo's blockchain retreat, Contour/we.trade/Marco Polo/TradeLens shutdowns) and centralized fintech escrow (Tazapay/Truzo's manual review + custodial risk + fee levels close to LC fees). Blockmediary is positioned as the synthesis neither camp reached.
2. **"No lead investor" / consortium governance is a proven failure mode** — cite Contour's CEO directly. Use this as evidence that bank-led blockchain trade finance structurally can't move fast; a focused, non-bank-owned product can.
3. **Custody and verification are the two axes that separate every competitor from Blockmediary** — the comparison table (§2) is built around exactly these two columns because no researched competitor is both non-custodial *and* automated-document-verified.
4. **Fee story:** Tazapay (0.8–3.8%) and Truzo (0.22–3.1%) both land in or above the 1–3% LC-fee range. Blockmediary's tiered 0.8%/1.5%/3.0% structure undercuts that range on Tier A and matches it on Tier B/C, with a blended take rate starting near 2% in Year 1 and falling toward 1% by Year 5 as Tier A adoption grows — a useful side-by-side stat for a slide, now backed by Conrad's deal-value research report rather than an aspirational "~0%" claim.
5. **Caveat to state explicitly in the report:** several "competitors" (Komgo, XREX) are larger, regulated, well-funded incumbents — Blockmediary's honest counter is speed of trust (rules-based verification in minutes vs. bank underwriting in days) and cost (no bank margin), not scale or regulatory maturity. AI extraction and a human review console are themselves still roadmap, not delivered — a second gap worth acknowledging directly in the Reflection section alongside scale and regulatory maturity.

---

## 7. Sources

**Tazapay:** [FinTech Futures](https://www.fintechfutures.com/paytech/singapore-s-tazapay-bags-16-9m-in-series-a-funding-round) · [PRNewswire Series A](https://www.prnewswire.com/in/news-releases/singapore-based-fintech-tazapay-raises-us16-9-million-in-series-a-fundraising-round-led-by-sequoia-capital-southeast-asia-301742788.html) · [DealStreetAsia Series B](https://www.dealstreetasia.com/stories/tazapay-extended-series-b-477235) · [TechCrunch](https://techcrunch.com/2023/02/10/tazapay/) · [Skydo review](https://www.skydo.com/blog/tazapay-fees-reviews-features) · [Tazapay stablecoin guide](https://tazapay.com/guides/stablecoin-payments-guide-global-businesses) · [PYMNTS EaaS launch](https://www.pymnts.com/news/b2b-payments/2021/tazapay-launches-escrow-as-a-service-with-global-b2b-marketplaces/) · [Trustpilot](https://www.trustpilot.com/review/tazapay.com) · [Fintech Singapore — agentic payments](https://fintechnews.sg/132703/ai/tazapay-agentic-payments-stablecoins/)

**Truzo:** [Crunchbase](https://www.crunchbase.com/organization/truzo) · [PitchBook](https://pitchbook.com/profiles/company/435426-13) · [FinTech Futures UK launch](https://www.fintechfutures.com/fintech/africa-focused-escrow-service-truzo-launches-in-the-uk) · [Truzo fees](https://truzo.com/escrow-fees/) · [Trustpilot](https://www.trustpilot.com/review/truzo.com)

**XREX:** [Tracxn](https://tracxn.com/d/companies/xrex/__R7Ns0qHHmCKRhQsHNV8t2wVrCVFRyOTinLKp2MmGsyA) · [Tether $18.75M investment](https://tether.io/news/tether-invests-18-75m-in-xrex-group-to-drive-financial-inclusion-in-emerging-markets/) · [Ledger Insights](https://www.ledgerinsights.com/tether-invests-18-75m-in-xrex-for-b2b-cross-border-stablecoin-payments/) · [XREX BitCheck](https://support.xrex.io/en/articles/6433093-what-is-escrow-and-bitcheck) · [XREX Pay](https://xrex.io/bitcheck/)

**Komgo:** [About Komgo](https://www.komgo.io/about) · [Ledger Insights $29M raise](https://www.ledgerinsights.com/blockchain-trade-finance-firm-komgo-raises-29-million/) · [Consensys case study](https://consensys.io/blockchain-use-cases/finance/komgo) · [Komgo Newsroom 2025](https://www.komgo.io/newsroom/komgo-2025-whats-new-and-what-you-need-to-know) · [S&P Global — trade finance blockchain failures](https://www.spglobal.com/market-intelligence/en/news-insights/articles/2022/10/trade-finance-industry-remains-hopeful-on-blockchain-despite-failed-projects-72557910)

**Contour & other failed networks:** [GTR — shutdown exclusive](https://www.gtreview.com/news/top-stories/exclusive-contour-to-shut-down-as-bank-shareholders-pull-funding/) · [Ledger Insights — shutter](https://www.ledgerinsights.com/contour-blockchain-trade-finance-network-shutter/) · [Forbes — Xalts acquisition](https://www.forbes.com/sites/davidprosser/2024/02/19/fintech-start-up-xalts-buys-contour-to-expand-trade-finance-platform/) · [GTR — XDC Ventures re-energise](https://www.gtreview.com/news/digital-trade/xdc-ventures-to-re-energise-contour-after-xalts-sale/) · [101 Blockchains — Contour overview](https://101blockchains.com/contour-blockchain/) · [Ledger Insights — Marco Polo insolvency](https://www.ledgerinsights.com/marco-polo-blockchain-trade-finance-insolvency/) · [Futurum Group — we.trade](https://futurumgroup.com/insights/hsbc-ibm-and-socgen-backed-blockchain-company-we-trade-is-now-we-broke/)

**Market context:** [Cross-Border Trade Finance for SMEs Market Insights](https://www.intelmarketresearch.com/cross-border-trade-finance-for-smes-market-44536) · [ICLG — Trade Finance on the Blockchain 2026](https://iclg.com/practice-areas/lending-and-secured-finance-laws-and-regulations/09-trade-finance-on-the-blockchain-2026-update/) · [WEF — fintech for SME cross-border trade](https://www.weforum.org/stories/2025/05/msme-cross-border-trade-payments/)

**Vaultion (unverified):** [promoteproject.com listing — sole source](https://www.promoteproject.com/startup/201117/vaultion)
