# Blockmediary — Document Template Field Register

This file defines every document Blockmediary collects, the fields inside each one,
and how each field is used. It is the single source of truth for building the
document upload templates in the platform.

**Status:** Batches 1, 2, and 3 complete. Onboarding documents pending.

---

## How fields are classified

| Tag | Meaning |
|-----|---------|
| ✅ GRADE | Machine-checked against the agreed deal terms. A mismatch = Discrepant verdict. |
| 🔁 CROSS | Cross-checked against another document in the same submission. |
| 📋 RECORD | Recorded on the audit trail for the human examiner. Not machine-checked. |
| 🚩 FLAG | Triggers automatic hold for human review if present or missing. |

---

## Batch 1 — Universal + UK corridor documents

---

### DOC-01 — Commercial Invoice
**Submitted by:** Seller
**Reference:** ICC standard / UCP 600 Art. 18
**Required for:** All corridors, all deals

#### Sender (Seller) Details
| Field | Type | Notes |
|-------|------|-------|
| Company name | ✅ GRADE | Must match seller name in deal terms |
| Address line 1 | 📋 RECORD | |
| Address line 2 | 📋 RECORD | |
| Postcode / City | 📋 RECORD | |
| Country | ✅ GRADE | Must match seller country in deal terms |
| Sender name (signatory) | ✅ GRADE | Must be authorised signatory of seller entity |
| Telephone | 📋 RECORD | |
| Email | 📋 RECORD | |
| Sender VAT number | 📋 RECORD | |
| EORI number | 📋 RECORD | Required for UK exports — must be present on UK deals |

#### Receiver (Buyer) Details
| Field | Type | Notes |
|-------|------|-------|
| Company name | ✅ GRADE | Must match buyer name in deal terms |
| Address line 1 | 📋 RECORD | |
| Address line 2 | 📋 RECORD | |
| Postcode / City | 📋 RECORD | |
| Country | ✅ GRADE | Must match buyer country in deal terms |
| Receiver name | 📋 RECORD | |
| Telephone | 📋 RECORD | |
| Email | 📋 RECORD | |
| Receiver VAT number | 📋 RECORD | |

#### Delivery Details (if different from receiver)
| Field | Type | Notes |
|-------|------|-------|
| Company | 📋 RECORD | |
| Address | 📋 RECORD | |
| Delivery contact | 📋 RECORD | |

#### Invoice Header
| Field | Type | Notes |
|-------|------|-------|
| Invoice number | 🔁 CROSS | Must match reference on Packing List and BoL |
| Shipping date | ✅ GRADE | Must be on or before shipment deadline in deal terms |
| Shipment number | 📋 RECORD | |
| Currency | ✅ GRADE | Must match escrow currency (e.g. USDC / EURC) |
| Reason for export | 📋 RECORD | |
| Incoterms (Terms of sale) | ✅ GRADE | Must match Incoterm agreed in deal spec |

#### Line Items (one row per goods type)
| Field | Type | Notes |
|-------|------|-------|
| Description of goods | ✅ GRADE | Token-match against goods description in deal spec |
| Quantity | 🔁 CROSS | Must match Packing List |
| Unit weight (kg) | 🔁 CROSS | Must match Packing List |
| Unit value | ✅ GRADE | |
| HS code | 🚩 FLAG | Triggers export controls check — required on all deals |
| Location of origin | ✅ GRADE | Sanctions screening + export controls gate |
| Total weight (kg) | 🔁 CROSS | Must match Packing List and BoL gross weight |
| Total value | ✅ GRADE | Must match escrow funded amount (within UCP 600 Art. 30 ±10% tolerance if "approximately" used) |

#### Totals
| Field | Type | Notes |
|-------|------|-------|
| Number of packages in shipment | 🔁 CROSS | Must match Packing List |
| Total shipment value | ✅ GRADE | Must match escrow amount |
| Discount | 📋 RECORD | |
| Subtotal | 📋 RECORD | |
| Shipping costs | 📋 RECORD | |
| Insurance costs | 📋 RECORD | Required for CIF/CIP — must equal ≥110% of invoice value |
| Other costs | 📋 RECORD | |
| Total declared value | ✅ GRADE | Must match escrow amount |

#### Declaration
| Field | Type | Notes |
|-------|------|-------|
| Name and signature | ✅ GRADE | Must be authorised signatory |
| Company and job title | 📋 RECORD | |
| Date | ✅ GRADE | Must be on or before shipment deadline |

#### Additional Information
| Field | Type | Notes |
|-------|------|-------|
| Hazardous goods details | 🚩 FLAG | Triggers human review + export controls check |
| ECCN number | 🚩 FLAG | US Export Control Classification — triggers EAR check |
| Additional notes | 📋 RECORD | |

---

### DOC-02 — Packing List
**Submitted by:** Seller
**Reference:** ICC standard
**Required for:** All corridors, all deals

#### Header
| Field | Type | Notes |
|-------|------|-------|
| Exporter name | ✅ GRADE | Must match seller in deal terms |
| Consignee | ✅ GRADE | Must match buyer in deal terms |
| Buyer (if not consignee) | 📋 RECORD | |
| Export invoice number & date | 🔁 CROSS | Must match Commercial Invoice |
| Bill of Lading number | 🔁 CROSS | Must match BoL |
| Reference | 📋 RECORD | |
| Buyer reference | 📋 RECORD | |

#### Transport Details
| Field | Type | Notes |
|-------|------|-------|
| Method of dispatch | 📋 RECORD | Sea / Air / Road |
| Type of shipment | 📋 RECORD | FCL / LCL / Groupage |
| Country of origin of goods | ✅ GRADE | Sanctions + export controls screening |
| Country of final destination | ✅ GRADE | Sanctions screening |
| Vessel / Aircraft | 🔁 CROSS | Must match BoL |
| Voyage No | 🔁 CROSS | Must match BoL |
| Port of loading | ✅ GRADE | Must match deal terms and BoL |
| Date of departure | ✅ GRADE | Must be on or before shipment deadline |
| Port of discharge | ✅ GRADE | Must match deal terms and BoL |
| Final destination | 📋 RECORD | |
| Packing information (general) | 📋 RECORD | |

#### Line Items (one row per goods type)
| Field | Type | Notes |
|-------|------|-------|
| Product code | 📋 RECORD | |
| Description of goods | ✅ GRADE | Must match invoice and deal spec |
| Unit quantity | 🔁 CROSS | Must match invoice |
| Kind & No. of packages | 🔁 CROSS | Must match invoice |
| Net weight (kg) | 🔁 CROSS | Cross-check against invoice |
| Gross weight (kg) | 🔁 CROSS | Cross-check against BoL |
| Measurements (m³) | 📋 RECORD | |

#### Totals & Sign-off
| Field | Type | Notes |
|-------|------|-------|
| Total this page | 📋 RECORD | |
| Consignment total | 🔁 CROSS | Must match invoice totals |
| Additional info | 📋 RECORD | |
| Signatory company | ✅ GRADE | Must be seller entity |
| Name of authorised signatory | ✅ GRADE | |
| Signature | ✅ GRADE | Must be present |

---

### DOC-03 — Bill of Lading (BIMCO CONGENBILL 2016)
**Submitted by:** Seller (document issued by Carrier)
**Reference:** UCP 600 Arts. 20, 27 / BIMCO CONGENBILL 2016
**Required for:** All sea freight deals

#### Parties
| Field | Type | Notes |
|-------|------|-------|
| Shipper | ✅ GRADE | Must match seller name in deal terms |
| Consignee | ✅ GRADE | Must match buyer name in deal terms |
| Notify address | 📋 RECORD | |

#### Reference
| Field | Type | Notes |
|-------|------|-------|
| Bill of Lading No. | 🔁 CROSS | Cross-referenced with invoice and packing list |
| Reference No. | 📋 RECORD | |

#### Vessel & Route
| Field | Type | Notes |
|-------|------|-------|
| Vessel name | 🔁 CROSS | Must match packing list |
| Voyage number | 🔁 CROSS | Must match packing list |
| Port of loading | ✅ GRADE | Must match deal terms |
| Port of discharge | ✅ GRADE | Must match deal terms |

#### Goods
| Field | Type | Notes |
|-------|------|-------|
| Description of goods | ✅ GRADE | Must match invoice |
| Gross weight | 🔁 CROSS | Must match packing list |
| Number of packages | 🔁 CROSS | Must match packing list and invoice |
| On-deck cargo notation | 🚩 FLAG | Triggers human review if present |

#### Condition & Compliance
| Field | Type | Notes |
|-------|------|-------|
| Clean on board (no damage / defect clauses) | 🚩 FLAG | UCP 600 Art. 27 — automatic hold if any damage clause present |
| Freight pre-paid / collect | ✅ GRADE | CIF/CFR deals must show "freight pre-paid" |
| Number of original BoLs issued | ✅ GRADE | UCP 600 Art. 14(f) — all originals must be presented |

#### Date & Signature
| Field | Type | Notes |
|-------|------|-------|
| Shipped on board date | ✅ GRADE | Must be on or before shipment deadline in deal terms |
| Place and date of issue | 📋 RECORD | |
| Signed by (Master / Agent for carrier) | ✅ GRADE | UCP 600 Art. 20 — must be carrier, master, or authorised agent |
| Charter Party date (freight reference) | 📋 RECORD | |
| Freight advance received | 📋 RECORD | |

---

### DOC-04 — Certificate of Origin (GSP Form A)
**Submitted by:** Seller (issued by Chamber of Commerce)
**Reference:** UNCTAD GSP Form A / UCP 600 Art. 14
**Required for:** All corridors. UAE deals also require attestation (UAE Embassy + MoFA stamp).

| Field | Type | Notes |
|-------|------|-------|
| Exporter business name, address, country (Box 1) | ✅ GRADE | Must match seller in deal terms |
| Reference No | 🔁 CROSS | Cross-reference with invoice |
| Consignee name, address, country (Box 2) | ✅ GRADE | Must match buyer in deal terms |
| Issued in — country (Box header) | ✅ GRADE | Must be the exporting country |
| Means of transport and route (Box 3) | 📋 RECORD | |
| Item number (Box 5) | 📋 RECORD | |
| Marks and numbers of packages (Box 6) | 🔁 CROSS | Cross-check against packing list |
| Description of goods (Box 7) | ✅ GRADE | Must match invoice description |
| Origin criterion (Box 8) — P / W / Y / G / F | ✅ GRADE | Must be a valid code for the importing country |
| Gross weight / other quantity (Box 9) | 🔁 CROSS | Cross-check against invoice and packing list |
| Number and date of invoices (Box 10) | 🔁 CROSS | Must match commercial invoice |
| Certifying authority stamp & signature (Box 11) | 🚩 FLAG | Must be present — automatic hold if missing |
| Exporter declaration — country of production (Box 12) | ✅ GRADE | Must match seller's country in deal terms |
| Exporter declaration — importing country (Box 12) | ✅ GRADE | Must match buyer's country in deal terms |
| Authorised signatory signature (Box 12) | ✅ GRADE | Must be present |
| UAE Embassy attestation stamp | 🚩 FLAG | UAE corridor only — hold if missing |
| UAE Ministry of Foreign Affairs stamp | 🚩 FLAG | UAE corridor only — hold if missing |

---

### DOC-05 — UK CDS Export Declaration (Reference Number only)
**Submitted by:** Seller (filed by seller or their freight forwarder with HMRC)
**Reference:** UK Customs Declaration Service (CDS) — GOV.UK CDS Volume 3 completion guide
**Required for:** All UK export deals

> Blockmediary does not process the full CDS declaration — that is filed directly
> with HMRC by the seller's freight forwarder. We collect the two outputs that
> prove it was accepted.

| Field | Type | Notes |
|-------|------|-------|
| Movement Reference Number (MRN) | ✅ GRADE | Issued by HMRC on acceptance — proves declaration was filed |
| Export licence number (if applicable) | 🚩 FLAG | Required if goods are on the UK Commodity Control List (dual-use / strategic) |

---

### DOC-06 — Dubai Customs Import Declaration (Mirsal2 Reference Number only)
**Submitted by:** Buyer (filed by buyer or their customs agent on Dubai Trade portal)
**Reference:** Dubai Customs e-Mirsal 2 system — dubaitrade.ae
**Required for:** All UAE import deals (Type 1: Import to Local from Rest of World)
**Declaration types relevant to us:** Type 1 (standard import), Type 4 (import for re-export)

> Same as CDS — Blockmediary does not process the Mirsal2 declaration itself.
> We collect the proof of clearance outputs.

| Field | Type | Notes |
|-------|------|-------|
| Importer name | ✅ GRADE | Must match buyer in deal terms |
| Importer TRN (Tax Registration Number) | 📋 RECORD | UAE VAT registration |
| Declaration number (issued by Dubai Customs) | ✅ GRADE | Proof that UAE customs accepted the import |
| Declaration type | 📋 RECORD | Type 1 for standard imports |
| Invoice value declared to customs | 🔁 CROSS | Must match our commercial invoice |
| Currency | ✅ GRADE | Must match deal |
| HS code per line | 🔁 CROSS | Must match invoice |
| Country of origin | 🔁 CROSS | Must match invoice and CoO |
| Customs duty paid (amount) | 📋 RECORD | |
| UAE VAT paid (5%) | 📋 RECORD | |
| Attachments confirmed uploaded: Invoice, Packing List, BoL, CoO | 🚩 FLAG | Dubai Customs requires all four — if any missing, declaration rejected |

---

## Batch 2 — Air freight, insurance, road freight, EU preferential origin

---

### DOC-07 — Air Waybill (IATA standard)
**Submitted by:** Seller (document issued by airline / freight agent)
**Reference:** IATA Resolution 600a / UCP 600 Art. 23
**Required for:** All air freight deals
**Note:** AWB is non-negotiable — no "original" concept. Three copies issued automatically
(Original 1 for issuing carrier, Original 2 for consignee, Original 3 for shipper).
Date of issue = date cargo accepted by carrier = shipment date per UCP 600 Art. 23.

#### Parties
| Field | Type | Notes |
|-------|------|-------|
| Shipper name and address | ✅ GRADE | Must match seller in deal terms |
| Consignee name and address | ✅ GRADE | Must match buyer in deal terms |
| Issuing carrier's agent name and city | 📋 RECORD | |
| Agent's IATA code | 📋 RECORD | |
| Also notify (if applicable) | 📋 RECORD | |

#### Routing
| Field | Type | Notes |
|-------|------|-------|
| Airport of departure | ✅ GRADE | Must match deal terms |
| Airport of destination | ✅ GRADE | Must match deal terms |
| Requested flight / date | ✅ GRADE | Must be on or before shipment deadline |
| Routing (via / to / carrier) | 📋 RECORD | Intermediate stops — record only |

#### Goods
| Field | Type | Notes |
|-------|------|-------|
| Number of pieces | 🔁 CROSS | Must match packing list |
| Gross weight | 🔁 CROSS | Must match packing list and invoice |
| Rate class | 📋 RECORD | |
| Commodity item number | 📋 RECORD | |
| Chargeable weight | 📋 RECORD | |
| Nature and quantity of goods / description | ✅ GRADE | Must match invoice description |

#### Charges
| Field | Type | Notes |
|-------|------|-------|
| Currency | ✅ GRADE | Must match deal currency |
| Charges code — prepaid / collect | ✅ GRADE | CIF/CIP deals must show "prepaid" |
| Weight charge | 📋 RECORD | |
| Valuation charge | 📋 RECORD | |
| Total charges | 📋 RECORD | |
| Declared value for carriage | 📋 RECORD | |
| Declared value for customs | 🔁 CROSS | Cross-check against invoice value |
| Amount of insurance | 📋 RECORD | CIF/CIP deals — must be ≥110% of invoice |

#### Certification & Compliance
| Field | Type | Notes |
|-------|------|-------|
| Handling information / SCI (Special Customs Information) | 🚩 FLAG | Flag if dangerous goods or export control codes present |
| Shipper's certification (dangerous goods declaration) | 🚩 FLAG | Triggers export controls + hazardous goods review |
| Place and date of issue | ✅ GRADE | Date of issue = shipment date — must be ≤ deadline |
| Signature of issuing carrier or agent | ✅ GRADE | Must be present |
| AWB number (carrier IATA code + 8-digit serial) | 🔁 CROSS | Cross-reference with packing list |

---

### DOC-08 — Marine Insurance Certificate (Lloyd's)
**Submitted by:** Seller (obtained from insurer / broker)
**Reference:** UCP 600 Art. 28 / Lloyd's Marine Certificate
**Required for:** CIF and CIP Incoterm deals only
**Note:** Cover notes are NOT acceptable — only insurance certificates or policies (UCP 600 Art. 28).

#### Certificate Header
| Field | Type | Notes |
|-------|------|-------|
| Certificate of Insurance number | 📋 RECORD | |
| Assured name | ✅ GRADE | Must be seller (or "to order" allowing buyer to claim) |
| Broker name | 📋 RECORD | |
| Policy period — commencement date | ✅ GRADE | Must cover from place of shipment |
| Policy period — end date | ✅ GRADE | Must cover through to final destination |
| Policy limit / coverage amount | ✅ GRADE | Must be ≥ 110% of CIF/CIP invoice value (UCP 600 Art. 28) |
| Currency of insured value | ✅ GRADE | Must match deal currency |

#### Coverage Details
| Field | Type | Notes |
|-------|------|-------|
| Modes of transport approved | ✅ GRADE | Must include the actual mode used in the deal |
| Cargo description covered | ✅ GRADE | Must match goods description in deal spec |
| Geographical areas covered — from | ✅ GRADE | Must cover from port/place of shipment |
| Geographical areas covered — to | ✅ GRADE | Must cover to final destination |

#### Shipment Declaration
| Field | Type | Notes |
|-------|------|-------|
| Conveyance (vessel / aircraft name) | 🔁 CROSS | Must match BoL or AWB |
| From (port / place of origin) | 🔁 CROSS | Must match BoL / AWB port of loading |
| Via / To (routing) | 📋 RECORD | |
| To (final destination) | 🔁 CROSS | Must match deal terms |
| Marks and numbers | 🔁 CROSS | Cross-check against packing list |
| Interest (cargo interest insured) | 📋 RECORD | |
| Key policy terms / deductible reference | 📋 RECORD | ICC (A), (B), or (C) clause reference |

#### Claim & Sign-off
| Field | Type | Notes |
|-------|------|-------|
| Losses payable to order of | ✅ GRADE | Must be buyer or "to order" — seller cannot retain claim right |
| Date and location | 📋 RECORD | |
| Signature of assured | ✅ GRADE | Must be present |
| Authorised signatory | ✅ GRADE | Must be present |

---

### DOC-09 — CMR International Consignment Note
**Submitted by:** Carrier (road freight — UK ↔ EU)
**Reference:** Convention on the Contract for International Carriage of Goods by Road (CMR)
**Required for:** UK ↔ EU road freight deals

| Field | Type | Notes |
|-------|------|-------|
| Box 1 — Sender (name, address, country) | ✅ GRADE | Must match seller in deal terms |
| Box 2 — Consignee (name, address, country) | ✅ GRADE | Must match buyer in deal terms |
| Box 3 — Place of delivery (place, country) | ✅ GRADE | Must match deal destination |
| Box 4 — Place and date of taking over the goods | ✅ GRADE | Date must be ≤ shipment deadline |
| Box 5 — Annexed documents | 📋 RECORD | Lists supporting docs attached |
| Box 6 — Marks and numbers | 🔁 CROSS | Cross-check against packing list |
| Box 7 — Number of packages | 🔁 CROSS | Must match packing list and invoice |
| Box 8 — Method of packing | 📋 RECORD | |
| Box 9 — Nature of the goods | ✅ GRADE | Must match invoice description |
| Box 10 — Statistical number | 📋 RECORD | |
| Box 11 — Gross weight (kg) | 🔁 CROSS | Must match packing list |
| Box 12 — Volume (m³) | 📋 RECORD | |
| ADR class / number / letter | 🚩 FLAG | Dangerous goods — triggers export controls and hazmat review |
| Box 13 — Sender's instructions (customs formalities) | 📋 RECORD | |
| Box 14 — Freight payment (paid / to be paid) | ✅ GRADE | CIP/CPT deals must show freight paid |
| Box 15 — Cash on delivery | 📋 RECORD | |
| Box 16 — Carrier (name, address, country) | ✅ GRADE | Must be a named, identifiable carrier |
| Box 17 — Successive carriers | 📋 RECORD | |
| Box 18 — Carrier's reservations and observations | 🚩 FLAG | Any notation = automatic hold for human review |
| Box 19 — Special agreements | 📋 RECORD | |
| Box 20 — Charges to be paid by sender / consignee | 📋 RECORD | |
| Box 21 — Established in/on (date) | 📋 RECORD | |
| Box 22 — Signature and stamp of sender | ✅ GRADE | Must be present |
| Box 23 — Signature and stamp of carrier + tractor/trailer plate | ✅ GRADE | Must be present |
| Box 24 — Signature and stamp of consignee | 📋 RECORD | Proof of delivery — record only |

---

### DOC-10 — EUR.1 Movement Certificate (Form C1299)
**Submitted by:** Seller (endorsed by HMRC / UK customs)
**Reference:** HMRC Form C1299 / UK–EU Trade and Cooperation Agreement (TCA)
**Required for:** UK ↔ EU deals where preferential tariff rates are being claimed
**Note:** Provides proof of UK origin for preferential duty treatment in the EU (and vice versa).
Not required for every deal — only when claiming TCA preferential tariffs.

| Field | Type | Notes |
|-------|------|-------|
| Box 1 — Exporter (name, full address, country) | ✅ GRADE | Must match seller in deal terms |
| Box 2 — Preferential trade between UK and [destination] | ✅ GRADE | Destination country/territory must match deal |
| Box 3 — Consignee (name, full address, country) | 📋 RECORD | Optional on the form |
| Box 4 — Country of origin: UK | ✅ GRADE | Must be UK — this is the originating country |
| Box 5 — Country of destination | ✅ GRADE | Must match buyer country in deal terms |
| Box 6 — Transport details | 📋 RECORD | Optional |
| Box 7 — Remarks | 📋 RECORD | |
| Box 8 — Item number, marks and numbers, description of goods | ✅ GRADE | Must match invoice goods description |
| Box 9 — Gross weight (kg) or other measure | 🔁 CROSS | Cross-check against invoice and packing list |
| Box 10 — Invoice reference | 🔁 CROSS | Must match commercial invoice |
| Box 11 — Customs Endorsement (Declaration certified / Stamp / Form / Number / Customs office / Date / Signature) | 🚩 FLAG | HMRC endorsement must be present — automatic hold if missing |
| Box 12 — Declaration by exporter (Place and date / Signature) | ✅ GRADE | Must be present and signed |
| Exporter name in block letters | ✅ GRADE | |
| Status of signatory | 📋 RECORD | |
| Company name | 🔁 CROSS | Must match seller in deal terms |
| EUR.1 certificate number | 📋 RECORD | Unique reference issued by HMRC |

---

## Batch 3 — UAE regulatory + EU customs + UK food safety

---

### DOC-11 — EU Single Administrative Document (SAD)
**Submitted by:** Seller / freight forwarder (filed with EU customs authority)
**Reference:** EU Customs Code / Commission Regulation (EEC) No 2454/93
**Required for:** All EU exports (EU → UK, EU → UAE)
**Note:** Like UK CDS, this is a digital customs filing. Blockmediary collects proof of filing,
not the full form. The key output is the Export Accompanying Document (EAD) with MRN.

#### Fields we collect (proof of filing)
| Field | Type | Notes |
|-------|------|-------|
| MRN — Movement Reference Number (from EAD) | ✅ GRADE | EU equivalent of UK CDS MRN — proves export declaration accepted |
| Export licence number (Box 44) | 🚩 FLAG | Required for dual-use goods under EU Reg 2021/821 |

#### Full SAD field reference (for human examiner)
| SAD Box | Field | Type | Notes |
|---------|-------|------|-------|
| Box 2 | Consignor/Exporter + EORI | 📋 RECORD | |
| Box 6 | Total packages | 🔁 CROSS | Cross-check against packing list |
| Box 7 | Reference number | 📋 RECORD | |
| Box 8 | Consignee + EORI | 📋 RECORD | |
| Box 14 | Declarant/Representative | 📋 RECORD | Freight forwarder details |
| Box 15 | Country of dispatch/export | ✅ GRADE | Must match seller country |
| Box 16 | Country of origin | ✅ GRADE | Must match CoO and invoice |
| Box 17 | Country of destination | ✅ GRADE | Must match buyer country |
| Box 18 | Identity of transport at departure | 🔁 CROSS | Vessel/vehicle — cross-check BoL/CMR |
| Box 20 | Delivery terms (Incoterm) | ✅ GRADE | Must match deal Incoterm |
| Box 22 | Currency and total amount invoiced | 🔁 CROSS | Must match commercial invoice |
| Box 25 | Mode of transport at border | 📋 RECORD | |
| Box 27 | Place of loading | 🔁 CROSS | Must match BoL/CMR |
| Box 31 | Packages and description of goods | ✅ GRADE | Must match invoice |
| Box 33 | Commodity code (HS) | 🚩 FLAG | Export controls check — EU dual-use list |
| Box 34 | Country of origin code | ✅ GRADE | Must match invoice and CoO |
| Box 35 | Gross mass (kg) | 🔁 CROSS | Must match packing list |
| Box 38 | Net mass (kg) | 🔁 CROSS | Must match packing list |
| Box 44 | Additional info / documents / licences / authorisations | 🚩 FLAG | Export licence ref goes here |
| Box 46 | Statistical value | 📋 RECORD | |
| Box 54 | Signature of declarant/representative | ✅ GRADE | Must be present |

---

### DOC-12 — Halal Certificate
**Submitted by:** Seller (issued by ESMA-accredited Halal certification body)
**Reference:** UAE ESMA standard GSO 2055 / UAE Cabinet Resolution No. 26/2019
**Required for:** UAE corridor deals involving food, beverages, cosmetics, pharmaceuticals,
food packaging, or any consumable goods
**Note:** Halal certificate file was a .docx binary — fields derived from ESMA standard requirements.

| Field | Type | Notes |
|-------|------|-------|
| Certificate number | 📋 RECORD | Unique reference from certifying body |
| Issuing body name | ✅ GRADE | Must be an ESMA-accredited or UAE-recognised Halal certifier |
| Certificate holder — company name | ✅ GRADE | Must match seller in deal terms |
| Certificate holder — address | 📋 RECORD | |
| Manufacturing facility name and address | 📋 RECORD | |
| Product name(s) and description | ✅ GRADE | Must match goods description in deal spec |
| Product category | 📋 RECORD | Food / Cosmetics / Pharma etc. |
| HS code | 🔁 CROSS | Must match invoice HS code |
| Country of manufacture / origin | ✅ GRADE | Must match invoice country of origin |
| Batch / lot number (if applicable) | 📋 RECORD | |
| Certificate validity — from date | ✅ GRADE | Must be valid at time of shipment |
| Certificate validity — to date | ✅ GRADE | Must not have expired before shipment date |
| Slaughter method attestation (food only) | 🚩 FLAG | Required for meat/poultry — hold for human review if absent |
| No haram substances declaration | ✅ GRADE | Must be present |
| Ingredients list reference | 📋 RECORD | |
| Certifying authority stamp | 🚩 FLAG | Must be present — automatic hold if missing |
| Authorised signatory name and signature | ✅ GRADE | Must be present |
| Date of issue | ✅ GRADE | Must be before shipment date |

---

### DOC-13 — ECAS Certificate of Conformity (UAE)
**Submitted by:** Seller (issued by MOIAT / ESMA via accredited conformity assessment body)
**Reference:** UAE Federal Law No. 28/2001 / ESMA ECAS scheme / MOIAT
**Required for:** UAE corridor deals involving regulated product categories:
electrical equipment, electronics, construction materials, toys, medical devices,
chemical products, personal protective equipment
**Note:** Certificate is electronic and does not require stamp or signature (per MOIAT).
Will be invalid if modified. Verified via QR code on moiat.gov.ae.

| Field | Type | Notes |
|-------|------|-------|
| Certificate number | 📋 RECORD | Format: YY-MM-NNNNN/ENXX-XX-NNNNNN |
| Registration date | 📋 RECORD | |
| Valid until (expiry date) | ✅ GRADE | Must not have expired before shipment date |
| Issued to — company name | ✅ GRADE | Must match seller / UAE importer in deal terms |
| Issued to — address | 📋 RECORD | |
| Sector | 📋 RECORD | e.g. Electrical, Construction, Chemical |
| Product category | ✅ GRADE | Must match the goods category in the deal spec |
| Product sub-category | ✅ GRADE | Must match specific goods type |
| Approved standard(s) referenced | 📋 RECORD | UAE/GSO standard the product was tested against |
| QR code (for MOIAT verification) | 🚩 FLAG | Must be scannable — flag for human review if absent or broken |
| Issuing authority (MOIAT logo) | ✅ GRADE | Must be MOIAT / ESMA — reject if issued by unrecognised body |

---

### DOC-14 — UK Export Health Certificate (EHC)
**Submitted by:** Seller (certified by Official Veterinarian or Environmental Health Officer)
**Issuing authority:** APHA (Animal and Plant Health Agency) — DEFRA / Scottish Government / Welsh Government
**Reference:** UK Export Health Certificate scheme — GOV.UK EHC Form Finder
**Required for:** UK export deals involving food, animal products, plants, seeds,
plant products, and certain biological materials
**Note:** The EHC template varies by product type — there are hundreds of specific templates
on GOV.UK EHC Form Finder (e.g. EHC 8082 for beef, EHC 6818 for dairy). The file
received (ET135) is the cancellation/replacement request form. Core fields common across
all EHC templates are listed below.

#### Core fields (common across all EHC templates)
| Field | Type | Notes |
|-------|------|-------|
| EHC serial number | 📋 RECORD | Unique serial assigned by APHA |
| EHC template number | 📋 RECORD | Identifies which product-specific template (e.g. EHC 8082) |
| Exporter name | ✅ GRADE | Must match seller in deal terms |
| Exporter address | 📋 RECORD | |
| Consignee / importer name | ✅ GRADE | Must match buyer in deal terms |
| Consignee / importer address | 📋 RECORD | |
| Country of origin | ✅ GRADE | Must match invoice and CoO |
| Country of destination | ✅ GRADE | Must match buyer country — destination-specific health attestations apply |
| Description of goods / consignment | ✅ GRADE | Must match invoice goods description |
| Number of packages | 🔁 CROSS | Must match packing list |
| Net / gross weight | 🔁 CROSS | Must match packing list and invoice |
| Health attestations (product-specific) | 🚩 FLAG | Must be present and checked — specific disease-free / treatment attestations vary by goods type. Missing or blank attestation = automatic hold |
| Date of inspection by Certifying Officer | ✅ GRADE | Must be before dispatch date |
| Place of inspection | 📋 RECORD | |
| Certifying Officer name | ✅ GRADE | Must be an Official Veterinarian (OV) or Environmental Health Officer (EHO) |
| Certifying Officer signature | ✅ GRADE | Must be present |
| Certifying Officer stamp | 🚩 FLAG | Must be present — hold if missing |
| Date of export / dispatch | ✅ GRADE | Must be ≤ shipment deadline in deal terms |
| Border Inspection Post (BIP) of entry — if specified | 📋 RECORD | Destination country may specify required BIP |

---

## Onboarding Documents

Collected once per company at registration. Not per-deal documents.
Passport (DOC-18) and Source of Funds Declaration (DOC-19) still pending upload.

---

### DOC-15 — Certificate of Incorporation
**Submitted by:** Buyer and Seller
**Purpose:** Proves the company legally exists and is registered
**Variants:** UK (Companies House) · UAE mainland (Ministry of Economy) · UAE free zones (each zone issues its own — Ajman, DIFC, ADGM, DMCC etc.) · EU (varies by member state)

#### UK Certificate of Incorporation (Companies House)
| Field | Type | Notes |
|-------|------|-------|
| Company Number | ✅ GRADE | Unique Companies House reference — must match what the company states on all trade documents |
| Registered company name | ✅ GRADE | Must match exactly the name used on commercial invoices and deal setup |
| Company type | ✅ GRADE | Private limited / Public limited — affects KYB risk assessment |
| Registered office jurisdiction | ✅ GRADE | England and Wales / Scotland / NI — determines applicable law |
| Date of incorporation | 📋 RECORD | Age of company — AML risk signal if very newly incorporated |
| Issuing authority | ✅ GRADE | Must be Companies House — reject if issuing body is unrecognised |
| Official seal / electronic authentication | 🚩 FLAG | Must be present — Companies House seal or electronic authentication under CA 2006 s.1115 |

#### UAE Certificate of Incorporation (Free Zone — Ajman Free Zone example)
| Field | Type | Notes |
|-------|------|-------|
| Company name (English and Arabic) | ✅ GRADE | Must match all trade documents |
| Company type | ✅ GRADE | Offshore / FZ-LLC / mainland LLC — determines regulatory obligations |
| Date of incorporation | 📋 RECORD | |
| Registration / Certificate number | ✅ GRADE | Unique free zone reference |
| Free zone / issuing authority | ✅ GRADE | Must be an authorised UAE free zone or mainland authority |
| Registrar signature and official seal | 🚩 FLAG | Must be present |
| Arabic text confirmed | 📋 RECORD | Bilingual document — both versions must be present for UAE deals |

> **Note:** UAE has many free zones (DIFC, ADGM, DMCC, JAFZA, Ajman, etc.) — each issues its own certificate format. The Ajman Free Zone template covers offshore companies; DIFC certificates are issued by the DIFC Registrar of Companies and look different. Core graded fields are consistent across all zones.

---

### DOC-16 — Articles of Association
**Submitted by:** Buyer and Seller
**Purpose:** Defines company governance — who can bind the company, share structure, director powers
**Reference:** UK: Companies Act 2006 Model Articles / bespoke articles. UAE: Memorandum & Articles of Association
**Note:** The uploaded file (AOA_UK.pdf) is an HM Treasury PF2 specialist form used for private finance companies. Fields below apply to all UK AoAs.

| Field | Type | Notes |
|-------|------|-------|
| Company name | ✅ GRADE | Must match Certificate of Incorporation |
| Company number | ✅ GRADE | Must match Certificate of Incorporation |
| Date of adoption (resolution date) | 📋 RECORD | Most recent adoption — confirms document is current |
| Issued share capital — amount and number of ordinary shares | 📋 RECORD | Confirms share structure for UBO analysis |
| Maximum share capital limit | 📋 RECORD | |
| Director appointment / removal rights | 📋 RECORD | Identifies who has power to bind the company |
| Material Shareholder threshold | 📋 RECORD | Percentage triggering significant control (25% in PF2; Companies Act default is also 25%) |
| Share transfer restrictions | 📋 RECORD | Pre-emption rights, permitted transfer conditions |
| Quorum requirements | 📋 RECORD | |
| Signing authority — who may execute contracts | ✅ GRADE | Determines whether the person signing trade documents has authority to bind the company |

---

### DOC-17 — UBO / PSC Register (People with Significant Control)
**Submitted by:** Buyer and Seller
**Purpose:** AML beneficial ownership check — identifies individuals who ultimately own or control the company
**Reference (UK):** Companies Act 2006 Part 21A / Register of People with Significant Control Regulations 2016 (amended 2025) — DBT guidance Version 4, November 2025
**Reference (UAE):** Federal Decree-Law No. 20 of 2018 on Anti-Money Laundering (UBO register)

> **Document note:** The uploaded file (PSC_UK.pdf) is the 49-page DBT guidance document explaining the PSC regime — NOT the actual PSC notification form. The correct form to collect is the **Companies House PSC01** (individual PSC) or **PSC02** (corporate entity PSC), available from companieshouse.gov.uk. As of 18 November 2025, all PSCs must also verify their identity directly with Companies House.

#### Individual PSC — required fields (per CA 2006 Part 21A / DBT guidance Ch.4)
| Field | Type | Notes |
|-------|------|-------|
| Full name | ✅ GRADE | Sanctions screening — must match passport |
| Date of birth (month and year public; full date held privately) | ✅ GRADE | KYC identity verification |
| Nationality | ✅ GRADE | Sanctions screening — high-risk nationality flags |
| Country / state / area of usual residence | 📋 RECORD | |
| Service address | 📋 RECORD | Publicly available on Companies House register |
| Residential address | 📋 RECORD | Provided to Companies House but NOT public — held internally by Blockmediary only; never displayed |
| Date became a PSC | 📋 RECORD | |
| PSC conditions met (i–v) with quantification | ✅ GRADE | Identifies control mechanism — e.g. "directly holds >25% but ≤50% of shares" |
| Identity verification status | 🚩 FLAG | As of 18 Nov 2025, all PSCs must verify identity with Companies House — flag if not verified |

**The 5 PSC conditions (one or more must be stated):**
- (i) Directly or indirectly holds >25% of shares
- (ii) Directly or indirectly holds >25% of voting rights
- (iii) Directly or indirectly holds right to appoint / remove majority of directors
- (iv) Has the right to exercise, or actually exercises, significant influence or control
- (v) Controls a trust or firm whose trustees / members meet any of conditions (i)–(iv)

#### Registrable Relevant Legal Entity (RLE — corporate PSC)
| Field | Type | Notes |
|-------|------|-------|
| Name of the legal entity | ✅ GRADE | Sanctions screening |
| Address of principal office | 📋 RECORD | |
| Legal form and governing law | 📋 RECORD | |
| Register in which it appears + registration number | 📋 RECORD | Companies House number or overseas equivalent |
| Date became a registrable RLE | 📋 RECORD | |
| Which PSC conditions (i–v) are met | ✅ GRADE | |

#### UAE UBO equivalent
| Field | Type | Notes |
|-------|------|-------|
| UBO full name | ✅ GRADE | |
| Nationality | ✅ GRADE | |
| Date of birth | ✅ GRADE | |
| Passport number | ✅ GRADE | |
| Percentage ownership / nature of control | ✅ GRADE | Must be ≥25% to be reportable under Federal Decree-Law No. 20/2018 |
| UAE residency status | 📋 RECORD | |

---

### DOC-18 — Director / Authorised Signatory Passport
**Submitted by:** Buyer and Seller (each director or signatory who will execute the deal)
**Purpose:** KYC identity verification of the individual authorised to sign
**Status:** No template to design — just a copy of the passport biographical data page.

| Field | Type | Notes |
|-------|------|-------|
| Full name (as on passport) | ✅ GRADE | Must match name on AoA signing authority and all deal documents |
| Nationality | ✅ GRADE | Sanctions screening |
| Date of birth | ✅ GRADE | Cross-check against PSC / UBO register entry |
| Passport number | 📋 RECORD | |
| Expiry date | 🚩 FLAG | Expired passport = automatic hold — cannot accept as valid KYC |
| Issuing country | ✅ GRADE | |
| Photo page | 📋 RECORD | Human reviewer check for identity consistency |
| Machine-readable zone (MRZ) | 📋 RECORD | |

---

### DOC-19 — Source of Funds Declaration
**Submitted by:** Buyer and Seller
**Purpose:** AML — confirms the legitimate origin of funds used in the deal (MLR 2017 obligation)
**Status:** No official form exists. Blockmediary must design this form from scratch.

| Field | Type | Notes |
|-------|------|-------|
| Declaring company name | ✅ GRADE | Must match onboarding entity name |
| Declaring company registration number | ✅ GRADE | Must match CoI |
| Authorised signatory name and title | ✅ GRADE | Must be an authorised director per AoA |
| Nature of business / source of trading funds | ✅ GRADE | Business type generating the funds — AML assessment |
| Estimated annual transaction volume with Blockmediary | 📋 RECORD | |
| Banking institution(s) holding the funds | 📋 RECORD | |
| Country of origin of funds | ✅ GRADE | Sanctions screening — OFSI, UN, EU lists |
| Declaration: funds are not derived from criminal activity | 🚩 FLAG | Must be signed — POCA 2002 / MLR 2017 Schedule 2 obligation |
| Declaration: no sanctions designations apply | 🚩 FLAG | Must be signed |
| Signature of authorised signatory | ✅ GRADE | |
| Date | ✅ GRADE | |

---

## Cross-document consistency checks (summary)

When all documents for a deal are submitted, these cross-checks run before the
compliance verdict is issued:

| Check | Documents involved |
|-------|--------------------|
| Seller name consistent | Invoice ↔ Packing List ↔ BoL ↔ CoO |
| Buyer name consistent | Invoice ↔ Packing List ↔ BoL ↔ CoO |
| Invoice number consistent | Invoice ↔ Packing List ↔ BoL |
| Goods description consistent | Invoice ↔ Packing List ↔ BoL ↔ CoO |
| Quantity / weight consistent | Invoice ↔ Packing List ↔ BoL |
| Port of loading consistent | Packing List ↔ BoL ↔ deal terms |
| Port of discharge consistent | Packing List ↔ BoL ↔ deal terms |
| Shipment date ≤ deadline | Invoice ↔ BoL ↔ Packing List ↔ deal terms |
| Total value = escrow amount | Invoice (total declared value) ↔ escrow funded amount |
| Currency match | Invoice ↔ escrow currency |
| Incoterm match | Invoice ↔ deal terms |
| HS code consistent | Invoice ↔ Mirsal2 declaration |
| Country of origin consistent | Invoice ↔ Packing List ↔ CoO |
| Export clearance confirmed | UK CDS MRN present |
| Import clearance confirmed | Mirsal2 declaration number present |
| EU export clearance confirmed | EU SAD MRN (EAD) present |
| Insurance coverage ≥ 110% of invoice | Insurance Certificate ↔ Commercial Invoice total value |
| Insurance covers shipment period | Insurance Certificate dates ↔ BoL/AWB shipment date |
| AWB date = shipment date | AWB date of issue ↔ deal shipment deadline |
| CMR clean (no carrier reservations) | Box 18 of CMR — any notation = hold |
| Halal certificate valid at shipment | Halal Certificate expiry ↔ BoL/AWB shipment date |
| ECAS certificate valid at shipment | ECAS expiry ↔ BoL/AWB shipment date |
| EHC signed before dispatch | EHC inspection date ↔ date of export |
| EUR.1 customs endorsement present | Box 11 HMRC stamp ↔ UK export MRN |

---

*Last updated: Batches 1, 2, and 3 complete.*
*DOC-01 to DOC-06: Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, UK CDS reference, Dubai Customs Mirsal2 reference*
*DOC-07 to DOC-10: Air Waybill, Marine Insurance Certificate, CMR Road Waybill, EUR.1 Movement Certificate*
*DOC-11 to DOC-14: EU SAD, Halal Certificate, ECAS Certificate of Conformity, UK Export Health Certificate*
