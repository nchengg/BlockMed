# Blockmediary - Customer Demographics

> **Status:** Conceptual draft for team discussion
> **Date:** 2026-07-01
> **Purpose:** Internal segmentation note. This is not yet a market-research-backed
> customer analysis; it captures how each customer type looks from Blockmediary's
> operating and financial perspective.

## Framing

Blockmediary should not treat "SME customer" as one segment. The economics depend
on three overlapping dimensions:

1. **Party role** - buyer/importer, seller/exporter, or platform/intermediary.
2. **Customer size and process maturity** - small SME, repeat mid-market SME, large
   corporate, or institutional channel.
3. **Document maturity** - eBL/API-verifiable documents versus carrier-source
   checks versus paper/manual documents.

The most important practical insight is that small customers are not only smaller
revenue opportunities. They may be more expensive to serve because their documents,
shipping arrangements, and internal processes are less standardised.

## Document Maturity Lens

| Tier | Typical customer/doc profile | What it means for Blockmediary |
|---|---|---|
| **Tier A - eBL / source-of-truth digital rail** | Larger or more sophisticated customers using recognised eBL/document systems | Lowest operational risk, fastest verification, best scalability, lower support burden |
| **Tier B - carrier/API-verifiable documents** | Mid-market or forwarder-supported customers using known carriers or accessible issuer checks | Good commercial core: some source corroboration, manageable manual work, realistic SME fit |
| **Tier C - paper/manual/originals fallback** | Smaller SMEs, smaller shippers, house BoLs, scanned originals, couriered documents | Highest cost and risk: manual review, examiner time, courier/original handling, more disputes |

For early financial modelling, assume the smallest businesses tend toward **Tier C**
unless they come through a forwarder/platform that standardises the workflow.

## Customer Segment Map

| Customer type | What they represent to us | Likely document profile | Needs we must support | Main financial risks | Early stance |
|---|---|---|---|---|---|
| **Small SME importer / buyer** | Demand-side customer with a payment-trust problem, but limited process maturity | Scanned PDFs, inconsistent naming, forwarder or house BoL, limited carrier API access | Simple onboarding, clear fee disclosure, wallet support, strong buyer confidence, guided objection process | Low deal value may not cover KYC, examiner, and support cost; high education burden; higher blocked/enhanced-review rate | Serve carefully with minimum fees and strict eligibility gates |
| **Small SME exporter / seller** | Supply-side customer that values payment assurance before shipment | Commercial invoice and packing docs may be informal; transport docs may be paper/manual | Proof that funds are locked, clear upload guidance, fast discrepancy feedback, protection from invalid buyer objections | Incomplete documents, delayed release, cure/waiver workload, support intensity, reputational risk if release is slow | Useful segment, but needs heavy workflow guidance |
| **Repeat mid-market SME importer/exporter** | Best likely beachhead: enough deal size and repeat usage to make unit economics work | More standard invoice/packing list; likely known forwarders/carriers; mixed Tier B/Tier C | Multi-deal dashboard, repeat-counterparty onboarding, reusable escrow templates, predictable review SLA | Onboarding must amortise over repeat deals; pricing must beat LC alternatives while covering examiner costs | Primary early target |
| **Large corporate buyer** | High-value customer with procurement and compliance discipline | Standardised docs, stronger ERP/procurement process, likely Tier A/B | Role-based access, audit trail, legal review, integrations, high reliability, security assurance | Long sales cycle, procurement drag, lower pricing power, heavy diligence and SLA requirements | Later target, not first wedge |
| **Large corporate seller** | Volume and credibility if won; strong need for payment certainty | Usually better documents and shipment discipline; Tier A/B more likely | Release certainty, predictable objection window, high-confidence documentary process, dispute path | Will demand strong indemnities, fast settlement, enterprise support, and clear liability allocation | Later target once process is proven |
| **Forwarder / logistics platform / broker** | Channel partner that can aggregate many SME deals | Mixed underlying customers; partner may standardise forms and document capture | Platform/intermediary initiation, API or portal, partner dashboard, scoped permissions, counterparty invitation | Integration cost, partner commission, inherited customer support burden, unclear KYC reliance, concentration risk | Attractive if they improve document quality and repeat volume |
| **Bank / institutional white-label partner** | Future distribution route and credibility signal | Highly standardised, but compliance-heavy | API, white-label controls, reporting, security, audit exports, bank-grade diligence | Very long cycle, heavy compliance, low margin, custom implementation, potential loss of product control | Post-MVP only |
| **Contracted documentary examiner** | Not a customer, but a critical supply-side partner shaping unit economics | Receives all submitted docs plus Layer 2/3 outputs | Structured verdict capture, examiner portal or data feed, audit trail, service-level terms | Per-deal examiner fee is a floor under pricing; quality/turnaround affect our liability and customer experience | Outsource in Phase 1, retain structured data ownership |

## Segment Notes

### Small SME Importers

Small importers have the clearest pain point: they do not want to pay before there
is credible shipment evidence. They may also be the least prepared to use stablecoin
escrow, wallet signatures, or documentary release rules.

From Blockmediary's perspective, this customer is expensive unless the deal is large
enough or repeatable enough. The main risks are onboarding friction, low willingness
to pay, high support needs, and poor document quality from the seller or forwarder.

Support requirements:

- Plain-language onboarding and fee disclosure.
- Wallet setup support or a very guided wallet-signature flow.
- Clear explanation that Blockmediary releases against documents, not physical
  goods quality.
- A strict valid-objection workflow so buyers cannot block release for invalid reasons.
- Minimum fees so low-value trades do not become loss-making.

### Small SME Exporters

Small exporters value payment assurance. Their biggest need is confidence that the
buyer has funded escrow and cannot renegotiate after shipment if the documents comply.

The risk is operational: smaller sellers may upload incomplete or inconsistent
documents, especially where the carrier, forwarder, or local agent creates the
transport paperwork. That creates cure requests, examiner time, and customer support.

Support requirements:

- Clear document checklist by Incoterm and corridor.
- Upload validation before formal submission.
- Fast feedback on missing or discrepant fields.
- Visibility that funds are locked before shipment.
- Protection from invalid buyer objections after compliant presentation.

### Repeat Mid-Market SMEs

This is the strongest conceptual beachhead. These customers are still underserved by
traditional LCs, but they are more likely to have repeat flows, known counterparties,
better documents, and enough deal size to absorb fees.

They are also where onboarding costs can be amortised. If a customer does one trade,
KYC/KYB and support costs are heavy. If the same customer does many trades, the model
improves quickly.

Support requirements:

- Saved counterparties and repeat deal templates.
- Multi-deal dashboard.
- Predictable SLA for document review.
- Tiered pricing based on document maturity.
- A route to migrate customers from Tier C to Tier B over time through better
  forwarder/carrier choices.

### Large Corporate Customers

Large corporates are attractive because they bring higher deal value and cleaner
documents. They are also slower and harder to win. They may already have bank LC
facilities, internal trade teams, ERP workflows, and strict vendor onboarding.

They are therefore not the best first wedge unless a specific warm channel exists.
They are better treated as later enterprise or platform customers once the product
has operational proof.

Support requirements:

- Security and compliance documentation.
- Role-based access and approval workflows.
- API/integration options.
- Strong audit exports.
- Higher SLA, incident response, and legal review capacity.

### Forwarders, Platforms, and Intermediaries

Forwarders and platforms may be the best route into SME volume because they can
aggregate deals and help standardise intake. However, they can also pass operational
messiness onto Blockmediary if their customers are low-quality or poorly documented.

The key question is whether the partner improves the workflow or merely increases
volume. Good partners should reduce support load, improve document quality, and
increase repeat usage. Bad partners create low-margin, high-risk volume.

Support requirements:

- Platform/intermediary deal initiation.
- Permissions that allow initiation and coordination, but not deposit, approval, or
  release as a principal.
- Clear reliance model for KYC/KYB.
- Partner reporting and API access.
- Commercial terms for setup fees, monthly minimums, and referral commissions.

### Banks and Institutional Partners

Banks and institutional channels are not the right first customer for a fast MVP.
They are useful later if Blockmediary becomes a white-label documentary escrow rail
or verification API.

The financial upside is distribution and credibility. The downside is long sales
cycles, low tolerance for regulatory ambiguity, custom requirements, and reduced
pricing power.

Support requirements:

- Hardened API and documentation.
- Enterprise-grade audit, controls, and reporting.
- Legal/regulatory sign-off.
- Data-protection and jurisdictional controls.
- Integration support and formal SLA.

## Financial Implications By Segment

| Driver | Small SME | Repeat mid-market SME | Large corporate | Platform/intermediary |
|---|---|---|---|---|
| Average deal value | Low to medium | Medium | High | Mixed |
| Repeat usage | Uncertain | Stronger | Strong if won | Depends on partner |
| Document quality | Often weak | Mixed to good | Strong | Mixed, but can be standardised |
| Tier C exposure | High | Medium | Low | Depends on underlying customers |
| Support cost | High | Medium | High but more structured | High during integration |
| Pricing power | Limited | Moderate | Lower due to negotiation | Shared via commission/minimums |
| Sales cycle | Shorter | Moderate | Long | Moderate to long |
| Best use | Carefully gated early users | Primary beachhead | Later enterprise target | Volume channel if quality is controlled |

## Key Assumptions To Validate Later

This document should feed a future market-research-backed customer analysis. The
priority assumptions to validate are:

1. Average transaction value by customer segment and corridor.
2. Repeat trades per customer per year.
3. Share of customers that can produce Tier A, Tier B, or Tier C documents.
4. Actual availability of carrier/eBL/API source corroboration in the beachhead corridor.
5. Examiner cost per document set by customer/document type.
6. Customer willingness to pay minimum fees and tiered take rates.
7. Support time per deal for small customers versus mid-market customers.
8. Discrepancy, cure, waiver, and valid-objection rates by customer type.
9. Partner/intermediary commission expectations and setup-fee tolerance.
10. Whether customers perceive Blockmediary as cheaper, faster, or safer than an LC.

## Working Conclusion

The first viable customer should probably be a **repeat mid-market SME** or a
**forwarder-led cluster of SMEs** in a controlled corridor, not the smallest
one-off trader and not a large institutional customer.

Small SMEs are aligned with the mission, but they need strict pricing and support
boundaries because their deals are more likely to be Tier C. Large corporates and
banks are attractive later, but they create enterprise sales, integration, and
compliance burden before the product has proof. The practical early goal is to find
customers that are SME enough to need Blockmediary, but process-mature enough that
the verification model can scale.
