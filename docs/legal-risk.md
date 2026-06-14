# Blockmediary — Legal & Compliance Risk Register
**Role:** Chief Compliance Officer (CCO) — Badhri
**Last updated:** 2026-06-14 (rev. 4)
**Status:** Living document — update as research and build progress

---

## Document Purpose

This is the working legal risk reference for Blockmediary's CCO function. It covers the key regulatory risks, applicable rules, and mitigation strategies across our two target jurisdiction groups: **UK/EU** and **UAE/Dubai**. Turkey has been excluded from target markets. It serves both as internal working notes and as a shareable compliance reference for the team and hackathon judges.

Blockmediary is a **programmable documentary escrow layer for SME cross-border trade** — it locks stablecoin (USDC on Base) into a smart contract, verifies trade documents, and releases funds on compliance. This creates regulatory surface area across: crypto/stablecoin regulation, payment services, AML/KYB/KYC, data privacy, trade finance, and consumer/business protection law.

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
| 14 | DIFC / ADGM alternative | DFSA / FSRA crypto frameworks | UAE (Free zones) | 🟢 Lower | More accessible for MVP |
| 15 | UAE data protection | PDPL Federal Decree-Law No. 45/2021 | UAE | 🟡 Medium | Exec regulations pending |
| 16 | Sanctions screening | OFAC, UN, HMT, UAE lists | Global | 🔴 High | Must screen before every deal |
| 17 | Trade finance / documentary credit law | UCP 600, URDG 758, eUCP | Global | 🟡 Medium | Governs release rule logic |
| 18 | Consumer / business protection | FCA PRIN, UCT Regulations | UK / EU | 🟡 Medium | Terms of service risk |
| 19 | Governing law & dispute forum | Contractual | All | 🟡 Medium | Must be specified per deal |
| 20 | Smart contract audit / security | FCA, VARA expectations | All | 🟡 Medium | Audit before production use |
| 21 | Trade document checklist — Incoterms® 2020 | ICC Incoterms® 2020 | Global | 🟡 Medium | Integrate into document verification engine |

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
- For production: budget for FCA authorisation (timeline: 12–18 months) or consider launching initially in a free-zone jurisdiction (ADGM, DIFC) with a cleaner path to authorisation.

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

**What it is:** The UK Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017 (MLR 2017, as amended) require cryptoasset businesses to apply customer due diligence, transaction monitoring, and suspicious activity reporting. The EU's 6th Anti-Money Laundering Directive (6AMLD) tightens AML obligations across the EU.

**Risk to Blockmediary:**
- Blockmediary is a VASP (Virtual Asset Service Provider) by FATF definition — it facilitates transfers and custody of virtual assets. This triggers full AML/CFT obligations.
- Failure to implement adequate KYB/KYC before escrow funding creates risk of facilitating sanctioned or money-laundering transactions.
- Trade-based money laundering (TBML) is a specific risk in cross-border trade escrow — over/under-invoicing, phantom shipments, and document fraud are known typologies.

**Mitigation:**
- Implement a **compliance gate before funding**: both parties must complete KYB/KYC, sanctions screening, wallet screening, and goods/corridor eligibility before escrow is funded. (Already built into the MVP_FLOW.md design.)
- Use a reputable KYB/KYC provider (e.g. Sumsub, Jumio, Onfido) with sanctions and PEP screening.
- Maintain a **TBML risk checklist** for trade documents — watch for: invoice price inconsistent with market rates, unusual shipment routes, vague goods descriptions, discrepancies between documents.
- File Suspicious Activity Reports (SARs) where required.
- Appoint a UK Money Laundering Reporting Officer (MLRO) for production.

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
- **Wallet address as personal data:** The EDPB and many DPAs consider blockchain wallet addresses to be personal data where they can be linked to an identified individual. Because Blockmediary links wallets to verified legal identities, this linkage is clearly personal data.
- **KYC document storage:** Passports, ID images, business registration documents, and beneficial ownership information are all personal and sensitive data requiring secure, GDPR-compliant storage.
- **Cross-border data transfers:** If using cloud infrastructure or KYB providers that process data outside the UK/EU/EEA, standard contractual clauses (SCCs) or UK IDTA must be in place.

**Mitigation (Critical — Architecture Level):**
- **All personal data is kept off-chain (confirmed architecture decision).** The smart contract stores only: wallet addresses, deal amounts, state transitions, and document hashes. No names, no documents, no KYC data on-chain. This is not aspirational — it is the implemented design.
- Store KYC/KYB data in an off-chain, GDPR-compliant database (encrypted at rest and in transit).
- Use **pseudonymisation** — link on-chain wallet addresses to off-chain identity records via an internal reference ID, not the individual's name.
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
- Consider ADGM/DIFC as the initial regulatory home and passport to EU later.

**Key references:**
- [EBA MiCA page](https://www.eba.europa.eu/regulation-and-policy/asset-referenced-and-e-money-tokens-mica)
- [ESMA MiCA page](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica)

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
- Consider structuring UAE market entry through **ADGM or DIFC** (see 4.3 below), which have more accessible crypto licensing frameworks.

---

### 4.2 Dubai (VARA) — Virtual Asset Regulatory Authority

**What it is:** VARA regulates virtual asset activities in Dubai (outside DIFC). VARA Rulebook v2.0 took effect 19 June 2025. Category 1 tokens (stablecoins, ARVAs) now require **prior VARA approval** before issuance or distribution.

**Risk to Blockmediary:**
- Distributing or facilitating USDC (a Category 1 token) in Dubai without VARA approval / using a VARA-licensed distributor could breach VARA rules.
- Operating a VA escrow / transfer service in Dubai without VARA licensing triggers penalties.

**Mitigation:**
- Use only VARA-approved stablecoins and VARA-licensed distributors for Dubai-based transactions.
- For production Dubai launch: obtain relevant VARA licence (VA Management & Investment, VA Broker-Dealer, or VA Custody) as appropriate.
- For hackathon: note VARA compliance path in pitch.

**Key reference:** [VARA Rulebook v2.0](https://www.vara.ae)

---

### 4.3 DIFC / ADGM — Free Zone Frameworks (Lower Risk Path)

**What it is:**
- **ADGM (Abu Dhabi Global Market):** FSRA's Digital Asset Framework — well-regarded, internationally recognised, lighter-touch for innovative firms. FSRA has granted licences to crypto custody, exchange, and broker firms.
- **DIFC (Dubai International Financial Centre):** DFSA's crypto-token regime — regulated crypto services within DIFC. DFSA issued its crypto token framework in 2022, with ongoing updates.

**Risk to Blockmediary:** Lower than mainland UAE.

**Opportunity:**
- ADGM or DIFC could be the **regulatory home for the MVP** and early production stage.
- ADGM's FSRA has a structured Innovation Programme (RegLab) that may be relevant for a hackathon-to-pilot pathway.
- ADGM/DIFC entities can also serve as a base for GCC corridor deals.

**Mitigation / Action:**
- Prioritise ADGM or DIFC licensing for UAE market entry.
- Review ADGM FSRA Digital Asset Framework and RegLab eligibility.

---

### 4.4 UAE Data Protection — PDPL (Federal Decree-Law No. 45/2021)

**What it is:** UAE's Personal Data Protection Law. Applies to any entity processing personal data of UAE residents, regardless of location. Requires: consent or other lawful basis, data minimisation, DPO appointment for high-volume sensitive data processing, breach notification. Executive regulations pending as of early 2026 (6-month implementation grace once published).

**Risk to Blockmediary:**
- KYB/KYC data on UAE users (passports, business registration, wallet data linked to identity) is personal data under PDPL.
- DIFC and ADGM have their own separate data protection frameworks (DIFC DP Law 2020; ADGM DPR 2021) — these are arguably more mature than the federal PDPL.

**Mitigation:**
- Align with PDPL principles now (data minimisation, security, consent/contract basis).
- For DIFC/ADGM entities: comply with the respective free-zone DP framework.
- Watch for executive regulations and implement within the grace period.

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
| Art 14(b) | Data need not be identical across docs but must not conflict | AI checker flags *conflicts* (e.g. "5,000 MT" invoice vs "5 MT" BoL), not mere phrasing variations. |
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
| 8 | Assess ADGM RegLab / DIFC Innovation Testing Licence eligibility for UAE MVP | Badhri | 🟡 Medium | Pre-UAE launch |
| 9 | Smart contract audit plan — identify auditor and timeline | CTO | 🟡 Medium | Pre-mainnet |
| 10 | TBML red-flag checklist for document review workflow | Badhri + COO | 🟡 Medium | MVP |
| 11 | Monitor FCA CP25/14 Policy Statement (expected Summer 2026) | Badhri | 🟢 Low | Ongoing |
| 13 | Integrate Incoterms® 2020 document checklist into deal setup — dynamic checklist generation by Incoterm, transport mode validation, CIP ICC (A) check, FCA on-board BoL election | CTO + Badhri | 🔴 High | MVP build |
| 14 | Update all deal templates: replace DAT with DPU, update CIP insurance requirement to ICC (A) | Badhri | 🟡 Medium | MVP |
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
| DIFC DP Law 2020 | UAE (DIFC) | DIFC data protection framework | — |
| ADGM DPR 2021 | UAE (ADGM) | ADGM data protection framework | — |
| UCP 600 (ICC Pub. No. 600, 2007) | Global | ICC documentary credit standards — governs document examination and release logic | [docs/UCP600.md](UCP600.md) |
| eUCP | Global | Electronic supplement to UCP 600 — governs electronic document presentations | — |
| Incoterms® 2020 | Global | ICC trade terms — determines required documents, risk transfer, insurance obligations | [docs/Incoterms2020.md](Incoterms2020.md) |
| ICC DOCDEX | Global | Documentary dispute resolution | [ICC](https://iccwbo.org/dispute-resolution/dispute-resolution-services/adr/docdex/) |

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
| **Blockmediary** | On-chain stablecoin escrow | Document compliance | Yes (USDC, Base) | Yes ($5K–$250K) | Seeking FCA, ADGM, MiCA | Yes — UCP 600-inspired |

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

## 10. UAE Jurisdiction Choice — JAFZA vs DIFC vs ADGM

### JAFZA (Jebel Ali Free Zone Authority)

JAFZA is a Tier 1 logistics and trading free zone — excellent for import/export, warehousing, and physical goods businesses. **It is not a financial services regulator.** Regulated activities (crypto escrow, payment services, custody) are supervised by VARA (Dubai) or the mainland CBUAE — not JAFZA. For Blockmediary, JAFZA can house a **holding company or commercial subsidiary** but cannot be the regulatory home for the financial services product.

**Verdict for Blockmediary: Not suitable as the primary regulatory home. Useful only as a commercial/holding entity.**

---

### DIFC (Dubai International Financial Centre)

- **Regulator:** DFSA (Dubai Financial Services Authority) — modelled closely on the UK FCA.
- **Legal system:** English common law, independent courts — very familiar for UK/EU-trained lawyers.
- **Crypto framework:** DFSA published its Investment Token and Crypto Token regime in 2022. Firms can obtain a licence to provide custody, exchange, and arranged services for crypto tokens within DIFC.
- **Ecosystem:** 8,800+ registered companies (2025), including JPMorgan, Goldman Sachs, Big Four firms, and FinTech Hive accelerator. 62% rise in new registrations Q1 2026.
- **Capital requirements:** Higher than ADGM (~20–30% more).
- **Sandbox:** DIFC Innovation Testing Licence (ITL) — allows testing of innovative financial products for up to 2 years without full authorisation.
- **Data protection:** DIFC Data Protection Law 2020 — mature, GDPR-aligned.

**Best for:** Blockmediary if the team wants UK FCA-style regulation, maximum institutional credibility, and access to the largest financial ecosystem in the Middle East.

---

### ADGM (Abu Dhabi Global Market)

- **Regulator:** FSRA (Financial Services Regulatory Authority) — principles-based, more flexible, crypto-forward since 2018.
- **Legal system:** English common law — same as DIFC.
- **Crypto framework:** First formal virtual asset framework in the Middle East (2018). Updated guidance March 2026 covering tokenised securities, DeFi, AI-driven systems. Licence categories include Multilateral Trading Facility, Broker-Dealer, Custodian, and Investment Manager for digital assets.
- **Ecosystem:** 12,000+ active licences (2026), Abu Dhabi government-backed, strong sovereign wealth fund connections.
- **Capital requirements:** 20–30% lower than DIFC — meaningful for a startup.
- **Sandbox:** FSRA Digital Lab — active engagement with founders, rapid testing pathway.
- **Data protection:** ADGM Data Protection Regulations 2021 — similarly GDPR-aligned to DIFC.

**Best for:** Blockmediary if the team wants lower capital requirements, a more founder-friendly regulator, and the most advanced crypto-specific licensing framework in the UAE.

---

### Recommendation: **ADGM for MVP; DIFC as scale-up option**

| Criteria | JAFZA | DIFC | ADGM | Winner |
|----------|-------|------|------|--------|
| Crypto/fintech licensing | ❌ | ✅ | ✅✅ | ADGM |
| English common law | ❌ | ✅ | ✅ | Tie |
| Capital requirements | N/A | Higher | Lower | ADGM |
| Regulator flexibility | N/A | Structured / FCA-style | Principles-based, founder-friendly | ADGM for early stage |
| Ecosystem / prestige | High (logistics) | Highest (finance) | High (finance) | DIFC for later stage |
| Sandbox / innovation pathway | ❌ | ITL (2 years) | Digital Lab (active) | ADGM |
| GDPR-aligned data protection | ❌ | ✅ (DIFC DP Law 2020) | ✅ (ADGM DPR 2021) | Tie |
| GCC corridor access | ✅ (trade) | ✅ | ✅ | Tie |

**Recommended path:**
1. **Incorporate in ADGM** and apply for FSRA Digital Lab / Innovation Testing Licence for the MVP phase.
2. Use ADGM as the regulatory home for GCC and MENA market launch.
3. Consider **DIFC** for a second entity once institutional partnerships (banks, trade finance houses) are being pursued — the DIFC ecosystem is better for those conversations.
4. JAFZA: only if the team wants a separate holding or trading entity for physical goods logistics — not the fintech product.

**On GDPR in ADGM/DIFC:** Both free zones have their **own** data protection frameworks (DIFC DP Law 2020; ADGM DPR 2021) that are separate from and more developed than the UAE federal PDPL. They are both closely aligned with GDPR principles (lawful basis, data minimisation, data subject rights, breach notification, DPO requirements for high-risk processing). For practical purposes, if you comply with GDPR you will largely satisfy DIFC/ADGM DP requirements — but there are differences in detail (e.g. DIFC has its own Commissioner, separate enforcement). **EU GDPR itself still applies if you process data of EU residents regardless of where the company is incorporated** — so incorporation in ADGM does not exempt Blockmediary from GDPR for EU user data.

---

*This document is a working compliance reference for an academic hackathon project. It does not constitute legal advice. Seek qualified legal counsel before operating in any of these jurisdictions with real funds or real users.*
