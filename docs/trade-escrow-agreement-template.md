# Blockmediary — Trade Escrow Agreement
**Template version:** 0.1 (draft for team review)
**Status:** For discussion — not a final legal document. Seek qualified legal counsel before use with real parties.
**Governing law:** English law (default — parties may agree an alternative in Schedule 1)
**Last updated:** 2026-06-23

> **How to use this template:** Fields in `[SQUARE BRACKETS]` must be completed for each deal. Sections marked `[DISCUSS]` are open decisions for the team to agree before finalising. Annotations in *italics* are drafting notes — remove before sending to parties.

---

## TRADE ESCROW AGREEMENT

**This Trade Escrow Agreement** ("Agreement") is entered into as of the date of the last party's electronic approval recorded in the Blockmediary platform ("Effective Date").

### Parties

| Party | Details |
|---|---|
| **Buyer** | `[Full legal name]`, `[registered address / country of residence]`, wallet address `[0x...]` ("Buyer") |
| **Seller** | `[Full legal name]`, `[registered address / country of residence]`, wallet address `[0x...]` ("Seller") |
| **Blockmediary** | `[Blockmediary legal entity name, registered address]` ("Blockmediary") |

The Buyer and Seller are together the "Parties." Blockmediary is the escrow operator and not a principal to the underlying trade.

---

## Recitals

A. The Buyer and Seller have agreed to a commercial transaction for the sale and purchase of goods described in Schedule 1 ("the Trade") on terms recorded in their underlying sale contract (`[reference or "as verbally agreed"]`).

B. The Parties wish to use the Blockmediary platform to manage payment for the Trade through a smart-contract documentary escrow, where the Buyer's payment is held on-chain and released to the Seller upon verified presentation of compliant trade documents.

C. This Agreement sets out the terms on which Blockmediary operates the escrow, the document release rules, and the rights of the Parties in the event of discrepancy, objection, or dispute.

D. This Agreement is separate from and does not replace the underlying sale contract between the Parties. Blockmediary is not a party to that contract and has no liability for the underlying trade.

---

## 1. Definitions

| Term | Meaning |
|---|---|
| **Audit Ledger** | Blockmediary's append-only off-chain record of every state transition, reviewer decision, and on-chain transaction relating to this Deal. |
| **Blockchain** | `[Base Sepolia (testnet) / Base Mainnet]` — the EVM-compatible blockchain on which the Escrow Contract is deployed. |
| **Compliant Presentation** | A presentation of Required Documents that satisfies all Release Rules specified in Schedule 1, as determined by Blockmediary's document verification process. |
| **Deal** | The specific escrow transaction governed by this Agreement, identified by Deal ID `[0x...]`. |
| **Discrepancy** | A deficiency in a presented document that prevents a Compliant Presentation, as particularised in a Discrepancy Notice. |
| **Discrepancy Notice** | A written notice from Blockmediary to the Seller identifying each specific Discrepancy in a submitted document set. |
| **Escrow Amount** | `[Amount in USDC / EURC]` (equivalent to `[fiat amount and currency]` at the agreed rate), held by the Escrow Contract. |
| **Escrow Contract** | The smart contract deployed at address `[0x...]` on the Blockchain that holds the Escrow Amount and enforces state transitions. |
| **Escrow Specification** | The canonical structured JSON document generated at deal setup, identified by hash `[0x...]`, that is authoritative for Release Rules and required document types. This Agreement incorporates the Escrow Specification by reference. |
| **Notice of Release** | Blockmediary's written notification to the Parties that a Compliant Presentation has been determined and that the Escrow Amount will be released subject to the Objection Window. |
| **Objection Window** | The period of `[48 hours]` following a Notice of Release during which the Buyer may raise a valid Permitted Objection. *[DISCUSS: confirm 48h default — BRD §15 Q9]* |
| **Permitted Objection** | An objection by the Buyer during the Objection Window on one or more of the grounds specified in clause 7.2. |
| **Release Rules** | The document compliance conditions specified in the Escrow Specification (Schedule 1) that must be satisfied for the Escrow Amount to be released to the Seller. |
| **Required Documents** | The trade documents specified in Schedule 1 that the Seller must present to trigger a compliance determination. |
| **Settlement Token** | `[USDC / EURC]` — the stablecoin in which the Escrow Amount is denominated and released. |
| **Shipment Deadline** | `[Date]` — the latest date by which the Required Documents must evidence shipment, as specified in Schedule 1. |
| **Trade Escrow Agreement** or **TEA** | This document including all Schedules. |

---

## 2. The Escrow Arrangement

### 2.1 Nature of the escrow

Blockmediary operates a **documentary escrow**: the Buyer deposits the Escrow Amount on-chain; Blockmediary verifies whether the Seller's presented documents satisfy the Release Rules; and the Escrow Amount is released to the Seller upon a Compliant Presentation (subject to the Objection Window) or returned to the Buyer on a Refund Condition.

### 2.2 Blockmediary's role

Blockmediary acts as an **independent escrow operator and document verification service**. It is not:
- a bank, payment institution, or e-money institution;
- a party to the Parties' underlying sale contract;
- a guarantor of the quality, condition, or title of the goods;
- an issuing bank or confirming bank within the meaning of UCP 600.

Blockmediary's verification is based on the **face of the documents** presented. It does not inspect goods, verify physical delivery, or investigate whether the Seller's representations in the documents are true.

### 2.3 UCP 600-inspired release logic

Blockmediary's Release Rules are inspired by the ICC Uniform Customs and Practice for Documentary Credits (UCP 600, ICC Publication No. 600, 2007) but this Agreement is **not a letter of credit** and Blockmediary is not an issuing bank. Where this Agreement is silent, UCP 600 principles provide interpretive guidance but are not binding. The Escrow Specification is authoritative.

### 2.4 Electronic document acceptance (MVP scope)

For this Deal, the Seller must present **scanned originals** of the Required Documents (high-resolution PDF images of physically signed originals). Electronic transferable records (including electronic bills of lading) are not accepted under this Agreement unless Schedule 1 expressly specifies an ETDA-qualifying electronic system. *[DISCUSS: post-MVP, add eBL pathway with ETDA representation clause.]*

---

## 3. Deal Setup and Approval

### 3.1 Escrow Specification

The Escrow Specification (Schedule 1) was generated by Blockmediary based on the trade terms provided by `[the Buyer / the Seller / the initiating platform]`. The Parties confirm that the Escrow Specification accurately reflects the agreed trade terms. If there is a conflict between the Escrow Specification and the underlying sale contract, the **Escrow Specification governs** for the purposes of this Agreement and the Release Rules.

### 3.2 Party approval

This Agreement takes effect when all three parties have recorded their approval in the Blockmediary platform. Each Party agrees that their electronic approval (whether by wallet signature, click-acceptance, or other method confirmed in the platform) constitutes a valid and binding electronic signature under the Electronic Communications Act 2000 (UK) and, where applicable, Regulation (EU) 2024/1183 (eIDAS 2.0). *[DISCUSS: confirm signature method — wallet SIWE, DocuSign, or click-wrap — and update clause accordingly. See legal-risk.md §2.3.]*

### 3.3 Initiating party

*[If platform/intermediary-initiated, insert:]*
> This Deal was initiated by `[Platform/Intermediary name]` ("the Initiator") on behalf of the Buyer and Seller. The Initiator is not a principal to this Agreement and has no right to receive the Escrow Amount. KYC/KYB of the Buyer and Seller has been `[conducted directly by Blockmediary / provided by the Initiator under a written MLR 2017 Reg 39 third-party reliance agreement dated [date]]`.

---

## 4. Funding

### 4.1 Buyer deposit

The Buyer shall deposit the Escrow Amount in the Settlement Token to the Escrow Contract address `[0x...]` on the Blockchain on or before `[Funding Deadline]`. The deposit is made by the Buyer wallet address `[0x...]` calling the `deposit` function on the Escrow Contract.

### 4.2 Funds locked

Upon confirmation of the deposit on-chain, the Escrow Contract will reflect state `Funded`. Blockmediary will notify both Parties. The Seller may then proceed to ship goods and prepare Required Documents.

### 4.3 No Blockmediary custody

The Escrow Amount is held **by the Escrow Contract**, not by Blockmediary. Blockmediary does not at any point hold, control, or have access to the Escrow Amount except through the `RELEASER_ROLE` functions (`recordVerdict`, `refund`) which it may only call in accordance with this Agreement.

### 4.4 KYC / sanctions / export controls gate

**The Buyer's deposit will be blocked** if any of the following conditions are not satisfied before funding:

(a) Both Parties have completed KYC/KYB verification to Blockmediary's satisfaction;
(b) Neither Party, nor any wallet address associated with either Party, appears on applicable sanctions lists (OFAC, UN, HMT, UAE);
(c) The goods described in Schedule 1 are not subject to an export licence requirement (UK Export Control Order 2008, EU Dual-Use Regulation 2021/821, or US EAR/ITAR), or the Seller has confirmed it holds a valid applicable export licence and provided a copy;
(d) The trade corridor is not a sanctioned or prohibited corridor.

Blockmediary will notify the Parties of any hold and its reason. A hold is not a termination of the Deal — the Parties may resolve the underlying issue and request re-screening.

---

## 5. Document Submission

### 5.1 Seller's obligation

The Seller shall submit the Required Documents (Schedule 1) via the Blockmediary platform on or before the **Submission Deadline** specified in Schedule 1. The Seller warrants that all documents submitted are genuine, have not been altered, and accurately reflect the underlying trade.

### 5.2 Completeness

A presentation that omits any Required Document is an incomplete presentation and will not be assessed for compliance. Blockmediary will notify the Seller of any missing document so it may be supplied before the Submission Deadline.

### 5.3 Document format

Documents must be submitted as `[high-resolution scanned PDFs of paper originals, minimum 300 DPI]`. The Seller warrants that each scanned document is a true and accurate copy of the original and that the original has not been separately transferred or encumbered.

### 5.4 Shipment deadline

Documents must evidence shipment on or before the Shipment Deadline specified in Schedule 1. Shipment date is determined from the transport document (bill of lading date, air waybill issue date, or equivalent), not from the Seller's representations. A shipment date after the Shipment Deadline is a Discrepancy.

---

## 6. Document Verification

### 6.1 Review period

Blockmediary shall complete its document review and issue either (a) a Notice of Release or (b) a Discrepancy Notice, within **`[5 banking days]`** of receipt of a complete presentation. *[This mirrors the UCP 600 Art. 14(a) 5-banking-day standard — DISCUSS: confirm or vary.]*

### 6.2 Standard of examination

Blockmediary examines documents **on their face** against the Release Rules in the Escrow Specification. Specifically:
- Data in documents need not be identical across documents but must not conflict (per UCP 600 Art. 14(b)).
- Invoice goods description must match the Escrow Specification exactly.
- Amounts are compared in minor units (token base units) using deterministic code, not manual calculation.
- Quantity tolerances: ±5% on quantities not expressed in units; ±10% only if "approximately" or "about" is used (per UCP 600 Art. 30).

### 6.3 Compliant presentation — mandatory release

If Blockmediary determines that a presentation is **Compliant**, it shall issue a Notice of Release. Upon expiry of the Objection Window with no valid Permitted Objection, Blockmediary **must** call `recordVerdict` on the Escrow Contract, moving the Deal to `ReleasePending`. Once in `ReleasePending`, the `release` function on the Escrow Contract is **permissionless** — any party (including the Seller directly) may call it to transfer the Escrow Amount to the Seller wallet.

*Blockmediary has no discretion to delay or refuse release once a Compliant determination has been made and the Objection Window has expired with no valid objection. This is the core trust guarantee to the Seller.*

### 6.4 Review deadline failure

If Blockmediary fails to issue either a Notice of Release or a Discrepancy Notice within the review period, **Blockmediary is precluded from claiming the documents are non-compliant** (per UCP 600 Art. 16 principle). In that event, Blockmediary shall treat the presentation as Compliant and proceed to issue a Notice of Release. The Seller may contact Blockmediary support to trigger this remedy.

### 6.5 Human reviewer sign-off

For any Deal with an Escrow Amount above `[£50,000 equivalent]` or where the AI-assisted extraction confidence is below `[0.9]` on any checked field, a human document reviewer must sign off on the compliance verdict before a Notice of Release is issued. *[DISCUSS: confirm value cap — BRD §15 Q8.]*

---

## 7. Objection Window and Release

### 7.1 Notice of Release

Upon a Compliant determination, Blockmediary will notify both Parties. The Buyer's Objection Window begins at the time of that notification.

### 7.2 Permitted Objections — exhaustive list

The Buyer may raise an objection during the Objection Window **only** on the following grounds ("Permitted Objections"):

(a) A Required Document is missing from the presentation;
(b) A document field materially conflicts with the Escrow Specification (e.g. seller name, buyer name, amount, currency, port of loading/discharge) in a way not already identified by Blockmediary;
(c) The transport document evidences shipment **after** the Shipment Deadline;
(d) The Buyer has reasonable grounds to believe a submitted document is fraudulent (with supporting evidence);
(e) A sanctions or KYC compliance issue has arisen after the Notice of Release that was not known at the time of funding;
(f) Both Parties mutually agree to request an amendment to the Release Rules (in which case clause 8.3 applies).

**The following are not Permitted Objections and will be rejected:**
- The Buyer has changed their mind about the trade.
- The Buyer is dissatisfied with the goods (unless an inspection certificate is a Release Rule and the certificate reports a deficiency).
- The Buyer wishes to renegotiate price or terms after shipment.
- Any subjective quality complaint not evidenced by a Required Document.
- Any ground not listed in (a)–(f) above.

The Buyer's right to object is strictly limited to these grounds. This limitation is fundamental to the product's value to the Seller and is accepted by the Buyer at the time of approving this Agreement.

### 7.3 Raising a Permitted Objection

A Permitted Objection must be raised in writing via the Blockmediary platform during the Objection Window, stating: (i) the specific ground relied upon from clause 7.2; (ii) the specific document(s) or field(s) in issue; and (iii) supporting evidence where required by clause 7.2(d) or (e).

Blockmediary will assess whether the objection falls within clause 7.2. A determination that an objection is not a Permitted Objection will be recorded in the Audit Ledger with reasons.

### 7.4 No valid objection

If the Objection Window expires with no Permitted Objection raised (or any objection raised is determined to be outside clause 7.2), Blockmediary shall proceed with `recordVerdict` and the `release` function may be called to transfer the Escrow Amount to the Seller.

---

## 8. Discrepancy, Amendment and Waiver

### 8.1 Discrepancy Notice

If Blockmediary determines the presentation is **Discrepant**, it will issue a Discrepancy Notice to the Seller identifying **each specific Discrepancy**. The Discrepancy Notice will be issued within the review period (clause 6.1). Blockmediary will not rely on any Discrepancy not stated in the Discrepancy Notice.

### 8.2 Seller's options on Discrepancy

On receipt of a Discrepancy Notice, the Seller may:

(a) **Cure:** Re-present corrected documents before the Submission Deadline. A re-presentation restarts the review period (clause 6.1).
(b) **Request waiver:** Request that the Buyer waive the identified Discrepancy(ies) and agree to release. The Buyer's waiver must be given in writing via the platform. A valid waiver authorises Blockmediary to treat the presentation as Compliant for the waived Discrepancy(ies) and proceed to release.
(c) **Accept refund:** If the Seller cannot cure and the Buyer will not waive, the Seller may request a refund of the Escrow Amount to the Buyer, terminating the Deal.

### 8.3 Amendment

If both Parties wish to change the Release Rules or other material terms of this Agreement (a "mutual amendment"), the Deal must be terminated, the Escrow Amount refunded to the Buyer, and a new Deal created with an updated Escrow Specification. *[This is a consequence of the smart contract architecture — the Escrow Specification hash committed on-chain cannot be altered without deploying a new deal. See TRD TR-4.4.3.]*

---

## 9. Refund

### 9.1 Refund conditions

Blockmediary shall call the `refund` function on the Escrow Contract and return the Escrow Amount to the Buyer wallet if any of the following conditions ("Refund Conditions") are met:

(a) The Seller has not submitted a complete presentation by the Submission Deadline;
(b) The Seller has submitted a Discrepant presentation that cannot be cured or waived, and the Seller requests a refund (clause 8.2(c));
(c) Both Parties have mutually agreed in writing to cancel the Deal;
(d) A dispute has been resolved in the Buyer's favour by the Dispute Forum (Schedule 2);
(e) A sanctions or export control issue has been identified that prevents release under applicable law.

### 9.2 Refund processing

A refund requires human reviewer sign-off within Blockmediary before the `refund` function is called on-chain. Refunds are typically processed within `[2 banking days]` of a Refund Condition being confirmed. Blockmediary will notify both Parties.

---

## 10. Dispute Resolution

### 10.1 First-line: Blockmediary determination

Any dispute about whether a Permitted Objection is valid, whether a Discrepancy exists, or whether a Refund Condition has been met shall first be determined by Blockmediary acting as the independent escrow operator. Blockmediary's determination is made on the face of the documents against the Escrow Specification and is recorded in the Audit Ledger.

### 10.2 Escalation: Documentary disputes — ICC DOCDEX

If a Party disputes Blockmediary's determination on a documentary matter (whether a presentation is Compliant or Discrepant), either Party may refer the matter to **ICC DOCDEX** (Documentary Instruments Dispute Resolution Expertise). A DOCDEX panel of three ICC-accredited experts will deliver a non-binding expert opinion within 30 days. The Parties agree to consider the DOCDEX opinion in good faith before escalating further.

*DOCDEX is not arbitration — its decision is binding only if both Parties agree in advance. It is fast (30 days) and lower cost than arbitration, making it appropriate for documentary disputes.*

### 10.3 Escalation: Other disputes — arbitration

All other disputes arising out of or in connection with this Agreement (including disputes about fraud, breach of contract, or liability), if not resolved by negotiation within `[14 days]` of one Party giving written notice to the other, shall be finally resolved by **`[ICC arbitration / LCIA arbitration]`** under the `[ICC Rules / LCIA Rules]` in force at the date of the dispute, with the seat of arbitration in **`[London]`** and the language of proceedings **English**. *[DISCUSS: confirm forum — ICC is global standard for trade; LCIA is good for London-seated disputes.]*

### 10.4 Escrow hold during dispute

When a Permitted Objection is raised and Blockmediary determines it is valid, or when a dispute is escalated, Blockmediary will **not call `recordVerdict`**, keeping the Deal in `Funded` state. The Escrow Amount remains held on-chain until the dispute is resolved or a Refund Condition is met. The Audit Ledger records the hold and reason.

### 10.5 Governing law

This Agreement and any dispute arising from it shall be governed by and construed in accordance with the **laws of England and Wales**, unless the Parties have specified an alternative governing law in Schedule 1.

---

## 11. Pause — Emergency Control

### 11.1 Permitted grounds

Blockmediary may invoke the `pause()` function on the Escrow Contract — which suspends all fund movements including the permissionless `release` — **only** on the following grounds:

(a) A critical vulnerability or exploit in the Escrow Contract has been identified or is reasonably suspected;
(b) A regulatory direction, court order, or competent authority instruction requires suspension;
(c) A sanctions or export control issue has been identified after a Notice of Release has been issued that prevents release under applicable law.

### 11.2 Prohibited use

Blockmediary **must not** invoke `pause` as a routine operational control, to delay a compliant payout for administrative convenience, or for any reason not listed in clause 11.1. Use of `pause` outside these grounds in circumstances where the Seller is entitled to release is a breach of this Agreement.

### 11.3 Notification and resolution

If `pause` is invoked, Blockmediary will notify both Parties immediately with the stated reason and an estimated resolution timeline. Blockmediary will lift the pause as soon as the grounds are resolved. If `pause` is invoked on a Deal in `ReleasePending` state without a valid ground under clause 11.1, Blockmediary shall be liable to the Seller for any direct loss caused by the delay.

---

## 12. Representations and Warranties

Each Party represents and warrants to the others as at the Effective Date and as at the Funding Date:

(a) They have the legal capacity and authority to enter into this Agreement and to perform their obligations under it;
(b) This Agreement constitutes a valid and binding obligation enforceable against them;
(c) They have successfully completed Blockmediary's KYC/KYB process and all information provided is accurate and complete;
(d) They are not subject to any sanctions (OFAC, UN, HMT, UAE lists) or any other legal prohibition that would prevent them from performing this Agreement;
(e) *(Seller only)* The goods described in Schedule 1 do not require an export licence under applicable law, or the Seller holds a valid export licence and has provided a copy to Blockmediary;
(f) *(Seller only)* All documents submitted via the Blockmediary platform are genuine, have not been altered, and accurately reflect the underlying trade;
(g) *(Buyer only)* The Buyer wallet address `[0x...]` is within the Buyer's sole control and the Buyer has not authorised any third party to operate it for this Deal.

---

## 13. Data Protection

### 13.1 Data controller

Blockmediary is the data controller for personal data processed in connection with this Agreement (KYC/KYB records, party names, contact details). Processing is on the lawful basis of contract performance (UK GDPR Art. 6(1)(b)) and legal obligation (Art. 6(1)(c)) for AML/sanctions screening.

### 13.2 Off-chain only

All personal data (party names, identification documents, contact details, wallet addresses linked to identity) is held in Blockmediary's off-chain database and is never written to the Blockchain. The Escrow Contract stores only: the Buyer and Seller wallet addresses, the Escrow Amount, the Deal state, and `[the Escrow Specification hash]`. *[DISCUSS: the specHash GDPR question — if names are stripped from the spec before hashing, insert: "The Escrow Specification hash is computed over a version of the Specification that contains no personal data." See legal-risk.md §1.6 / §22.]*

### 13.3 Retention

Personal data will be retained for `[5 years]` from the completion of the Deal (Released, Refunded, or Cancelled) to comply with MLR 2017 record-keeping obligations (Reg 40). After that period, data will be securely deleted or anonymised.

### 13.4 Subject rights

Each Party has rights to access, rectify, and request erasure of their personal data, subject to overriding legal obligations (AML record-keeping). Requests should be directed to `[dpo@blockmediary.com]`. *[Insert DPO details for production.]*

### 13.5 Cross-border transfers

If personal data is transferred outside the UK or EEA (e.g. to a cloud provider or KYB vendor in a third country), Blockmediary will ensure an appropriate transfer mechanism is in place (UK IDTA, EU SCCs, adequacy decision, or equivalent). *[Specify transfer mechanism before production launch.]*

---

## 14. Liability

### 14.1 Limitation

Blockmediary's liability to either Party under or in connection with this Agreement is limited to:

(a) Direct losses caused by Blockmediary's **fraud**, **wilful misconduct**, or **gross negligence**; and
(b) The **amount of fees paid by the claimant Party** to Blockmediary in connection with this Deal in the 12 months preceding the claim.

### 14.2 Exclusions

Blockmediary shall not be liable for:

(a) Loss arising from the quality, condition, or non-delivery of goods (Blockmediary releases on document compliance, not goods receipt);
(b) Loss arising from a Party's own misrepresentation in documents or KYC;
(c) Loss arising from a smart contract exploit or force majeure event beyond Blockmediary's reasonable control, provided Blockmediary has complied with its key management and audit obligations;
(d) Indirect or consequential loss, loss of profit, or loss of business.

### 14.3 Force majeure

Neither Party shall be liable for delay or failure to perform caused by circumstances beyond their reasonable control. If a force majeure event prevents the Seller from shipping by the Shipment Deadline, the Parties may agree an extension by mutual amendment (clause 8.3).

---

## 15. Term and Termination

### 15.1 Term

This Agreement commences on the Effective Date and continues until the Deal reaches a terminal state: `Released`, `Refunded`, or `Cancelled`.

### 15.2 Cancellation before funding

Either Party may cancel the Deal before the Buyer deposits the Escrow Amount. Cancellation is effected by written notice via the Blockmediary platform; Blockmediary will call `cancel` on the Escrow Contract.

### 15.3 Survival

Clauses 10 (Dispute Resolution), 12 (Representations), 13 (Data Protection), 14 (Liability), and 15.4 survive termination or expiry of this Agreement.

### 15.4 Governing law (survival)

The Governing Law clause (clause 10.5) and this survival clause survive any termination of this Agreement.

---

## 16. General

### 16.1 Entire agreement

This Agreement (including all Schedules) constitutes the entire agreement between the Parties relating to the escrow arrangement and supersedes all prior representations about it. It does not affect or replace the Parties' underlying sale contract.

### 16.2 Amendments

This Agreement may only be amended by mutual written agreement of all three Parties recorded in the Blockmediary platform. Amendments to Release Rules require a new Deal (clause 8.3).

### 16.3 No assignment

No Party may assign or transfer their rights or obligations under this Agreement without the prior written consent of the other Parties, except that Blockmediary may assign its rights and obligations to a group company or a successor entity acquiring all or substantially all of Blockmediary's business.

### 16.4 Severability

If any provision of this Agreement is held invalid or unenforceable, the remaining provisions continue in full force.

### 16.5 Notices

Notices under this Agreement shall be given via the Blockmediary platform's notification system, or by email to the addresses registered by each Party. Notices are effective on delivery confirmation.

### 16.6 No third-party rights

This Agreement does not confer any rights on third parties under the Contracts (Rights of Third Parties) Act 1999, except that any successor or assignee of Blockmediary may enforce clause 14 (Liability).

---

## Schedule 1 — Deal Terms and Release Rules

*Complete for each Deal. This Schedule is incorporated into and governed by the Trade Escrow Agreement.*

| Field | Value |
|---|---|
| **Deal ID** | `[0x...]` (bytes32, matches on-chain `dealId`) |
| **Escrow Contract address** | `[0x...]` |
| **Blockchain** | `[Base Sepolia / Base Mainnet]`, Chain ID `[84532 / 8453]` |
| **Buyer legal name** | `[...]` |
| **Buyer wallet address** | `[0x...]` |
| **Seller legal name** | `[...]` |
| **Seller wallet address** | `[0x...]` |
| **Settlement Token** | `[USDC / EURC]` |
| **Escrow Amount** | `[Amount in Settlement Token]` (`[minor units]`) |
| **Invoice Currency** | `[USD / EUR / GBP]` — the currency stated in the commercial invoice |
| **Goods description** | `[...]` |
| **HS Code** | `[...]` |
| **Incoterm** | `[FOB / CIF / CPT / CIP / FCA / DAP / DPU / DDP / other]` `[Named port/place]` |
| **Trade corridor** | `[Origin country → Destination country]` |
| **Funding Deadline** | `[Date]` — Buyer must deposit by this date |
| **Shipment Deadline** | `[Date]` — Latest shipment date evidenced by transport document |
| **Submission Deadline** | `[Date]` — Latest date for Seller document presentation |
| **Objection Window** | `[48 hours]` after Notice of Release |
| **Value cap (auto-review threshold)** | `[£50,000 equivalent]` — above this, human reviewer sign-off required |
| **Governing law** | `[English law]` (default) or `[alternative]` |
| **Dispute forum (escalation)** | See Schedule 2 |

### Required Documents

*Tick the documents required for this Deal. The Incoterm drives the baseline set (see [docs/Incoterms2020.md](Incoterms2020.md)).*

| Document | Required? | Specific requirements |
|---|---|---|
| Commercial invoice | ✅ Always | Issued by Seller; consignee = Buyer name; currency = `[Invoice Currency]`; goods description matches this Schedule |
| Packing list | ✅ Always | Quantities consistent with invoice |
| Bill of lading (on-board) | `[Yes / No]` | Required for FOB, CFR, CIF sea shipments. "On board" notation + date; named vessel; clean (no damage clauses) |
| Air waybill | `[Yes / No]` | Required for air shipments. Date of issue = shipment date |
| Road/rail transport document | `[Yes / No]` | Required for land shipments |
| Multimodal transport document | `[Yes / No]` | Required for combined-mode shipments |
| Export customs declaration | `[Yes / No]` | Required for most Incoterms except EXW |
| Insurance certificate/policy | `[Yes / No]` | Required for CIF (ICC C minimum, 110% of invoice) and CIP (ICC A minimum, 110% of invoice). Cover notes **not** accepted. |
| Certificate of origin | `[Yes / No]` | Required if `[preferential tariff / letter of credit condition / buyer requirement]` |
| Inspection certificate | `[Yes / No]` | Required if quality/quantity verification specified. Issued by: `[named inspector]`. Date: before shipment. |
| Export licence | `[Yes / No]` | Required if goods fall on a controlled list. Licence number: `[...]`. |
| Import customs clearance | `[Yes / No]` | Required for DDP only |
| Other: `[specify]` | `[Yes / No]` | `[Specific requirements]` |

### Release Rules (from Escrow Specification)

The following rules must all pass for a Compliant determination:

| Rule | Pass condition |
|---|---|
| All Required Documents present | Every ticked document above has been submitted |
| Invoice amount matches Escrow Amount | Invoice total (converted to minor units) = `[Escrow Amount in minor units]`, tolerance: `[0 / ±5% / ±10% if "approximately"]` |
| Seller name on invoice matches Seller in this Agreement | Fuzzy match score ≥ 0.8 |
| Buyer name on invoice matches Buyer in this Agreement | Fuzzy match score ≥ 0.8 |
| Invoice currency matches | Invoice currency field = `[Invoice Currency]` |
| Shipment date ≤ Shipment Deadline | Transport document date ≤ `[Shipment Deadline]` |
| Transport document is "clean" | No damage, short-shipment, or condition clauses on the transport document |
| Insurance value ≥ 110% of invoice | If insurance is a Required Document: coverage ≥ 110% × invoice amount |
| `[Additional rule]` | `[Pass condition]` |

---

## Schedule 2 — Dispute Forum

| Field | Value |
|---|---|
| **First-line (documentary disputes)** | ICC DOCDEX — ICC Documentary Instruments Dispute Resolution Expertise. Non-binding expert opinion within 30 days. |
| **Escalation (all other disputes)** | `[ICC arbitration / LCIA arbitration]` |
| **Rules** | `[ICC Rules of Arbitration / LCIA Rules]` (version in force at date of dispute) |
| **Seat** | `[London, England]` |
| **Language** | English |
| **Number of arbitrators** | `[1 / 3]` *[DISCUSS: 1 arbitrator is faster and cheaper for SME deal values; 3 for larger disputes]* |
| **Emergency arbitrator** | Available under ICC/LCIA Rules — relevant if injunctive relief is needed to prevent a fraudulent release |

---

*This template is for internal Blockmediary team use and discussion. It is a working draft, not a final legal document. Seek qualified legal counsel admitted in the relevant jurisdiction before this Agreement is used with real parties or real funds. Certain provisions (signature method, governing law alternatives, dispute forum, value caps, objection window) are marked `[DISCUSS]` and require team agreement before finalisation.*
