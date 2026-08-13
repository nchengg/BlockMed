# Blockmediary — Frontend Spec

> This file is for the **landing page frontend only**. Read it before touching any component.

---

## What we're building

Blockmediary is a programmable escrow platform for SME cross-border trade — a smart-contract alternative to Letters of Credit that removes banks from the payment flow. The frontend is a landing page that explains the product clearly and routes users into the buyer or seller workflow.

---

## North star

> **Apple-level minimalism. Cinematic scroll animations.** Every element earns its place. The page should feel like a product film — not a fintech dashboard, not a crypto app.

The test: show it to someone with no crypto or trade finance background. They understand the product in 30 seconds and feel confident enough to use it.

---

## What good looks like

| Reference | Why it matters |
|-----------|---------------|
| [apple.com](https://apple.com) | The benchmark for whitespace, type scale, and restraint. Nothing on screen that doesn't need to be there. |
| [linear.app](https://linear.app) | Dark mode done right — subtle depth, precise motion, confident negative space. |
| [stripe.com](https://stripe.com) | Complex product explained simply. One idea per section. Zero jargon. |

---

## Design spec

### Colour palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-deep` | `#0A0A0B` | Page background |
| `--bg-mid` | `#111114` | Alternate section backgrounds |
| `--bg-surface` | `#18181C` | Cards, borders |
| `--accent` | `#F59E0B` | CTAs, key numbers, labels — amber/gold |
| `--text-primary` | `#FAFAFA` | All headlines |
| `--text-secondary` | `#71717A` | Body copy |
| `--text-muted` | `#3F3F46` | Metadata, small labels |

### Typography

- **Font:** Inter (variable weight) — no other typefaces
- **Display:** 800 weight · -0.03em tracking · `clamp(44px, 7.5vw, 96px)`
- **Section headline:** 700 weight · -0.02em tracking · `clamp(34px, 5.5vw, 72px)`
- **Body:** 400 weight · 1.7 line-height · 15–19px
- **Section labels:** 600 weight · 0.2em tracking · 11px ALL CAPS · always in `--accent`
- **Monospace numbers:** `font-family: monospace` for stats, amounts, step numbers

### Motion principles

- **Scroll-scrubbed video** — hero drone footage tied directly to `video.currentTime` via GSAP `onUpdate`. No autoplay. Pinned with CSS `position: sticky` (never GSAP `pin: true`).
- **Scroll reveals** — all sections fade + `translateY(32px → 0)` on entry. GSAP `fromTo`, `power2.out` easing.
- **Line draws** — SVG/div connectors animate `scaleX: 0 → 1` from left. Used in the circuit diagram.
- **Easing:** `power2.out` only. No bounce, no spring — this is a professional fintech product.
- **Duration:** 0.5s minimum · 0.9s maximum for reveals. Scrub uses `scrub: 1.2`.

---

## Landing page sections

### 1 — Hero (scroll-scrubbed video)
Full-bleed drone footage of a cargo ship, pinned while the user scrolls 400vh. Three story beats reveal and fade as scroll progresses:
- **Beat 1 (~25%):** "This ship is carrying $2.3 million in goods."
- **Beat 2 (~50%):** "The seller shipped. The buyer hasn't paid."
- **Beat 3 (~75%):** "Until now." (amber, oversized)

### 2 — Problem
Split-column timeline: **SELLER** vs **BUYER**. Shows the 90-day payment delay that destroys SME cash flow. Amber dots = done, grey circles = unpaid/waiting. Bottom line: "A Letter of Credit puts a bank in the middle — and charges 1–3% for the privilege."

### 3 — Solution
Circuit diagram: BUYER → BLOCKMEDIARY → SELLER. Connecting lines animate `scaleX` on scroll entry. Centre node glows amber. Stat row below: `~2% platform fee` · `<5 min automated verification` · `100% on-chain`.

### 4 — How it works
Three cards, staggered reveal:
- **01** Buyer deposits — locks exact USDC amount in escrow
- **02** Seller ships & uploads — commercial invoice through the dashboard
- **03** Rules engine verifies. Funds transfer. — Deterministic checks against the agreed release terms, escrow releases

### 5 — Trust signals
Four items in a row: Built on Base · Deterministic verification engine · Open-source contracts · Non-custodial. Fades in as a unit.

### 6 — CTA
"Ready to protect your next trade?" + two buttons: **I'm a Buyer** (amber filled → `/buyer`) · **I'm a Seller** (outlined → `/seller`). Nothing else on screen.

### 7 — Footer
`© 2026 Blockmediary. Built on Base.` · Privacy · Terms · GitHub

---

## Rules

1. **One idea per section.** No section tries to do two things at once.
2. **No component library.** Inline styles + Tailwind utilities only.
3. **No changes without sign-off.** Suggest edits; don't make them unless explicitly asked.
4. **Ask before inventing.** If a layout or behaviour isn't in this spec, ask — don't guess.
5. **Mobile:** all sections stack single-column. Hero video degrades gracefully to its first frame.
