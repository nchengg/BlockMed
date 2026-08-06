# Main Pitch — Slide Ideas (Aug 14 submission)

5-minute investor-style video. This is a **topic outline only** — no written content, so
each owner can draft their own slide's actual words. Built from the real June 8 deck
(`Pitch-Deck-June-8.pptx`) plus the two things the Main Presentation Brief newly requires
that the proposal didn't: a demo and a stage-reached-vs-plan slide.

Grading reminder: 70% Potential Real Value (product, problem, why it'll work, stage
reached) / 30% Presentation (organisation, aids, language).

## 14 slides, ~5 min

| # | Slide | Owner | What to address (topics, not content) | Notes |
|---|-------|-------|----------------------------------------|-------|
| 1 | Title / Mission | Reshi | Who we are, mission/vision/values, one-line hook for the problem | |
| 2 | Problem | Reshi | The SME trade-finance gap, why LCs don't reach small deals, the size of the pain | |
| 3 | Solution | Reshi | What Blockmediary actually does, the escrow workflow at a glance | |
| 4 | Product Architecture | Dan | How it's built — on-chain vs off-chain split, what the smart contract does and doesn't do | |
| 5 | Demo | Dan | Walkthrough of what's actually working right now — this is the proof slide | |
| 6 | Progress vs. Plan | Nick | Where we said we'd be by now (June 8 roadmap) vs. where we actually are — be honest about gaps | |
| 7 | Market | Tamer | TAM/SAM/SOM, beachhead corridor, why this wedge | |
| 8 | Business Model | Tamer | How we make money, revenue streams, margins | |
| 9 | Competition | Badhri | Who else is in this space and why we're structurally different | Format: 1 line per company + 1 line on why we're better.<br>• Tazapay (Singapore) — escrow-as-a-service for B2B marketplaces, manual doc review, custodial fiat rails → we're AI-verified in minutes, non-custodial.<br>• Truzo (UK/SA) — narrow UK↔SA corridor, manual KYC, fiat via Currencycloud → we're multi-corridor, structurally lower fees (no bank/EMI in the chain).<br>• XREX (Taiwan) — licensed custodial BitCheck escrow, releases on buyer/mutual agreement → we release on document compliance, non-custodial.<br>• Komgo (Geneva) — bank-consortium SaaS, digitizes LC paperwork for banks/traders, dropped its own blockchain → we remove the bank entirely, sell to SMEs directly not through banks.<br>• Contour (defunct) — HSBC/StanChart/Citi-backed Corda LC network, shut down Nov 2023 at ~60–70 deals/month, no lead investor → we avoid their failure mode: no consortium governance, no closed-network onboarding.<br>Close: well-funded attempts still failed structurally — proves the gap is real, not hypothetical.<br>Source: `docs/Competitor-analysis.md`. |
| 10 | Go-to-Market | Tamer | How we acquire and retain customers, why the beachhead works | |
| 11 | Legal & Compliance | Badhri | Regulatory posture across target jurisdictions, why this makes us investable not just clever | Frame as an update on the June 8 slide, not a new topic — June 8 had a high-level jurisdiction list (UAE ADGM/DIFC, UK FCA, EU MiCA, Turkey excluded, off-chain PII). Since then the register went from ~15 items to a 31-item risk register (`docs/legal-risk.md`, rev. 5) — lead with what's genuinely new:<br>• **FCA Consumer Duty** — heavier obligation than first assumed; most SME users likely count as retail customers, not eligible counterparties, so it applies in full.<br>• **DORA** — found this rides along with MiCA CASP authorisation, not separate; means our third-party vendor contracts (Claude API, cloud, KYB provider) need specific DORA-compliant terms.<br>• **specHash / GDPR conflict** — identified a real architecture risk: committing a hash of the deal spec (which contains KYC references) to a public chain can still count as personal data under GDPR — live design decision needed before mainnet, not yet closed.<br>• **Releaser key compromise** — connected our top technical security risk directly to concrete regulatory consequences (FCA/VARA breach notification, POCA criminal liability) — compliance and security are the same finding, not two lists.<br>• **UCP 600 + Incoterms 2020** — June 8 said "UCP 600-inspired"; since then built this into an actual article-by-article and Incoterm-by-Incoterm document checklist feeding the verification engine.<br>• **Electronic Trade Documents Act 2023** — this is *why* the MVP only accepts scanned PDFs for now, not a gap — eBL support is gated on ETDA-qualifying systems, a deliberate near-term scope decision.<br>Close: point to the full 31-item register as the supplementary PDF documentation being submitted separately for reference — the slide is the headline, the register is the evidence.<br>Source: `docs/legal-risk.md`. |
| 12 | Financial Projections | Conrad | Revenue projections, key assumptions, break-even path, headline ask number | |
| 13 | Team + Ask | Conrad | Who's building this, what we need next | |
| 14 | Contact | Conrad | Close, contact details, call to action | |

## Notes

- Order can move — this is a starting skeleton, not a locked sequence.
- Adding slide 12 brings this to 14 slides in a 5-minute video — re-check the time budget
  once real content goes in; Market (7) and Go-to-Market (10) are the first candidates to
  trim since they carry over cleanly from the proposal video and don't need much new
  airtime.
- Demo (5) and Progress vs. Plan (6) are the two slides the brief is actually new about —
  protect their time budget over the others.
- Pull real facts/figures from `Pitch-Deck-June-8.pptx` and the `docs/` folder directly
  when writing your slide — don't rely on secondhand summaries of that content.
- Notes column is intentionally blank — filling it in next.
