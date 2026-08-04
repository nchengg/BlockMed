# Blockmediary — Deal Flow (Stages 1–6)

How a deal moves through Blockmediary, and what we build at each stage.

## Custody

Non-custodial. The buyer sends stablecoin straight into the escrow smart contract, which
holds it until the agreed rules are met and then pays the seller. We never hold the money —
we only hold a key that tells the contract when the documents have passed.

## 1. Agree

The buyer or seller starts a deal and fills in the trade terms — amount, documents required,
deadlines — from a template. The other side recieves, reviews, highlights issues, and they go back and forth until both
accept. The agreed terms become the rulebook the documents are checked against later.

Build:

- A form to enter deal terms, and the structured spec (JSON) it produces.
- `createDeal` on the contract to register the deal (Draft → Agreed).
- Later: the negotiation back-and-forth, notifications, and e-signature.

## 2. Verify parties

Both companies are screened — KYC/KYB, sanctions, and a goods/export check — by an outside
provider. The result comes back as a simple approved/blocked flag, and funding is gated on it.

Build:

- A slot for the outsourced screening result (approved/blocked), stored against the deal.
- A gate that blocks funding until both parties are approved.
- For the demo: parties are pre-approved, so the step shows but doesn't block.

## 3. Lock funds

The buyer connects their wallet and deposits the stablecoin into the contract for this deal.
The seller can see on-chain that the money is locked before they ship.

Build:

- `deposit` on the contract (Agreed → Funded).
- Buyer screen: show balance, approve, deposit.
- Seller screen: show that the funds are locked.
- Later: let the buyer pay from a bank through a licensed on-ramp partner.

## 4. Ship and submit documents

The seller ships the goods and uploads the required documents — bill of lading first, then
commercial invoice, packing list, certificate of origin, and so on.

Build:

- Seller upload screen (demo: just the commercial invoice).
- Document storage, saving a hash of each file for the record.
- Later: the full document set and bill-of-lading / eBL handling.

## 5. Verify documents

Every deal's documents are checked in layers: our system extracts and rule-checks the fields,
corroborates against the source where that's available, and a contracted third-party
examiner does the final documentary review on every deal. The result is one of: compliant,
discrepant, rejected, or escalated. Amount and figure checks are done in code, not by the AI.

Build:

- AI extraction of the document fields.
- A rules engine that checks the fields against the deal terms and across documents (invoice,
  BoL and packing list don't contradict each other), returning the verdict with a confidence
  score.
- Later — source corroboration: call the carrier/issuer API where one exists; where it
  doesn't, log "source unavailable" and continue.
- Later — examiner handoff (every deal): a console that shows the examiner our checks and the
  documents, and captures their verdict as structured data — not a PDF — before the release
  call. We contract out the examination itself; we only build the slot for it.

## 6. Release

The verdict goes to the contract. The buyer gets a short window to object, but only on set
grounds — missing document, wrong details, late shipment, fraud, sanctions. If there's no
valid objection, the contract releases the funds to the seller automatically.

Build:

- `recordVerdict`, `release`, and a `refund` escape hatch on the contract
  (Funded → ReleasePending → Released).
- The service that records the verdict on-chain when the documents pass.
- Later: the objection window, and the refund / amend / dispute / fraud-escalation paths
  (mostly referred out).

## For the demo

One pre-set deal, test stablecoin, happy path only: deposit → upload invoice → AI and rules
check → release. KYC, source corroboration, the contracted examiner, the objection window,
and refunds/disputes are left out and built later.
