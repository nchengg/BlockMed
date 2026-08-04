# Blockmediary — Visual Spec Sheet

Framework-agnostic design spec. No code. Covers `/`, `/buyer`, `/seller`, `/dashboard`.

---

## 0. Design tokens

### Colour

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `#0A0A0B` | Page background |
| `--bg-mid` | `#111114` | Alternate section backgrounds |
| `--bg-surface` | `#18181C` | Cards, panels, table rows |
| `--border` | `#27272A` | Card borders, dividers |
| `--accent` | `#F59E0B` | Primary CTAs, current step, active state, locked-funds state |
| `--accent-dim` | `#F59E0B` at 12% opacity | Hover backgrounds and active-state fills only; avoid decorative amber glows |
| `--success` | `#22C55E` | Verified / released / paid states |
| `--error` | `#EF4444` | Rejected / refunded / failed states |
| `--pending` | `#71717A` | Waiting / not-yet-started states |
| `--text-primary` | `#FAFAFA` | Headlines, primary values |
| `--text-secondary` | `#71717A` | Body copy |
| `--text-muted` | `#3F3F46` | Metadata, timestamps, helper text |

### Typography

- Font: **Inter** (variable weight), no other typefaces.
- Display: 800 weight, -0.03em tracking, `clamp(44px, 7.5vw, 96px)`.
- Section headline: 700 weight, -0.02em tracking, `clamp(34px, 5.5vw, 72px)`.
- Sub-headline (page-level, non-hero): 600 weight, -0.01em tracking, `clamp(22px, 3vw, 32px)`.
- Body: 400 weight, 1.7 line-height, 15–19px.
- Section labels / eyebrows: 600 weight, 0.12em tracking, 11px, all caps, always `--accent`. Use for section context, not duplicate step numbers when a step indicator is already visible.
- Monospace numbers: system monospace, used for stats, USDC amounts, step numbers, payment addresses, timestamps, and transaction IDs.
- Button label: 600 weight, 15px, 0.01em tracking.

### Spacing & grid

- Base unit: 8px. All spacing in multiples of 8 (8/16/24/32/48/64/96/128).
- Desktop content grid: 12 columns, 1200px max container, 24px gutters, 80px outer margin at ≥1440px.
- Section vertical rhythm: 128px padding top/bottom on desktop, 64px on mobile.
- Cards: 24px internal padding, 1px `--border`, 8px corner radius.
- Mobile breakpoint: <768px, all grids collapse to single column, section padding drops to 64px.

### Motion

- Easing: `power2.out` only, everywhere. No bounce, no spring.
- Scroll reveals: landing page support sections only, fade + `translateY(24px → 0)`, 0.5–0.7s duration.
- Line/connector draws: `scaleX 0 → 1`, left-anchored.
- Number count-ups: linear interpolation over 0.8s when a stat scrolls into view, monospace tabular figures so digits don't shift width.
- Status transitions (e.g. pending → verified): 0.3s crossfade + 4px scale pulse on the icon, once.
- Scroll-scrubbed image sequence: landing page only, tied to scroll progress, using three generated image plates with gentle `scale`, `transform-origin`, opacity crossfades, and no deep zoom that would cause pixelation.
- No animation blocks interaction — reveals trigger at 15% element visibility, not on full entry.
- Task flows use motion only for state changes and progress confirmation; avoid decorative reveals inside form steps.

---

## 1. `/` — Landing page

**Purpose:** Tell the SME trade problem through a cinematic scroll story, then route the visitor into the buyer or seller flow.

*(This page follows the existing frontend direction but has been tightened for SME clarity and fintech credibility.)*

### Sections in order

**1 — Scroll story (three-image sequence)**
Full-bleed generated image sequence, pinned across 500vh of scroll. Use three plates with smooth scroll-driven crossfades and subtle scale/pan transforms so the experience feels like a continuous zoom without relying on a single image crop. No video.
- Visual beat 1: Plate A, wide ocean + massive cargo ship, premium cinematic but realistic.
  - Copy: "Global trade is beautiful."
- Visual beat 2: transition from Plate A into Plate B, moving toward a much smaller SME boat.
  - Copy: "But not for SMEs."
- Visual beat 3: Plate B, closer to the smaller boat, showing its vulnerability beside the scale of global shipping.
  - Copy: "They ship first and hope payment arrives."
- Visual beat 4: transition from Plate B into Plate C, moving into the operator/person on the small boat.
  - Copy: "Letters of credit solve this problem."
- Visual beat 5: Plate C, intimate SME-scale view with the operator, documents, and cargo.
  - Copy: "But SMEs are locked out."
- Visual beat 6: Plate C darkened behind the text for final brand reveal.
  - Copy line 1: "Blockmediary."
  - Copy line 2: "Global trade for SMEs."
Each copy beat fades in/out independently; only one message is dominant at a time. Text sits directly over the image, not inside a card.

**Generated landing image assets**
These assets have been generated and saved in the app's public asset folder for implementation:
- Plate A — global trade scale: `/landing/landing-plate-a-global-trade.png`
  - Source file: `app/public/landing/landing-plate-a-global-trade.png`
  - Use for: "Global trade is beautiful."
- Plate B — SME boat scale contrast: `/landing/landing-plate-b-sme-boat.png`
  - Source file: `app/public/landing/landing-plate-b-sme-boat.png`
  - Use for: "But not for SMEs." and "They ship first and hope payment arrives."
- Plate C — operator/documents close-up: `/landing/landing-plate-c-operator-documents.png`
  - Source file: `app/public/landing/landing-plate-c-operator-documents.png`
  - Use for: "Letters of credit solve this problem.", "But SMEs are locked out.", and the "Blockmediary. Global trade for SMEs." reveal.

**2 — How it works**
Eyebrow: "HOW IT WORKS". Four compact steps, arranged horizontally on desktop and vertically on mobile. Use a restrained line/connector motif rather than heavy cards.
- **01** Agree terms upfront — "Buyer and seller agree the deal and required documents."
- **02** Buyer locks payment — "The buyer locks the agreed amount before shipment."
- **03** Seller uploads documents — "The seller uploads the invoice and trade documents."
- **04** Funds release when documents match — "If the documents match the deal terms, payment is released."

**3 — Role choice**
Headline: "Start as a buyer or seller." Two large role options, styled as navigation choices rather than sales CTAs:
- **Continue as Buyer** → `/buyer`
- **Continue as Seller** → `/seller`
No FAQ or trust-signal sections in the MVP landing page. These can be added after the core demo flow is working.

**4 — Footer**
`© 2026 Blockmediary.` · Privacy · Terms · GitHub.

### Empty/loading/error states
- Image not loaded / reduced-motion preference: show the wide scene as a static hero image, then stack the six story beats as normal scroll sections underneath.
- Image fails to load: fall back to a static dark gradient with the same six text beats appearing on scroll.

---

## 2. `/buyer` — Buyer flow

**Purpose:** Take a buyer from deal review to a confirmed, funded escrow in five linear steps.

### Layout

Single-column centred flow, max-width 640px, vertical stepper on the left on desktop (≥1024px) showing all 5 steps with the active one highlighted in amber; on mobile the stepper collapses to a horizontal progress bar pinned under the header. Background `--bg-deep`. Each step should fit within one focused screen where possible; avoid making short form steps feel theatrical or artificially long.

### Sections / components in order

**Header (persistent)**
Blockmediary wordmark, left. Step indicator "Step 2 of 5", right, monospace. No nav links — this is a task flow, not a browsing page.

**Step 1 — Connect wallet**
- Eyebrow: "BUYER"
- Headline: "Connect your wallet to begin."
- Subline: "You’ll use a wallet to approve the escrow payment, like confirming a bank transfer. Blockmediary never takes custody of your funds."
- Component: large centred wallet-connect card, `--bg-surface`, listing supported wallets (MetaMask, Coinbase Wallet, WalletConnect) as individual rows with icon + name, each a full-width button.
- CTA: none separate — clicking a wallet row *is* the action.
- States: default (rows enabled) · connecting (row shows spinner, others dim) · connected (auto-advances to Step 2) · rejected (row shows "Connection declined — try again" in `--error`, row re-enabled) · wallet not detected (row shows "Not installed" in `--text-muted`, links out to install).

**Step 2 — Enter deal amount**
- Eyebrow: "BUYER"
- Headline: "How much do you want to lock?"
- Subline: "Enter the exact invoice amount in USDC digital dollars."
- Component: single large monospace numeric input, centred, amber caret, USDC suffix label. Below it, read-only rows: "Seller payment address" (truncated address + copy icon), "Your USDC balance" (live, monospace), and a helper line: "Seller details come from the invite or deal link."
- CTA: "Continue" (amber filled, disabled until amount > 0 and ≤ balance).
- States: empty (CTA disabled, no error shown) · amount exceeds balance ("Insufficient USDC balance" in `--error` under input) · valid (CTA enables with a 0.2s fade).

**Step 3 — Review release terms**
- Eyebrow: "BUYER"
- Headline: "Review when payment will release."
- Subline: "Funds release only when the uploaded invoice matches the deal terms below."
- Component: review card with amount, seller payment address, required document ("Commercial invoice"), and release checks ("Invoice total matches escrow amount", "Seller details match", "Deal reference matches"). Use plain labels; no technical language.
- CTA: "I understand — continue" (amber filled).
- States: seller details missing (full-card warning "This deal link is missing seller details" + disabled CTA) · valid (CTA enabled).

**Step 4 — Approve & deposit**
- Eyebrow: "BUYER"
- Headline: "Approve and lock your funds."
- Subline: "You’ll confirm two wallet prompts: first to allow USDC digital dollars, then to lock them in escrow."
- Component: two stacked task rows, each with a numbered circle (1, 2), label ("Approve USDC", "Deposit to escrow"), and a status pill (Waiting / Confirm in wallet / Confirmed). Row 2 is greyed out and non-interactive until row 1 is confirmed.
- CTA: each row's own button ("Approve", then "Deposit") — replaces the pill area once actionable.
- States: waiting (grey pill) · awaiting signature ("Confirm in wallet…" pulsing amber dot) · confirmed (green check, pill reads "Confirmed") · rejected in wallet (`--error` pill "Declined — retry", button reappears) · payment network error/timeout ("Transaction failed — retry", `--error`).

**Step 5 — Confirmation**
- Eyebrow: "BUYER"
- Headline: "Funds are locked." (amber, large)
- Subline: "$[amount] USDC is now held in escrow. The seller can see the funded deal and ship with confidence."
- Component: receipt card — deal ID (monospace), amount, seller payment address, timestamp, seller visibility status ("Seller can view this deal"), "View transaction" link (external, opens the Base payment network record).
- CTA: "Go to dashboard" (amber filled → `/dashboard?deal=[id]`).
- Animation: on entry, a single amber checkmark draws itself (stroke-dashoffset 0→1, 0.6s) before the card content fades in.

### Empty/loading/error states (flow-level)
- Wrong network connected: full-screen interstitial replacing the step content — "Your wallet is on the wrong network" + subline "Switch to Base, the payment network Blockmediary uses." with a single "Switch network" button.
- Page reloaded mid-flow: rehydrate from wallet + on-chain state, resume at the correct step automatically (never restart from Step 1 unless wallet is disconnected).

---

## 3. `/seller` — Seller flow

**Purpose:** Let a seller confirm funds are locked, upload the required trade document, and watch the document check unlock payment.

### Layout

Same single-column focused-step pattern as `/buyer` for consistency, max-width 640px, vertical stepper on desktop. Three steps (no wallet-approval step needed since seller only receives).

### Sections / components in order

**Header (persistent)**
Same as buyer flow. Step indicator reads "Step 1 of 3" etc.

**Step 1 — Funds locked**
- Eyebrow: "SELLER"
- Headline: "$[amount] USDC is locked and waiting for you."
- Subline: "The buyer has funded escrow. The funds cannot release until the required document matches the deal terms."
- Component: status card showing amount (monospace, large), buyer payment address, deal ID, required document ("Commercial invoice for this MVP"), and "locked" badge (amber dot + "Locked").
- CTA: "Continue to upload".
- States: funds not yet detected ("Waiting for buyer to deposit…" with a pulsing grey dot, CTA disabled) · funds confirmed (badge turns amber, CTA enables with fade).

**Step 2 — Upload documents**
- Eyebrow: "SELLER"
- Headline: "Upload your commercial invoice."
- Subline: "Accepted formats: PDF, PNG, JPG. Blockmediary checks the invoice against the deal terms."
- Component: drag-and-drop zone, dashed `--border`, centred upload icon + "Drop file or click to browse". Once a file is added, zone becomes a file row (filename, size, remove icon).
- CTA: "Submit for document check" (disabled until a file is present).
- States: empty (dashed zone, helper text visible) · dragging-over (border turns solid amber, background `--accent-dim`) · file added (row view, CTA enabled) · wrong file type ("Unsupported file type" in `--error`, zone resets) · upload failing/retry (progress bar, then "Upload failed — retry" in `--error`).

**Step 3 — Document check → payment**
- Eyebrow: "SELLER"
- Headline (state-dependent, see below).
- Component: single vertical progress list, three rows, each with icon + label + status pill: "Document received" · "Checking deal terms" · "Payment released".
- Sub-component while verifying: small line under row 2 showing the current check category, using truthful labels such as "Checking invoice total…", "Checking seller details…", "Checking deal reference…". Do not present fake logs.
- Animation: each row's status pill crossfades from pending (`--pending`, grey dot) → active (amber, pulsing dot) → done (`--success`, checkmark draw) as verification proceeds.
- States and headline copy:
  - Verifying: "Checking your document." / subline "This usually takes under 5 minutes."
  - Verified + released: "Payment released." (amber, large) / subline "$[amount] USDC has been sent to your wallet."
  - Verification failed: "We couldn't verify this document." / subline "Reason: [short reason, e.g. 'Invoice amount doesn't match escrow amount']." + CTA "Re-upload document" (returns to Step 2 with file cleared).
  - Escalated to manual review (edge case, low-confidence result): "Needs manual review." / subline "A reviewer needs to check this before payment can release. We'll notify you within 24 hours." — no user action available, page can be safely left and returned to.
- Final CTA once released: "Go to dashboard" (amber filled → `/dashboard?deal=[id]`).

### Empty/loading/error states (flow-level)
- Returning to `/seller` after funds already released: skip straight to the "Payment released" state, no re-upload possible.
- Network/API error during document-check submit: inline banner above the progress list, `--error` background at low opacity, "Something went wrong submitting your document — retry", with a retry button; progress list stays in its pre-submit state.

---

## 4. `/dashboard` — Deal dashboard

**Purpose:** Give Buyer, Seller, and Blockmediary/Escrow Operator views of one escrow deal. The dashboard is the operational source of truth: current state, next action, documents, participants, settings, and audit trail.

### Role viewpoints

The same dashboard shell adapts to the viewer's role. In the MVP/demo this may be a visible role switcher; in production it comes from authentication.

| Viewer | What they need | Primary action examples |
|---|---|---|
| Buyer | See whether funds are locked, documents are submitted, and payment is safe to release or refund under the rules. | Continue buyer flow, request refund when valid, view transaction. |
| Seller | Confirm funds are locked before shipping, upload documents, and see whether payment has released. | Upload document, re-upload failed document, view release transaction. |
| Blockmediary / Escrow Operator | Monitor the deal, review document-check results, manage exceptions, and preserve the audit trail. | Mark manual review, approve compliant result in demo mode, flag discrepancy, pause only as an emergency/demo state. |
| Read-only link | Understand high-level status without exposing sensitive participant details. | No primary action; prompt to connect as a participant. |

### Layout

Dashboard uses an app-like shell inspired by the generated mockup:
- Left rail on desktop: Blockmediary wordmark, deal navigation, and viewer role indicator. Keep it narrow and functional, not a marketing sidebar. On mobile, collapse into a top bar/menu.
- Main content max-width 1200px, 12-column grid.
- Top summary band spans the main content width.
- Below the summary, a tab bar controls the primary content area.
- Overview tab uses a two-column split (≥1024px): left column 8/12 for state visual and audit preview, right column 4/12 for participants and actions. Below 1024px, right column stacks under left.

### Dashboard tabs

Tabs are visible under the summary band. Use text labels, 8px radius active state, amber underline or fill. Tabs should not look like browser tabs.

1. **Overview** — default tab; current status, next action, escrow flow, participants, and recent audit trail.
2. **Documents** — required documents, upload/check status, extracted fields, discrepancy reasons, and re-upload path.
3. **Audit trail** — full chronological ledger of state changes, document checks, on-chain transactions, and operator decisions.
4. **Settings** — deal terms, release rules, addresses, network details, and read-only configuration. For MVP, most settings are read-only.

### Sections / components in order

**1 — App shell / header**
Left rail: Blockmediary wordmark, selected deal label (`Deal BM-2048` style), and viewer role (`Buyer view`, `Seller view`, or `Escrow operator`). Main header right side: connected payment address chip, network badge (`Ethereum Sepolia` for demo if applicable), and reconnecting badge when live updates fail.

**2 — Deal summary band**
Full-width `--bg-surface` card. Contents, left to right: deal ID (monospace, small), amount (monospace, large display), status badge, created date, and payment network. Status badge language:
- Awaiting deposit
- Funds locked
- Documents submitted
- Checking documents
- Discrepancy found
- Manual review
- Release pending
- Payment released
- Refunded
- Disputed
On mobile these stack vertically, amount stays largest.

**3 — Next action band**
Prominent compact strip directly below the summary, not buried in the right column. It tells the current viewer what happens next:
- Buyer before deposit: "Lock funds to start this deal" + CTA "Continue buyer flow".
- Seller after funds locked: "Upload the required documents" + CTA "Upload documents".
- Buyer during document check: "Documents are being checked" + no CTA.
- Seller after discrepancy: "Document needs correction" + CTA "Re-upload document".
- Escrow operator during manual review: "Manual review required" + CTA "Review documents".
- Either party after release/refund: "Deal closed" + link "View transaction" where available.
- Read-only viewer: "Read-only view" + subline "Connect as a participant to see full details."

**4 — Tab bar**
Tabs: Overview / Documents / Audit trail / Settings. Default = Overview. Preserve selected tab in the URL query or local state for demo navigation.

### Overview tab

**Escrow state visual**
Horizontal 3-node diagram: BUYER — ESCROW — SELLER. The connecting line segment lights up amber and animates `scaleX` as funds move. Centre node label changes by state: "Awaiting deposit" / "Funds locked" / "Checking documents" / "Release pending" / "Payment released" / "Refunded" / "Disputed".

**Deal progress checklist**
Compact progress list under the state visual:
- Deal terms agreed
- Buyer funds locked
- Seller documents submitted
- Documents checked
- Payment released
Use green checks for complete, amber for active, grey for pending, red for discrepancy/refund/dispute.

**Recent audit preview**
Last 4 ledger events only, with "View full audit trail" link to the Audit trail tab. Entries: timestamp, event label, actor, optional transaction ID.

**Participants panel**
Rows for Buyer, Seller, and Blockmediary/Escrow Operator:
- Buyer: optional business name, truncated payment address, `you` tag if applicable.
- Seller: optional business name, truncated payment address, `you` tag if applicable.
- Escrow Operator: "Blockmediary" / "Document review" / "Release authority" label, no wallet address unless explicitly relevant.
Read-only viewers see role labels and masked payment addresses only.

**Actions panel**
Context-dependent, role-specific actions only:
- Buyer: request refund only when a valid refund/dispute path exists; include helper copy "Requesting a refund will notify the seller and pause payment release."
- Seller: upload/re-upload documents; view release transaction when paid.
- Escrow operator: review documents, flag discrepancy, approve demo compliant result, or mark manual review. Do not expose emergency pause as a routine action.
- Closed deals: no primary actions, just "Deal closed" label in `--text-muted`.

### Documents tab

Purpose: show exactly what the seller must upload and what Blockmediary checked.

**Required document list**
Rows for MVP/full-product readiness:
- Commercial invoice — MVP required.
- Packing list — show as "Coming next" unless implemented.
- Bill of lading / sea waybill / air waybill / courier receipt — show as "Coming next" unless implemented.
Each row includes status: Missing / Uploaded / Checking / Verified / Discrepant / Rejected / Manual review.

**Document detail panel**
When a document row is selected, show: filename, upload time, uploaded by, content hash if available, check status, and extracted fields. Use plain field labels:
- Invoice total
- Seller name
- Buyer name
- Deal reference
- Shipment date
- Required document type

**Discrepancy panel**
Only appears when needed. Show one short reason at a time, e.g. "Invoice total does not match locked amount." CTA depends on role: Seller sees "Re-upload document"; Buyer sees "Wait for correction"; Escrow operator sees "Review discrepancy".

### Audit trail tab

Full chronological ledger, table/timeline hybrid:
- Timestamp
- Event
- Actor (Buyer / Seller / Blockmediary / System)
- Result
- Transaction ID or document hash where relevant

Example events: Escrow created → Deal terms agreed → Funds locked → Document uploaded → Document check started → Document check result → Manual review opened → Release pending → Payment released → Refunded.

Audit trail is regulator-facing and should feel immutable: no edit buttons, no delete actions, no casual copy. Existing entries do not re-animate; new entries fade in subtly.

### Settings tab

Read-only by default for MVP. Sections:
- Deal terms: amount, currency, created date, shipment deadline if known.
- Release rules: required document(s), matching checks, objection window status if implemented.
- Payment details: buyer payment address, seller payment address, escrow contract address, network.
- Visibility: participant-only vs read-only shared link.

Actions here are limited. Do not let users edit terms after funding unless a future amendment flow is explicitly built.

### Empty/loading/error states
- Deal ID not found: full-page state replacing all sections — "We couldn't find this deal" + "Check the link or return home" CTA.
- Data still loading: summary band, tabs, state visual, and active tab content show skeleton blocks (`--bg-surface` pulsing opacity 0.4↔0.7, 1.2s loop) matching final content dimensions — no layout shift on load.
- Live update fails (e.g. websocket drops): small persistent badge top-right of summary band, "Reconnecting…" in `--text-muted`, auto-retries silently; falls back to manual refresh button after 3 failed attempts.
- Unsupported role: show read-only dashboard with a note: "This view is limited because your role could not be confirmed."

---

## 5. Master component list

Reusable across all four pages:

1. **Header bar** — wordmark + contextual right-side slot (nav links on `/`, step indicator on flows, nothing extra on `/dashboard`).
2. **Eyebrow label** — 11px, uppercase, `--accent`, 0.12em tracking. Used above section/step headlines for context, not to duplicate the visible step count.
3. **Section headline** — 700 weight display text, used once per section/step.
4. **Primary button (filled)** — amber background, dark text, 8px radius, used for the single most important action per screen.
5. **Secondary button (outlined)** — 1px `--border`, transparent fill, `--text-primary` label.
6. **Status pill** — small rounded chip, colour-coded dot + label, used for wallet states, verification states, deal status.
7. **Stepper / progress indicator** — vertical (desktop) or horizontal bar (mobile), used in `/buyer` and `/seller`.
8. **Card / surface panel** — `--bg-surface`, 1px `--border`, 8px radius, 24px padding. Base container for repeated items, receipts, review panels, and focused task components.
9. **Wallet/account row** — icon + label + trailing status or chevron, used for wallet selection and participants list.
10. **Numeric input (monospace)** — large centred amount entry, used in buyer Step 2.
11. **Deal terms review card** — amount, seller payment address, required document, and release checks, used before buyer deposit.
12. **File drop zone / file row** — dashed empty state, solid file-row state, used in seller Step 2.
13. **Vertical task list** — numbered rows with status pills, used in buyer deposit and seller document-check progress.
14. **Circuit/flow diagram** — 3-node horizontal diagram with animated connectors; appears on landing (static concept) and dashboard (live state), same visual language.
15. **Next action band** — compact state-aware strip below dashboard summary, used to remove ambiguity about what happens next.
16. **Timeline / audit entry row** — timestamp + label + actor + optional transaction ID link, used in dashboard audit trail and landing page 2's problem timeline (same visual primitive, different data).
17. **Stat row (monospace)** — 2–3 numbers or short factual claims with small labels underneath, used on landing page 3 and could extend to dashboard summary.
18. **Skeleton loader block** — pulsing placeholder matching final component dimensions.
19. **Empty/error banner** — inline, low-opacity coloured background (`--error` or `--pending` tint), single line of copy, optional retry action.
20. **Copy-to-clipboard address chip** — truncated payment address or transaction ID + copy icon, used everywhere an address or transaction appears.
21. **Dashboard app rail** — narrow desktop rail with wordmark, deal label, and viewer role; collapses to top bar/menu on mobile.
22. **Dashboard tab bar** — Overview / Documents / Audit trail / Settings tabs, used only inside `/dashboard`.
23. **Deal summary band** — amount, status, deal ID, created date, and network, used at the top of `/dashboard`.
24. **Document status row** — required document name, status pill, upload metadata, and role-specific action, used in Documents tab.
25. **Extracted-field row** — plain-language field label, extracted value, match/mismatch status, and confidence/status copy, used in Documents tab.
26. **Settings read-only row** — label/value row for deal terms, release rules, payment addresses, and visibility settings.
27. **Footer** — copyright + legal links, landing page only, but structurally reusable.

---

## 6. Notes for build phase

- All copy above is final draft language, not placeholder — use verbatim unless product wording changes. Prefer plain trade/payment language over crypto or trade-finance jargon.
- Colour, type, spacing, and motion tokens in Section 0 are the single source of truth; the landing page's existing CLAUDE.md tokens matched exactly to keep buyer/seller/dashboard visually identical to the locked landing page.
- No component library — plan for inline/utility styling on whatever stack is chosen next, consistent with the "no changes without sign-off" rule already in place for the landing page.
