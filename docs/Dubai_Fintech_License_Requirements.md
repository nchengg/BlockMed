---
status: "Superseded planning note — retained for historical context only"
superseded_by: "Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md"
last_reviewed: "2026-08-12"
---

# Dubai Fintech License Requirements — Superseded Planning Note
## Documentary Escrow · DIFC Partner Pilot · VARA Scale Readiness

> [!CAUTION]
> **Do not use this file as the current Blockmediary regulatory strategy or as legal advice.** Its original single-path comparison, activity labels, fees and sequencing assumptions have been superseded by [Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md](Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md). Official regulator materials and a written UAE regulatory-perimeter opinion take precedence over both documents.

> **Current product boundary:** Blockmediary is a prefunded documentary escrow and document-conformity service for SME cross-border trade. It does not provide credit, advances, working capital or trade financing in the MVP.

## Current canonical planning position

| Topic | Current assumption |
|---|---|
| Overall strategy | Start the DIFC partner-led pilot and VARA readiness/application workstreams in parallel at inception (model Month 1). They are complementary, not alternative or sequential routes. |
| DIFC pilot | Operate only through a suitably DFSA-authorised partner whose permissions cover the actual activity. A DIFC Commercial or Innovation Licence does not authorise regulated financial services. |
| DFSA ITL | Do not assume an Innovation Testing Licence is required or sufficient. Consider it only if the DFSA or counsel concludes that Blockmediary itself will conduct regulated activity during testing. |
| First paid pilot | Month 12 base case, subject to partner, legal, AML/KYB, contract, security and production-readiness gates. |
| VARA timing | Start in Month 1; model full licensing at Month 18 in the base case, with Month 12 as an early case and Month 24 as a delayed case. ATI or in-principle approval is not permission to operate. |
| VARA activity scope | Transfer and Settlement is the closest apparent fit. Custody depends on actual smart-contract, release-key, upgrade and recovery control. Broker-Dealer is not established by the current facts and must not be assumed mandatory. |
| Entity structure | The DIFC partner-led pilot and Blockmediary's own VARA-scale operation are legally distinct. A VARA applicant must be established outside DIFC; Custody may also require structural separation. |
| CBUAE overlay | Treatment of USDC/EURC settlement for UAE physical-goods transactions is an unresolved legal gate. Obtain written advice before any live UAE launch. |
| Terminology | Say **VARA-licensed**, never “VARA-certified.” Do not describe Blockmediary as DFSA-authorised unless it obtains the relevant authorisation. |

## Historical research retained below

The remaining tables are preserved only as an earlier research snapshot. Their activity classifications, fee totals, capital treatment and timelines are illustrative and may be inaccurate for Blockmediary's final architecture. They must not override the canonical report linked above.

---

## Historical Path A — Dubai Mainland (VARA + CBUAE)

**Regulated by:** Virtual Assets Regulatory Authority (VARA) and Central Bank of UAE (CBUAE)  
**Best for:** Reaching UAE-wide SMEs directly across the mainland market

| # | License / Registration | Key Requirements | Timeline | Cost (AED) |
|---|---|---|---|---|
| **1** | **Free zone trade license** (DMCC or DWTC) — legal entity before anything else | Passport copies, business plan, office lease, share structure, local address | 2–4 weeks | 50,000–80,000 (one-time setup) |
| **2** | **VARA — VA Custody Services** — possible only if Blockmediary's functional control constitutes custody *(Activity-dependent; not established)* | Requires a written analysis of release keys, administration, upgrades, recovery and safeguarding. Structural separation may be required. | Not confirmed | Historical estimate only |
| **3** | **VARA — VA Transfer & Settlement** — smart-contract release of stablecoin after documentary conditions are satisfied *(Closest apparent fit; confirmation required)* | Settlement rules, counterparty-risk framework, operational resilience and activity-specific capital requirements. | Begin readiness in Month 1 | Historical estimate only |
| **4** | **VARA — VA Broker-Dealer** — relevant only if the actual service includes regulated VA order arranging, matching or dealing *(Do not assume required)* | The present physical-goods escrow model does not establish this activity. Obtain a written perimeter opinion. | Not confirmed | Historical estimate only |
| **5** | **CBUAE — Payment Token Services overlay** *(Unresolved legal gate; do not assume a specific licence or sequence)* | Obtain written advice on the chosen token, customer location and physical-goods payment flow, including whether a licence, registration or non-objection is required. | Before live UAE launch | Not confirmed |

### Historical Dubai Mainland Year 1 Cost Scenario

| Cost category | AED |
|---|---|
| Regulatory fees — licenses 1 to 4 (applications + Year 1 supervision + entity setup) | ~700,000–780,000 |
| Legacy broad-scope capital placeholder — actual scope and structure unconfirmed | 1,500,000+ |
| Operational costs — office, 2 Responsible Individuals, legal, tech, AML | 900,000–1,600,000 |
| **Total cash required — Year 1** | **AED 3.1M–3.9M (≈ USD 845K–1.06M)** |

> **Legacy capital note:** The AED 1.5M figure is a conservative broad-scope planning placeholder, not a confirmed Blockmediary requirement. Actual capital is activity-specific, overhead-tested and affected by entity structure. Do not describe it as a permanently frozen VARA-beneficiary trust account without current authoritative support.

---

## Historical Path B — DIFC Free Zone (DFSA)

**Regulated by:** Dubai Financial Services Authority (DFSA)  
**Best for:** Institutional partnerships, a controlled partner-led pilot and English common-law contracting

| # | License / Registration | Key Requirements | Timeline | Cost (AED/USD) |
|---|---|---|---|---|
| **1** | **DIFC Innovation License** — entry point, legal presence, no regulated activity yet *(Do first — cheapest entry)* | Business plan, passport copies, co-working desk, no capital requirement, no Responsible Individuals yet. Valid 2–5 years at subsidised rate. | 1–2 weeks | USD 1,500/year (≈ AED 5,500/yr) |
| **2** | **DFSA Innovation Testing Licence (ITL)** — restricted sandbox for a firm that itself needs to test regulated financial services *(Conditional; not the default partner-led route)* | Consider only if the DFSA or counsel concludes Blockmediary itself will conduct regulated activity during the test. It is not a substitute for an authorised partner or correct operating structure. | Not assumed in base case | Verify with DFSA |
| **3** | **DIFC entity registration (LLC)** — full legal entity needed before DFSA full license application *(Required before step 4)* | Memorandum of Association, share structure, physical office lease (not co-working), UAE bank account, audited financials plan | 3–6 weeks | AED 29,000–44,000 (+ AED 14,700–18,000/yr renewal) |
| **4** | **Possible DFSA authorisation for Blockmediary itself** *(No category or permission is currently confirmed)* | Required only if Blockmediary independently conducts a regulated financial service. The exact activity, category, staffing, capital and digital-asset treatment require a perimeter opinion and DFSA confirmation. | Not assumed for the partner-led pilot | Historical ranges are not decision-grade |
| **5** | **DFSA Digital Assets permission** — specific add-on permission to deal in or hold digital assets including stablecoins *(Added to Cat 3/4 license — no separate fee)* | Token classification assessment per DFSA rules, proof stablecoin is DFSA-recognised (e.g. USDC approved Feb 2025), custody safeguarding plan, client disclosure requirements | Concurrent with step 4 | Included in Cat 3/4 application |
| **6** | **DFSA Tokenisation Sandbox** (optional alternative) — if targeting tokenised trade instruments, test under DFSA supervision *(Alternative to ITL for tokenisation angle)* | Tokenisation use case proposal, regulatory collaboration agreement, 12-month test period, exit to full license or wind down. Open to 2025 cohort applicants. | 12 months sandbox + 4–8 months full license | No sandbox fee (cost is full license after exit) |

### Historical DIFC Year 1 Cost Scenario

| Cost category | AED |
|---|---|
| Legacy all-steps fee scenario — not the current partner-led pilot base case | 250,000–500,000 |
| Capital requirement — expense-based, not locked in trust (USD 10K base or ~USD 150K expense-based — significantly lower than VARA) | 37,000–550,000 |
| Operational costs — office, 2 Senior Executive Officers, legal, tech, AML | 700,000–1,200,000 |
| **Total cash required — Year 1** | **AED 1.0M–2.3M (≈ USD 270K–625K)** |

---

## Historical side-by-side comparison

| Factor | Path A — Dubai Mainland (VARA) | Path B — DIFC (DFSA) |
|---|---|---|
| Regulator | VARA + CBUAE | DFSA |
| Entry cost | AED 50,000+ (free zone setup) | AED 5,500/yr (Innovation License) |
| Capital assumption | AED 1.5M+ legacy broad-scope placeholder; not confirmed | AED 37K–550K legacy range; not the partner-led pilot base case |
| Total Year 1 cash | AED 3.1M–3.9M | AED 1.0M–2.3M |
| Timeline to first operation | Full VARA licence: M18 base (M12 early / M24 delayed) | Partner-led paid pilot: M12 base, subject to launch gates |
| SME reach | UAE-wide mainland + free zones | DIFC clients and institutions only (without VARA) |
| Bank partnerships | Any UAE bank | Direct access to 28 of world's top 30 banks inside DIFC |
| Legal framework | UAE civil law | English common law |
| Best for | Scale and SME volume | Institutional credibility and bank partnerships |
| Can both be held? | Yes — they can coexist | Yes — they can coexist |

---

## Current recommendation — parallel workstreams with separate launch gates

The current plan starts both workstreams at inception:

1. **DIFC partner-led pilot track:** select and verify a suitably DFSA-authorised partner; obtain a written regulatory-perimeter opinion; agree the responsibility matrix and outsourcing terms; complete customer contracts, KYB/sanctions controls, production security and operating procedures; target the first limited paid pilot in Month 12.
2. **VARA scale-readiness track:** select a non-DIFC Dubai applicant structure; begin pre-application work and the Initial Disclosure Questionnaire in Month 1; resolve the activity perimeter and CBUAE overlay; recruit the required people; build the policies, capital plan and evidence package; target a full licence in Month 18 in the base case.

The DIFC pilot may operate only within the authorised partner's permissions and agreed controls. The VARA-scale service may begin only when the full VASP licence is effective and only for the approved activities. Preliminary approval, Approval to Incorporate or in-principle approval is not permission to serve customers.

### Agent handoff rule

When another project document conflicts with this note, agents must use the following priority:

1. Current official DFSA, VARA and CBUAE sources and written legal/regulatory advice.
2. [Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md](Blockmediary_DIFC_Pilot_and_VARA_Readiness_Report.md).
3. The current BRD, product specification, domain rules and financial model.
4. This historical note only for background and leads that still require verification.

Do not propagate the superseded claims that Blockmediary is a trade-financing product, that DIFC and VARA should be pursued sequentially, that an ITL automatically permits the pilot, or that Custody and Broker-Dealer permissions are confirmed mandatory.

---

*Historical research was originally compiled in July 2026 and reviewed on 12 August 2026. Fees, capital, activity classifications and regulatory requirements must be verified against current official sources before use.*
