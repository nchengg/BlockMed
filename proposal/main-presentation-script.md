# Main Presentation — 5:00 video script

**Team Transakt · Blockmediary · due Fri 14 Aug.** One narrator throughout works;
switching narrator at the demo (slide 4) also reads naturally if two people want
speaking parts. Target pace ≈150 wpm — every section below is timed to that.
The same script lives in each slide's speaker notes in
`Main-Presentation-Aug-14.pptx`.

---

## Slide 1 — Title  `0:00–0:15`

> This is Blockmediary, from Team Transakt: a programmable documentary escrow
> for SME cross-border trade. In the next five minutes we'll show you the
> product working for real — settling an actual trade, with real money, on a
> public blockchain.

## Slide 2 — Problem  `0:15–0:50`

> When two businesses on different continents don't trust each other, the
> classic answer is a documentary Letter of Credit: a bank pays when shipping
> documents prove the goods moved. It works — but the paperwork behind a
> ten-thousand-dollar shipment costs a bank the same as behind a five-million-
> dollar one, so banks simply don't serve small traders. That's a
> two-and-a-half-trillion-dollar financing gap. Today an SME's real options are
> paying cash in advance and hoping — or walking away from the deal.

## Slide 3 — Solution  `0:50–1:25`

> Blockmediary takes the documentary credit process and rebuilds it as code.
> The buyer locks the exact payment in a smart-contract escrow — non-custodial,
> so we never hold the money. The seller ships and uploads the standard trade
> documents. Then a deterministic rules engine grades that pack: sixty-one
> checks against the agreed terms, grounded in UCP 600 — the same rulebook bank
> document examiners use. If the documents prove performance, the escrow
> releases. If they don't, it doesn't. Let us show you — and this is not a
> mock-up.

## Slide 4 — DEMO  `1:25–3:25`  *(drop your recording here)*

Voiceover beats, matched to the suggested cut:

1. **Dashboard / agreed deal** — "This is the live product. Two companies have
   agreed a trade — the terms are on screen: goods, amount, shipping deadline,
   ports."
2. **Buyer funds from their own wallet** — "The buyer funds the deal from
   their own wallet. Watch the state change: the USDC is now locked in the
   escrow contract on Base — you can see the transaction hash the moment it
   lands."
3. **Seller submits documents** — "Now the seller's side: they submit the
   document pack — commercial invoice, packing list, bill of lading,
   certificate of origin, and the customs declarations for the corridor."
4. **Verdict** — "The rules engine grades the pack instantly. Every check is
   listed — what passed, and what it was checked against. A discrepant document
   fails loudly and names itself; a compliant pack opens the release."
5. **Release + BaseScan** — "And here is the moment that matters: the verdict
   is recorded on-chain, and the escrow releases the funds to the seller. Every
   stage of this deal — agreement, funding, verdict, release — now links to its
   own transaction on BaseScan. This is an audit trail a regulator, or an
   investor, can check without trusting us."

## Slide 5 — Proof  `3:25–3:50`

> Everything you just watched settled for real. The deal ended in state
> Released: the seller was paid because the documents proved performance — not
> because anyone pressed an approve button. Agreement, funding, verdict and
> release each carry their own transaction hash, and that release transaction
> is on screen. Pause the video, type it into BaseScan, and check us. The brief
> said a hosted prototype wasn't expected — we went further: the rail already
> settles real value.

## Slide 6 — Competition  `3:50–4:15`

> Why hasn't someone done this? The funded players all stop one step short:
> Tazapay and XREX escrow the money but still release on buyer approval — the
> trust problem survives. Komgo serves banks, not SMEs. Contour raised eighteen
> million dollars from the biggest trade banks in the world and still shut
> down. Releasing on document compliance, priced for SMEs, is the seat left
> open — and unlike everyone on this slide, our version of it is already live
> and settling on a public chain.

## Slide 7 — Stage & path  `4:15–4:40`

> So where are we, honestly? Today: a working prototype that has settled real
> value — ahead of where a hackathon build needs to be. The plan from here is
> deliberately conservative: a paid, partner-led pilot in the DIFC at month
> twelve, first receipts the month after, and a full VARA licence targeted at
> month eighteen. The base case reaches one-point-three-seven million pounds of
> Year-3 revenue on two thousand deals — and monthly break-even in year four.

## Slide 8 — The ask  `4:40–4:52`

> The ask is three-point-one million pounds of operating funding, staged.
> Seventy percent goes to people and permission — the compliance, licensing and
> team that turn a working rail into a regulated business — because the hard
> engineering risk is already retired: you watched it settle.

## Slide 9 — Close  `4:52–5:00`

> Blockmediary. The trust layer for global trade — already settling. Try the
> prototype, read the code, verify the transaction. Thank you.

---

## Submission checklist (from the brief)

- [ ] Video ≤ 5:00, uploaded (unlisted YouTube is standard) — **link in the group document**
- [ ] Group document also links: live prototype `https://block-med-nine.vercel.app`,
      repo `https://github.com/nchengg/BlockMed`, and the settlement
      `https://basescan.org/tx/0xd3507c6e863e43e5f4f1f0467d51349391c1d65e166b00837d27d427412a4d8d`
- [ ] Stage-vs-plan stated explicitly (slide 7 does this)
- [ ] Balance kept: ~1 min technical (slide 3 + demo narration), rest value
