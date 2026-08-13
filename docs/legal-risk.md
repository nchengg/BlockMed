# Blockmediary — Legal & Compliance Risk Register
**Role:** Chief Compliance Officer (CCO) — Badhri
**Last updated:** 2026-08-13 (rev. 6)
**Status:** Living document — update as research and build progress

**Rev. 6 change note:** Section 4 (UAE) and Section 10 rewritten. The UAE regulatory home is
no longer "ADGM for MVP; DIFC as scale-up" — the confirmed route, following a team decision
informed by a founder's existing DIFC-connected partner relationship and the detailed
readiness analysis in `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md`, is a
**DIFC partner-led pilot run in parallel with an independent VARA licence application**. ADGM
is no longer part of the plan. This mirrors the same route change already made in the
submitted `Risk_assessment.tex` / PDF — this document had not been updated to match until now.

---

## Document Purpose

This is the working legal risk reference for Blockmediary's CCO function. It covers the key regulatory risks, applicable rules, and mitigation strategies across our two target jurisdiction groups: **UK/EU** and **UAE/Dubai**. Turkey has been excluded from target markets. It serves both as internal working notes and as a shareable compliance reference for the team and hackathon judges.

Blockmediary is a **programmable documentary escrow layer for SME cross-border trade** — it locks stablecoin (USDC on Base) into a smart contract, verifies trade documents, and releases funds on compliance. This creates regulatory surface area across: crypto/stablecoin regulation, payment services, AML/KYB/KYC, data privacy, trade finance, and consumer/business protection law.

**Current status:** We validated the core escrow mechanism on testnet as a proof of concept. Mainnet deployment for real value would additionally require licensing/VASP registration, resolution of client-asset custody status, sanctions screening, resolution of the GDPR question raised by the on-chain spec hash, and a security audit — all of which are set out in this register as a forward-looking compliance roadmap, **not** as already satisfied.

---

## Quick-Reference Risk Register

| # | Risk Area | Regulation | Jurisdiction | Severity | Status |
|---|-----------|------------|-------------|----------|--------|
| 1 | Stablecoin issuance / custody | FCA CP25/14, FSMA 2000 | UK | 🔴 High | Monitoring — rules not yet final |
| 2 | Crypto-asset service provider (CASP) licensing | FCA CP25/40, MiCA | UK / EU | 🔴 High | Mitigation needed |
| 3 | Payment services (escrow = payment?) | PSD2 / PSR, EMD2 | UK / EU | 🟡 Medium | Architecture-dependent |
| 4 | MiCA CASP authorisation | MiCA Title V | EU | 🔴 High | Required before EU launch |
| 5 | AML / KYB / KYC | 6AMLD, MLR 2017, FATF R.15/16 | UK / EU | 🔴 High | Core product gate |
| 6 | FATF Travel Rule (VASP) | FATF R.16, revised June 2025 | Global | 🟡 Medium | Implement at wallet transfer |
| 7 | GDPR — personal data on-chain | GDPR Arts 5, 17, 25 | UK / EU | 🔴 High | ✅ CONFIRMED — all PII off-chain by design |
| 8 | Smart contract legal enforceability | Law Commission (UK) | UK | 🟡 Medium | Supplementary legal agreement needed |
| 9 | Turkey CASP licensing | CMB (SPK) Law No. 7518 | Turkey | 🔴 High | ⛔ N/A — Turkey excluded from target markets |
| 10 | Turkey stablecoin payments ban | CBRT regulation 2021 | Turkey | 🔴 High | ⛔ N/A — Turkey excluded; ban is primary reason for exclusion |
| 11 | Turkey data protection | KVKK Law No. 6698 | Turkey | 🟡 Medium | ⛔ N/A — Turkey excluded |
| 12 | UAE mainland licensing | CBUAE Payment Token Services Reg. | UAE mainland | 🔴 High | License or partner required |
| 13 | UAE Dubai VARA licensing | VARA Rulebook v2.0 (June 2025) | UAE (Dubai) | 🔴 High | Category 1 token approval needed |
| 14 | DIFC partner-led pilot + VARA licence (confirmed route) | DFSA outsourcing rules / VARA Rulebook v2.0 | UAE (DIFC + Dubai) | 🟢 Lower | Confirmed — pilot targets Month 12, VARA licence targets Month 18 |
| 15 | UAE data protection | PDPL Federal Decree-Law No. 45/2021 | UAE | 🟡 Medium | Exec regulations pending |
| 16 | Sanctions screening | OFAC, UN, HMT, UAE lists | Global | 🔴 High | Must screen before every deal |
| 17 | Trade finance / documentary credit law | UCP 600, URDG 758, eUCP | Global | 🟡 Medium | Governs release rule logic |
| 18 | Consumer / business protection | FCA PRIN, UCT Regulations | UK / EU | 🟡 Medium | Terms of service risk |
| 19 | Governing law & dispute forum | Contractual | All | 🟡 Medium | Must be specified per deal |
| 20 | Smart contract audit / security | FCA, VARA expectations | All | 🟡 Medium | Audit before production use |
| 21 | Trade document checklist — Incoterms® 2020 | ICC Incoterms® 2020 | Global | 🟡 Medium | Integrate into document verification engine |
| 22 | specHash committed to public blockchain — personal data GDPR gap | GDPR Arts 5, 17 | UK / EU | 🔴 High | Architecture decision needed before mainnet |
| 23 | Platform/intermediary deal initiation — third-party KYC reliance chain | MLR 2017 Reg 39, 6AMLD Art 25 | UK / EU | 🔴 High | Must be specified in TEA and compliance gate |
| 24 | Releaser key compromise — customer funds loss + breach notification | FCA CASP / PSR breach reporting, VARA incident reporting | All | 🔴 High | Key management policy required |
| 25 | Pause power as censorship lever — seller funds withheld post-compliance | Contract liability, FCA Consumer Duty, VARA conduct | All | 🟡 Medium | TEA must define permissible pause grounds |
| 26 | Electronic trade documents legal validity | UK Electronic Trade Documents Act 2023 (ETDA), UNCITRAL MLETR | UK / Global | 🟡 Medium | Accept eDocs only under ETDA-compliant terms |
| 27 | Export controls — dual-use and controlled goods | UK Export Control Order 2008, EU Dual-Use Reg 2021/821, US EAR/ITAR | UK / EU / Global | 🔴 High | Goods-category screen required at deal intake |
| 28 | FCA Consumer Duty — retail SME outcomes | FCA PS22/9 Consumer Duty (July 2023) | UK | 🟡 Medium | Assess whether SME users are retail customers |
| 29 | EU Digital Operational Resilience — ICT risk + incident reporting | DORA (EU Reg 2022/2554, in force Jan 2025) | EU | 🟡 Medium | Required alongside MiCA CASP authorisation |
| 30 | Electronic signature enforceability — Trade Escrow Agreement | eIDAS 2.0 (EU Reg 2024/1183), UK ECA 2000 | UK / EU | 🟡 Medium | Specify signature standard in TEA |
| 31 | Proceeds of Crime Act 2002 — criminal AML liability | POCA 2002 s.330 (UK) | UK | 🔴 High | MLRO SAR obligation; criminal liability for firm |

---

## 1. UK Regulatory Risks

### 1.1 Stablecoin Issuance & Cryptoasset Custody — FCA CP25/14

**What it is:** The FCA published CP25/14 in May 2025, proposing rules for firms that issue "qualifying stablecoins" (fiat-pegged cryptoassets) and for firms that provide custody of cryptoassets. Final rules expected in 2026; regime goes live after parliamentary approval.

**Risk to Blockmediary:**
- Blockmediary does not *issue* USDC — Circle does. However, if Blockmediary's smart contract ever holds USDC on behalf of parties in a way that constitutes "safeguarding" cryptoassets as a regulated activity, it could be caught by the custody rules.
- The FCA's proposed CASS (client asset) framework for cryptoassets would require FCA authorisation, segregation of customer assets, and robust custody arrangements.

**Mitigation:**
- Use a **smart-contract escrow model** (not a Blockmediary-controlled wallet) — funds sit in the on-chain contract, not with Blockmediary directly.
- For production, partner with an FCA-authorised cryptoasset custodian rather than holding assets ourselves.
- Monitor CP25/14 Policy Statement (expected Summer 2026) and adjust architecture accordingly.
- In the hackathon context, operate on testnet / mock USDC — no real regulated activity triggered.

**Key reference:** [FCA CP25/14](https://www.fca.org.uk/publications/consultation-papers/cp25-14-stablecoin-issuance-cryptoasset-custody)

---

### 1.2 Crypto-Asset Service Provider Licensing — FCA CP25/40

**What it is:** CP25/40 (published 2025) sets out the FCA's broader framework for regulating cryptoasset activities, expanding on the Financial Services and Markets Act 2000 (FSMA) regime. Firms providing cryptoasset services — including exchange, custody, and related services — to UK persons must be FCA-registered or authorised.

**Risk to Blockmediary:**
- Depending on how "arranging" or "operating" the escrow is characterised, Blockmediary may need FCA registration as a cryptoasset business.
- The current FCA cryptoasset registration regime (under MLR 2017) focuses on AML compliance, but the new FSMA-based regime will introduce conduct, prudential, and consumer protection obligations.

**Mitigation:**
- Take legal advice on whether Blockmediary's activity constitutes a regulated cryptoasset service under the new regime.
- For MVP/hackathon: operate in testnet only; no UK persons transacting with real funds.
- For production: budget for FCA authorisation (timeline: 12–18 months) or launch initially via the confirmed DIFC partner-led pilot (§4.2, §10), which has a faster path to a first live transaction.

**Key reference:** [FCA CP25/40](https://www.fca.org.uk/publications/consultation-papers/cp25-40-regulating-cryptoasset-activities)

---

### 1.3 Payment Services — PSD2 / PSRs 2017

**What it is:** The Payment Services Regulations 2017 (UK PSRs) implement PSD2 and regulate payment services. The EU's revised PSD3 / PSR framework is also developing.

**Risk to Blockmediary:**
- If Blockmediary's escrow function is characterised as "holding funds on behalf of parties" or "executing payment transactions," it could be a payment service requiring FCA authorisation as a Payment Institution or E-Money Institution.
- The smart-contract escrow model partially mitigates this — funds go directly into the contract, not through Blockmediary's own accounts. But the "release instruction" step (where Blockmediary authorises the on-chain release) may still be caught.

**Mitigation:**
- Legal opinion on whether the escrow release instruction constitutes execution of a payment transaction.
- Ensure Blockmediary's role is framed as **verification and orchestration**, not as a payment service provider or e-money issuer.
- For production: consider partnering with a licensed payment institution for the fiat on/off-ramp layer.

---

### 1.4 AML / KYB / KYC — Money Laundering Regulations 2017 & 6AMLD

**What it is:** The UK Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017 (MLR 2017, as amended) require cryptoasset businesses to apply customer due diligence, transaction monitoring, and suspicious activity reporting. The EU's 6th Anti-Money Laundering Directive (6AMLD) tightens AML obligations across the EU. Underlying the MLR regime is the **Proceeds of Crime Act 2002 (POCA)**, which makes money laundering a criminal offence in the UK and creates the Nominated Officer's (MLRO's) mandatory Suspicious Activity Report (SAR) obligation under s.330. Failure to file a SAR where one is required is a criminal offence for both the firm and the individual MLRO — POCA is the statute under which prosecution occurs, not MLR 2017 (which sets the procedural framework). The Terrorism Act 2000 (TA 2000, s.19) creates a parallel obligation for terrorist financing suspicions.

**Risk to Blockmediary:**
- Blockmediary is a VASP (Virtual Asset Service Provider) by FATF definition — it facilitates transfers and custody of virtual assets. This triggers full AML/CFT obligations.
- Failure to implement adequate KYB/KYC before escrow funding creates risk of facilitating sanctioned or money-laundering transactions.
- Trade-based money laundering (TBML) is a specific risk in cross-border trade escrow — over/under-invoicing, phantom shipments, and document fraud are known typologies.

**Mitigation:**
- Implement a **compliance gate before funding**: both parties must complete KYB/KYC, sanctions screening, wallet screening, and goods/corridor eligibility before escrow is funded. (Already built into the MVP_FLOW.md design.)
- Use a reputable KYB/KYC provider (e.g. Sumsub, Jumio, Onfido) with sanctions and PEP screening.
- Maintain a **TBML risk checklist** for trade documents — watch for: invoice price inconsistent with market rates, unusual shipment routes, vague goods descriptions, discrepancies between documents.
- File Suspicious Activity Reports (SARs) where required under POCA s.330. The MLRO must file before any "prohibited act" (completing the transaction) where a suspicion exists — this is the "consent" SAR route.
- Appoint a UK Money Laundering Reporting Officer (MLRO) for production. The MLRO has personal criminal liability under POCA s.330 for failure to disclose.
- **Platform/intermediary-initiated deals (BRD §5, decided 2026-06-10):** When a third-party platform or freight forwarder initiates a deal and invites both buyer and seller, Blockmediary must ensure KYC/KYB on all principals is performed by either (a) Blockmediary directly, or (b) a third party under MLR 2017 Reg 39 (reliance on third parties). Third-party reliance requires: the third party is itself subject to AML obligations equivalent to the UK regime; a written reliance agreement is in place; Blockmediary can obtain the KYC data on request within 2 business days. This reliance arrangement must be documented in the TEA and the compliance gate. Do not allow a platform-initiated deal to fund before KYC of the underlying buyer and seller is confirmed.

**Key reference:** [FATF 2025 Virtual Assets Targeted Update](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/targeted-update-virtual-assets-vasps-2025.html)

---

### 1.5 FATF Travel Rule

**What it is:** FATF Recommendation 16 (revised June 2025) requires VASPs to collect, verify, and transmit originator and beneficiary information alongside virtual asset transfers above a threshold (USD/EUR 1,000 in most jurisdictions).

**Risk to Blockmediary:**
- Every escrow funding and release transaction is a virtual asset transfer. The Travel Rule requires Blockmediary to collect and share identifying information about both parties with counterparty VASPs.
- The revised standards take effect domestically by end of 2030, but many jurisdictions (UK, EU under MiCA, UAE) are already implementing.

**Mitigation:**
- Collect full KYB/KYC data at onboarding — this also satisfies the Travel Rule data requirement.
- For wallet-to-contract transfers: implement Travel Rule data transmission to counterpart VASPs where both sides are VASPs.
- For MVP/hackathon: document the compliance design; note that testnet transactions do not trigger real obligations.

**Key reference:** [FATF Travel Rule update June 2025](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

---

### 1.6 GDPR — Data Privacy (UK GDPR / EU GDPR)

**What it is:** UK GDPR (retained post-Brexit) and EU GDPR (Regulation 2016/679) impose obligations on any entity processing personal data of UK/EU residents: lawful basis, purpose limitation, data minimisation, right to erasure, data subject rights, breach notification, etc.

**Risk to Blockmediary:**
- **On-chain immutability vs. right to erasure (Art. 17 GDPR):** If any personal data (names, addresses, wallet addresses linked to identity) is written on-chain, it cannot be deleted — directly conflicting with GDPR's right to erasure.
- **specHash on a public blockchain (TRD §6.1 — active architecture risk):** The full-product design commits the keccak256 hash of the canonical escrow specification to Base Sepolia at `createDeal`. The spec contains party names and KYC reference IDs. Even though a hash is not the plaintext data, where Blockmediary controls both the spec store (off-chain, containing the names) and the on-chain hash, the hash can be linked back to identified individuals — making it personal data under GDPR's functional definition. Committing it to an immutable public chain creates a permanent, non-erasable record linked to personal data, in direct conflict with GDPR Art. 17. This is a live architectural risk requiring a design decision before mainnet deployment.
- **Wallet address as personal data:** The EDPB and many DPAs consider blockchain wallet addresses to be personal data where they can be linked to an identified individual. Because Blockmediary links wallets to verified legal identities, this linkage is clearly personal data.
- **KYC document storage:** Passports, ID images, business registration documents, and beneficial ownership information are all personal and sensitive data requiring secure, GDPR-compliant storage.
- **Cross-border data transfers:** If using cloud infrastructure or KYB providers that process data outside the UK/EU/EEA, standard contractual clauses (SCCs) or UK IDTA must be in place.

**Mitigation (Critical — Architecture Level):**
- **All personal data is kept off-chain (confirmed architecture decision).** The smart contract stores only: wallet addresses, deal amounts, state transitions, and document hashes. No names, no documents, no KYC data on-chain. This is not aspirational — it is the implemented design.
- Store KYC/KYB data in an off-chain, GDPR-compliant database (encrypted at rest and in transit).
- Use **pseudonymisation** — link on-chain wallet addresses to off-chain identity records via an internal reference ID, not the individual's name.
- **For the specHash problem:** three options — (a) omit personal data entirely from the spec before hashing (use only deal IDs and amount, strip names); (b) hash only a subset of the spec that contains no personal data; (c) use a zero-knowledge commitment scheme so the on-chain commitment reveals nothing about the spec content. Option (a) is simplest for the MVP. Chosen option must be decided before mainnet and documented as an architecture decision.
- Publish a Privacy Notice explaining lawful basis (contract performance + legal obligation), data retention periods, and data subject rights.
- Appoint a Data Protection Officer (DPO) or equivalent for production.
- Implement a data breach notification procedure (72-hour notification to ICO under UK GDPR).

**Key references:**
- GDPR Article 17 (right to erasure)
- GDPR Article 25 (data protection by design and default)

---

### 1.7 Smart Contract Legal Enforceability (UK)

**What it is:** The UK Law Commission published a report in 2021 confirming that smart contracts can be legally binding under English law, but identified areas of uncertainty around: offer/acceptance, consideration, mistake, and remedies.

**Risk to Blockmediary:**
- The Blockmediary smart contract enforces financial obligations (fund release, refund) automatically. If a party challenges the on-chain outcome in court, the question arises: is the smart contract the binding agreement, or is it merely an execution mechanism for the off-chain Trade Escrow Agreement?
- On-chain state transitions (e.g. `Released`) may not be reversible even if a court orders otherwise.

**Mitigation:**
- Maintain a **separate, signed Trade Escrow Agreement** (off-chain, in natural language) that governs the parties' rights. The smart contract is the execution layer; the agreement is the legal record.
- Include a **governing law and jurisdiction clause** (recommend English law for UK/EU deals — well-developed commercial and trade finance law).
- Include explicit language: "The smart contract constitutes the automated execution mechanism for this Agreement. In the event of conflict between on-chain outcomes and this Agreement, the parties agree [resolution mechanism]."
- Provide a dispute escalation path to an external forum (ICC DOCDEX, LCIA, or agreed arbitration).

---

### 1.8 UK Electronic Trade Documents Act 2023 (ETDA)

**What it is:** The Electronic Trade Documents Act 2023 (in force September 2023) is the first UK law to give electronic trade documents — including electronic bills of lading (eBLs), ship's delivery orders, sea waybills, and warehouse receipts — the same legal status as paper originals under English law. It is based on UNCITRAL's Model Law on Electronic Transferable Records (MLETR). Equivalent laws have been adopted in Singapore, Bahrain, and within the DIFC — relevant for the UK/EU/ME corridors Blockmediary targets.

**Risk to Blockmediary:**
- Blockmediary is a digital platform that accepts uploaded trade documents as the basis for fund release. The legal validity of those documents — particularly whether an eBL constitutes a "document of title" giving the holder right to claim the goods — depends on whether the ETDA (or equivalent MLETR law) is satisfied.
- If a seller submits an electronic bill of lading that does not meet ETDA requirements (e.g. it is not issued via a qualifying electronic system, or the "control" requirement is not met), it may not be legally equivalent to a paper original. Releasing funds against a legally invalid document exposes Blockmediary to liability.
- UCP 600 Art. 17 requires at least one original of each required document. The eUCP supplement governs what counts as an "original" in electronic form. The ETDA operates alongside eUCP but is a separate UK statute — compliance with eUCP alone does not guarantee ETDA compliance.
- The ETDA "control" requirement: a person has control of an electronic trade document if they can use it, transfer it, and prevent others from doing so. An electronic document that can be freely copied (e.g. a PDF emailed to multiple parties) does not satisfy this — it must be on a system that enforces singularity of control.

**Mitigation:**
- In the Blockmediary platform terms and Trade Escrow Agreement: require that any electronic bill of lading submitted via the platform is issued on an **ETDA-qualifying electronic system** (e.g.BOLERO, essDOCS, WaveBL, TradeLens successors, or carrier-native eBL platforms) — not a simple PDF.
- For scanned paper documents: these remain valid paper originals and are not subject to the ETDA — accept them as-is (with the presenter warranty from eUCP).
- Include a representation in the document upload terms: the presenter confirms that any electronic transferable record submitted satisfies the requirements of the applicable law governing electronic trade documents (ETDA for English-law deals; MLETR-equivalent for UAE/DIFC deals).
- For the MVP: accept scanned PDFs only (which avoids the ETDA question entirely) and document the eBL pathway as a post-MVP feature requiring ETDA-qualifying system integration.
- Monitor equivalent MLETR adoptions in UAE (DIFC already adopted) and EU (EU digital transport documents under eFTI Regulation 2020/1056).

**Key reference:** UK Electronic Trade Documents Act 2023; UNCITRAL MLETR; [docs/UCP600.md](UCP600.md) Art. 17

---

### 1.9 FCA Consumer Duty (PS22/9, July 2023)

**What it is:** The FCA's Consumer Duty (Policy Statement PS22/9, in force July 2023) substantially replaced and expanded the Principles for Business (PRIN) framework for retail-facing UK financial services firms. It requires firms to deliver "good outcomes" across four pillars: (1) products and services, (2) price and value, (3) consumer understanding, and (4) consumer support. The Duty applies to firms in the "distribution chain" — including firms whose products reach retail customers indirectly.

**Risk to Blockmediary:**
- The key question is whether Blockmediary's SME buyer and seller users are "retail customers" under FCA rules. The FCA definition of retail customer excludes "eligible counterparties" (large institutions) but **includes most SMEs** unless they qualify as "professional clients" (which requires financial sophistication thresholds most SMEs won't meet). If Blockmediary's users are retail customers, Consumer Duty applies in full.
- The four pillars create specific obligations beyond old PRIN: the "consumer understanding" pillar requires that communications are clear, fair and not misleading in a way that is specifically tested against a "retail customer" standard; the "price and value" pillar requires that the fee structure delivers fair value; the "consumer support" pillar requires accessible complaint and support channels.
- Consumer Duty also imposes a **proactive obligation** — firms must not just avoid harm but must actively pursue good outcomes. This includes monitoring and reviewing whether the product continues to deliver good outcomes for users.
- The existing row 18 ("FCA PRIN, UCT Regulations") in the register understates this risk. Consumer Duty is a materially heavier obligation.

**Mitigation:**
- Conduct a **retail/professional client classification** exercise for Blockmediary's target SME users. If most users will be retail customers (likely), design the product and communications to satisfy Consumer Duty from the outset.
- Apply the "consumer understanding" test to all marketing, terms of service, fee disclosures, and the Trade Escrow Agreement — would a reasonable SME in the target market understand what they are agreeing to and what the risks are?
- Build a complaints handling process that satisfies FCA DISP (Dispute Resolution) rules — including an 8-week written response obligation and Financial Ombudsman Service (FOS) referral rights for eligible complainants.
- For the hackathon: note that Consumer Duty applies to the production product but is not triggered in a testnet/MVP context with no real users.

**Key references:** FCA PS22/9 Consumer Duty; FCA PRIN 2A; FCA DISP

---

## 2. EU Regulatory Risks

### 2.1 MiCA — Markets in Crypto-Assets Regulation

**What it is:** MiCA (EU Regulation 2023/1114) is the EU's comprehensive crypto-asset framework. Key provisions:
- **Title III** (ARTs — stablecoins pegged to multiple assets): authorisation by national competent authority, reserve requirements, whitepaper disclosure.
- **Title IV** (EMTs — e-money tokens, single fiat peg): must be issued by authorised credit institution or e-money institution.
- **Title V** (CASPs — crypto-asset service providers): requires MiCA authorisation to provide services including custody, exchange, transfer of crypto-assets in the EU. Full application from December 2024; transitional period ends **1 July 2026**.

**Risk to Blockmediary:**
- USDC is an EMT under MiCA (single fiat peg). Circle must be MiCA-authorised to issue USDC in the EU. **Note:** Binance and Coinbase delisted non-MiCA-compliant stablecoins in 2024–2025. Blockmediary must use a MiCA-compliant USDC.
- Blockmediary itself may qualify as a CASP if it provides crypto-asset transfer or custody services to EU persons. This requires MiCA authorisation (or a national transitional arrangement, but these expire 1 July 2026).
- Post-July 2026, operating without MiCA authorisation for EU users is unlawful.

**Mitigation:**
- Confirm with Circle that USDC used is MiCA-compliant (Circle received EMI authorisation in France in 2024).
- For EU market entry: apply for MiCA CASP authorisation with a national competent authority (note: requires EU-established entity).
- For hackathon: note the MiCA compliance path in the pitch; operate on testnet only.
- The confirmed DIFC partner-led pilot (§4.2, §10) is the initial regulatory home; whether it can passport to EU activity later is not yet confirmed and should be checked with counsel.

**Key references:**
- [EBA MiCA page](https://www.eba.europa.eu/regulation-and-policy/asset-referenced-and-e-money-tokens-mica)
- [ESMA MiCA page](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica)

---

### 2.2 DORA — Digital Operational Resilience Act (EU Regulation 2022/2554)

**What it is:** DORA came into full force on 17 January 2025 and applies to financial entities operating in the EU, including crypto-asset service providers (CASPs) authorised under MiCA. It establishes a harmonised framework for ICT (information and communication technology) risk management across EU financial services. Key requirements: an ICT risk management framework, mandatory ICT incident reporting to competent authorities, digital operational resilience testing (including threat-led penetration testing for significant firms), and contractual requirements for third-party ICT providers.

**Risk to Blockmediary:**
- DORA is not a standalone licence — it is a compliance obligation that comes with MiCA CASP authorisation (already flagged as required in §2.1). Firms cannot hold a MiCA CASP licence without also satisfying DORA.
- Blockmediary's target architecture depends on multiple third-party ICT providers: Anthropic Claude (AI/OCR extraction — roadmap, not yet delivered; the current prototype uses a deterministic rules engine), cloud infrastructure (document storage, audit ledger), KYB/KYC provider (TBD), blockchain node provider (Base Sepolia / mainnet RPC). Each of these is a "third-party ICT provider" under DORA, requiring: risk assessment, written contractual terms (including audit rights, exit plans, SLA commitments), and inclusion in Blockmediary's ICT risk register.
- DORA's incident reporting obligation: significant ICT incidents must be reported to the national competent authority. For Blockmediary, a releaser key compromise (§5.9 below), a prolonged outage of the document verification service, or a data breach affecting the KYC database would all be reportable incidents.
- Major incidents must be reported: initial notification within 4 hours of classification; intermediate report within 72 hours; final report within 1 month.

**Mitigation:**
- Do not treat DORA as a separate workstream from MiCA — build the ICT risk framework at the same time as the MiCA CASP authorisation process.
- Maintain a **third-party ICT provider register** listing all providers, their role, risk classification, and contractual terms.
- Draft DORA-compliant ICT contracts with Anthropic (Claude API), cloud provider, and KYB/KYC vendor before EU launch.
- Implement an ICT incident classification and reporting procedure; designate an ICT risk function (can be combined with the CCO role at MVP stage).
- For hackathon: document the DORA compliance pathway alongside MiCA; note it is not triggered until EU launch.

**Key reference:** DORA (EU Reg 2022/2554); EBA/ESMA/EIOPA Joint Guidelines under DORA

---

### 2.3 eIDAS 2.0 — Electronic Identification and Trust Services (EU Regulation 2024/1183)

**What it is:** eIDAS 2.0 (EU Regulation 2024/1183, published April 2024, superseding the original eIDAS 910/2014) governs electronic identification and trust services across the EU. It introduces the EU Digital Identity Wallet (EUDIW) and updates the legal framework for electronic signatures. For financial services contracts, the key provision is that a **Qualified Electronic Signature (QES)** has the same legal effect as a handwritten signature across all EU member states. For the UK post-Brexit, the equivalent framework is the Electronic Communications Act 2000 (ECA 2000) and the retained eIDAS Order 2021.

**Risk to Blockmediary:**
- The Trade Escrow Agreement (TEA) is a legally binding contract between buyer, seller, and Blockmediary. For it to be enforceable across EU jurisdictions, it must be signed using a legally recognised electronic signature method.
- If the TEA is signed via a simple click-wrap ("I agree" button) or basic email confirmation, it may not be enforceable as an "advanced" or "qualified" electronic signature in some EU member states where higher standards are required for certain contract types.
- The new FCA Consumer Duty and contract law standards in the UK also require that consumers can demonstrate they understood and agreed to terms — a click-wrap alone may not satisfy this.
- SIWE (Sign-In with Ethereum) wallet signatures do not currently qualify as a QES under eIDAS — they are not issued by a qualified trust service provider (QTSP). However, they are a form of "advanced" electronic signature in the sense that they are uniquely linked to the signatory (their private key) and capable of detecting subsequent changes. Legal advice is needed on whether SIWE signatures satisfy the relevant enforceability threshold for the TEA.

**Mitigation:**
- For EU deals: specify in the TEA that parties agree to be bound by electronic signature and identify the signature method used (click-wrap, SIWE, DocuSign, etc.).
- For high-value or disputed deals: consider offering an **Advanced Electronic Signature (AdES)** option via a trust service provider (e.g. DocuSign eIDAS-compliant, Adobe Sign, Signicat) — this gives a verifiable legal trail.
- For the UK: the ECA 2000 takes a functional approach — an electronic signature is valid if the parties intend to be bound by it. Click-wrap and SIWE should both satisfy ECA 2000, but include an explicit consent clause in the TEA.
- Include in the TEA: "Each party agrees that their electronic approval of this Agreement (whether by wallet signature, click-acceptance, or other agreed method) constitutes a valid and binding electronic signature under the Electronic Communications Act 2000 (UK) and, where applicable, Regulation (EU) 2024/1183 (eIDAS 2.0)."

**Key references:** eIDAS 2.0 (EU Reg 2024/1183); UK ECA 2000; ETSI electronic signature standards (AdES)

---

## 3. Turkey Regulatory Risks

> ⛔ **Turkey is excluded from Blockmediary's target markets as of June 2026.** The CBRT stablecoin payments ban (Regulation No. 2021/14) directly prohibits Blockmediary's core product model. The CMB CASP licensing deadline (30 June 2026) and minimum capital requirement (TRY 100M ≈ ~£2.3M) add a further barrier. This section is retained as a reference record. No action items are open for Turkey.

### 3.1 CASP Licensing — CMB (SPK) Law No. 7518

**What it is:** Turkey's Capital Markets Law was amended by Law No. 7518 (2024) to bring crypto-asset service providers under CMB (SPK) supervision. CMB circulars published March 2025 set minimum capital requirements (TRY 100 million for platforms; TRY 50 million for custody-only) and operational requirements. All CASPs must obtain a certificate of authorisation by **30 June 2026**.

**Risk to Blockmediary:**
- Operating as a CASP serving Turkish users without CMB authorisation after June 2026 is unlawful.
- The capital threshold (TRY 100M ≈ ~£2.3M) is significant for a startup.

**Mitigation:**
- Turkey is **excluded from Blockmediary's target markets**. No Turkish users will be onboarded at any phase until the regulatory position materially changes.
- Monitor MASAK Circular No. 29 (June 2025) passively — no active regulatory engagement in Turkey.

---

### 3.2 Stablecoin Payments Ban — CBRT Regulation 2021

**What it is:** The Central Bank of Turkey (CBRT) banned the use of crypto-assets (including stablecoins) as a means of payment for goods and services in Turkey in April 2021 (Regulation No. 2021/14). The ban remains in force. Stablecoins can be held and traded on licensed platforms but cannot be used to settle commercial transactions within Turkey.

**Risk to Blockmediary — PRIMARY REASON FOR EXCLUSION:**
- Blockmediary's core product is using USDC stablecoin to settle commercial trade transactions. This is **precisely what the CBRT regulation prohibits** within Turkey.
- Using Blockmediary to settle a Turkey-origin or Turkey-destination trade where the buyer or seller is a Turkish resident/entity violates this ban.

**Mitigation:**
- **Turkish residents and entities are excluded from Blockmediary entirely** — the CBRT ban is the primary driver of the full Turkey exclusion decision.
- In the pitch: Turkey is out of scope. The CBRT ban is presented as the reason for exclusion, not a risk to manage.

---

### 3.3 Data Protection — KVKK (Law No. 6698)

**What it is:** Turkey's Personal Data Protection Law (KVKK), amended in 2025 to align more closely with GDPR. Key additions: data portability, right to object to automated decisions. Cross-border data transfer framework (July 2024 regulation): explicit consent no longer valid for transfers; must use SCCs (in Turkish, unmodified), adequacy decisions, or BCRs, with 5-day notification to the KVKK Authority.

**Risk to Blockmediary:**
- *(Dormant — Turkey excluded.)* KYB/KYC data on Turkish users processed outside Turkey would require SCCs with mandatory Turkish-language versions.
- *(Dormant — Turkey excluded.)* Law No. 6493 requires that primary and secondary information systems for payment/fintech operations be **physically located within Turkey** — significant infrastructure cost.
- *(Dormant — Turkey excluded.)* The KVKK Authority and CMB signed a cooperation protocol in 2025 — combined enforcement risk.

**Mitigation:**
- No action required. Turkey is excluded. Reopen only if Turkey is added as a target market in a future phase.

---

## 4. UAE Regulatory Risks

### 4.1 UAE Mainland — CBUAE Payment Token Services Regulation

**What it is:** The Central Bank of UAE (CBUAE) Payment Token Services Regulation (effective August 2024) regulates "payment tokens" — crypto-assets fully backed by one or more fiat currencies and used for settlement or transfer. Any entity issuing, redeeming, or *facilitating* payment tokens on the UAE mainland must hold a CBUAE licence.

Federal Decree Law No. 6 of 2025 extends CBUAE oversight to DeFi, cross-chain bridges, and Web3 infrastructure, with a one-year transition period to September 2026.

**Risk to Blockmediary:**
- Facilitating USDC-denominated escrow for UAE mainland parties may require a CBUAE licence (stored value facility or payment services licence).
- Administrative penalties reach **AED 1 billion ($272M)** for unlicensed activity.

**Mitigation:**
- For UAE mainland: partner with a CBUAE-licensed entity or obtain a stored value facility licence before offering services to UAE mainland users.
- Blockmediary avoids the mainland regime entirely at this stage by routing launch activity through the **DIFC partner-led pilot and a separate VARA licensing track** (see 4.2 and 4.3 below). This does not fully close the question: Financial Free Zones are excluded from the mainland regime's definition of "UAE" under Article 2, but a licensed VASP may still need a non-objection registration to custody or transfer certain foreign payment tokens, and whether a UAE buyer may lawfully prefund USDC/EURC into escrow remains an open legal gate pending written advice.

---

### 4.2 DIFC (Dubai International Financial Centre) — Partner-Led Pilot (confirmed route)

**What it is:** Following a team decision — informed by an existing relationship one of the founders holds with a DIFC-connected partner, and by the readiness analysis in `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md` — Blockmediary's near-term UAE route is a **partner-led pilot within DIFC**, not an independent DFSA licence application. A DIFC partner-led pilot is not itself a named DFSA licence category: it's an operating arrangement where a DFSA-authorised firm acts as the regulated principal and Blockmediary supplies the technology, document verification and workflow layer beneath it. A DIFC Commercial or Innovation Licence gives Blockmediary legal presence in the Centre but does **not** itself authorise regulated financial services.

**Risk to Blockmediary:**
- Under DFSA outsourcing rules, the authorised partner remains responsible for the outsourced functions, must supervise Blockmediary as provider, and — where material — must notify the DFSA and maintain written outsourcing/contingency arrangements. The partner agreement and responsibility matrix are the central regulatory instrument, not a licence held by Blockmediary itself.
- Blockmediary must not describe itself as "DFSA authorised" unless and until it separately obtains that authorisation.

**Minimum requirements before the pilot accepts live funds:**
- A written regulatory perimeter opinion mapping the customer journey, entities, wallet flows, release key and smart contract control.
- Verification that the partner's actual DFSA permissions cover the specific custody, settlement and customer activity involved (not just generic fintech/payment permissions).
- An executed partner term sheet and outsourcing agreement (scope, audit rights, incident reporting, termination).
- A written responsibility matrix (customer contracting, onboarding, sanctions/wallet screening, safeguarding, release approval, loss liability).
- A defined pilot envelope: B2B customers only, deal values at/below the £50k automation threshold, approved low-risk corridors, manual sign-off available on every release.

**Note:** The DFSA Innovation Testing Licence (ITL) is *not* assumed required or sufficient for this route — it's a restricted sandbox for a firm that itself needs to test a regulated activity, and should only be pursued if counsel concludes Blockmediary will itself conduct regulated activity during testing. It is not a default substitute for the partner arrangement.

**Target:** First paid transaction in Month 12 (from a Month 1 start).

**Key reference:** `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md`

---

### 4.3 VARA (Virtual Assets Regulatory Authority) — Licensing for Scale (confirmed route)

**What it is:** Alongside, and starting from the same Month 1 as, the DIFC pilot, Blockmediary pursues its **own VARA licence** for wider Dubai scale. VARA regulates virtual asset activity outside DIFC; an application must be made through a non-DIFC entity — Blockmediary needs a separate legal entity established outside the Centre, with a physical Dubai office and two full-time, fit-and-proper Responsible Individuals.

**Risk / scope to Blockmediary:**
- The closest apparent activity fit is **Virtual Asset Transfer and Settlement** (transmission/settlement of virtual assets between wallets), matching the release of escrowed stablecoin to the seller on documentary compliance.
- Whether **Custody Services** also applies is *not yet settled* — direct smart-contract funding helps, but the server-side release key and any admin/upgrade/recovery rights Blockmediary retains may still amount to control requiring a written opinion. If Custody is required, VARA generally requires it to sit in a legally separate entity from other activities.
- **Broker-Dealer Services** is not established by the current model (Blockmediary settles a physical goods sale, not a token purchase/sale) and should not be assumed mandatory.
- VARA does not publish a guaranteed approval timeline. Base case: full licence targeted Month 18; Month 12 only in an early case where the activity perimeter resolves quickly; Month 24 in a delayed case.
- **Fees remain planning placeholders, not confirmed:** a broad three-activity scope is indicatively ~AED 170,000 application / ~AED 480,000/year supervision / ~AED 1.5m capital floor; a Transfer-and-Settlement-only scope is closer to ~AED 40,000 application / ~AED 80,000/year supervision / capital floor of the higher of AED 500,000 or 25% of fixed annual overhead.

**Mitigation:**
- Use only VARA-approved stablecoins and VARA-licensed distributors for Dubai-based transactions.
- Do not treat "approval to incorporate" or in-principle approval as permission to serve customers — VARA scale activity should begin only from the effective date of the full licence.

**Key reference:** [VARA Rulebook v2.0](https://www.vara.ae); `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md`

---

### 4.4 UAE Data Protection — PDPL (Federal Decree-Law No. 45/2021)

**What it is:** UAE's Personal Data Protection Law. Applies to any entity processing personal data of UAE residents, regardless of location. Requires: consent or other lawful basis, data minimisation, DPO appointment for high-volume sensitive data processing, breach notification. Executive regulations pending as of early 2026 (6-month implementation grace once published).

**Risk to Blockmediary:**
- KYB/KYC data on UAE users (passports, business registration, wallet data linked to identity) is personal data under PDPL.
- Under the confirmed route, the two UAE entities sit under two different frameworks: the **DIFC pilot entity** is governed by DIFC's own Data Protection Law 2020 (the operative free-zone framework, since the DIFC entity runs the partner-led pilot); the **VARA entity**, established outside DIFC, falls under the **federal PDPL directly** rather than a second free-zone framework.
- EU residents' data remains subject to GDPR directly regardless of where Blockmediary is incorporated — neither entity's location exempts the product from that separate obligation.

**Mitigation:**
- Align with PDPL principles now (data minimisation, security, consent/contract basis).
- For the DIFC pilot entity: comply with DIFC DP Law 2020.
- For the VARA entity: comply with the federal PDPL directly.
- Watch for PDPL executive regulations and implement within the grace period.

---

## 5. Cross-Cutting Risks

### 5.1 Sanctions Screening

**Risk:** Blockmediary's cross-border trade model spans multiple corridors. Every deal could involve a party, wallet, goods category, or trade corridor that is subject to sanctions (OFAC, UN Security Council, HM Treasury, UAE, Turkey lists).

**Mitigation:**
- Screen **both parties, all wallets, goods categories, and trade corridors** against all applicable sanctions lists before allowing escrow funding. (Already specified in MVP_FLOW.md.)
- Re-screen at point of document review and at point of fund release — sanctions can be imposed between deal creation and settlement.
- Maintain a **blocked countries / blocked goods / blocked corridors** list.
- Escalate any sanctions hit to the MLRO — do not proceed without sign-off.
- For hackathon: document this in the compliance design; use a mock sanctions API in demo.

---

### 5.2 Trade-Based Money Laundering (TBML)

**Risk:** Cross-border trade escrow is a known TBML vector. Red flags include:
- Invoice value inconsistent with market price for the described goods.
- Vague goods description ("general merchandise", "electronics").
- Unusual trade routes or transshipment points.
- Shipment from/to high-risk jurisdictions.
- Repeated transactions between the same parties with changing terms.
- Document alterations or inconsistencies across submission versions.

**Mitigation:**
- Build a **TBML red-flag checklist** into the document review workflow.
- Use AI-assisted document extraction to flag price/quantity inconsistencies.
- Human review mandatory before any release on first-time counterparty pairs.
- Train document reviewers on FATF TBML typologies guidance.

---

### 5.3 Governing Law, Jurisdiction & Dispute Forum

**Risk:** Blockmediary's Trade Escrow Agreements need clear governing law and dispute resolution clauses. Without these, a dispute between a buyer in one jurisdiction and a seller in another over a UK-structured escrow creates jurisdictional chaos.

**Mitigation:**
- Default governing law: **English law** (robust commercial law, well-tested for trade finance and escrow).
- Default dispute forum: **ICC DOCDEX** for documentary disputes; LCIA or ICC arbitration for larger commercial disputes.
- Allow parties to choose alternative governing law / forum for their deal (within supported jurisdictions).
- Include a clear **governing law clause** in the Trade Escrow Agreement template.

**Key reference:** [ICC DOCDEX](https://iccwbo.org/dispute-resolution/dispute-resolution-services/adr/docdex/)

---

### 5.4 Smart Contract Security & Audit

**Risk:** A bug or exploit in the escrow smart contract could result in loss of user funds. Regulatory expectations (FCA, VARA, CMB) increasingly require evidence of security standards for cryptoasset firms.

**Mitigation:**
- For hackathon: code review and peer testing; clearly mark as testnet/MVP.
- For production: **independent smart contract audit** by a reputable firm (e.g. Trail of Bits, OpenZeppelin, Certik) before mainnet deployment with real funds.
- Implement role-based access control, multi-sig for the release authority, and time-lock mechanisms.
- Bug bounty programme post-audit.

**5.4.1 — Releaser Key Compromise (🔴 High, new — from TRD §3.4)**

The TRD names releaser key compromise as "the top security risk." The `RELEASER_ROLE` private key is the sole bridge from off-chain verdicts to on-chain state transitions (`recordVerdict`, `refund`). Compromise means:
- An attacker can call `recordVerdict` on any deal, moving it to `ReleasePending` — triggering permissionless `release` to the seller even if documents were non-compliant.
- An attacker can call `refund` on funded deals, redirecting buyer funds.
- Blockmediary cannot stop in-flight transactions once submitted.

This is not just a security incident — it is a **customer funds loss event** triggering: FCA breach notification (under PSR/CASP regimes), VARA incident reporting (within 24 hours under VARA Rulebook v2.0), potential criminal liability under POCA 2002, and civil liability to affected buyers and sellers.

**Mitigation:**
- Use a **hardware security module (HSM)** or threshold signature scheme (TSS/MPC) for the releaser key in production — never a hot wallet.
- For testnet/MVP: use a dedicated EOA wallet with the private key in an environment variable; clearly document this is a demo-only setup.
- Implement **role rotation** via `DEFAULT_ADMIN_ROLE` so the releaser key can be replaced immediately on suspected compromise without redeploying the contract.
- `pause()` the contract immediately on suspected key compromise — the admin role (separate key, ideally multisig) can pause all fund movements while the releaser key is rotated.
- Maintain a **key compromise incident response plan**: pause → revoke → rotate → audit ledger review → regulatory notification → user notification.

**5.4.2 — Pause Power as Censorship Lever (🟡 Medium, new — from TRD TR-3.4)**

The TRD explicitly acknowledges: "`whenNotPaused` on `release` re-introduces a censorship lever — admin can pause to block a compliant seller's payout." Once a deal is in `ReleasePending` (documents verified compliant, objection window expired, no valid objection), the seller has a contractual right to payment. If Blockmediary invokes `pause` at this point, the seller has a claim for breach of contract and potentially for financial loss caused by delayed payment.

**Mitigation:**
- The TEA must define **exhaustive permissible grounds for `pause`**: (a) suspected smart contract exploit or critical vulnerability; (b) regulatory requirement (regulator direction or court order); (c) confirmed sanctions hit post-verdict. Any other use of `pause` to delay a compliant payout is a breach.
- `pause` must not be used as a routine operational lever — it is an emergency control only.
- If `pause` is invoked on a deal in `ReleasePending`, Blockmediary must notify both parties immediately with the stated reason and an estimated resolution timeline.
- Build an internal approval requirement before `pause` is invoked (e.g. CCO + CTO co-approval) — prevent single-person censorship.

---

### 5.5 UCP 600 & Documentary Credit Standards

**What it is:** The ICC's Uniform Customs and Practice for Documentary Credits (UCP 600, ICC Publication No. 600, 2007) is the global standard governing letters of credit and documentary trade. Blockmediary frames its product as "UCP 600 logic without the issuing bank." See [docs/UCP600.md](UCP600.md) for the full operational cheat sheet.

**Risk:**
- Blockmediary's release rules and document verification standards must be coherent with UCP 600 principles or clearly disclaim any departure.
- If parties and judges expect UCP 600 compliance and the product deviates, this is both a legal and reputational risk.
- UCP 600 applies to LCs issued under it — Blockmediary's Trade Escrow Agreement is a separate instrument and is not a letter of credit. This distinction must be clear in the legal documentation.
- Missing a review deadline (equivalent of the 5-banking-day rule, Art. 14(a)) precludes the platform from later claiming documents were non-compliant — a systemic risk if the review pipeline is slow or blocked.

**Key operational rules Blockmediary inherits from UCP 600:**

| Article | Rule | Blockmediary implication |
|---------|------|--------------------------|
| Arts 4 & 5 | Autonomy principle — deal only in documents, not goods or performance | Once docs are compliant, funds **must** release even if buyer claims goods are defective. Disclose clearly in Trade Escrow Agreement. |
| Art 14(a) | 5-banking-day examination window | Build a hard review deadline. Missing the window = funds release by default. |
| Art 14(b) | Data need not be identical across docs but must not conflict | The rules engine flags *conflicts* (e.g. "5,000 MT" invoice vs "5 MT" BoL), not mere phrasing variations; AI/OCR-assisted field extraction is a roadmap item, not yet delivered. |
| Art 14(c) | Transport doc must be presented within 21 days of shipment date | Build a shipment-date-to-presentation-deadline validation. |
| Art 14(d) | Goods description in invoice must match credit exactly; other docs need only be not inconsistent | Invoice goods description check is strict; other docs use looser matching. |
| Art 14(g) | Conditions without a named document are disregarded | Every compliance condition in our deal setup must map to a specific document. |
| Art 15 | Complying presentation = mandatory honour | No discretion to delay release once compliance is confirmed. |
| Art 16 | Refusal requires itemised discrepancy notice within 5 banking days | Our rejection workflow must list each discrepancy. Late notice = cannot claim non-compliance. Include a buyer waiver mechanism. |
| Art 17 | At least one original of each required document must be presented | Document upload flow must collect originals or certified copies. For eDocs, reference eUCP. |
| Art 18 | Invoice: issued by seller, consignee = buyer, currency matches deal, goods description exact | Invoice checklist must verify all four points. Currency match critical for USDC-denominated deals. |
| Art 20 | Bill of lading: "on board" notation + date, named vessel, clean, port of loading/discharge match | Build BoL parser to check on-board notation, cleanliness clauses, vessel name, port codes. |
| Art 27 | Clean transport document — no damage or condition clauses | Any damage clause = automatic hold for human review. |
| Art 28 | Insurance: min 110% CIF/CIP value, covers shipment to destination, no cover notes | If insurance required (CIF/CIP Incoterms), check value threshold and reject cover notes per Art 28(c). |
| Art 30 | Tolerance: ±10% on "about/approximately", ±5% on quantity not in units | Build tolerance logic into quantity/amount verification. |

**Mitigation:**
- In all marketing and legal documents: Blockmediary provides **UCP 600-inspired** documentary release logic, not a letter of credit.
- Implement the document verification engine against the above article-by-article checklist.
- Reference **eUCP** (electronic UCP supplement) in document upload terms: presenter warrants authenticity of electronic records.
- Include **ICC DOCDEX** as the first-line dispute mechanism in the Trade Escrow Agreement for documentary disputes (see also §5.3).

**Key reference:** [docs/UCP600.md](UCP600.md) — ICC UCP 600 (ICC Publication No. 600, 2007)

---

### 5.6 Incoterms® 2020 — Document Checklist & Risk Transfer

**What it is:** ICC Incoterms® 2020 (effective 1 January 2020) are the globally accepted standard trade terms defining where risk transfers, who pays freight and insurance, and which documents the seller must produce. See [docs/Incoterms2020.md](Incoterms2020.md) for the full cheat sheet.

**Risk:**
- The Incoterm agreed in a deal directly determines which documents Blockmediary must require. Using the wrong document checklist for the stated Incoterm means either (a) accepting incomplete presentations that expose the buyer, or (b) rejecting compliant ones that expose the seller.
- CIF and CIP deals require insurance certificates — accepting a cover note (prohibited under UCP 600 Art 28(c)) is a document verification failure.
- DDP deals require import customs clearance evidence; missing this creates incomplete presentations.
- FOB/CIF/CFR are technically inappropriate for containerised cargo, yet widely used in practice — our document verification engine must handle the practical reality while flagging the technical mismatch.
- Incoterms 2020 introduced the DAT→DPU rename and upgraded CIP insurance to ICC (A) all-risks. Any template or checklist built on Incoterms 2010 will be wrong for current deals.

**Document checklist by Incoterm (build into deal setup):**

| Incoterm | Must-Have Documents | Conditional |
|----------|-------------------|-------------|
| EXW | Invoice, packing list | Export customs (buyer handles — Blockmediary use discouraged) |
| FCA | Invoice, packing list, carrier receipt, export customs | On-board BoL (if parties elect it per 2020 FCA rule) |
| CPT | Invoice, transport doc (any mode), packing list, export customs | — |
| CIP | Invoice, transport doc, **insurance cert (ICC A, 110%)**, packing list, export customs | — |
| DAP | Invoice, transport doc to destination, packing list, export customs | — |
| DPU | Invoice, transport doc, delivery/unloading confirmation, packing list, export customs | — |
| DDP | Invoice, transport doc to destination, **import customs clearance**, packing list, export customs | Duty payment evidence |
| FAS | Invoice, packing list, delivery receipt alongside ship, export customs | — |
| FOB | Invoice, **on-board BoL**, packing list, export customs | — |
| CFR | Invoice, **on-board BoL**, packing list, export customs | — |
| CIF | Invoice, **on-board BoL**, **insurance cert (ICC C, 110%)**, packing list, export customs | — |

**Key 2020 changes that affect Blockmediary:**
- **DAT → DPU:** Any legacy deal template referencing DAT must be updated to DPU.
- **CIP insurance upgraded to ICC (A):** CIP deals require all-risks cover; ICC (C) is no longer sufficient.
- **FCA + on-board BoL:** Parties may now agree the buyer's carrier issues an on-board BoL to the seller — this solves the longstanding FCA/LC mismatch. Build this optional election into the deal setup form.

**Common mistakes to flag in document review:**
- FOB used for containerised cargo — verify BoL date reflects actual vessel loading, not inland depot handover.
- CIF/CIP deal with a cover note instead of an insurance policy — reject per UCP 600 Art 28(c).
- DDP deal missing import customs clearance documentation.
- Insurance value below 110% of CIF/CIP invoice value.

**Mitigation:**
- Require the Incoterm to be specified at deal setup; dynamically generate the document checklist from it.
- Build transport mode validation: flag if a sea-only Incoterm (FAS, FOB, CFR, CIF) is selected for an air or road shipment.
- For CIP deals, validate that the insurance certificate specifies ICC (A) or equivalent all-risks cover.
- Include a representation in the Trade Escrow Agreement that the stated Incoterm governs document obligations; disclaim any duty to verify physical delivery beyond documentary evidence.
- EXW is **not recommended** on the platform for cross-border deals — seller has almost no documentary obligations, making our release logic unworkable.

**Key reference:** [docs/Incoterms2020.md](Incoterms2020.md) — ICC Incoterms® 2020

---

### 5.7 Export Controls — Dual-Use and Controlled Goods

**What it is:** Export control regimes impose positive obligations to obtain an export licence before shipping certain categories of goods — regardless of whether the buyer or seller is sanctioned. Key regimes:
- **UK Export Control Order 2008 (ECO):** administered by HMRC/DBIT (formerly DIT). Covers military goods (Schedule 1), dual-use goods (Schedule 2, mirroring the EU dual-use list), and other controlled items. Exporters need a licence from the Export Control Joint Unit (ECJU).
- **EU Dual-Use Regulation (2021/821):** Updated in 2021, covers goods, software, and technology with both civilian and military applications (encryption, certain chemicals, optical equipment, electronics, aircraft parts). Applies to EU-origin goods and EU exporters.
- **US EAR/ITAR:** The US Export Administration Regulations (EAR, administered by BIS) and International Traffic in Arms Regulations (ITAR, administered by DDTC) apply to US-origin goods, US technology, and transactions involving US persons — regardless of where Blockmediary is incorporated. If a seller ships US-origin goods subject to EAR, an export licence may be needed from BIS even if the transaction is structured through a UK or UAE entity.

**Risk to Blockmediary:**
- A cross-border trade escrow platform that releases payment for a shipment of export-controlled goods, without checking whether an export licence exists, could be **facilitating an illegal export**. This is a criminal offence under the ECO, and under EAR/ITAR if US persons or US-origin goods are involved.
- The sanctions screening gate (§5.1) catches *who* you're dealing with — export controls catch *what* you're shipping. These are separate checks.
- Dual-use goods are not self-evidently "weapons" — they include: encryption software, certain chemicals, precision optics, drone components, thermal imaging, high-performance computers. An SME exporter may not know their goods are controlled.
- The "goods-agnostic" target market in BRD §4.3 explicitly excludes "sanctioned corridors and prohibited high-risk regulated goods" — export controls define part of that exclusion. But the BRD does not specify a mechanism for checking export licence status.

**Mitigation:**
- Add an **export control goods-category screen** to the deal intake compliance gate, running before escrow funding. This is a distinct check from sanctions screening.
- At deal intake, collect: goods description, HS code (Harmonised System), origin country of goods, destination country. Cross-reference against the UK/EU dual-use control lists and the US Commerce Control List (CCL) / USML.
- If goods fall on a controlled list: require the seller to confirm they hold a valid export licence and upload a copy as part of the document set (or confirm licence not required with stated basis).
- Maintain a **controlled goods category list** in the platform rules engine; flag any goods category that commonly triggers dual-use controls for manual review.
- For US-origin goods or US-person transactions: consult US export counsel before onboarding that corridor.
- For hackathon: document the export control check in the compliance design; use a simplified goods-category eligibility question in the demo flow.

**Key references:** UK Export Control Order 2008; EU Dual-Use Regulation 2021/821; US EAR (15 CFR Parts 730-774); US ITAR (22 CFR Parts 120-130); [docs/domain-rules.md](domain-rules.md) (blocked goods)

---

### 5.8 Platform / Intermediary Deal Initiation — AML Chain of Responsibility

**What it is:** BRD v0.3 (decided 2026-06-10) introduced role-agnostic deal initiation: a third-party platform or freight forwarder can create a deal on behalf of a buyer and seller. This creates a specific AML risk: the direct contractual relationship is between the intermediary and Blockmediary, but the underlying principals (buyer and seller) must also be KYC'd.

**Risk to Blockmediary:**
- If a licensed freight forwarder or trade finance platform initiates a deal, Blockmediary may be tempted to rely on the intermediary's assertion that KYC has been done. This is legally permissible under MLR 2017 Reg 39 (third-party reliance) only under strict conditions — and getting it wrong makes Blockmediary criminally liable under POCA 2002.
- The intermediary may itself be a VASP or CASP with AML obligations, or it may be an unregulated entity (e.g. a trade broker or freight forwarder with no AML obligations). Blockmediary cannot rely on KYC from an unregulated entity.
- Even where the intermediary is regulated, Blockmediary must still: check the intermediary itself; confirm the reliance arrangement is in writing; and be able to obtain the underlying KYC data on request within 2 business days.

**Mitigation:**
- Before allowing any platform/intermediary to initiate deals on behalf of others: conduct **onboarding KYB on the intermediary itself** (registered entity, beneficial owners, AML status, regulated status).
- If relying on the intermediary's KYC under MLR 2017 Reg 39: obtain a **written third-party reliance agreement** confirming: (a) the intermediary is subject to AML obligations equivalent to the UK regime; (b) the intermediary agrees to provide KYC data on request within 2 business days; (c) the intermediary has conducted CDD on the underlying buyer and seller.
- If the intermediary is not itself AML-regulated: Blockmediary must conduct KYC directly on the underlying buyer and seller — do not rely on the intermediary's assertions.
- The TEA for intermediary-initiated deals must name all principals (buyer, seller, initiating intermediary) and their roles.
- Build a **platform/intermediary onboarding tier** in the compliance gate, separate from the buyer/seller KYC flow.

**Key references:** MLR 2017 Reg 39 (third-party reliance); FATF Guidance on CDD; §1.4 above (AML/KYC/POCA)

---

## 6. Open Questions & Next Steps

| # | Question / Action | Owner | Priority | Target |
|---|-------------------|-------|----------|--------|
| 1 | Confirm USDC on Base is MiCA-compliant (Circle EU authorisation status) | Badhri | 🔴 High | Pre-launch EU |
| 2 | Legal opinion on whether Blockmediary's escrow release activity constitutes a payment service under UK PSRs | Badhri + legal counsel | 🔴 High | Pre-UK launch |
| 3 | Draft Trade Escrow Agreement template with governing law (English), dispute forum (DOCDEX / LCIA), and smart contract disclaimer | Badhri | 🔴 High | MVP |
| 4 | Select KYB/KYC provider (Sumsub, Jumio, or equivalent) | Badhri + CTO | 🟡 Medium | MVP build |
| 5 | Build sanctions screening into deal intake flow (OFAC, HMT, UN, UAE, Turkey lists) | CTO + Badhri | 🔴 High | MVP build |
| 6 | Draft Privacy Notice covering UK GDPR, EU GDPR, UAE PDPL | Badhri | 🟡 Medium | Pre-launch |
| 7 | ✅ DONE — Turkey excluded from target markets (CBRT stablecoin payment ban + CMB CASP barrier). Decision communicated to team. | Badhri | — | Closed Jun 2026 |
| 8 | Commission a single integrated perimeter memorandum with counsel covering the DFSA (DIFC pilot), VARA, and CBUAE positions together — the single most valuable next step per the readiness review | Badhri | 🔴 High | Pre-UAE launch |
| 9 | Smart contract audit plan — identify auditor and timeline | CTO | 🟡 Medium | Pre-mainnet |
| 10 | TBML red-flag checklist for document review workflow | Badhri + COO | 🟡 Medium | MVP |
| 11 | Monitor FCA CP25/14 Policy Statement (expected Summer 2026) | Badhri | 🟢 Low | Ongoing |
| 13 | Integrate Incoterms® 2020 document checklist into deal setup — dynamic checklist generation by Incoterm, transport mode validation, CIP ICC (A) check, FCA on-board BoL election | CTO + Badhri | 🔴 High | MVP build |
| 14 | Update all deal templates: replace DAT with DPU, update CIP insurance requirement to ICC (A) | Badhri | 🟡 Medium | MVP |
| 15 | Decide specHash GDPR architecture before mainnet: strip personal data from spec before hashing (recommended option (a)) | CTO + Badhri | 🔴 High | Pre-mainnet |
| 16 | Add export control goods-category screen to deal intake compliance gate (HS code check against UK/EU dual-use lists) | CTO + Badhri | 🔴 High | MVP build |
| 17 | Draft intermediary onboarding tier: KYB on the intermediary + MLR 2017 Reg 39 written reliance agreement template | Badhri | 🔴 High | Pre-launch |
| 18 | Define releaser key management policy: HSM or MPC for production; incident response plan (pause → revoke → rotate → notify) | CTO | 🔴 High | Pre-mainnet |
| 19 | Define permissible pause grounds in the TEA; build internal co-approval gate before pause can be invoked | CTO + Badhri | 🟡 Medium | MVP |
| 20 | Confirm electronic document acceptance policy: scanned PDFs only for MVP; eBL pathway deferred to post-MVP (requires ETDA-qualifying system integration) | Badhri + CTO | 🟡 Medium | MVP |
| 21 | Assess whether SME users are retail customers under FCA Consumer Duty; if yes, apply Consumer Duty to product and comms design | Badhri | 🟡 Medium | Pre-UK launch |
| 22 | Build DORA ICT risk framework alongside MiCA CASP authorisation: third-party ICT register, DORA-compliant contracts with Anthropic/cloud/KYB vendor | Badhri + CTO | 🟡 Medium | Pre-EU launch |
| 23 | Specify eIDAS/ECA 2000 signature clause in TEA template; confirm SIWE wallet signature satisfies enforceability threshold | Badhri + legal counsel | 🟡 Medium | MVP (TEA) |
| 12 | ~~Monitor Turkey CBRT~~ — closed. Turkey excluded. Reopen only if regulatory position fundamentally changes. | Badhri | 🟢 Low | Closed |

---

## 7. Regulatory Reference Index

| Regulation | Jurisdiction | Summary | Link |
|------------|-------------|---------|------|
| FCA CP25/14 | UK | Stablecoin issuance and cryptoasset custody rules | [Link](https://www.fca.org.uk/publications/consultation-papers/cp25-14-stablecoin-issuance-cryptoasset-custody) |
| FCA CP25/40 | UK | Broader cryptoasset activities regulation | [Link](https://www.fca.org.uk/publications/consultation-papers/cp25-40-regulating-cryptoasset-activities) |
| UK MLR 2017 | UK | Money laundering regulations — VASP AML obligations | — |
| MiCA (2023/1114) | EU | Comprehensive crypto-asset framework | [ESMA](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica) |
| EBA MiCA (ARTs/EMTs) | EU | Stablecoin authorisation and reserve requirements | [EBA](https://www.eba.europa.eu/regulation-and-policy/asset-referenced-and-e-money-tokens-mica) |
| GDPR (2016/679) | EU / UK | Data privacy — personal data processing obligations | — |
| FATF R.15 / R.16 (June 2025) | Global | VASP AML obligations and Travel Rule | [FATF](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/targeted-update-virtual-assets-vasps-2025.html) |
| CMB Law No. 7518 | Turkey | CASP licensing framework | — |
| MASAK Circular No. 29 (2025) | Turkey | Stablecoin limits, withdrawal restrictions | — |
| CBRT Regulation No. 2021/14 | Turkey | Ban on crypto-asset payments | — |
| KVKK Law No. 6698 (amended 2025) | Turkey | Personal data protection | — |
| CBUAE Payment Token Services Reg. | UAE | Mainland stablecoin / payment token licensing | — |
| Federal Decree Law No. 6 of 2025 | UAE | Extension of CBUAE oversight to DeFi/Web3 | — |
| VARA Rulebook v2.0 (June 2025) | UAE (Dubai) | Category 1 token approval; CASP licensing in Dubai | — |
| PDPL (FL No. 45/2021) | UAE | Personal data protection | — |
| DIFC DP Law 2020 | UAE (DIFC) | DIFC data protection framework — governs the DIFC pilot entity | — |
| DFSA outsourcing rules | UAE (DIFC) | Governs the DIFC partner-led pilot's outsourcing arrangement | — |
| VARA Rulebook v2.0 fees schedule | UAE (Dubai) | VARA application/supervision/capital fee schedule (planning placeholders) | — |
| UCP 600 (ICC Pub. No. 600, 2007) | Global | ICC documentary credit standards — governs document examination and release logic | [docs/UCP600.md](UCP600.md) |
| eUCP | Global | Electronic supplement to UCP 600 — governs electronic document presentations | — |
| Incoterms® 2020 | Global | ICC trade terms — determines required documents, risk transfer, insurance obligations | [docs/Incoterms2020.md](Incoterms2020.md) |
| ICC DOCDEX | Global | Documentary dispute resolution | [ICC](https://iccwbo.org/dispute-resolution/dispute-resolution-services/adr/docdex/) |
| UK ETDA 2023 | UK | Electronic Trade Documents Act — legal validity of eBLs and electronic trade documents under English law | — |
| UNCITRAL MLETR | Global | Model Law on Electronic Transferable Records — basis for ETDA and equivalent laws in UAE/DIFC, Singapore | — |
| UK Export Control Order 2008 | UK | Dual-use and military goods export licensing | — |
| EU Dual-Use Regulation 2021/821 | EU | EU export controls for dual-use goods, software and technology | — |
| US EAR (15 CFR 730-774) | US / Global | US Export Administration Regulations — applies to US-origin goods and US persons globally | — |
| FCA PS22/9 Consumer Duty | UK | Consumer Duty — good outcomes obligation for retail-facing UK financial services firms (in force July 2023) | — |
| DORA (EU Reg 2022/2554) | EU | Digital Operational Resilience Act — ICT risk framework, incident reporting, third-party risk (in force Jan 2025) | — |
| eIDAS 2.0 (EU Reg 2024/1183) | EU | Electronic identification and trust services; Qualified Electronic Signatures | — |
| UK ECA 2000 | UK | Electronic Communications Act 2000 — UK electronic signature validity | — |
| POCA 2002 | UK | Proceeds of Crime Act 2002 — criminal AML offences; MLRO SAR obligation (s.330) | — |
| Terrorism Act 2000 s.19 | UK | Terrorist financing disclosure obligation (parallel to POCA for TF) | — |
| MLR 2017 Reg 39 | UK | Third-party reliance on KYC — conditions for intermediary-initiated deals | — |

---

---

## 8. Competitive Landscape — Compliance Comparison

Understanding how competitors handle compliance informs Blockmediary's own positioning.

### 8.1 Tazapay

**What they do:** One of the largest cross-border payment and escrow infrastructure platforms for B2B trade. They collect payments from buyers, hold them in escrow, and release to sellers once conditions are met. They also support stablecoin-to-fiat — businesses can send USDC or USDT and Tazapay converts it to local fiat for the seller.

**Scale:** Operates across 70 markets for collections, with payouts to 100+ countries. Backed by Circle Ventures (the company behind USDC) in a $36M Series B (2026).

**Regulatory status:** Licensed in Singapore, Canada, Australia, and the US. Active licence applications pending in UAE and EU — not yet fully licensed there.

**Release model:** Buyer-discretion. The buyer confirms receipt of goods before funds are released. They do check some documents, but the release is ultimately triggered by the buyer clicking approve — not by an independent document compliance check.

**Key difference from Blockmediary:** Tazapay is payment infrastructure first, escrow second. Their release model depends on buyer approval. Blockmediary's release is triggered by document compliance regardless of whether the buyer approves — much closer to how a Letter of Credit works. Tazapay also has no on-chain smart contract escrow.

---

### 8.2 Truzo

**What they do:** A regulated digital escrow and payment platform, originally focused on the UK–South Africa trade corridor. FCA-approved in the UK — notably the first and only FCA-approved digital escrow service focused on Africa. They partner with Currencycloud for cross-border currency conversion.

**Scale:** Smaller, corridor-focused (primarily UK–Africa). Backed by the UK Department for International Trade.

**Regulatory status:** FCA-approved. Operates in fiat only.

**Release model:** Traditional escrow — they hold funds in a bank account and release when the terms of the transaction are fulfilled, usually on delivery confirmation. No blockchain, no smart contracts.

**Key difference from Blockmediary:** Truzo is essentially a digital version of a traditional escrow agent using conventional banking rails. No on-chain component, no documentary release logic, and limited to specific corridors. Blockmediary targets a broader set of trade corridors and uses on-chain stablecoin escrow with documentary release.

---

### 8.3 XREX (BitCheck)

**What they do:** A Taiwanese crypto-financial platform with a cross-border escrow product called BitCheck. They escrow stablecoins (USDC, USDT) and cryptocurrencies between buyers and sellers for cross-border B2B transactions. All users go through KYC/AML verification.

**Scale:** International — licensed in Singapore (MAS), registered as an MSB in the US, and entered Lithuania for EU market access. Taiwan-headquartered but not limited to Asia.

**Regulatory status:** MAS-licensed (Singapore), US MSB, EU presence via Lithuania. No confirmed licensing in UK, UAE, or Dubai specifically.

**Release model:** Buyer-discretion. The seller requests release after shipping; the buyer then approves it. XREX is not doing documentary release. The buyer can still block or delay payment even if documents are compliant.

**Key difference from Blockmediary:** XREX is the closest competitor in terms of using crypto/stablecoin escrow for cross-border trade. However their release model is buyer-approval, not documentary compliance. Blockmediary's UCP 600-inspired documentary release means that once documents are verified as compliant, funds must release — the buyer cannot simply refuse. This is what makes Blockmediary a genuine LC alternative rather than just a "digital hold-and-release" service. Geographic overlap is also limited — XREX's primary markets (Taiwan, Singapore, Southeast Asia) don't significantly overlap with Blockmediary's target markets (UK, EU, UAE/Dubai).

---

### 8.4 Komgo

**What they do:** A blockchain-based platform for commodity trade finance — primarily oil, gas, metals, and agricultural commodities. They digitise and accelerate the existing Letter of Credit process rather than replacing it. Key users are large commodity traders and banks (backed by institutions including Société Générale, ING, ABN AMRO, Citi, and others).

**Blockchain:** Runs on JP Morgan's Quorum (an Ethereum fork), connected to the VAKT post-trade platform.

**Smart contracts:** Yes — they use smart contracts to automate LC matching and processing, cutting LC turnaround from ~10 days to ~1 hour in production. But the LC itself still exists as the legal instrument; Komgo is the digital rail underneath it.

**Key difference from Blockmediary:** Komgo modernises LCs for large commodity traders and banks — it is not replacing LCs and it is not serving SMEs. **Komgo is not a direct competitor.** They are more of a reference point and potential future integration partner (e.g. if Blockmediary ever wanted to connect into institutional commodity trade flows). Worth studying their document verification and smart contract architecture.

---

### 8.5 Contour (wound down November 2023)

**What they did:** The most ambitious attempt to replace the traditional Letter of Credit with a blockchain-based alternative. Backed by nine major banks including HSBC, Standard Chartered, Citi, and BNP Paribas. Used R3's Corda blockchain.

**Why they shut down:** Wound down in **November 2023** (not 2022). The reasons: bank shareholders pulled funding, the platform was only processing 60–70 transactions per month, there was no lead investor to drive direction, and regulatory frameworks took too long to catch up with what they were building.

**Why this matters for Blockmediary:** Contour's failure left the LC-replacement space wide open. The lessons from their collapse are directly relevant — the market gap is real, but the approach matters. Contour tried to get banks to adopt a new network; Blockmediary bypasses the banks entirely with a smart-contract model. Pitch judges will likely know about Contour — framing Blockmediary as having learned from that failure is a strong narrative.

---

### Summary comparison table

| Company | Model | Release Trigger | Stablecoin / On-chain | SME-focused | Key Licence(s) | Documentary Compliance |
|---------|-------|----------------|----------------------|-------------|----------------|------------------------|
| **Tazapay** | Fiat escrow, B2B cross-border | Buyer approval | No (fiat only) | Yes | MAS, CA, AU, US | No |
| **Truzo** | Fiat escrow, UK–Africa | Delivery confirmation | No (fiat only) | Yes (corridor) | FCA-approved | No |
| **XREX** | Stablecoin escrow, B2B | Buyer approval | Yes (USDC/USDT) | Yes | MAS, US MSB | No |
| **Komgo** | Commodity LC digitisation | LC process | Partial (Quorum) | No (large traders) | EU banking consortium | Partial (LC wrapper) |
| **Contour** | LC replacement (wound down) | N/A | No (Corda) | No | N/A | Partial (attempted) |
| **Blockmediary** | On-chain stablecoin escrow | Document compliance | Yes (USDC, Base) | Yes ($5K–$250K) | Seeking FCA, DIFC/VARA, MiCA | Yes — UCP 600-inspired |

**Blockmediary's defensible differentiator:** Documentary release — funds release when documents are verified as compliant, not when the buyer clicks approve. This closes the gap that exists in Tazapay, Truzo, and XREX, and is the exact mechanism that makes Blockmediary a genuine LC alternative rather than a "hold-and-release" escrow service. Komgo is not a direct competitor. Contour's failure in November 2023 left this space wide open.

---

## 9. Turkey — Fiat Settlement Alternative

**Question: If Blockmediary uses fiat currency instead of stablecoins for Turkish deals, does the CBRT ban still apply?**

### Short answer

Using fiat avoids the CBRT crypto-asset payments ban — but replaces it with a different, and in some ways heavier, regulatory stack.

### What the ban covers

The CBRT Regulation No. 2021/14 bans the use of **crypto-assets** (including stablecoins) as a means of payment. Fiat currency transfers are not covered by this ban. So switching to TRY, USD, or EUR settlement removes the primary legal blocker for Turkey.

### What fiat brings instead

| Compliance area | What it means for Blockmediary (Turkey fiat model) |
|----------------|--------------------------------------------------|
| **Payment Institution (PI) licence — CBRT** | Any entity holding or transferring fiat funds on behalf of third parties in Turkey needs a PI licence from the CBRT under Law No. 6493. This is a significant licensing undertaking requiring a Turkish subsidiary, minimum capital, and local IT infrastructure. |
| **E-Money Institution (EMI) licence** | If Blockmediary holds fiat in "accounts" that function like e-money, an EMI licence may also be required. |
| **Local IT infrastructure** | Law No. 6493 requires primary and secondary IT systems to be physically located in Turkey. No cloud-only model outside Turkey. |
| **FX regulations** | Cross-border fiat transfers involving Turkish Lira (TRY) are subject to CBRT FX controls. USD/EUR transfers are more straightforward but still require a licensed payment channel. |
| **MASAK AML obligations** | Full AML/KYB/KYC, suspicious transaction reporting, and record-keeping obligations under MASAK apply to fiat payment operations — similar burden to the crypto stack, but in the established fiat framework. |
| **KVKK data protection** | Unchanged — same obligations regardless of fiat vs stablecoin. |
| **CMB (crypto) licensing** | No longer required if the product is purely fiat-based with no crypto component for Turkish users. |

### Verdict (updated June 2026)

Turkey has been **fully excluded** from Blockmediary's target markets. The fiat-route analysis above is retained for reference but is not an active pathway. The decision is driven by the CBRT stablecoin payments ban (core model conflict) and the CMB CASP capital and licensing requirements (TRY 100M threshold, 30 June 2026 deadline). This section is archived — reopen only if the regulatory position materially changes.

---

## 10. UAE Jurisdiction Choice — DIFC Partner-Led Pilot and VARA Scale (confirmed route)

This section previously weighed a single choice of regulatory home among JAFZA, DIFC, and ADGM, and recommended incorporating in ADGM first. **That recommendation has since been superseded.** Following a team decision — informed by an existing relationship one of the founders holds with a DIFC-connected partner, and by the more detailed readiness analysis in `docs/Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md` — Blockmediary's confirmed route is a **DIFC partner-led pilot run in parallel with an independent VARA licence application**, rather than a single free-zone choice or an ADGM-first sequence. ADGM is not part of the confirmed plan; it's recorded below as a route the team considered and moved away from, for transparency, rather than omitted silently.

### The two confirmed tracks

Both start together at inception (Month 1) and are legally distinct:

- **DIFC partner-led pilot** (detail in §4.2 above): gives Blockmediary an early, controlled route to paying customers under an authorised partner's DFSA permissions. Targets a first paid transaction in **Month 12**. This does not by itself make Blockmediary a regulated entity — Blockmediary should not describe itself as "DFSA authorised" unless and until it separately obtains that authorisation.
- **VARA licence** (detail in §4.3 above): builds Blockmediary's own licensed platform for wider Dubai scale, through a legal entity established outside DIFC. Targets a full licence in **Month 18** (base case); Month 12 only if the activity perimeter resolves quickly, Month 24 if regulatory or partner remediation is needed.

Running both from Month 1 avoids making the scale track wait for pilot revenue, while keeping the pilot as the nearer-term route to real customer evidence.

### JAFZA (Jebel Ali Free Zone Authority)

JAFZA remains relevant only in the same narrow role previously identified: it's a logistics and trading free zone, not a financial services regulator, and could house a holding or commercial subsidiary for physical-goods-related activity if the team wanted one — but it has no role in either the DIFC pilot or the VARA licence.

**Verdict for Blockmediary: Not suitable as the regulatory home. Useful only as a commercial/holding entity, if needed at all.**

### ADGM (Abu Dhabi Global Market) — considered and moved away from

ADGM was the previous MVP recommendation (principles-based FSRA regulator, lower capital requirements, active Digital Lab sandbox). It is **not part of the confirmed plan** and is not analysed further here — kept as a record of the route considered and superseded, not a live option.

### Open items carried over from the readiness report

Three points of continuing uncertainty should be tracked as open, not treated as resolved by this route decision:
1. Whether Blockmediary's release key, contract administration and recovery design amount to custody/control under DFSA or VARA rules is not yet settled — determines entity structure and capital.
2. The exact VARA activity scope — in particular whether Custody Services applies alongside Transfer and Settlement — is not yet confirmed.
3. CBUAE's treatment of UAE-denominated USDC/EURC settlement remains a hard legal gate independent of which UAE route is chosen (see §4.1).

The single most valuable next step, per the readiness review, is a single integrated perimeter memorandum prepared with counsel covering the DFSA, VARA and CBUAE positions together.

**On data protection:** the DIFC pilot entity is governed by DIFC's own Data Protection Law 2020; the separate VARA entity, established outside DIFC, falls under the federal PDPL directly rather than a second free-zone framework (see §4.4). EU residents' data remains subject to GDPR directly regardless of where Blockmediary is incorporated.

---

*This document is a working compliance reference for an academic hackathon project. It does not constitute legal advice. Seek qualified legal counsel before operating in any of these jurisdictions with real funds or real users.*
