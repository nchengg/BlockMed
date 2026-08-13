# Blockmediary financial model — key figures

**Model date:** 12 August 2026  
**Source:** [Blockmediary Financial Model Detailed 2026-08-12](./Blockmediary_Financial_Model_Detailed_2026-08-12.xlsx)  
**Purpose:** A shared reference for reports, presentation slides and speaker notes. Figures are the model's base case unless stated otherwise. GBP figures are rounded for presentation; use the cited cells for the underlying values.

## Headline numbers

- **Initial operating funding need: £3.06m.** This comprises the peak operating cash gap plus a three-month operating reserve. It excludes future VARA restricted capital. (`Launch Readiness!E12`)
- **First paying pilot: Month 12; first cash receipt: Month 13.** The DIFC/regulated-partner pilot and VARA licensing workstreams run in parallel from inception. (`Launch Readiness!E6`, `E11`)
- **Full VARA licence target: Month 18 in the base timing case.** (`Launch Readiness!E14`)
- **Monthly cash-flow break-even: Year 4, Month 8 in the base case.** The high case reaches it in Year 4, Month 4; the low case remains beyond Month 60. (`Cash Flow Statement!B45:B47`)
- **Base Year 3: 2,000 deals, £76.0m GMV, £1.37m revenue and 77.1% gross margin.** (`P&L 5yr!E7:E18`, `E31`)
- **Future VARA restricted capital: £319k, funded separately before licensing.** It is regulatory capital, not spendable runway. (`Launch Readiness!E17`)

## Base-case commercial outlook

| Model year | Deals | Ending active customers | Average deal | GMV | Revenue |
|---|---:|---:|---:|---:|---:|
| Year 1 | 3 | 1 | £30.8k | £92.3k | £2.4k |
| Year 2 | 240 | 60 | £34.0k | £8.16m | £220.1k |
| Year 3 | 2,000 | 333 | £38.0k | £76.03m | £1.371m |
| Year 4 | 15,000 | 1,875 | £42.8k | £642.34m | £8.943m |
| Year 5 | 30,000 | 3,000 | £47.9k | £1.437bn | £17.833m |

Sources: `P&L 5yr!C7:G18` and `P&L 5yr!C78:G84`. Customer counts are model-implied targets; the presentation table rounds fractional outputs to whole customers.

| Model year | Gross margin | EBITDA before one-offs | Net profit/(loss), including one-offs |
|---|---:|---:|---:|
| Year 1 | 71.1% | (£764k) | (£1.110m) |
| Year 2 | 78.5% | (£990k) | (£990k) |
| Year 3 | 77.1% | (£409k) | (£409k) |
| Year 4 | 77.8% | £5.002m | £5.002m |
| Year 5 | 78.6% | £11.753m | £11.753m |

Source: `P&L 5yr!C29:G63`. Monthly cash-flow break-even occurs in **Year 4, Month 8**; this is more precise than inferring break-even from the annual P&L.

## Revenue model and pricing

Blockmediary earns transaction fees plus document-review, exception-handling, partner/API and ancillary-service revenue. The MVP does **not** model lending spread, FX trading revenue or balance-sheet credit risk.

| Intake tier | Year 1 base deal value | Escrow take rate | Minimum escrow fee | Document/review fee | Dispute/amendment fee |
|---|---:|---:|---:|---:|---:|
| Tier A — eBL | £35,000 | 0.8% | £150 | £25/deal | £100/event |
| Tier B — carrier/API | £30,000 | 1.5% | £250 | £90/deal | £200/event |
| Tier C — paper collection | £30,000 | 3.0% | £500 | £300/deal | £500/event |

Sources: `Assumptions!F63:F74`, `F149:F154` and `Tier Economics!B3:U16`.

The base mix shifts toward lower-friction digital processing as the platform scales:

- Tier A eBL rises from **15% of deals in Year 1 to 70% in Year 5**.
- Tier C paper collection falls from **40% to 5%** and remains a higher-priced fallback, not the strategic scale path.
- The resulting blended escrow take rate declines from approximately **2.0% in Year 1 to 1.3% in Year 3 and 1.0% in Year 5**, while the base gross margin remains approximately **71%–79%**.

Sources: `Tier Economics!B4:U10` and `Pitch Deck References!C8:C16`.

### Year 3 revenue bridge

**2,000 deals × £38.0k average deal value = £76.0m GMV.** Tiered escrow fees plus ancillary revenue produce **£1.371m total revenue** and **£1.057m gross profit**, equivalent to a **77.1% gross margin**. (`P&L 5yr!E7:E31`)

## Funding, reserve and use of funds

The **£3,063,210 initial operating funding need** is the base case's peak monthly operating deficit of approximately **£2,871,694**, plus a **£191,516 three-month operating reserve**. Average pre-revenue operating burn is approximately **£104,270 per month**. (`P&L 5yr!F64:F66`; `Launch Readiness!E12:E13`)

| Use of funds | Amount | Share of initial operating funding |
|---|---:|---:|
| Engineering and product | £570,988 | 18.6% |
| Operations, people and G&A | £1,062,631 | 34.7% |
| Compliance, legal and regulatory | £1,067,397 | 34.8% |
| Go-to-market and acquisition | £170,678 | 5.6% |
| Working capital and contingency | £191,516 | 6.3% |
| **Total** | **£3,063,210** | **100.0%** |

Source: `Dashboard!J57:M62`.

### Capital terminology — do not combine these accidentally

| Item | Amount | Treatment |
|---|---:|---|
| Initial operating funding need | £3,063,210 | The model's initial operating ask; funds the operating deficit and three-month reserve. |
| Operating reserve | £191,516 | Included within the £3.063m ask; spendable operating liquidity held as a cushion. |
| Future VARA restricted capital | £319,095 | Excluded from the initial ask and not spendable as operating runway. |
| Combined staged capital envelope | £3,382,305 | Derived total if the operating ask and later restricted capital are discussed together; do not call this the initial ask. |
| Safeguarded client funds | Varies with GMV | Customer assets with a matching liability; never revenue, company cash or funding capacity. |

## Startup and regulatory cost assumptions

| Item | Model value | Timing/treatment |
|---|---:|---|
| First-six-month one-off startup costs | £243,412 | Includes a 15% contingency. |
| DIFC/regulated-partner pilot onboarding one-off | £60,000 | Year 1 launch cost. |
| VARA application fee placeholder | AED 200,000 / £42,546 | Staged during the Year 1 application process. |
| Total Year 1 startup and staged regulatory one-offs | £345,958 | £243,412 + £60,000 + £42,546. |
| Partner-pilot annual fees and oversight | £67,000/year | Pilot-stage regulatory/partner run-rate. |
| VARA annual supervision placeholder | AED 480,000 / £102,110/year | Applies after licensing. |
| VARA restricted-capital placeholder | AED 1,500,000 / £319,095 | Held separately before licensing. |

Sources: `Startup 6mo!F40:F44`, `Launch Readiness!A5:E17` and `P&L 5yr!C58`.

The VARA application, supervision and restricted-capital values remain **planning placeholders pending counsel, regulator and entity-structure confirmation**. They should not be described as final quoted fees.

## Launch timeline

The base case starts the DIFC/partner-pilot and VARA workstreams together in **Month 1**. The pilot can begin before the full VARA licence because regulated-partner and counsel-approved controls define the limited pilot perimeter.

| Timing case | First paid pilot | First cash receipt | Full VARA target |
|---|---:|---:|---:|
| Early | Month 9 | Month 10 | Month 12 |
| **Base** | **Month 12** | **Month 13** | **Month 18** |
| Delayed | Month 18 | Month 19 | Month 24 |

Source: `Launch Readiness!A19:G23`.

Base VARA planning milestones are **IDQ/pre-application in Month 1, ATI/Stage 2 in Month 4, full submission in Month 9 and licensing in Month 18**. (`Launch Readiness!F14:G16`; `Model Checks!A44:G48`)

The customer-launch critical path assumes completion of:

- pilot perimeter and DIFC partner structure by Month 4;
- custody, settlement, contracts and go-live approval by Month 11;
- KYB, sanctions, monitoring and review procedures by Month 10; and
- production security, smart-contract audit and API hardening by Month 10.

Source: `Launch Readiness!A48:E53`.

## Scenario sensitivity

| Scenario | Year 3 revenue | Year 3 active customers | Monthly cash-flow break-even | Peak cash gap | Initial operating funding need | Month-60 cash |
|---|---:|---:|---|---:|---:|---:|
| Low | £1.037m | 480 | Beyond Month 60 | £4.088m | £4.279m | (£3.104m) |
| **Base** | **£1.371m** | **333** | **Year 4, Month 8** | **£2.872m** | **£3.063m** | **£12.717m** |
| High | £1.912m | 320 | Year 4, Month 4 | £2.264m | £2.455m | £33.596m |

Sources: `Scenario Engine!D30,J30,P30`, `D62,J62,P62` and `Dashboard!J23:N28`.

The active-customer result is not ordered the same way as revenue because the scenarios use different assumptions for deals per active customer. The low case needs more customers to produce fewer deals per customer.

## Implied customer acquisition cost

The dashboard's CAC is a **planning cross-check**, not observed acquisition performance. It divides loaded Sales/BD/CS compensation, marketing and CRM costs by gross new customers. Year 1 is unusually high because one pilot customer carries the launch-year commercial build-out.

| Model year | Implied CAC | Gross new customers required | New customers per Sales/BD/CS FTE | Capacity readout |
|---|---:|---:|---:|---|
| Year 1 | £50,633 | 1.0 | 3.0 | Within capacity |
| Year 2 | £3,063 | 59.1 | 29.6 | Within capacity |
| Year 3 | £974 | 279.3 | 93.1 | Within capacity |
| Year 4 | £347 | 1,575.0 | 225.0 | Within capacity |
| Year 5 | £486 | 1,312.5 | 164.1 | Within capacity |

Source: `Dashboard!B40:O50`. The model's warning threshold is **250 gross new customers per Sales/BD/CS FTE** (`Assumptions!F169`).

## Client funds and safeguarding scale

The model assumes a **14-day average funded-to-release period**, with **0% of client funds available to operations** and **no client-asset yield or spread recognized**.

| Model year | Average safeguarded client assets | Operating-cash availability | Recognized yield |
|---|---:|---:|---:|
| Year 1 | £3,538 | £0 | £0 |
| Year 2 | £313,032 | £0 | £0 |
| Year 3 | £2,916,261 | £0 | £0 |
| Year 4 | £24,637,623 | £0 | £0 |
| Year 5 | £55,114,789 | £0 | £0 |

Source: `Client Funds Memo!A5:G18`. During the partner-led pilot, funds are assumed to route through the regulated partner or a counsel-approved non-custodial structure, not a Blockmediary-controlled wallet.

## Copy-ready statements

- “The base case requires **£3.06m of initial operating funding**, including a three-month reserve, with future VARA restricted capital funded separately.”
- “Blockmediary begins the partner-pilot and VARA workstreams in parallel, targeting a **first paid pilot in Month 12** and a **full VARA licence in Month 18**.”
- “By Year 3, the base case processes **2,000 deals and £76m of GMV**, generating **£1.37m of revenue at a 77% gross margin**.”
- “The base case reaches **monthly cash-flow break-even in Year 4, Month 8**; the modeled range is Year 4, Month 4 to beyond Month 60.”
- “The model treats client escrow funds and future VARA restricted capital as **unavailable for operating use**.”

## Important boundaries

- This is a preliminary, presentation-level model for a master's project, not a loan application, audited forecast or investment-grade valuation.
- Year 4 and Year 5 volumes are ambitious planning targets. They depend on digital-document adoption, partner distribution and an AI-enabled commercial operating model.
- Regulatory costs, licence timing and the pilot perimeter require confirmation from UAE counsel, the regulated partner, DIFC and VARA.
- GMV is the value of transactions processed, not Blockmediary revenue.
- Implied CAC, churn, deal frequency, holding period and acquisition capacity are assumptions or planning outputs, not historical performance.
- Client funds, restricted capital and the operating reserve must remain separately described.

## Model integrity and source map

At extraction, the workbook's overall status was **PASS**: all **42 model checks passed**, and the formula-error scan found no `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?` or `#N/A` errors. (`Model Checks!A1:G48`)

| Topic | Primary model location |
|---|---|
| Executive headlines and use of funds | `Dashboard` |
| Slide-ready KPI wording | `Pitch Deck References` |
| Launch timing, regulatory costs and funding need | `Launch Readiness` |
| Five-year operating case and customer bridge | `P&L 5yr` |
| Low/base/high cases | `Scenario Engine` |
| Tier pricing and unit economics | `Assumptions`; `Tier Economics` |
| Startup cost build | `Startup 6mo` |
| Safeguarded balances and treatment | `Client Funds Memo` |
| Mechanical validation | `Model Checks` |

