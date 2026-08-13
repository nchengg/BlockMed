# Blockmediary

> Programmable stablecoin escrow for SME cross-border trade — a smart-contract alternative to the bank Letter of Credit. Built for **BEEM063** by **Team Transakt**.

**🔗 Live prototype → https://block-med-nine.vercel.app**

A buyer locks USDC in a non-custodial on-chain escrow; the seller ships and uploads trade documents; a **deterministic rules engine** grades them against the agreed terms; the escrow releases the funds — with no bank in the middle.

> **Status: a working _testnet_ prototype (proof of concept).** It runs on **Base Sepolia** with test USDC — no real funds are involved. See [What's delivered vs. roadmap](#whats-delivered-vs-roadmap) so it's assessed for what it is.

---

## 👀 For the marker — start here

### 1. Try the live prototype (≈2 min, no setup)
1. Open **https://block-med-nine.vercel.app** and scroll the landing page (the product story).
2. Go to **`/dashboard`**.
3. Under **Company access**, pick a demo company (e.g. *Meridian Imports*) and click **Demo sign-in** — it's passwordless.
4. Explore the **Deals** tab (create and track escrow deals) and the **Company** tab (KYB profile + wallet linking).

### 2. See it on-chain
The escrow contract is live on Base Sepolia with real testnet transactions:
- **Contract:** [`0x17e8…f0ac` on BaseScan](https://sepolia.basescan.org/address/0x17e8fd47f082157cd8808424de7a3fe670d0f0ac) *(current address is always in [`contracts/deployments/baseSepolia.json`](contracts/deployments/baseSepolia.json))*

### 3. Read the documents
| To see… | Open |
|---|---|
| **Business Requirements (BRD)** | [`docs/business-requirements.md`](docs/business-requirements.md) |
| **Technical Requirements (TRD)** | [`docs/technical-requirements.md`](docs/technical-requirements.md) |
| **Legal & compliance risk register** | [`docs/legal-risk.md`](docs/legal-risk.md) |
| **Verification model** | [`docs/verification-model-v2.md`](docs/verification-model-v2.md) |
| **Competitor analysis** | [`docs/Competitor-analysis.md`](docs/Competitor-analysis.md) |
| **Domain rules (UCP 600 / Incoterms 2020)** | [`docs/domain-rules.md`](docs/domain-rules.md), [`docs/UCP600.md`](docs/UCP600.md), [`docs/Incoterms2020.md`](docs/Incoterms2020.md) |
| **Architecture & auth** | [`docs/architecture.md`](docs/architecture.md), [`docs/auth-mechanism.md`](docs/auth-mechanism.md) |
| **Project governance** (plan · Kanban · RACI · Gantt) | [`project-governance/`](project-governance/) |
| **Proposal / pitch materials** | [`proposal/`](proposal/) |
| **Financial model** | [`financial-projections/`](financial-projections/) |

---

## 🗂 Repository structure

Two kinds of thing live here — **the build** (code you can run) and **the paperwork**
(documents that specify, govern and pitch it). Every directory has its own README
explaining its contents.

**Code:**
| Path | What's there |
|---|---|
| [`app/`](app/) | The web application — Next.js 16, React 19, Prisma + Postgres, viem. Dashboard, escrow API, auth. |
| [`contracts/`](contracts/) | The `Escrow.sol` smart contract, Hardhat tests, and deploy scripts (local + Base Sepolia). |
| [`data/`](data/) | Synthetic / sandbox datasets only — no real PII. |

**Documents:**
| Path | What's there |
|---|---|
| [`docs/`](docs/) | Requirements (BRD/TRD), legal & compliance, verification model, domain rules, architecture. |
| [`project-governance/`](project-governance/) | Project plan, Kanban, RACI, Gantt. |
| [`proposal/`](proposal/) | Pitch decks, presentation scripts, business model canvas. |
| [`financial-projections/`](financial-projections/) | Financial model and pricing. |
| [`reference-documents/`](reference-documents/) | The real-world trade documents (B/L, invoices, certificates) the rules engine models. |

---

## ▶️ Run it locally (optional — the live site is easier)

Prerequisites: **Node 22+** and a Postgres database (a free [Neon](https://neon.tech) instance
works, or locally: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16`).

**Full local demo — app + your own private blockchain.** This is entirely
self-contained: the local Hardhat chain uses publicly-known dev keys, so no
secrets are needed and nothing touches a real network.

```bash
# terminal 1 — a local chain
cd contracts && npm install
npx hardhat node

# terminal 2 — deploy the escrow to it, then start the app
cd contracts && npx hardhat run scripts/deploy-local.ts --network localhost
cd ../app && npm install
cp .env.example .env    # then set DATABASE_URL to your Postgres; add ESCROW_DEMO_LOGIN=1
npm run db:seed:demo    # migrations + demo companies (passwordless demo sign-in)
npm run dev             # http://localhost:3000
```

`ESCROW_NETWORK` defaults to `local`, so the app talks to the Hardhat chain
automatically. Sign in via the demo company picker and run a deal end to end —
create → accept → fund → submit documents → release.

**Pointing a local app at Base Sepolia** additionally needs
`ESCROW_NETWORK=baseSepolia` and a `RELEASER_PRIVATE_KEY` that holds
`RELEASER_ROLE` on the deployed contract. That key is deliberately **not in the
repo** — for the testnet experience, use the hosted site above instead.

**Contracts test suite** (no setup beyond `npm install`):
```bash
cd contracts && npx hardhat test
```

---

## What's delivered vs. roadmap

**Delivered (in this repo, running on Base Sepolia testnet):**
- Non-custodial `Escrow` smart contract — create → fund → release / refund.
- Account-based authentication with SIWE wallet linking; multi-deal dashboard; objection window; refund path.
- A **deterministic rules engine** that grades submitted document fields against the agreed release terms.

**Roadmap (designed, not yet built):**
- AI / OCR document field extraction feeding the rules engine.
- KYC / KYB / sanctions screening.
- Production mainnet deployment, hardware-secured releaser key, and regulatory licensing.

The BRD and TRD carry the full delivered-vs-roadmap breakdown, and `legal-risk.md` sets out the compliance work required before any real-value launch.

---

## 👥 Team Transakt
Tamer (project lead) · Nick (technical architecture) · Conrad (finance & commercial) · Dan (product & on-chain) · Badhri (legal & compliance) · Mo (front-end & UX).
