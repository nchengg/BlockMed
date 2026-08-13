# Blockmediary — Landing Page Design Sheet (superseded)

> **Superseded 2026-08-13.** `CLAUDE.md` (root of the repo) is now the authoritative frontend
> spec — it has a different colour system, section structure, and copy, and it also carries
> the current AI-verification-language correction that this file predates. Do not build from
> this file; it's kept for design-history reference only.
>
> This document was the implementation spec for Opus 4.8.
> Do not deviate from the scene structure or copy without flagging it first.

---

## The headline

After researching fintech landing page best practices and LC alternatives for SMEs, the winning
approach is **outcome-led copy that names the problem before presenting the solution**.
Letters of Credit fail SMEs because they're slow, expensive, and full of paperwork traps.
The headline sequence uses the animation itself to tell that story.

**Scene 1 (big ship):**
> *"Letters of Credit were built for them."*

**Scene 2 (small ship):**
> *"You were left to figure it out alone."*

**Scene 3 (Blockmediary reveal):**
> *"Not anymore."*

**Final CTA headline:**
> *"Trade finance, finally built for the small guy."*

---

## Animation philosophy

This is a **scroll-driven cinematic experience** — not a traditional scroll-through page.
The user scrolls, and the story plays like a film. Every scene is tied to scroll position.

References: the VISITE travel site (layered parallax landscape), the Planet Earth site
(large hero object rising from bottom), the Crown Burger site (dark, dramatic, 3D-feeling).

**The guiding rule:** At every scroll position, there is exactly one thing to read and one
thing to look at. No clutter. No competing elements.

---

## Tech stack for the landing page

| Tool | Purpose |
|------|---------|
| **GSAP + ScrollTrigger** | Primary scroll-driven animation engine. Pinned sections, scrubbed timelines, scene transitions. |
| **Lenis** | Smooth scroll inertia — gives the page that cinematic, weighty feel |
| **Framer Motion** | Fade-ins and micro-interactions outside the main scroll sequence |
| **SVG** | All ships and ocean elements — drawn in code, not images |
| **Next.js 15** | App Router, page lives at `app/app/page.tsx` |
| **Tailwind CSS** | Layout and spacing only — animations handled by GSAP, not Tailwind |

Install (add to `app/package.json`):
```bash
pnpm add gsap @studio-freight/lenis framer-motion
```

---

## Colour system (dark theme throughout)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-deep` | `#050A14` | Main background — deep navy, almost black |
| `--bg-mid` | `#0A1628` | Mid-layer ocean/horizon |
| `--bg-surface` | `#111E35` | Cards and surface elements |
| `--text-primary` | `#F0F4FF` | All main headings |
| `--text-secondary` | `#8899BB` | Subtext, captions |
| `--accent-blue` | `#2D7DD2` | CTAs, highlights, links |
| `--accent-glow` | `#2D7DD240` | Glows and halos behind key elements |
| `--ocean-dark` | `#061020` | Deep ocean base |
| `--ocean-mid` | `#0B2040` | Mid ocean layer |
| `--ocean-light` | `#1A4060` | Ocean surface highlights |
| `--fog` | `#8899BB20` | Atmospheric fog/haze layers |

The page is **dark throughout** — no light sections. The CTA section at the bottom uses
`--bg-surface` to lift slightly from the deep background.

---

## Typography

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Scene headline | `clamp(48px, 8vw, 96px)` | 700 | Inter |
| Scene subline | `clamp(18px, 2.5vw, 28px)` | 400 | Inter |
| Section label | `14px` | 500 | Inter, letter-spacing 0.15em, uppercase |
| Step title | `24px` | 600 | Inter |
| Step body | `16px` | 400 | Inter |
| CTA button | `18px` | 600 | Inter |
| Nav | `15px` | 500 | Inter |

Load Inter via `next/font/google`.

---

## Page structure overview

```
<Navbar />                          ← Fixed, fades in after hero
<HeroSection />                     ← Scene 1: The big ship
<SmallShipSection />                ← Scene 2: The small ship (scroll-pinned)
<ZoomSection />                     ← Scene 3: Zoom into deck, crew member
<BlockmediaryRevealSection />       ← Scene 4: "Not anymore" + product intro
<HowItWorksSection />               ← Scene 5: 3-step animated flow
<CTASection />                      ← Scene 6: I'm a Buyer / I'm a Seller
<Footer />
```

---

## Scene 1 — The big ship (Hero)

**Scroll behaviour:** Pinned for 150vh of scroll. The scene plays as the user scrolls through it.

**Visual layout:**
- Full viewport, dark navy background (`--bg-deep`)
- Layered parallax (back to front):
  - Layer 0: starfield / night sky (barely visible dots, very subtle)
  - Layer 1: distant fog bank (`--fog`, blurred, moves at 0.1× scroll speed)
  - Layer 2: horizon glow (very faint blue-green light at horizon, moves at 0.2× speed)
  - Layer 3: ocean — three horizontal bands of `--ocean-dark`, `--ocean-mid`, `--ocean-light`
  - Layer 4: **large container ship SVG** — dominates 60% of viewport width, sits on the waterline
  - Layer 5: foreground ocean waves / foam (moves at 1.2× scroll speed, slight parallax forward)

**The ship SVG (large):**
- Classic container ship silhouette — rectangular hull, bridge tower on right side, stacked
  containers on deck in 2–3 colours (`#B22222`, `#1A5276`, `#2E7D32`)
- Slight rocking animation (continuous, not scroll-driven): subtle `rotate(-0.5deg)` to
  `rotate(0.5deg)` on a 4s ease-in-out loop
- Stack of funnels with a thin smoke wisp rising (CSS animation, continuous)
- Reflection in water below — flipped SVG at 20% opacity, blurred

**Text (enters on scroll, not on load):**
- Section label: `"TRADE FINANCE TODAY"` (top-left, small caps, fades in at scroll 0)
- Main headline: `"Letters of Credit were built for them."` — massive, 2-line, white,
  appears letter by letter or word by word as user scrolls into the pin
- Subline: `"The system that moves $2 trillion in global trade was designed for corporations,
  not for you."` — fades in after headline completes

**Animation timeline (GSAP ScrollTrigger, scrub: 1):**
```
0%   → ship enters from right, ocean layers establish
20%  → section label fades in
40%  → headline animates in word by word
70%  → subline fades in
100% → scene holds, transition to Scene 2 begins
```

---

## Scene 2 — The small ship

**Scroll behaviour:** Continues from Scene 1 pin, or new pin for 100vh.

**Visual:**
- Same ocean background — continuous, no cut
- The large ship begins to scale down (GSAP scale from 1 → 0.3) AND drift to the
  upper-left corner of the screen as user scrolls
- Simultaneously, a **small vessel SVG** rises from below the waterline at centre-screen
  — a modest cargo boat, clearly smaller, clearly older-looking
- When the small ship is centred, the large ship has shrunk to the upper-left corner,
  labelled `"Fortune 500"` (tiny label, `--text-secondary`)
- The small ship is labelled `"You"` in `--text-primary`

**Text:**
- Headline: `"You were left to figure it out alone."` — appears as small ship settles
- Subline: `"No bank guarantee. No payment protection. Just trust — and hope the buyer pays."` — fades in after

**The small ship SVG:**
- Simpler silhouette — single-deck fishing/cargo vessel, no stacked containers
- Slightly weathered feel (thinner stroke lines, slightly more angular)
- Same gentle rocking animation
- A single figure visible on the bridge — just a small dark silhouette, no detail needed

---

## Scene 3 — Zoom into the deck

**Scroll behaviour:** 80vh pin. This is the emotional beat.

**Visual:**
- Camera "zooms in" to the small ship using GSAP scale (scale from 1 → 4, with the ship
  centre scaling up so the deck fills the screen)
- As we zoom, ocean background blurs slightly (CSS filter blur increasing)
- The silhouette figure on the bridge becomes more prominent
- A single dim light on the deck creates a warm glow against the cold dark ocean
- Subtle atmosphere: the ship is alone at sea, mid-voyage, no guarantee of payment

**Text (appears during zoom):**
- No headline during the zoom — let the visual breathe
- Once zoom settles: small caption text fades in: `"Every small exporter knows this feeling."`
- Then: `"You've shipped. You've trusted. Sometimes it didn't end well."`

**Transition out:**
- The zoom continues until the ship fills the screen and bleeds to black
- From black, Scene 4 fades in

---

## Scene 4 — Blockmediary reveal

**Scroll behaviour:** Standard scroll, no pin needed. 100vh section.

**Visual:**
- Fades up from black
- A clean, glowing graphic at centre: a smart contract / lock icon, rendered as a minimal
  line-art SVG with a subtle blue glow (`--accent-glow`)
- The ocean is still in the background but heavily desaturated — we've left the problem space
- Two small ship icons (buyer and seller) appear on either side of the lock, connected by
  glowing lines that pulse from left → lock → right

**Text:**
- Section label: `"INTRODUCING BLOCKMEDIARY"`
- Headline: `"Not anymore."` — large, confident, white
- Subline: `"The same payment protection as a Letter of Credit — without the bank,
  the fees, or the paperwork."` — appears below

**Animation:**
- The lock icon draws itself (SVG stroke-dashoffset animation)
- The connecting lines pulse from buyer → lock → seller on a loop
- Buyer icon label: `"Buyer locks funds"` | Seller icon label: `"Seller ships + submits docs"`
  | Lock label: `"Blockmediary verifies"`

---

## Scene 5 — How it works

**Scroll behaviour:** Standard scroll. Three steps appear one at a time as user scrolls.

**Visual:**
- Background shifts from `--bg-deep` to `--bg-surface` (slight lift — still dark but
  feels like a new chapter)
- Three cards appear sequentially — each card slides up and fades in on scroll

**Section label:** `"HOW IT WORKS"`
**Section headline:** `"Three steps. No banks. No waiting."` (centred, above the cards)

**Step cards (horizontal on desktop, stacked on mobile):**

Step 1 — Lock
- Icon: padlock SVG, blue glow
- Number: `"01"`
- Title: `"Buyer locks funds"`
- Body: `"The buyer deposits USDC into a smart contract escrow. The seller sees the funds
  are locked before shipping a single item."`

Step 2 — Ship
- Icon: small ship SVG (the same one from Scene 2, miniaturised)
- Number: `"02"`
- Title: `"Seller ships & submits docs"`
- Body: `"Once the goods are shipped, the seller uploads the trade documents — starting
  with a commercial invoice."`

Step 3 — Release
- Icon: checkmark inside a circle, green glow
- Number: `"03"`
- Title: `"AI verifies. Funds release."`
- Body: `"Blockmediary's AI checks the documents against the agreed terms. On compliance,
  funds release to the seller automatically."`

**Animation:**
- Each card starts at `opacity: 0, y: 40px`
- Triggers when card enters viewport: `opacity: 1, y: 0` over 0.6s, ease out
- Staggered — cards 2 and 3 animate 0.15s after the previous

---

## Scene 6 — CTA section

**Scroll behaviour:** Standard. Full viewport height.

**Visual:**
- Background: `--bg-deep` — back to the deep navy to close the loop
- Faint starfield returns (same as Scene 1, full circle)
- Both the large and small ship appear in the far background at tiny scale, side by side —
  a callback to the opening, but now they're equals
- The Blockmediary logotype / wordmark centred
- Below it, the final headline

**Text:**
- Headline: `"Trade finance, finally built for the small guy."`
- Subline: `"Join the buyers and sellers who've moved on from the old system."`

**CTA buttons (side by side):**
- Primary: `"I'm a Buyer"` → `/buyer` — filled, `--accent-blue` background, white text
- Secondary: `"I'm a Seller"` → `/seller` — outlined, `--accent-blue` border, white text
- Both: `border-radius: 9999px` (pill shape), `padding: 16px 40px`, `font-size: 18px`
- On hover: primary scales to `1.03`, secondary fills with `--accent-blue`

---

## Navbar

**Behaviour:** Fixed, hidden on load. Fades in after user scrolls past the hero (Scene 1).

**Contents:**
- Left: `Blockmediary` wordmark in `--text-primary`
- Right: `"I'm a Buyer"` link + `"I'm a Seller"` button (filled, small)

**Style:**
- Background: `--bg-deep` at 80% opacity + `backdrop-filter: blur(12px)`
- Height: `64px`
- No border — just the blur gives it separation

---

## Footer

Minimal. Dark. Three lines only:
- `Blockmediary` wordmark
- `"© 2026 Blockmediary. Built on Base."`
- Links: `Privacy` · `Terms` · `GitHub`

---

## File structure

```
app/
  app/
    page.tsx                        ← Imports and composes all sections
    components/
      landing/
        Navbar.tsx
        HeroSection.tsx             ← Scene 1 (big ship + GSAP pin)
        SmallShipSection.tsx        ← Scene 2
        ZoomSection.tsx             ← Scene 3
        RevealSection.tsx           ← Scene 4
        HowItWorksSection.tsx       ← Scene 5 (three cards)
        CTASection.tsx              ← Scene 6
        Footer.tsx
      svg/
        BigShip.tsx                 ← Large container ship SVG component
        SmallShip.tsx               ← Small cargo vessel SVG component
        LockIcon.tsx                ← Smart contract lock icon SVG
        OceanLayers.tsx             ← Reusable layered ocean background
  lib/
    lenis.ts                        ← Lenis smooth scroll initialisation
```

---

## Implementation notes for Opus

1. **Initialise Lenis in a `'use client'` layout component** that wraps the landing page.
   Pass Lenis's scroll position into GSAP's ticker so ScrollTrigger uses smooth scroll values.

2. **All GSAP / ScrollTrigger code must be in `'use client'` components** inside `useEffect`
   with a cleanup that kills all ScrollTrigger instances on unmount.

3. **SVG ships are components**, not `<img>` tags. Build them with `<svg>` elements directly
   in JSX so we can animate individual parts (hull, containers, funnel smoke) independently.

4. **Mobile:** On screens < 768px, collapse the parallax ship scenes to static images
   (the SVGs at fixed scale, no scroll-driven animation). Keep the How It Works cards and
   CTA section fully animated on mobile. GSAP is expensive on low-power devices.

5. **Do not use `@apply` in Tailwind** for animation-related styles — keep all transitions
   and transforms in GSAP or inline style props.

6. **Accessibility:** All animated sections must have `prefers-reduced-motion` handling.
   Wrap GSAP init in `window.matchMedia('(prefers-reduced-motion: reduce)')` — if true,
   skip scroll-driven animations and render sections statically.

7. **Performance:** The ships are SVGs — no image loading delays. The ocean layers use CSS
   gradients, not images. Total page weight target: under 200KB JS (excluding GSAP).
